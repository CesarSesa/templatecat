'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Sparkles, Zap, Crown } from 'lucide-react';
import { useFeatures } from '@/components/feature-provider';
import Link from 'next/link';
import { PLAN_PRICING } from '@/lib/features';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  key: 'basic' | 'pro' | 'premium';
  name: string;
  price: number;
  setup: number;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: PlanFeature[];
}

const PLANS: Plan[] = [
  {
    key: 'basic',
    name: 'Básico',
    price: PLAN_PRICING.basic.monthly,
    setup: PLAN_PRICING.basic.setup,
    description: 'Para empezar con tu catálogo online',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-gray-500 to-gray-600',
    features: [
      { name: 'Catálogo de productos ilimitado', included: true },
      { name: 'Página pública de catálogo', included: true },
      { name: 'Categorías personalizables', included: true },
      { name: 'Subida de imágenes', included: true },
      { name: 'Control de inventario', included: false },
      { name: 'Registro de ventas', included: false },
      { name: 'Reportes de ventas', included: false },
      { name: 'Registro de gastos', included: false },
      { name: 'Reportes P&L', included: false },
      { name: 'Multi-usuario', included: false },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: PLAN_PRICING.pro.monthly,
    setup: PLAN_PRICING.pro.setup,
    description: 'Control completo de inventario y ventas',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-blue-500 to-purple-500',
    features: [
      { name: 'Todo lo del plan Básico', included: true },
      { name: 'Control de inventario', included: true },
      { name: 'Variantes (talla/color)', included: true },
      { name: 'Alertas de stock bajo', included: true },
      { name: 'Registro de ventas', included: true },
      { name: 'Reportes de ventas', included: true },
      { name: 'Base de clientes', included: true },
      { name: 'Códigos SKU', included: true },
      { name: 'Registro de gastos', included: false },
      { name: 'Multi-usuario', included: false },
    ],
  },
  {
    key: 'premium',
    name: 'Premium',
    price: PLAN_PRICING.premium.monthly,
    setup: PLAN_PRICING.premium.setup,
    description: 'Gestión financiera completa y multi-usuario',
    icon: <Crown className="w-6 h-6" />,
    color: 'from-amber-400 to-orange-500',
    features: [
      { name: 'Todo lo del plan Pro', included: true },
      { name: 'Registro de gastos', included: true },
      { name: 'Reportes P&L automáticos', included: true },
      { name: 'Flujo de caja', included: true },
      { name: 'Exportar Excel/PDF', included: true },
      { name: 'Multi-usuario (hasta 5)', included: true },
      { name: 'Roles: admin, vendedor, contador', included: true },
      { name: 'Dashboard personalizable', included: true },
      { name: 'API access', included: true },
      { name: 'Soporte prioritario', included: true },
    ],
  },
];

function PlanCard({ plan, currentPlan }: { plan: Plan; currentPlan: string }) {
  const isCurrent = plan.key === currentPlan;
  
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      isCurrent ? 'ring-2 ring-purple-500 shadow-lg' : ''
    }`}>
      {isCurrent && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
          Tu Plan Actual
        </div>
      )}
      
      <CardHeader className={`bg-gradient-to-r ${plan.color} text-white`}>
        <div className="flex items-center gap-3">
          {plan.icon}
          <div>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <p className="text-white/80 text-sm mt-1">{plan.description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Precio */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">${plan.price}</span>
            <span className="text-gray-500">/mes</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            + ${plan.setup} setup inicial
          </p>
        </div>
        
        {/* Features */}
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3">
              {feature.included ? (
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
              )}
              <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
        
        {/* Botón */}
        {isCurrent ? (
          <Button className="w-full" variant="outline" disabled>
            Plan Actual
          </Button>
        ) : (
          <Button 
            className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`}
            asChild
          >
            <Link href={`/admin/upgrade/checkout?plan=${plan.key}`}>
              {currentPlan === 'basic' && plan.key === 'pro' ? 'Mejorar a Pro' :
               currentPlan === 'basic' && plan.key === 'premium' ? 'Mejorar a Premium' :
               currentPlan === 'pro' && plan.key === 'premium' ? 'Mejorar a Premium' :
               'Seleccionar Plan'}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function UpgradePage() {
  const { config, isLoading } = useFeatures();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }
  
  const currentPlan = config?.plan || 'basic';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Mejora tu Plan</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Desbloquea más funcionalidades para hacer crecer tu negocio. 
          Todos los planes incluyen soporte y actualizaciones.
        </p>
      </div>
      
      {/* Planes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {PLANS.map((plan) => (
          <PlanCard key={plan.key} plan={plan} currentPlan={currentPlan} />
        ))}
      </div>
      
      {/* Notas */}
      <div className="max-w-2xl mx-auto text-center text-sm text-gray-500 space-y-2">
        <p>
          ¿Tienes preguntas? Escríbenos a{' '}
          <a href="mailto:soporte@catalogkit.cl" className="text-purple-600 hover:underline">
            soporte@catalogkit.cl
          </a>
        </p>
        <p>
          Puedes cancelar o cambiar de plan en cualquier momento. 
          Sin contratos ni compromisos.
        </p>
      </div>
    </div>
  );
}
