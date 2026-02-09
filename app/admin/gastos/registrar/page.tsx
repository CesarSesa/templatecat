'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const EXPENSE_CATEGORIES = [
  'mercaderia',
  'arriendo',
  'servicios',
  'transporte',
  'marketing',
  'impuestos',
  'otros',
];

export default function RegisterExpensePage() {
  const [form, setForm] = useState({
    amount: '',
    category: 'otros',
    description: '',
    supplier_name: '',
    expense_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('expenses').insert({
        amount: parseInt(form.amount),
        category: form.category,
        description: form.description,
        supplier_name: form.supplier_name || null,
        expense_date: form.expense_date,
      });

      if (error) throw error;
      router.push('/admin/gastos');
    } catch (error) {
      console.error('Error registering expense:', error);
      alert('Error al registrar gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/gastos">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Registrar Gasto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Gasto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Monto (CLP) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.expense_date}
                  onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Categoría *</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="supplier">Proveedor / Destinatario</Label>
              <Input
                id="supplier"
                value={form.supplier_name}
                onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                placeholder="Ej: Textiles Santiago"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalle del gasto..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Registrando...' : 'Registrar Gasto'}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/gastos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
