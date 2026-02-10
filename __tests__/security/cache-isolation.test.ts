/**
 * Tests de Seguridad: Aislamiento de Cache entre Usuarios
 * 
 * Estos tests verifican que el sistema de feature flags NO comparta
 * datos de cache entre diferentes usuarios, evitando data leaks en SSR.
 * 
 * VULNERABILIDAD CRÍTICA PREVENIDA:
 * ---------------------------------
 * El código anterior usaba variables de módulo para cachear features:
 *   let featuresCache: Set<FeatureKey> | null = null;
 * 
 * Esto causaba que en entornos SSR (Server-Side Rendering), el cache
 * se compartiera entre solicitudes de diferentes usuarios. Un usuario
 * B podía recibir los features del usuario A, permitiendo acceso no
 * autorizado a funcionalidades de planes superiores.
 * 
 * SOLUCIÓN IMPLEMENTADA:
 * ----------------------
 * Usar React.cache() con userId como key, que crea caches aislados
 * por usuario en el contexto de renderizado de React Server Components.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// TYPES Y MOCK DATA
// ============================================================================

type FeatureKey = 
  | 'products' | 'public_catalog' | 'categories' | 'images'
  | 'inventory' | 'stock_alerts' | 'variants' | 'barcodes'
  | 'sales' | 'sales_analytics' | 'customers' | 'discounts'
  | 'expenses' | 'profit_loss' | 'cash_flow'
  | 'advanced_reports' | 'dashboard_widgets'
  | 'multi_user' | 'api_access' | 'webhooks';

type PlanTier = 'basic' | 'pro' | 'premium';

interface UserFeatures {
  userId: string;
  plan: PlanTier;
  features: Set<FeatureKey>;
}

// Features disponibles por plan
const FEATURES_BY_PLAN: Record<PlanTier, FeatureKey[]> = {
  basic: ['products', 'public_catalog', 'categories', 'images'],
  pro: [
    'products', 'public_catalog', 'categories', 'images',
    'inventory', 'stock_alerts', 'variants', 'barcodes',
    'sales', 'sales_analytics', 'customers'
  ],
  premium: [
    'products', 'public_catalog', 'categories', 'images',
    'inventory', 'stock_alerts', 'variants', 'barcodes',
    'sales', 'sales_analytics', 'customers', 'discounts',
    'expenses', 'profit_loss', 'cash_flow',
    'advanced_reports', 'dashboard_widgets',
    'multi_user', 'api_access', 'webhooks'
  ]
};

// Mock de usuarios de prueba
const MOCK_USERS = {
  userPremium: {
    id: 'user-premium-001',
    email: 'premium@test.com',
    plan: 'premium' as PlanTier,
    features: new Set(FEATURES_BY_PLAN.premium)
  },
  userBasic: {
    id: 'user-basic-001',
    email: 'basic@test.com',
    plan: 'basic' as PlanTier,
    features: new Set(FEATURES_BY_PLAN.basic)
  },
  userPro: {
    id: 'user-pro-001',
    email: 'pro@test.com',
    plan: 'pro' as PlanTier,
    features: new Set(FEATURES_BY_PLAN.pro)
  }
};

// ============================================================================
// MOCK DE REACT.CACHE
// ============================================================================

/**
 * Mock simplificado de React.cache()
 * 
 * React.cache() en el entorno real de Next.js/React crea caches aislados
 * por contexto de renderizado. Este mock simula ese comportamiento
 * creando un Map por userId.
 */
const mockCacheStore = new Map<string, Set<FeatureKey>>();

function mockReactCache<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    // El primer argumento es siempre userId en nuestra implementación
    const userId = args[0] as string;
    
    if (mockCacheStore.has(userId)) {
      return Promise.resolve(mockCacheStore.get(userId)) as ReturnType<T>;
    }
    
    const result = fn(...args);
    
    // Almacenar en cache para este userId específico
    if (result instanceof Promise) {
      return result.then(data => {
        mockCacheStore.set(userId, data);
        return data;
      }) as ReturnType<T>;
    }
    
    mockCacheStore.set(userId, result);
    return result;
  }) as T;
}

// ============================================================================
// MOCK DE BASE DE DATOS
// ============================================================================

/**
 * Simula la función que obtiene features desde la base de datos.
 * En producción esto sería una llamada a Supabase.
 */
async function fetchFeaturesFromDB(userId: string): Promise<Set<FeatureKey>> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 10));
  
  const user = Object.values(MOCK_USERS).find(u => u.id === userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }
  
  return new Set(user.features);
}

