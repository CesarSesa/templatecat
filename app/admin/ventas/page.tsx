'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, ShoppingBag } from 'lucide-react';

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ventas</h1>
        <Button asChild>
          <Link href="/admin/ventas/registrar">
            <Plus className="w-4 h-4 mr-2" />
            Registrar Venta
          </Link>
        </Button>
      </div>

      <div className="text-center py-12">
        <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay ventas registradas</h3>
        <p className="text-muted-foreground mb-4">
          Registra tu primera venta para comenzar a llevar el control
        </p>
        <Button asChild>
          <Link href="/admin/ventas/registrar">Registrar Venta</Link>
        </Button>
      </div>
    </div>
  );
}
