/**
 * Sistema de Features Modular - CatalogKit
 * 
 * Este sistema permite activar/desactivar funcionalidades según el plan del cliente.
 * Planes: basic ($50), pro ($80), premium ($120)
 * 
 * SEGURIDAD: Usa React.cache() para evitar data leak entre usuarios en SSR
 * Fecha refactor: Feb 11, 2026
 */

import { cache } from 'react';
import { createClient } from './supabase/client';

// Tipos de features disponibles
export type FeatureKey = 
  // Core (todos los planes)
  | 'products'
  | 'public_catalog'
  | 'categories'
  | 'images'
  // Inventory (pro+)
  | 'inventory'
  | 'stock_alerts'
  | 'variants'
  | 'barcodes'
  // Sales (pro+)
  | 'sales'
  | 'sales_analytics'
  | 'customers'
  | 'discounts'
  // Finance (premium)
  | 'expenses'
  | 'profit_loss'
  | 'cash_flow'
  // Analytics (premium)
  | 'advanced_reports'
  | 'dashboard_widgets'
  // Admin (premium)
  | 'multi_user'
  | 'api_access'
  | 'webhooks';

// Categorías de features
export type FeatureCategory = 'core' | 'inventory' | 'sales' | 'finance' | 'analytics' | 'admin';

// Planes disponibles
export type PlanTier = 'basic' | 'pro' | 'premium' | 'custom';

// Tipos de negocio
export type BusinessType = 'retail' | 'services' | 'restaurant';

// Interfaz de feature
export interface Feature {
  key: FeatureKey;
  name: string;
  description: string;
  category: FeatureCategory;
  defaultEnabled: boolean;
  minPlan: PlanTier;
  requiresSetup: boolean;
}

// Interfaz de configuración del tenant
export interface TenantConfig {
  id: string;
  businessName: string;
  businessType: BusinessType;
  plan: PlanTier;
  planExpiresAt?: string;
  currency: string;
  timezone: string;
  featuresOverride: Record<FeatureKey, boolean>;
  settings: Record<string, unknown>;
}

// Mapeo de planes a nivel numérico para comparaciones
export const PLAN_LEVELS: Record<PlanTier, number> = {
  basic: 1,
  pro: 2,
  premium: 3,
  custom: 99, // Custom puede tener cualquier combinación
};

// Definición estática de todas las features (fallback si la DB no responde)
export const ALL_FEATURES: Feature[] = [
  // CORE
  { key: 'products', name: 'Gestión de Productos', description: 'Catálogo de productos básico', category: 'core', defaultEnabled: true, minPlan: 'basic', requiresSetup: false },
  { key: 'public_catalog', name: 'Catálogo Público', description: 'Página de catálogo visible al público', category: 'core', defaultEnabled: true, minPlan: 'basic', requiresSetup: false },
  { key: 'categories', name: 'Categorías', description: 'Organización por categorías', category: 'core', defaultEnabled: true, minPlan: 'basic', requiresSetup: false },
  { key: 'images', name: 'Imágenes de Productos', description: 'Subida y gestión de imágenes', category: 'core', defaultEnabled: true, minPlan: 'basic', requiresSetup: true },
  
  // INVENTORY
  { key: 'inventory', name: 'Control de Inventario', description: 'Stock tracking y variantes', category: 'inventory', defaultEnabled: false, minPlan: 'pro', requiresSetup: true },
  { key: 'stock_alerts', name: 'Alertas de Stock Bajo', description: 'Notificaciones cuando stock es bajo', category: 'inventory', defaultEnabled: false, minPlan: 'pro', requiresSetup: false },
  { key: 'variants', name: 'Variantes (Talla/Color)', description: 'Gestión de variantes de productos', category: 'inventory', defaultEnabled: false, minPlan: 'pro', requiresSetup: false },
  { key: 'barcodes', name: 'Códigos de Barra/SKU', description: 'Sistema de SKUs y códigos de barra', category: 'inventory', defaultEnabled: false, minPlan: 'pro', requiresSetup: false },
  
  // SALES
  { key: 'sales', name: 'Registro de Ventas', description: 'Registrar ventas del negocio', category: 'sales', defaultEnabled: false, minPlan: 'pro', requiresSetup: false },
  { key: 'sales_analytics', name: 'Análisis de Ventas', description: 'Reportes y gráficos de ventas', category: 'sales', defaultEnabled: false, minPlan: 'pro', requiresSetup: false },
  { key: 'customers', name: 'Base de Clientes', description: 'Historial de compras por cliente', category: 'sales', defaultEnabled: false, minPlan: 'pro', requiresSetup: false },
  { key: 'discounts', name: 'Descuentos y Cupones', description: 'Sistema de descuentos', category: 'sales', defaultEnabled: false, minPlan: 'premium', requiresSetup: false },
  
  // FINANCE
  { key: 'expenses', name: 'Registro de Gastos', description: 'Tracking de gastos operacionales', category: 'finance', defaultEnabled: false, minPlan: 'premium', requiresSetup: false },
  { key: 'profit_loss', name: 'Ganancias y Pérdidas', description: 'Reporte P&L automático', category: 'finance', defaultEnabled: false, minPlan: 'premium', requiresSetup: false },
  { key: 'cash_flow', name: 'Flujo de Caja', description: 'Proyección de flujo de caja', category: 'finance', defaultEnabled: false, minPlan: 'premium', requiresSetup: false },
  
  // ANALYTICS
  { key: 'advanced_reports', name: 'Reportes Avanzados', description: 'Exportar a Excel/PDF', category: 'analytics', defaultEnabled: false, minPlan: 'premium', requiresSetup: false },
  { key: 'dashboard_widgets', name: 'Widgets Personalizados', description: 'Dashboard configurable', category: 'analytics', defaultEnabled: false, minPlan: 'premium', requiresSetup: false },
  
  // ADMIN
  { key: 'multi_user', name: 'Multi-usuario', description: 'Roles: admin, vendedor, contador', category: 'admin', defaultEnabled: false, minPlan: 'premium', requiresSetup: true },
  { key: 'api_access', name: 'API Access', description: 'Acceso programático a datos', category: 'admin', defaultEnabled: false, minPlan: 'premium', requiresSetup: false },
  { key: 'webhooks', name: 'Webhooks', description: 'Integraciones externas', category: 'admin', defaultEnabled: false, minPlan: 'premium', requiresSetup: true },
];

