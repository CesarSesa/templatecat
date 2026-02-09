import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PropertyCard } from '@/components/property-card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface FeaturedPropertiesProps {
  title: string;
  subtitle?: string;
  operation?: 'sale' | 'rent';
  limit?: number;
}

export async function FeaturedProperties({ 
  title, 
  subtitle, 
  operation, 
  limit = 6 
}: FeaturedPropertiesProps) {
  const supabase = await createClient();

  let query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (operation) {
    query = query.eq('operation', operation);
  }

  const { data: properties } = await query;

  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <Button variant="ghost" asChild className="mt-4 md:mt-0">
            <Link href={operation ? `/propiedades?operation=${operation}` : '/propiedades'}>
              Ver todas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
