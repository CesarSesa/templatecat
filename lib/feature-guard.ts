/**
 * Feature Guard - Protección de rutas y Server Actions por feature
 * 
 * Este módulo proporciona funciones para proteger páginas y API routes
 * basándose en las features habilitadas para el tenant.
 * 
 * SEGURIDAD: Todas las funciones requieren tenantId explícito para evitar data leak
 * Fecha: Feb 11, 2026
 */

import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createClient } from './supabase/server';
import { FeatureKey, PlanTier, ALL_FEATURES, PLAN_LEVELS, getEnabledFeaturesCached } from './features';

// Mapeo de rutas a features requeridas
const ROUTE_FEATURES: Record<string, FeatureKey | FeatureKey[]> = {
  // Admin routes
  '/admin/inventario': 'inventory',
  '/admin/ventas': 'sales',
  '/admin/ventas/registrar': 'sales',
  '/admin/gastos': 'expenses',
  '/admin/gastos/registrar': 'expenses',
  '/admin/clientes': 'customers',
  '/admin/reportes': ['sales_analytics', 'advanced_reports'],
  '/admin/configuracion': 'multi_user',
  
  // API routes
  '/api/sales': 'sales',
  '/api/expenses': 'expenses',
  '/api/reports': 'advanced_reports',
};

// Prefijos de rutas que requieren features
const ROUTE_PREFIX_FEATURES: Array<{ prefix: string; feature: FeatureKey }> = [
  { prefix: '/admin/inventario', feature: 'inventory' },
  { prefix: '/admin/ventas', feature: 'sales' },
  { prefix: '/admin/gastos', feature: 'expenses' },
  { prefix: '/admin/clientes', feature: 'customers' },
  { prefix: '/admin/reportes', feature: 'advanced_reports' },
];

/**
 * Obtiene el tenantId del usuario autenticado actual
 * Usa React.cache() para evitar múltiples queries durante el mismo request
 */
export const getCurrentTenantId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  
  // Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return null;
  }
  
  // Obtener perfil del usuario para sacar tenant_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();
  
  if (profileError || !profile?.tenant_id) {
    // Fallback: usar un tenant por defecto para single-tenant
    const { data: config } = await supabase
      .from('tenant_config')
      .select('id')
      .limit(1)
      .single();
    return config?.id || null;
  }
  
  return profile.tenant_id;
});

/**
 * Obtiene la feature requerida para una ruta específica
 */
export function getRequiredFeature(pathname: string): FeatureKey | FeatureKey[] | null {
  // Chequeo exacto primero
  if (ROUTE_FEATURES[pathname]) {
    return ROUTE_FEATURES[pathname];
  }
  
  // Chequeo por prefijo
  for (const { prefix, feature } of ROUTE_PREFIX_FEATURES) {
    if (pathname.startsWith(prefix)) {
      return feature;
    }
  }
  
  return null;
}

/**
 * Verifica si el tenant tiene acceso a una feature
 * (Server-side version con cache de React)
 */
export async function checkServerFeature(
  tenantId: string,
  featureKey: FeatureKey
): Promise<{ allowed: boolean; plan: PlanTier; reason?: string }> {
  const features = await getEnabledFeaturesCached(tenantId);
  
  // Obtener config del tenant
  const supabase = await createClient();
  const { data: config } = await supabase
    .from('tenant_config')
    .select('plan, features_override')
    .eq('id', tenantId)
    .single();
  
  const plan = config?.plan as PlanTier || 'basic';
  
  if (features.has(featureKey)) {
    return { allowed: true, plan };
  }
  
  return {
    allowed: false,
    plan,
    reason: `Feature '${featureKey}' not enabled for plan ${plan}`
  };
}

/**
 * Guard para Server Components
 * Redirige si la feature no está habilitada
 */
export async function requireFeature(
  featureKey: FeatureKey,
  redirectTo: string = '/admin/upgrade'
): Promise<{ tenantId: string; plan: PlanTier }> {
  const tenantId = await getCurrentTenantId();
  
  if (!tenantId) {
    console.error('No tenant ID found');
    redirect('/auth/login');
  }
  
  const { allowed, plan, reason } = await checkServerFeature(tenantId, featureKey);
  
  if (!allowed) {
    console.warn(`Feature '${featureKey}' access denied:`, reason);
    redirect(redirectTo);
  }
  
  return { tenantId, plan };
}