// Cache en memoria por tenantId (SERVER-SIDE ONLY)
// NOTA: Esto solo funciona en el servidor. En cliente, no hay cache.
const featureCache = new Map<string, { features: Set<FeatureKey>; ts: number }>();
const tenantConfigCache = new Map<string, { config: TenantConfig; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Verifica si el caché es válido para un tenant específico
 */
function isCacheValid(cache: Map<string, { ts: number }>, tenantId: string): boolean {
  const entry = cache.get(tenantId);
  return entry !== undefined && (Date.now() - entry.ts) < CACHE_TTL;
}

/**
 * Obtiene la configuración del tenant desde la base de datos
 * SEGURO: Usa tenantId para aislar cache entre usuarios
 */
export async function getTenantConfig(tenantId: string): Promise<TenantConfig | null> {
  // Verificar cache primero
  if (isCacheValid(tenantConfigCache, tenantId)) {
    return tenantConfigCache.get(tenantId)!.config;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('tenant_config')
    .select('*')
    .eq('id', tenantId)
    .single();

  if (error || !data) {
    console.error('Error loading tenant config:', error);
    return null;
  }

  const config: TenantConfig = {
    id: data.id,
    businessName: data.business_name,
    businessType: data.business_type,
    plan: data.plan,
    planExpiresAt: data.plan_expires_at,
    currency: data.currency,
    timezone: data.timezone,
    featuresOverride: data.features_override || {},
    settings: data.settings || {},
  };

  // Guardar en cache
  tenantConfigCache.set(tenantId, { config, ts: Date.now() });
  return config;
}

/**
 * React.cache() wrapper para getTenantConfig
 * Esto asegura que durante un request de React Server Component,
 * la función solo se ejecute una vez por tenantId
 */
export const getTenantConfigCached = cache(getTenantConfig);

/**
 * Obtiene todas las features habilitadas para un tenant específico
 * SEGURO: Requiere tenantId, cache aislado por usuario
 */
export async function getEnabledFeatures(tenantId: string): Promise<Set<FeatureKey>> {
  // Verificar cache primero
  if (isCacheValid(featureCache, tenantId)) {
    return featureCache.get(tenantId)!.features;
  }

  const supabase = createClient();
  
  // Intentar obtener desde la función RPC
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_available_features');

  if (!rpcError && rpcData) {
    const enabled = new Set<FeatureKey>(
      rpcData.filter((f: { enabled: boolean }) => f.enabled).map((f: { key: string }) => f.key as FeatureKey)
    );
    featureCache.set(tenantId, { features: enabled, ts: Date.now() });
    return enabled;
  }

  // Fallback: calcular localmente
  const config = await getTenantConfig(tenantId);
  if (!config) {
    // Si no hay config, usar features básicas
    const basicFeatures = new Set<FeatureKey>(
      ALL_FEATURES.filter(f => f.minPlan === 'basic').map(f => f.key)
    );
    return basicFeatures;
  }

  const enabled = new Set<FeatureKey>();
  const currentPlanLevel = PLAN_LEVELS[config.plan];

  for (const feature of ALL_FEATURES) {
    // Verificar override primero
    if (config.featuresOverride[feature.key] !== undefined) {
      if (config.featuresOverride[feature.key]) {
        enabled.add(feature.key);
      }
      continue;
    }

    // Verificar por plan
    if (PLAN_LEVELS[feature.minPlan] <= currentPlanLevel) {
      enabled.add(feature.key);
    }
  }

  featureCache.set(tenantId, { features: enabled, ts: Date.now() });
  return enabled;
}

/**
 * React.cache() wrapper para getEnabledFeatures
 */
export const getEnabledFeaturesCached = cache(getEnabledFeatures);

/**
 * Verifica si una feature específica está habilitada para un tenant
 * SEGURO: Requiere tenantId explícito
 */
export async function isFeatureEnabled(tenantId: string, featureKey: FeatureKey): Promise<boolean> {
  const enabled = await getEnabledFeatures(tenantId);
  return enabled.has(featureKey);
}

/**
 * Versión cacheada para React Server Components
 */
export const isFeatureEnabledCached = cache(isFeatureEnabled);

/**
 * Obtiene todas las features organizadas por categoría
 * (Función pura, no necesita cache)
 */
export function getFeaturesByCategory(): Record<FeatureCategory, Feature[]> {
  const grouped: Record<FeatureCategory, Feature[]> = {
    core: [],
    inventory: [],
    sales: [],
    finance: [],
    analytics: [],
    admin: [],
  };

  for (const feature of ALL_FEATURES) {
    grouped[feature.category].push(feature);
  }

  return grouped;
}

/**
 * Obtiene las features disponibles para un plan específico
 * (Función pura, no necesita cache)
 */
export function getFeaturesForPlan(plan: PlanTier): Feature[] {
  const planLevel = PLAN_LEVELS[plan];
  return ALL_FEATURES.filter(f => PLAN_LEVELS[f.minPlan] <= planLevel);
}

/**
 * Invalida el caché de features para un tenant específico
 * Llamar después de cambiar config del tenant
 */
export function invalidateFeaturesCache(tenantId: string): void {
  featureCache.delete(tenantId);
  tenantConfigCache.delete(tenantId);
}

/**
 * Invalida TODO el caché (usar con precaución)
 */
export function invalidateAllCaches(): void {
  featureCache.clear();
  tenantConfigCache.clear();
}

/**
 * Hook helper para uso en componentes React
 * Retorna un objeto con funciones de verificación
 */
export function createFeatureChecker(enabledFeatures: Set<FeatureKey>) {
  return {
    isEnabled: (key: FeatureKey) => enabledFeatures.has(key),
    isAnyEnabled: (keys: FeatureKey[]) => keys.some(k => enabledFeatures.has(k)),
    isAllEnabled: (keys: FeatureKey[]) => keys.every(k => enabledFeatures.has(k)),
    getEnabled: () => Array.from(enabledFeatures),
  };
}

/**
 * Precios de los planes
 */
export const PLAN_PRICING: Record<PlanTier, { monthly: number; setup: number; name: string; description: string }> = {
  basic: {
    monthly: 50,
    setup: 100,
    name: 'Básico',
    description: 'Para empezar con tu catálogo online',
  },
  pro: {
    monthly: 80,
    setup: 150,
    name: 'Pro',
    description: 'Control completo de inventario y ventas',
  },
  premium: {
    monthly: 120,
    setup: 200,
    name: 'Premium',
    description: 'Gestión financiera completa y multi-usuario',
  },
  custom: {
    monthly: 0,
    setup: 0,
    name: 'Personalizado',
    description: 'Configuración a medida',
  },
};
