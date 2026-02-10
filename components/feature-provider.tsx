'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  FeatureKey, 
  TenantConfig, 
  ALL_FEATURES,
  PLAN_LEVELS,
  createFeatureChecker,
  PlanTier
} from '@/lib/features';

interface FeatureContextValue {
  // Estado
  enabledFeatures: Set<FeatureKey>;
  config: TenantConfig | null;
  isLoading: boolean;
  error: Error | null;
  tenantId: string | null;
  
  // Funciones de verificación
  isEnabled: (key: FeatureKey) => boolean;
  isAnyEnabled: (keys: FeatureKey[]) => boolean;
  isAllEnabled: (keys: FeatureKey[]) => boolean;
  
  // Utilidades
  refresh: () => Promise<void>;
}

const FeatureContext = createContext<FeatureContextValue | undefined>(undefined);

interface FeatureProviderProps {
  children: ReactNode;
  initialTenantId?: string;
}

export function FeatureProvider({ children, initialTenantId }: FeatureProviderProps) {
  const [enabledFeatures, setEnabledFeatures] = useState<Set<FeatureKey>>(new Set());
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(initialTenantId || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFeatures = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabase = createClient();
      
      // Obtener tenantId si no lo tenemos
      let currentTenantId = tenantId;
      if (!currentTenantId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single();
          currentTenantId = profile?.tenant_id || null;
        }
        
        // Fallback para single-tenant
        if (!currentTenantId) {
          const { data: tenantConfig } = await supabase
            .from('tenant_config')
            .select('id')
            .limit(1)
            .single();
          currentTenantId = tenantConfig?.id || null;
        }
        
        setTenantId(currentTenantId);
      }
      
      if (!currentTenantId) {
        throw new Error('No tenant configured');
      }
      
      // Obtener config del tenant
      const { data: configData, error: configError } = await supabase
        .from('tenant_config')
        .select('*')
        .eq('id', currentTenantId)
        .single();
      
      if (configError) throw configError;
      
      if (configData) {
        setConfig({
          id: configData.id,
          businessName: configData.business_name,
          businessType: configData.business_type,
          plan: configData.plan,
          planExpiresAt: configData.plan_expires_at,
          currency: configData.currency,
          timezone: configData.timezone,
          featuresOverride: configData.features_override || {},
          settings: configData.settings || {},
        });
        
        // Calcular features habilitadas
        const planLevel = PLAN_LEVELS[configData.plan as PlanTier];
        const enabled = new Set<FeatureKey>();
        
        for (const feature of ALL_FEATURES) {
          // Verificar override
          if (configData.features_override?.[feature.key] !== undefined) {
            if (configData.features_override[feature.key]) {
              enabled.add(feature.key);
            }
            continue;
          }
          
          // Verificar por plan
          if (PLAN_LEVELS[feature.minPlan] <= planLevel) {
            enabled.add(feature.key);
          }
        }
        
        setEnabledFeatures(enabled);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load features'));
      console.error('Error loading features:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  const checker = createFeatureChecker(enabledFeatures);

  const refresh = async () => {
    await loadFeatures();
  };

  const value: FeatureContextValue = {
    enabledFeatures,
    config,
    isLoading,
    error,
    tenantId,
    isEnabled: checker.isEnabled,
    isAnyEnabled: checker.isAnyEnabled,
    isAllEnabled: checker.isAllEnabled,
    refresh,
  };

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
}

/**
 * Hook para usar el contexto de features
 */
export function useFeatures(): FeatureContextValue {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
}

/**
 * Hook simple para verificar si una feature está habilitada
 */
export function useFeature(key: FeatureKey): boolean {
  const { isEnabled, isLoading } = useFeatures();
  
  if (isLoading) {
    return false;
  }
  
  return isEnabled(key);
}

/**
 * Componente wrapper que solo renderiza children si la feature está habilitada
 */
interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const isEnabled = useFeature(feature);
  
  if (!isEnabled) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Componente wrapper que renderiza children si CUALQUIERA de las features está habilitada
 */
interface AnyFeatureGateProps {
  features: FeatureKey[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function AnyFeatureGate({ features, children, fallback = null }: AnyFeatureGateProps) {
  const { isAnyEnabled, isLoading } = useFeatures();
  
  if (isLoading) {
    return null;
  }
  
  if (!isAnyEnabled(features)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Componente wrapper que renderiza children si TODAS las features están habilitadas
 */
interface AllFeaturesGateProps {
  features: FeatureKey[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function AllFeaturesGate({ features, children, fallback = null }: AllFeaturesGateProps) {
  const { isAllEnabled, isLoading } = useFeatures();
  
  if (isLoading) {
    return null;
  }
  
  if (!isAllEnabled(features)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