/**
 * Guard para Server Components que permite múltiples features
 * (pasa si CUALQUIERA de las features está habilitada)
 */
export async function requireAnyFeature(
  featureKeys: FeatureKey[],
  redirectTo: string = '/admin/upgrade'
): Promise<{ tenantId: string; plan: PlanTier; enabledFeature: FeatureKey }> {
  const tenantId = await getCurrentTenantId();
  
  if (!tenantId) {
    redirect('/auth/login');
  }
  
  const features = await getEnabledFeaturesCached(tenantId);
  
  const enabled = featureKeys.find(key => features.has(key));
  
  if (!enabled) {
    console.warn(`None of the required features enabled:`, featureKeys);
    redirect(redirectTo);
  }
  
  const { plan } = await checkServerFeature(tenantId, enabled);
  return { tenantId, plan, enabledFeature: enabled };
}

/**
 * Guard para API Routes
 * Retorna una respuesta 403 si la feature no está habilitada
 */
export async function guardApiFeature(
  tenantId: string,
  featureKey: FeatureKey
): Promise<{ allowed: boolean; error?: Response }> {
  const { allowed, reason } = await checkServerFeature(tenantId, featureKey);
  
  if (!allowed) {
    return {
      allowed: false,
      error: new Response(
        JSON.stringify({
          error: 'Feature not enabled',
          message: reason || 'This feature is not available in your current plan',
          feature: featureKey,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    };
  }
  
  return { allowed: true };
}

/**
 * DECORADOR: withFeature
 * Protege Server Actions verificando feature antes de ejecutar
 * 
 * Uso:
 * 'use server'
 * export const generateReport = withFeature('ai_reports')(
 *   async (data: any) => { ... }
 * );
 */
export function withFeature<T extends (...args: any[]) => Promise<any>>(
  featureKey: FeatureKey
) {
  return function (
    serverAction: T
  ): T {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const tenantId = await getCurrentTenantId();
      
      if (!tenantId) {
        throw new Error('Authentication required');
      }
      
      const { allowed, reason } = await checkServerFeature(tenantId, featureKey);
      
      if (!allowed) {
        throw new Error(reason || `Feature "${featureKey}" not available on your plan`);
      }
      
      return serverAction(...args);
    }) as T;
  };
}

/**
 * DECORADOR: withAnyFeature
 * Protege Server Actions si CUALQUIERA de las features está habilitada
 */
export function withAnyFeature<T extends (...args: any[]) => Promise<any>>(
  featureKeys: FeatureKey[]
) {
  return function (
    serverAction: T
  ): T {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const tenantId = await getCurrentTenantId();
      
      if (!tenantId) {
        throw new Error('Authentication required');
      }
      
      const features = await getEnabledFeaturesCached(tenantId);
      const hasAnyFeature = featureKeys.some(key => features.has(key));
      
      if (!hasAnyFeature) {
        throw new Error(`None of the required features are available on your plan: ${featureKeys.join(', ')}`);
      }
      
      return serverAction(...args);
    }) as T;
  };
}

/**
 * Obtiene todas las features disponibles para el tenant actual
 * (Server-side con cache)
 */
export async function getServerFeatures(tenantId: string): Promise<{
  enabled: FeatureKey[];
  disabled: FeatureKey[];
  plan: PlanTier;
}> {
  const supabase = await createClient();
  
  const { data: config, error: configError } = await supabase
    .from('tenant_config')
    .select('*')
    .eq('id', tenantId)
    .single();
  
  if (configError || !config) {
    return { enabled: [], disabled: ALL_FEATURES.map(f => f.key), plan: 'basic' };
  }
  
  const plan = config.plan as PlanTier;
  const features = await getEnabledFeaturesCached(tenantId);
  
  const enabled = Array.from(features);
  const disabled = ALL_FEATURES
    .map(f => f.key)
    .filter(key => !features.has(key));
  
  return { enabled, disabled, plan };
}
