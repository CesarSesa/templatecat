'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Receipt } from 'lucide-react';

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gastos</h1>
        <Button asChild>
          <Link href="/admin/gastos/registrar">
            <Plus className="w-4 h-4 mr-2" />
            Registrar Gasto
          </Link>
        </Button>
      </div>

      <div className="text-center py-12">
        <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay gastos registrados</h3>
        <p className="text-muted-foreground mb-4">
          Registra tus gastos operacionales para llevar control del ROI
        </p>
        <Button asChild>
          <Link href="/admin/gastos/registrar">Registrar Gasto</Link>
        </Button>
      </div>
    </div>
  );
}
