import { Metadata } from 'next';
import { PropertyForm } from '@/components/property-form';

export const metadata: Metadata = {
  title: 'Nueva Propiedad | Admin',
};

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Nueva Propiedad</h1>
        <p className="text-muted-foreground">
          Completa el formulario para agregar una nueva propiedad al catálogo.
        </p>
      </div>

      <PropertyForm />
    </div>
  );
}
