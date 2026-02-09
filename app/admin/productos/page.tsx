'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Search, Edit, Eye } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category_id: string;
  categories?: { name: string };
  images: string[];
  active: boolean;
  featured: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-8">Cargando productos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Button asChild>
          <Link href="/admin/productos/nuevo">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative aspect-square bg-muted">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sin imagen
                </div>
              )}
              {!product.active && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="secondary" className="text-white">Inactivo</Badge>
                </div>
              )}
              {product.featured && (
                <Badge className="absolute top-2 right-2 bg-yellow-500">
                  Destacado
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold truncate">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {product.categories?.name || 'Sin categoría'}
              </p>
              <p className="font-bold mt-2">
                ${product.price.toLocaleString('es-CL')} CLP
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/admin/productos/${product.id}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/admin/productos/${product.id}/editar`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron productos</p>
          <Button asChild className="mt-4">
            <Link href="/admin/productos/nuevo">Crear primer producto</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
