'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Receipt, Lock, TrendingDown, PieChart, FileText } from 'lucide-react';
import { useFeatures } from '@/components/feature-provider';

// Componente mostrado cuando la feature de gastos no está disponible
function ExpensesUpgradePrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-full p-6 mb-6">
        <Lock className="w-12 h-12 text-amber-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Gestión Financiera Premium
      </h2>
      <p className="text-gray-600 text-center max-w-md mb-6">
        El registro de gastos, reportes P&L y flujo de caja están disponibles 
        en el plan Premium ($120/mes).
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/admin">Volver al Dashboard</Link>
        </Button>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500">
          <Link href="/admin/upgrade">Ver Planes</Link>
        </Button>
      </div>
      
      {/* Features del plan Premium */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-100 text-center">
          <TrendingDown className="w-8 h-8 text-amber-500 mb-3" />
          <p className="font-medium text-sm">Registro de Gastos</p>
          <p className="text-xs text-gray-500 mt-1">Control operacional completo</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-100 text-center">
          <PieChart className="w-8 h-8 text-amber-500 mb-3" />
          <p className="font-medium text-sm">Reportes P&L</p>
          <p className="text-xs text-gray-500 mt-1">Ganancias y pérdidas automáticas</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-100 text-center">
          <FileText className="w-8 h-8 text-amber-500 mb-3" />
          <p className="font-medium text-sm">Exportar Datos</p>
          <p className="text-xs text-gray-500 mt-1">Excel y PDF para tu contador</p>
        </div>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const { isEnabled, isLoading } = useFeatures();
  
  const expensesEnabled = isEnabled('expenses');
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }
  
  // Si no tiene la feature, mostrar upgrade prompt
  if (!expensesEnabled) {
    return <ExpensesUpgradePrompt />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gastos</h1>
          <p className="text-gray-500 mt-1">
            Registro y control de gastos operacionales
          </p>
        </div>
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
