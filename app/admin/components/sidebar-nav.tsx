'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse,
  ShoppingCart,
  Receipt,
  Store,
  LogOut,
  Heart,
  BarChart3,
  Users,
  Settings
} from 'lucide-react';
import { useFeatures, FeatureGate, AnyFeatureGate } from '@/components/feature-provider';
import { FeatureKey } from '@/lib/features';

// Definición de ítems de navegación con sus features requeridas
interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  feature: FeatureKey | FeatureKey[];
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { 
    href: '/admin', 
    label: 'Dashboard', 
    icon: <LayoutDashboard className="w-4 h-4 mr-3" />, 
    feature: 'public_catalog',
    exact: true 
  },
  { 
    href: '/admin/productos', 
    label: 'Productos', 
    icon: <Package className="w-4 h-4 mr-3" />, 
    feature: 'products' 
  },
  { 
    href: '/admin/inventario', 
    label: 'Inventario', 
    icon: <Warehouse className="w-4 h-4 mr-3" />, 
    feature: 'inventory' 
  },
  { 
    href: '/admin/ventas', 
    label: 'Ventas', 
    icon: <ShoppingCart className="w-4 h-4 mr-3" />, 
    feature: 'sales' 
  },
  { 
    href: '/admin/gastos', 
    label: 'Gastos', 
    icon: <Receipt className="w-4 h-4 mr-3" />, 
    feature: 'expenses' 
  },
  { 
    href: '/admin/clientes', 
    label: 'Clientes', 
    icon: <Users className="w-4 h-4 mr-3" />, 
    feature: 'customers' 
  },
  { 
    href: '/admin/reportes', 
    label: 'Reportes', 
    icon: <BarChart3 className="w-4 h-4 mr-3" />, 
    feature: ['sales_analytics', 'advanced_reports'] 
  },
];

// Componente para renderizar un ítem de navegación
function NavItemComponent({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const { isEnabled, isAnyEnabled } = useFeatures();
  
  const isActive = () => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };
  
  const getButtonClass = () => {
    const active = isActive();
    return `w-full justify-start transition-all duration-200 ${
      active 
        ? 'bg-white/20 text-white font-semibold shadow-lg shadow-purple-900/20 border-l-4 border-pink-400' 
        : 'text-purple-100 hover:text-white hover:bg-purple-700/50'
    }`;
  };
  
  // Verificar si la feature está habilitada
  const enabled = Array.isArray(item.feature) 
    ? isAnyEnabled(item.feature)
    : isEnabled(item.feature);
    
  if (!enabled) {
    return null;
  }
  
  return (
    <Link href={item.href}>
      <Button variant="ghost" className={getButtonClass()}>
        {item.icon}
        {item.label}
      </Button>
    </Link>
  );
}

// Componente para mostrar el nombre del negocio
function BusinessName() {
  const { config, isLoading } = useFeatures();
  
  if (isLoading) {
    return <span>Mi Negocio</span>;
  }
  
  return <span>{config?.businessName || 'Mi Negocio'}</span>;
}

// Badge del plan actual
function PlanBadge() {
  const { config, isLoading } = useFeatures();
  
  if (isLoading || !config) {
    return null;
  }
  
  const planLabels: Record<string, string> = {
    basic: 'Básico',
    pro: 'Pro',
    premium: 'Premium',
    custom: 'Personalizado',
  };
  
  const planColors: Record<string, string> = {
    basic: 'bg-gray-500/30 text-gray-200',
    pro: 'bg-blue-500/30 text-blue-200',
    premium: 'bg-amber-500/30 text-amber-200',
    custom: 'bg-purple-500/30 text-purple-200',
  };
  
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${planColors[config.plan] || planColors.basic}`}>
      {planLabels[config.plan] || config.plan}
    </span>
  );
}

export function SidebarNav() {
  const { isLoading } = useFeatures();
  
  return (
    <aside className="w-64 bg-gradient-to-b from-purple-900 via-purple-800 to-pink-800 min-h-screen sticky top-0 text-white">
      {/* Header */}
      <div className="p-6 border-b border-purple-700/50">
        <Link href="/admin" className="flex items-center gap-2 text-2xl font-bold">
          <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
          <span className="bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
            <BusinessName />
          </span>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <p className="text-purple-300 text-sm">Panel de Administración</p>
          <PlanBadge />
        </div>
      </div>
      
      {/* Navegación Principal */}
      <nav className="p-4 space-y-1">
        {isLoading ? (
          // Skeleton loading
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className="h-10 bg-white/5 rounded-lg animate-pulse mb-1"
              />
            ))}
          </>
        ) : (
          <>
            {NAV_ITEMS.map((item) => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </>
        )}
        
        {/* Sección Tienda */}
        <div className="pt-4 mt-4 border-t border-purple-700/50">
          <Link href="/tienda">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-pink-300 hover:text-pink-200 hover:bg-purple-700/50"
            >
              <Store className="w-4 h-4 mr-3" />
              Ver Tienda
            </Button>
          </Link>
        </div>
        
        {/* Configuración (solo premium) */}
        <FeatureGate feature="multi_user">
          <div className="pt-2">
            <Link href="/admin/configuracion">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-purple-300 hover:text-white hover:bg-purple-700/50"
              >
                <Settings className="w-4 h-4 mr-3" />
                Configuración
              </Button>
            </Link>
          </div>
        </FeatureGate>
        
        {/* Logout */}
        <form action="/auth/logout" method="post" className="pt-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-purple-300 hover:text-white hover:bg-red-500/20" 
            type="submit"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Cerrar Sesión
          </Button>
        </form>
      </nav>
      
      {/* Footer con info del plan */}
      <FeatureGate feature="advanced_reports">
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-700/50">
          <div className="text-xs text-purple-300 text-center">
            <p>✨ Versión Premium</p>
            <p className="mt-1">Todas las funciones habilitadas</p>
          </div>
        </div>
      </FeatureGate>
    </aside>
  );
}
