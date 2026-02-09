'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ShoppingBag, TrendingUp, Heart } from 'lucide-react';

export function HeroSection() {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const category = formData.get('category') as string;
    const query = formData.get('query') as string;

    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (query) params.set('q', query);
    
    router.push(`/tienda/productos${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Encuentra lo <span className="text-primary">mejor para ti</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Explora nuestro catálogo de productos seleccionados. 
            Calidad y buenos precios en un solo lugar.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="bg-card p-4 rounded-xl shadow-lg border">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select name="category" defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    <SelectItem value="destacados">Destacados</SelectItem>
                    <SelectItem value="nuevos">Nuevos ingresos</SelectItem>
                    <SelectItem value="ofertas">Ofertas</SelectItem>
                  </SelectContent>
                </Select>

                <Input 
                  name="query"
                  placeholder="Buscar productos..."
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </form>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
          <div>
            <ShoppingBag className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold">+100</p>
            <p className="text-sm text-muted-foreground">Productos</p>
          </div>
          <div>
            <Heart className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold">+500</p>
            <p className="text-sm text-muted-foreground">Clientes felices</p>
          </div>
          <div>
            <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold">5+</p>
            <p className="text-sm text-muted-foreground">Años de experiencia</p>
          </div>
        </div>
      </div>
    </section>
  );
}
