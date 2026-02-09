'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  product_variants?: { id: string; size: string; color: string; stock_quantity: number }[];
}

interface SaleItem {
  product_id: string;
  variant_id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
}

export default function RegisterSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, product_variants(id, size, color, stock_quantity)')
      .eq('active', true);
    setProducts(data || []);
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);

  const addItem = () => {
    if (!selectedProduct || !selectedVariant) return;
    
    const variant = selectedProductData?.product_variants?.find(v => v.id === selectedVariant);
    if (!variant) return;

    const newItem: SaleItem = {
      product_id: selectedProduct,
      variant_id: selectedVariant,
      product_name: selectedProductData?.name || '',
      size: variant.size,
      color: variant.color,
      quantity,
      unit_price: selectedProductData?.price || 0,
    };

    setItems([...items, newItem]);
    setSelectedProduct('');
    setSelectedVariant('');
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      // Crear venta
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          total_amount: total,
          customer_name: customerName,
          payment_method: paymentMethod,
          payment_status: 'completed',
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Crear items de venta
      const saleItems = items.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      await supabase.from('sale_items').insert(saleItems);

      // Actualizar stock
      for (const item of items) {
        await supabase.rpc('decrement_stock', {
          variant_id: item.variant_id,
          amount: item.quantity,
        });
      }

      router.push('/admin/ventas');
    } catch (error) {
      console.error('Error registering sale:', error);
      alert('Error al registrar venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/ventas">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Registrar Venta</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Venta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customer">Nombre Cliente (opcional)</Label>
              <Input
                id="customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>
            <div>
              <Label htmlFor="payment">Método de Pago</Label>
              <select
                id="payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Agregar Items */}
        <Card>
          <CardHeader>
            <CardTitle>Agregar Productos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Producto</Label>
                <select
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    setSelectedVariant('');
                  }}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="none">Seleccionar...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Variación (Talla/Color)</Label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  disabled={!selectedProduct}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="none">Seleccionar...</option>
                  {selectedProductData?.product_variants?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.size} / {v.color} (Stock: {v.stock_quantity})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  type="button" 
                  onClick={addItem}
                  disabled={!selectedVariant}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Agregados */}
        <Card>
          <CardHeader>
            <CardTitle>Productos en esta Venta</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-muted-foreground">No hay productos agregados</p>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.size} / {item.color} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">
                        ${(item.unit_price * item.quantity).toLocaleString('es-CL')}
                      </span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeItem(idx)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t mt-4">
                  <p className="text-2xl font-bold text-right">
                    Total: ${total.toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={loading || items.length === 0} 
            className="flex-1"
          >
            {loading ? 'Registrando...' : 'Registrar Venta'}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/ventas">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