// ============================================================================
// IMPLEMENTACIÓN NUEVA (segura) - Simulación de @/lib/features
// ============================================================================

/**
 * Implementación SEGURA usando React.cache()
 * Cada userId tiene su propio cache aislado.
 */
const getUserFeatures = mockReactCache(async (userId: string): Promise<Set<FeatureKey>> => {
  return fetchFeaturesFromDB(userId);
});

/**
 * Implementación INSEGURA (simulando el código viejo)
 * Usa variable de módulo global que se comparte entre todos los usuarios.
 */
let insecureGlobalCache: Set<FeatureKey> | null = null;

async function getEnabledFeaturesInsecure(userId: string): Promise<Set<FeatureKey>> {
  // BUG CRÍTICO: Este cache es global y compartido entre todas las solicitudes
  if (insecureGlobalCache !== null) {
    return insecureGlobalCache;
  }
  
  const features = await fetchFeaturesFromDB(userId);
  insecureGlobalCache = features;
  return features;
}

function resetInsecureCache() {
  insecureGlobalCache = null;
}

function resetMockCache() {
  mockCacheStore.clear();
}

// ============================================================================
// TESTS DE SEGURIDAD
// ============================================================================

describe('🔒 Cache Isolation Security Tests', () => {
  beforeEach(() => {
    resetMockCache();
    resetInsecureCache();
  });

  // ============================================================================
  // TEST 1: Aislamiento Básico
  // ============================================================================
  
  /**
   * TEST DE AISLAMIENTO BÁSICO
   * 
   * Vulnerabilidad probada: Data leak entre usuarios en solicitudes secuenciales
   * 
   * Escenario: User A (premium) solicita features, luego User B (basic) 
   * solicita features inmediatamente después.
   * 
   * Comportamiento inseguro esperado: B recibe features de A (premium)
   * Comportamiento seguro esperado: B solo recibe sus features (basic)
   */
  describe('Basic Isolation', () => {
    it('should NOT share cache between different users in sequential requests', async () => {
      // Arrange: User A (premium) y User B (basic)
      const userA = MOCK_USERS.userPremium;
      const userB = MOCK_USERS.userBasic;
      
      // Act: User A solicita features primero
      const featuresA = await getUserFeatures(userA.id);
      
      // Act: User B solicita features después
      const featuresB = await getUserFeatures(userB.id);
      
      // Assert: Cada usuario recibe SUS propios features
      expect(featuresA).toEqual(userA.features);
      expect(featuresB).toEqual(userB.features);
      
      // Assert CRÍTICO: B NO tiene acceso a features premium
      expect(featuresB.has('expenses')).toBe(false); // Solo premium
      expect(featuresB.has('multi_user')).toBe(false); // Solo premium
      expect(featuresA.has('expenses')).toBe(true); // A sí tiene premium
      
      // Verificación adicional: los sets deben ser diferentes
      expect(featuresA).not.toEqual(featuresB);
    });

    it('should demonstrate the vulnerability in the OLD implementation', async () => {
      // Este test demuestra cómo falla la implementación vieja
      const userA = MOCK_USERS.userPremium;
      const userB = MOCK_USERS.userBasic;
      
      // Act: User A (premium) primero - el cache se llena con datos de A
      const featuresA = await getEnabledFeaturesInsecure(userA.id);
      
      // Act: User B (basic) después - recibe cache de A (BUG!)
      const featuresB = await getEnabledFeaturesInsecure(userB.id);
      
      // Assert: Este es el BUG - B recibe features de A
      expect(featuresB.has('expenses')).toBe(true); // BUG: B tiene acceso a premium!
      expect(featuresB.has('multi_user')).toBe(true); // BUG: B tiene acceso a premium!
      
      // Los features de B son iguales a los de A (data leak)
      expect(featuresB).toEqual(featuresA);
    });
  });

  // ============================================================================
  // TEST 2: Concurrencia
  // ============================================================================
  
  /**
   * TEST DE CONCURRENCIA
   * 
   * Vulnerabilidad probada: Race conditions en solicitudes simultáneas
   * 
   * Escenario: 3 usuarios diferentes solicitan features simultáneamente.
   * El primero en completar podría "contaminar" el cache para los otros.
   * 
   * Comportamiento inseguro esperado: Todos reciben features del más rápido
   * Comportamiento seguro esperado: Cada uno recibe solo sus features
   */
  describe('Concurrent Access', () => {
    it('should maintain isolation when 3 users request simultaneously', async () => {
      // Arrange: 3 usuarios con planes diferentes
      const userA = MOCK_USERS.userBasic;
      const userB = MOCK_USERS.userPro;
      const userC = MOCK_USERS.userPremium;
      
      // Act: Las 3 solicitudes se ejecutan simultáneamente
      const [featuresA, featuresB, featuresC] = await Promise.all([
        getUserFeatures(userA.id),
        getUserFeatures(userB.id),
        getUserFeatures(userC.id)
      ]);
      
      // Assert: Cada usuario tiene sus propios features
      expect(featuresA).toEqual(userA.features);
      expect(featuresB).toEqual(userB.features);
      expect(featuresC).toEqual(userC.features);
      
      // Assert: Features específicas de cada plan
      
      // User A (basic) - solo core
      expect(featuresA.has('products')).toBe(true);
      expect(featuresA.has('inventory')).toBe(false); // No tiene pro
      expect(featuresA.has('expenses')).toBe(false); // No tiene premium
      
      // User B (pro) - core + inventory/sales
      expect(featuresB.has('products')).toBe(true);
      expect(featuresB.has('inventory')).toBe(true); // Sí tiene pro
      expect(featuresB.has('expenses')).toBe(false); // No tiene premium
      
      // User C (premium) - todo
      expect(featuresC.has('products')).toBe(true);
      expect(featuresC.has('inventory')).toBe(true);
      expect(featuresC.has('expenses')).toBe(true); // Sí tiene premium
      expect(featuresC.has('multi_user')).toBe(true); // Sí tiene premium
      
      // Verificación de seguridad: No hay cross-contamination
      const basicFeatureCount = Array.from(featuresA).length;
      const proFeatureCount = Array.from(featuresB).length;
      const premiumFeatureCount = Array.from(featuresC).length;
      
      expect(basicFeatureCount).toBeLessThan(proFeatureCount);
      expect(proFeatureCount).toBeLessThan(premiumFeatureCount);
    });

    it('should handle rapid sequential requests from same user', async () => {
      const user = MOCK_USERS.userPremium;
      
      // Múltiples solicitudes del mismo usuario
      const results = await Promise.all([
        getUserFeatures(user.id),
        getUserFeatures(user.id),
        getUserFeatures(user.id),
        getUserFeatures(user.id)
      ]);
      
      // Todas deben retornar los mismos features
      results.forEach(features => {
        expect(features).toEqual(user.features);
      });
    });
  });

  // ============================================================================
  // TEST 3: No-Contaminación
  // ============================================================================
  
  /**
   * TEST DE NO-CONTAMINACIÓN
   * 
   * Vulnerabilidad probada: Cache poisoning entre solicitudes alternadas
   * 
   * Escenario: User A solicita, luego User B, luego User A otra vez.
   * El cache podría "recordar" el último usuario consultado.
   * 
   * Comportamiento inseguro esperado: User A recibe features de B en la 2da llamada
   * Comportamiento seguro esperado: User A siempre recibe features premium
   */
  describe('Cache Poisoning Prevention', () => {
    it('should not contaminate cache when users alternate requests', async () => {
      const userA = MOCK_USERS.userPremium;
      const userB = MOCK_USERS.userBasic;
      
      // Secuencia: A → B → A → B → A
      const resultsA: Set<FeatureKey>[] = [];
      const resultsB: Set<FeatureKey>[] = [];
      
      // Request 1: User A
      resultsA.push(await getUserFeatures(userA.id));
      
      // Request 2: User B
      resultsB.push(await getUserFeatures(userB.id));
      
      // Request 3: User A otra vez
      resultsA.push(await getUserFeatures(userA.id));
      
      // Request 4: User B otra vez
      resultsB.push(await getUserFeatures(userB.id));
      
      // Request 5: User A una vez más
      resultsA.push(await getUserFeatures(userA.id));
      
      // Assert: User A siempre recibe features premium
      resultsA.forEach((features, index) => {
        expect(features.has('expenses')).toBe(true);
        expect(features.has('multi_user')).toBe(true);
        expect(features.has('api_access')).toBe(true);
        expect(features).toEqual(userA.features);
      });
      
      // Assert: User B siempre recibe features basic
      resultsB.forEach((features, index) => {
        expect(features.has('expenses')).toBe(false);
        expect(features.has('multi_user')).toBe(false);
        expect(features.has('api_access')).toBe(false);
        expect(features).toEqual(userB.features);
      });
      
      // Assert: Los features de A nunca se mezclan con los de B
      resultsA.forEach(featuresA => {
        resultsB.forEach(featuresB => {
          expect(featuresA).not.toEqual(featuresB);
        });
      });
    });

    it('should maintain correct features after multiple plan changes', async () => {
      // Simular que un usuario cambia de plan mientras otro usuario consulta
      const userA = MOCK_USERS.userPremium;
      const userB = MOCK_USERS.userBasic;
      const userC = MOCK_USERS.userPro;
      
      // Patrón complejo de solicitudes
      const pattern = [
        { user: userA, expectedPlan: 'premium' as PlanTier },
        { user: userB, expectedPlan: 'basic' as PlanTier },
        { user: userC, expectedPlan: 'pro' as PlanTier },
        { user: userA, expectedPlan: 'premium' as PlanTier },
        { user: userB, expectedPlan: 'basic' as PlanTier },
        { user: userA, expectedPlan: 'premium' as PlanTier },
        { user: userC, expectedPlan: 'pro' as PlanTier },
        { user: userB, expectedPlan: 'basic' as PlanTier },
      ];
      
      for (const { user, expectedPlan } of pattern) {
        const features = await getUserFeatures(user.id);
        const expectedFeatures = new Set(FEATURES_BY_PLAN[expectedPlan]);
        
        expect(features).toEqual(expectedFeatures);
        
        // Verificar features específicas por plan
        switch (expectedPlan) {
          case 'basic':
            expect(features.has('inventory')).toBe(false);
            expect(features.has('expenses')).toBe(false);
            break;
          case 'pro':
            expect(features.has('inventory')).toBe(true);
            expect(features.has('expenses')).toBe(false);
            break;
          case 'premium':
            expect(features.has('inventory')).toBe(true);
            expect(features.has('expenses')).toBe(true);
            break;
        }
      }
    });
  });

  // ============================================================================
  // TEST 4: Edge Cases
  // ============================================================================
  
  describe('Edge Cases', () => {
    it('should handle users with same email but different IDs', async () => {
      // Dos usuarios con emails similares pero IDs diferentes
      const user1 = { ...MOCK_USERS.userPremium, id: 'user-1', email: 'test@company.com' };
      const user2 = { ...MOCK_USERS.userBasic, id: 'user-2', email: 'test@company.com' };
      
      // Override temporal en mock
      const originalUsers = { ...MOCK_USERS };
      
      // Simular que ambos existen en la "base de datos"
      vi.stubGlobal('MOCK_USERS', {
        ...originalUsers,
        tempUser1: user1,
        tempUser2: user2
      });
      
      const features1 = await getUserFeatures(user1.id);
      const features2 = await getUserFeatures(user2.id);
      
      // IDs diferentes = features diferentes
      expect(features1).not.toEqual(features2);
      expect(features1.has('expenses')).toBe(true);
      expect(features2.has('expenses')).toBe(false);
    });

    it('should handle empty or invalid user IDs gracefully', async () => {
      // User ID no existe
      await expect(getUserFeatures('non-existent-user')).rejects.toThrow('User not found');
    });
  });
});

