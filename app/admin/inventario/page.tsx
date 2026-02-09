'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Minus } from 'lucide-react';

interface LowStockItem {
  product_name: string;
  size: string;
  color: string;
  stock_quantity: number;
  min_stock_alert: number;
}

export default function InventoryPage() {
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadInventory();
  }, []);

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
    return <div className="p-8">Cargando inventario...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventario</h1>
        <Button>+ Ajustar Stock</Button>
      </div>

      {/* Alertas */}
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

      {/* Placeholder para gestión completa */}
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
