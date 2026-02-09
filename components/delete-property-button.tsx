'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeletePropertyButtonProps {
  propertyId: string;
}

export function DeletePropertyButton({ propertyId }: DeletePropertyButtonProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm('¿Estás seguro de eliminar esta propiedad?')) {
      e.preventDefault();
    }
  };

  return (
    <form 
      action={`/admin/propiedades/${propertyId}/eliminar`}
      method="post"
      onSubmit={handleSubmit}
    >
      <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-600">
        <Trash2 className="w-4 h-4" />
      </Button>
    </form>
  );
}