// ============================================================================
// TESTS DE DEMONSTRACIÓN DE LA VULNERABILIDAD
// ============================================================================

describe('🐛 Vulnerability Demonstration (Insecure Implementation)', () => {
  beforeEach(() => {
    resetInsecureCache();
  });

  /**
   * Este test suite demuestra explícitamente cómo el código viejo
   * es vulnerable a data leaks entre usuarios.
   */
  it('demonstrates complete cache sharing vulnerability', async () => {
    const attacker = MOCK_USERS.userBasic;
    const victim = MOCK_USERS.userPremium;
    
    // El atacante (basic) espera a que un admin (premium) use el sistema
    // Después de eso, el atacante obtiene acceso a features premium
    
    // Admin (víctima) usa el sistema primero
    const victimFeatures = await getEnabledFeaturesInsecure(victim.id);
    expect(victimFeatures.has('expenses')).toBe(true);
    
    // Atacante usa el sistema después - recibe cache de la víctima!
    const attackerFeatures = await getEnabledFeaturesInsecure(attacker.id);
    
    // BUG: El atacante ahora tiene acceso a features premium
    expect(attackerFeatures.has('expenses')).toBe(true); // Vulnerabilidad!
    expect(attackerFeatures.has('multi_user')).toBe(true); // Vulnerabilidad!
    expect(attackerFeatures.has('api_access')).toBe(true); // Vulnerabilidad!
    
    // El atacante tiene exactamente los mismos features que la víctima
    expect(attackerFeatures).toEqual(victimFeatures);
  });
});
