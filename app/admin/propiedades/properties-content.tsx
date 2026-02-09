'use client';

import { use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DeletePropertyButton } from '@/components/delete-property-button';
import { 
  Plus, 
  Search, 
  Edit, 
  ExternalLink,
  Building2,
} from 'lucide-react';
import { formatPrice, operationLabels, propertyTypeLabels } from '@/types/property';
import { useEffect, useState } from 'react';
import { Property } from '@/types/property';

interface Props {
  searchParams: Promise<{
    status?: string;
    operation?: string;
    q?: string;
  }>;
}

export default function PropertiesContent({ searchParams }: Props) {
  const params = use(searchParams);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }
      if (params.operation && params.operation !== 'all') {
        query = query.eq('operation', params.operation);
      }

      const { data } = await query;

      // Filter by search query client-side
      const filtered = data?.filter(p => {
        if (!params.q) return true;
        const searchTerm = params.q.toLowerCase();
        return (
          p.title.toLowerCase().includes(searchTerm) ||
          p.commune.toLowerCase().includes(searchTerm) ||
          p.slug.toLowerCase().includes(searchTerm)
        );
      }) || [];

      setProperties(filtered);
      setLoading(false);
    }

    fetchData();
  }, [params]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Propiedades</h1>
          <p className="text-muted-foreground">
            {properties.length} propiedades en total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/propiedades/nueva">
            <Plus className="w-4 h-4 mr-2" />
            Nueva propiedad
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <form className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            name="q"
            placeholder="Buscar por título, comuna o slug..."
            className="pl-10"
            defaultValue={params.q || ''}
          />
        </div>
        <Select name="status" defaultValue={params.status || 'all'}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="published">Publicadas</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
          </SelectContent>
        </Select>
        <Select name="operation" defaultValue={params.operation || 'all'}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Operación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="sale">Venta</SelectItem>
            <SelectItem value="rent">Arriendo</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
        {(params.q || params.status || params.operation) && (
          <Button type="button" variant="ghost" asChild>
            <Link href="/admin/propiedades">Limpiar</Link>
          </Button>
        )}
      </form>

      {/* Properties Table */}
      {properties.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">Propiedad</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Precio</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Tipo</th>
                <th className="text-left p-4 font-medium">Estado</th>
                <th className="text-right p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {property.images?.[0] ? (
                          <img 
                            src={property.images[0]} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[200px]">{property.title}</p>
                        <p className="text-sm text-muted-foreground">{property.commune}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {formatPrice(property.price_clp)}
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="space-y-1">
                      <Badge variant="outline">
                        {operationLabels[property.operation]}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {propertyTypeLabels[property.property_type]}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant={property.status === 'published' ? 'default' : 'secondary'}
                      className={property.status === 'published' ? 'bg-green-500' : ''}
                    >
                      {property.status === 'published' ? 'Publicada' : 'Borrador'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link 
                          href={`/propiedades/${property.slug}`}
                          target="_blank"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/propiedades/${property.id}/editar`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <DeletePropertyButton propertyId={property.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No se encontraron propiedades</h3>
          <p className="text-muted-foreground mb-4">
            {params.q || params.status || params.operation 
              ? 'Intenta ajustar los filtros' 
              : 'Comienza creando tu primera propiedad'}
          </p>
          <Button asChild>
            <Link href="/admin/propiedades/nueva">
              <Plus className="w-4 h-4 mr-2" />
              Nueva propiedad
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
