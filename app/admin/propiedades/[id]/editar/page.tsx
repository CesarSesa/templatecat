import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PropertyForm } from '@/components/property-form';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: property } = await supabase
    .from('properties')
    .select('title')
    .eq('id', id)
    .single();

  return {
    title: property ? `Editar: ${property.title}` : 'Editar Propiedad',
  };
}

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (!property) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Editar Propiedad</h1>
        <p className="text-muted-foreground">
          Modifica los datos de la propiedad según sea necesario.
        </p>
      </div>

      <PropertyForm property={property} isEditing />
    </div>
  );
}
