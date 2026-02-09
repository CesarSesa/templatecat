'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [sizes, setSizes] = useState(['XS', 'S', 'M', 'L', 'XL']);
  const [colors, setColors] = useState(['Negro', 'Blanco', 'Azul', 'Rojo']);
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    cost_price: '',
    category_id: '',
    newSize: '',
    newColor: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order');
    setCategories(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generar slug
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Crear producto
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          name: form.name,
          description: form.description,
          slug: slug + '-' + Date.now().toString(36),
          price: parseInt(form.price),
          cost_price: form.cost_price ? parseInt(form.cost_price) : null,
          category_id: form.category_id || null,
          available_sizes: sizes,
          available_colors: colors,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Crear variantes de inventario iniciales (stock 0)
      const variants = [];
      for (const size of sizes) {
        for (const color of colors) {
          variants.push({
            product_id: product.id,
            size,
            color,
            stock_quantity: 0,
          });
        }
      }

      await supabase.from('product_variants').insert(variants);

      router.push(`/admin/productos/${product.id}/editar`);
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  const addSize = () => {
    if (form.newSize && !sizes.includes(form.newSize)) {
      setSizes([...sizes, form.newSize]);
      setForm({ ...form, newSize: '' });
    }
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size));
  };

  const addColor = () => {
    if (form.newColor && !colors.includes(form.newColor)) {
      setColors([...colors, form.newColor]);
      setForm({ ...form, newColor: '' });
    }
  };

  const removeColor = (color: string) => {
    setColors(colors.filter(c => c !== color));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/productos">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Ej: Vestido Florencia"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Descripción del producto..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Precio de Venta (CLP) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  placeholder="25000"
                />
              </div>
              <div>
                <Label htmlFor="cost_price">Costo (opcional)</Label>
                <Input
                  id="cost_price"
                  type="number"
                  value={form.cost_price}
                  onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                  placeholder="12000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="none">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tallas Disponibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {size}
                  <button
                    type="button"
                    onClick={() => removeSize(size)}
                    className="ml-2 text-blue-600 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nueva talla (ej: XXL)"
                value={form.newSize}
                onChange={(e) => setForm({ ...form, newSize: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
              />
              <Button type="button" variant="outline" onClick={addSize}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Colores Disponibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  {color}
                  <button
                    type="button"
                    onClick={() => removeColor(color)}
                    className="ml-2 text-purple-600 hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nuevo color (ej: Verde)"
                value={form.newColor}
                onChange={(e) => setForm({ ...form, newColor: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
              />
              <Button type="button" variant="outline" onClick={addColor}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creando...' : 'Crear Producto'}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/productos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
