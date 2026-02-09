'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { operationLabels, propertyTypeLabels } from '@/types/property';
import { X, Search } from 'lucide-react';

interface PropertyFiltersProps {
  communes: string[];
}

export function PropertyFilters({ communes }: PropertyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const operation = searchParams.get('operation') || 'all';
  const propertyType = searchParams.get('type') || 'all';
  const commune = searchParams.get('commune') || 'all';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const hasFilters = operation !== 'all' || propertyType !== 'all' || commune !== 'all' || minPrice || maxPrice;

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/propiedades?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    router.push('/propiedades', { scroll: false });
  };

  return (
    <div className="bg-muted/50 p-4 rounded-lg mb-8">
      <div className="flex flex-col gap-4">
        {/* Fila 1: Operación y Tipo */}
        <div className="grid grid-cols-2 gap-3">
          {/* Operation Filter */}
          <div className="w-full">
            <label className="text-sm font-medium mb-1.5 block">Operación</label>
            <Select value={operation} onValueChange={(v) => updateFilter('operation', v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="sale">{operationLabels.sale}</SelectItem>
                <SelectItem value="rent">{operationLabels.rent}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Type Filter */}
          <div className="w-full">
            <label className="text-sm font-medium mb-1.5 block">Tipo</label>
            <Select value={propertyType} onValueChange={(v) => updateFilter('type', v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
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
        </div>

        {/* Fila 2: Rango de precios */}
        <div className="grid grid-cols-2 gap-3">
          <div className="w-full">
            <label className="text-sm font-medium mb-1.5 block">Precio mínimo</label>
            <Select value={minPrice} onValueChange={(v) => updateFilter('minPrice', v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sin mínimo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin mínimo</SelectItem>
                <SelectItem value="100000">$100.000</SelectItem>
                <SelectItem value="200000">$200.000</SelectItem>
                <SelectItem value="300000">$300.000</SelectItem>
                <SelectItem value="400000">$400.000</SelectItem>
                <SelectItem value="500000">$500.000</SelectItem>
                <SelectItem value="600000">$600.000</SelectItem>
                <SelectItem value="700000">$700.000</SelectItem>
                <SelectItem value="800000">$800.000</SelectItem>
                <SelectItem value="900000">$900.000</SelectItem>
                <SelectItem value="1000000">$1.000.000</SelectItem>
                <SelectItem value="2000000">$2.000.000</SelectItem>
                <SelectItem value="5000000">$5.000.000</SelectItem>
                <SelectItem value="10000000">$10.000.000</SelectItem>
                <SelectItem value="20000000">$20.000.000</SelectItem>
                <SelectItem value="50000000">$50.000.000</SelectItem>
                <SelectItem value="100000000">$100.000.000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full">
            <label className="text-sm font-medium mb-1.5 block">Precio máximo</label>
            <Select value={maxPrice} onValueChange={(v) => updateFilter('maxPrice', v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sin máximo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin máximo</SelectItem>
                <SelectItem value="200000">$200.000</SelectItem>
                <SelectItem value="300000">$300.000</SelectItem>
                <SelectItem value="400000">$400.000</SelectItem>
                <SelectItem value="500000">$500.000</SelectItem>
                <SelectItem value="600000">$600.000</SelectItem>
                <SelectItem value="700000">$700.000</SelectItem>
                <SelectItem value="800000">$800.000</SelectItem>
                <SelectItem value="900000">$900.000</SelectItem>
                <SelectItem value="1000000">$1.000.000</SelectItem>
                <SelectItem value="2000000">$2.000.000</SelectItem>
                <SelectItem value="5000000">$5.000.000</SelectItem>
                <SelectItem value="10000000">$10.000.000</SelectItem>
                <SelectItem value="20000000">$20.000.000</SelectItem>
                <SelectItem value="50000000">$50.000.000</SelectItem>
                <SelectItem value="100000000">$100.000.000</SelectItem>
                <SelectItem value="200000000">$200.000.000</SelectItem>
                <SelectItem value="500000000">$500.000.000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Fila 3: Comuna y Botón Limpiar */}
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          {/* Commune Filter */}
          <div className="w-full sm:flex-1">
            <label className="text-sm font-medium mb-1.5 block">Comuna</label>
            <Select value={commune} onValueChange={(v) => updateFilter('commune', v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas las comunas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las comunas</SelectItem>
                {communes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto">
              <X className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
