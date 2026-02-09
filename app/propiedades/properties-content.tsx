'use client';

import { use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { PropertyCard } from '@/components/property-card';
import { PropertyFilters } from '@/components/property-filters';
import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Property } from '@/types/property';

interface Props {
  searchParams: Promise<{
    operation?: string;
    type?: string;
    commune?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default function PropertiesContent({ searchParams }: Props) {
  const params = use(searchParams);
  const [properties, setProperties] = useState<Property[]>([]);
  const [communes, setCommunes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      try {
        // Build query
        let query = supabase
          .from('properties')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        // Apply filters
        if (params.operation) {
          query = query.eq('operation', params.operation);
        }
        if (params.type) {
          query = query.eq('property_type', params.type);
        }
        if (params.commune) {
          query = query.eq('commune', params.commune);
        }
        if (params.minPrice) {
          query = query.gte('price_clp', parseInt(params.minPrice));
        }
        if (params.maxPrice) {
          query = query.lte('price_clp', parseInt(params.maxPrice));
        }

        const { data: propertiesData, error: propertiesError } = await query;

        if (propertiesError) throw propertiesError;

        // Get unique communes
        const { data: communesData } = await supabase
          .from('properties')
          .select('commune')
          .eq('status', 'published');

        const uniqueCommunes = Array.from(
          new Set(communesData?.map((p) => p.commune) || [])
        ).sort();

        setProperties(propertiesData || []);
        setCommunes(uniqueCommunes);
      } catch (err) {
        setError('Error al cargar propiedades');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error al cargar propiedades</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            🏠 Catálogo Inmobiliario
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/">Inicio</Link>
            </Button>
            <Button variant="default" asChild>
              <Link href="/auth/login">Acceder</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Propiedades Disponibles</h1>
          <p className="text-muted-foreground">
            Encuentra tu próximo hogar entre nuestras {properties.length} propiedades disponibles.
          </p>
        </div>

        {/* Filters */}
        <PropertyFilters communes={communes} />

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <SearchX className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No se encontraron propiedades</h2>
            <p className="text-muted-foreground mb-6">
              Intenta ajustar los filtros o vuelve más tarde.
            </p>
            <Button asChild variant="outline">
              <Link href="/propiedades">Ver todas las propiedades</Link>
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Catálogo Inmobiliario. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
