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
import { Search, Home, TrendingUp, Key } from 'lucide-react';
import { operationLabels, propertyTypeLabels } from '@/types/property';

export function HeroSection() {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const operation = formData.get('operation') as string;
    const type = formData.get('type') as string;
    const query = formData.get('query') as string;

    const params = new URLSearchParams();
    if (operation && operation !== 'all') params.set('operation', operation);
    if (type && type !== 'all') params.set('type', type);
    
    router.push(`/propiedades${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Encuentra tu <span className="text-primary">hogar ideal</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Casas, departamentos y oficinas en las mejores ubicaciones. 
            Te ayudamos a encontrar la propiedad perfecta para ti.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="bg-card p-4 rounded-xl shadow-lg border">
            <div className="flex flex-col gap-3">
              {/* Fila 1: Operación y Tipo (lado a lado en todos los tamaños) */}
              <div className="grid grid-cols-2 gap-3">
                <Select name="operation" defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Operación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="sale">{operationLabels.sale}</SelectItem>
                    <SelectItem value="rent">{operationLabels.rent}</SelectItem>
                  </SelectContent>
                </Select>

                <Select name="type" defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="house">{propertyTypeLabels.house}</SelectItem>
                    <SelectItem value="apartment">{propertyTypeLabels.apartment}</SelectItem>
                    <SelectItem value="office">{propertyTypeLabels.office}</SelectItem>
                    <SelectItem value="land">{propertyTypeLabels.land}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fila 2: Búsqueda y Botón */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  name="query"
                  placeholder="Buscar por comuna..."
                  className="flex-1"
                />
                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
          <div>
            <Home className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold">+500</p>
            <p className="text-sm text-muted-foreground">Propiedades</p>
          </div>
          <div>
            <Key className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold">+300</p>
            <p className="text-sm text-muted-foreground">Familias felices</p>
          </div>
          <div>
            <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold">15+</p>
            <p className="text-sm text-muted-foreground">Años de experiencia</p>
          </div>
        </div>
      </div>
    </section>
  );
}
