'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Lock } from 'lucide-react';
import { useFeatures, FeatureGate } from '@/components/feature-provider';
import Link from 'next/link';

interface LowStockItem {
  product_name: string;
  size: string;
  color: string;
  stock_quantity: number;
  min_stock_alert: number;
}

// Componente mostrado cuando la feature de inventario no está disponible
function InventoryUpgradePrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-6 mb-6">
        <Lock className="w-12 h-12 text-purple-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Control de Inventario Pro
      </h2>
      <p className="text-gray-600 text-center max-w-md mb-6">
        El control de inventario con alertas de stock y variantes está disponible 
        en el plan Pro ($80/mes).
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/admin">Volver al Dashboard</Link>
        </Button>
        <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
          <Link href="/admin/upgrade">Ver Planes</Link>
        </Button>
      </div>
      
      {/* Features del plan Pro */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-100">
          <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
          <div>
            <p className="font-medium text-sm">Stock en tiempo real</p>
            <p className="text-xs text-gray-500">Seguimiento de cada variante</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-100">
          <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
          <div>
            <p className="font-medium text-sm">Alertas automáticas</p>
            <p className="text-xs text-gray-500">Notificaciones de stock bajo</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-100">
          <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
          <div>
            <p className="font-medium text-sm">Variantes ilimitadas</p>
            <p className="text-xs text-gray-500">Talla, color y más</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-100">
          <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
          <div>
            <p className="font-medium text-sm">Códigos SKU</p>
            <p className="text-xs text-gray-500">Gestión profesional</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isEnabled } = useFeatures();
  const supabase = createClient();

  const inventoryEnabled = isEnabled('inventory');

  useEffect(() => {
    if (inventoryEnabled) {
      loadInventory();
    } else {
      setLoading(false);
    }
  }, [inventoryEnabled]);

  const loadInventory = async () => {
    try {
      const { data } = await supabase
        .from('low_stock_alert')
        .select('*');
      
      setLowStock(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  // Si no tiene la feature, mostrar upgrade prompt
  if (!inventoryEnabled) {
    return <InventoryUpgradePrompt />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-gray-500 mt-1">
            Gestión de stock y variantes de productos
          </p>
        </div>
        <Button>+ Ajustar Stock</Button>
      </div>

      {/* Alertas de Stock */}
      <FeatureGate feature="stock_alerts">
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Productos con Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-muted-foreground">No hay alertas de stock</p>
            ) : (
              <div className="space-y-2">
                {lowStock.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Talla: {item.size} | Color: {item.color}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={item.stock_quantity === 0 ? "destructive" : "secondary"}>
                        {item.stock_quantity} unidades
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FeatureGate>

      {/* Gestión de Inventario */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aquí se implementará la gestión completa de stock por producto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
