'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  ShoppingBag,
  Sparkles,
  Heart,
  Receipt
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  todaySales: number;
  todayRevenue: number;
  monthRevenue: number;
  monthExpenses: number;
}

interface LowStockItem {
  product_name: string;
  size: string;
  color: string;
  stock_quantity: number;
  min_stock_alert: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockCount: 0,
    todaySales: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    monthExpenses: 0,
  });
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Total productos
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      // Stock bajo
      const { data: lowStockData } = await supabase
        .from('low_stock_alert')
        .select('*')
        .limit(5);

      // Ventas de hoy
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySales } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('sale_date', today);

      const todayRevenue = todaySales?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;

      // Ventas del mes
      const monthStart = new Date();
      monthStart.setDate(1);
      const { data: monthSales } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('sale_date', monthStart.toISOString().split('T')[0]);

      const monthRevenue = monthSales?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;

      // Gastos del mes
      const { data: monthExpenses } = await supabase
        .from('expenses')
        .select('amount')
        .gte('expense_date', monthStart.toISOString().split('T')[0]);

      const totalExpenses = monthExpenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      setStats({
        totalProducts: totalProducts || 0,
        lowStockCount: lowStockData?.length || 0,
        todaySales: todaySales?.length || 0,
        todayRevenue,
        monthRevenue,
        monthExpenses: totalExpenses,
      });

      setLowStock(lowStockData || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Sparkles className="w-8 h-8 text-pink-500 animate-pulse" />
      </div>
    );
  }

  const roi = stats.monthRevenue - stats.monthExpenses;
  const roiPercentage = stats.monthExpenses > 0 
    ? ((roi / stats.monthExpenses) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-900 flex items-center gap-2">
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
            Dashboard
          </h1>
          <p className="text-purple-600/70 mt-1">Bienvenido a <BusinessName /> ✨</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white">
          <ShoppingBag className="w-4 h-4 mr-2" />
          Registrar Venta
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Productos Activos</CardTitle>
            <Package className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-purple-200">En catálogo</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-100">Ventas Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-pink-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todaySales}</div>
            <p className="text-xs text-pink-200">
              ${stats.todayRevenue.toLocaleString('es-CL')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-400 to-pink-400 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Ingresos Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.monthRevenue.toLocaleString('es-CL')}
            </div>
            <p className="text-xs text-white/70">Este mes</p>
          </CardContent>
        </Card>

        <Card className={`border-0 ${roi >= 0 ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-br from-red-400 to-rose-500 text-white'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">ROI Estimado</CardTitle>
            {roi >= 0 ? (
              <TrendingUp className="h-4 w-4 text-white/80" />
            ) : (
              <TrendingDown className="h-4 w-4 text-white/80" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {roiPercentage}%
            </div>
            <p className="text-xs text-white/70">
              ${Math.abs(roi).toLocaleString('es-CL')} {roi >= 0 ? 'ganancia' : 'pérdida'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Stock Bajo */}
      <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <AlertTriangle className="w-5 h-5 text-pink-500" />
            Alertas de Stock Bajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStock.length === 0 ? (
            <p className="text-purple-600/70 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              No hay alertas de stock. ¡Todo está perfecto!
            </p>
          ) : (
            <div className="space-y-2">
              {lowStock.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-white/80 rounded-lg border border-pink-200">
                  <div>
                    <p className="font-medium text-purple-900">{item.product_name}</p>
                    <p className="text-sm text-purple-600">
                      Talla: {item.size} | Color: {item.color}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.stock_quantity === 0 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {item.stock_quantity} unidades
                    </span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" asChild className="mt-2 border-pink-300 text-pink-600 hover:bg-pink-50">
                <Link href="/admin/inventario">Ver todo el inventario</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" asChild className="border-purple-300 text-purple-700 hover:bg-purple-50 h-auto py-4">
          <Link href="/admin/productos/nuevo">
            <Package className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Link>
        </Button>
        <Button variant="outline" asChild className="border-pink-300 text-pink-600 hover:bg-pink-50 h-auto py-4">
          <Link href="/admin/gastos/registrar">
            <Receipt className="w-4 h-4 mr-2" />
            Registrar Gasto
          </Link>
        </Button>
        <Button variant="outline" asChild className="border-purple-300 text-purple-700 hover:bg-purple-50 h-auto py-4">
          <Link href="/tienda">Ver Tienda</Link>
        </Button>
        <Button variant="outline" asChild className="border-pink-300 text-pink-600 hover:bg-pink-50 h-auto py-4">
          <Link href="/admin/inventario">Gestionar Stock</Link>
        </Button>
      </div>
    </div>
  );
}
