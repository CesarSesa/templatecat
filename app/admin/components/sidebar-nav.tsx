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
  Heart
} from 'lucide-react';

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') return true;
    if (path !== '/admin' && pathname.startsWith(path)) return true;
    return false;
  };

  const getButtonClass = (path: string) => {
    const active = isActive(path);
    return `w-full justify-start transition-all duration-200 ${
      active 
        ? 'bg-white/20 text-white font-semibold shadow-lg shadow-purple-900/20 border-l-4 border-pink-400' 
        : 'text-purple-100 hover:text-white hover:bg-purple-700/50'
    }`;
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-purple-900 via-purple-800 to-pink-800 min-h-screen sticky top-0 text-white">
      <div className="p-6 border-b border-purple-700/50">
        <Link href="/admin" className="flex items-center gap-2 text-2xl font-bold">
          <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
          <span className="bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
            Miche
          </span>
        </Link>
        <p className="text-purple-300 text-sm mt-1">Panel de Administración</p>
      </div>
      
      <nav className="p-4 space-y-1">
        <Link href="/admin">
          <Button variant="ghost" className={getButtonClass('/admin')}>
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Dashboard
          </Button>
        </Link>
        
        <Link href="/admin/productos">
          <Button variant="ghost" className={getButtonClass('/admin/productos')}>
            <Package className="w-4 h-4 mr-3" />
            Productos
          </Button>
        </Link>
        
        <Link href="/admin/inventario">
          <Button variant="ghost" className={getButtonClass('/admin/inventario')}>
            <Warehouse className="w-4 h-4 mr-3" />
            Inventario
          </Button>
        </Link>
        
        <Link href="/admin/ventas">
          <Button variant="ghost" className={getButtonClass('/admin/ventas')}>
            <ShoppingCart className="w-4 h-4 mr-3" />
            Ventas
          </Button>
        </Link>
        
        <Link href="/admin/gastos">
          <Button variant="ghost" className={getButtonClass('/admin/gastos')}>
            <Receipt className="w-4 h-4 mr-3" />
            Gastos
          </Button>
        </Link>
        
        <div className="pt-4 mt-4 border-t border-purple-700/50">
          <Link href="/tienda">
            <Button variant="ghost" className="w-full justify-start text-pink-300 hover:text-pink-200 hover:bg-purple-700/50">
              <Store className="w-4 h-4 mr-3" />
              Ver Tienda
            </Button>
          </Link>
        </div>
        
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
    </aside>
  );
}
