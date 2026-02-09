'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Save, 
  Send,
  Bot,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Draft {
  id: string;
  suggested_title: string | null;
  suggested_slug: string | null;
  detected_operation: 'sale' | 'rent' | null;
  detected_type: 'house' | 'apartment' | 'office' | 'land' | null;
  detected_commune: string | null;
  detected_region: string | null;
  detected_price: number | null;
  detected_bedrooms: number | null;
  detected_bathrooms: number | null;
  detected_total_area: number | null;
  detected_built_area: number | null;
  detected_year_built: number | null;
  detected_common_expenses: number | null;
  detected_has_suite: boolean;
  detected_in_condo: boolean;
  detected_has_terrace: boolean;
  detected_parking_count: number | null;
  detected_storage_count: number | null;
  detected_price_original: number | null;
  detected_price_currency: 'CLP' | 'UF' | 'USD';
  detected_amenities: string[];
  detected_security_features: string[];
  description_tecnica: string | null;
  description_puntos_fuertes: string | null;
  description_plusvalia: string | null;
  description_full: string | null;
  status: string;
}

export default function DraftEditPage({ params }: { params: Promise<{ id: string }> }) {
  const [draftId, setDraftId] = useState<string>('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Cargar draft
  useEffect(() => {
    const loadData = async () => {
      const { id } = await params;
      setDraftId(id);
      
      const { data } = await supabase
        .from('property_drafts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setDraft(data);
      }
      setLoading(false);
    };
    loadData();
  }, [params, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;

    setSaving(true);
    
    const { error } = await supabase
      .from('property_drafts')
      .update({
        suggested_title: draft.suggested_title,
        suggested_slug: draft.suggested_slug,
        detected_operation: draft.detected_operation,
        detected_type: draft.detected_type,
        detected_commune: draft.detected_commune,
        detected_price: draft.detected_price,
        detected_bedrooms: draft.detected_bedrooms,
        detected_bathrooms: draft.detected_bathrooms,
        detected_total_area: draft.detected_total_area,
        detected_built_area: draft.detected_built_area,
        detected_year_built: draft.detected_year_built,
        detected_common_expenses: draft.detected_common_expenses,
        detected_has_suite: draft.detected_has_suite,
        detected_in_condo: draft.detected_in_condo,
        detected_has_terrace: draft.detected_has_terrace,
        detected_parking_count: draft.detected_parking_count,
        detected_storage_count: draft.detected_storage_count,
        detected_price_original: draft.detected_price_original,
        detected_price_currency: draft.detected_price_currency,
        detected_amenities: draft.detected_amenities,
        detected_security_features: draft.detected_security_features,
        description_tecnica: draft.description_tecnica,
        description_puntos_fuertes: draft.description_puntos_fuertes,
        description_plusvalia: draft.description_plusvalia,
        status: 'in_review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', draftId);

    setSaving(false);

    if (!error) {
      router.push(`/admin/borradores/${draftId}`);
      router.refresh();
    } else {
      alert('Error al guardar: ' + error.message);
    }
  };

  const handleSendToApproval = async () => {
    if (!draft) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from('property_drafts')
      .update({
        status: 'ready_for_approval',
        updated_at: new Date().toISOString(),
      })
      .eq('id', draftId);

    setSaving(false);

    if (!error) {
      router.push('/admin/borradores');
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="text-center py-12">
        <p>Borrador no encontrado</p>
        <Button asChild className="mt-4">
          <Link href="/admin/borradores">Volver a borradores</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/borradores/${draftId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Borrador</h1>
            <p className="text-sm text-muted-foreground">
              Revisa y corrige los datos detectados por la IA
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Guardar
          </Button>
          <Button 
            onClick={handleSendToApproval}
            disabled={saving}
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar a Aprobación
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Slug */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">URL Amigable (Slug)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="slug">Slug</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-muted-foreground text-sm">/propiedades/</span>
                <Input
                  id="slug"
                  value={draft.suggested_slug || ''}
                  onChange={(e) => setDraft({ ...draft, suggested_slug: e.target.value })}
                  placeholder="venta-departamento-nunoa-3d2b-ab12"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Este será el URL público de la propiedad. Formato sugerido: operacion-tipo-comuna-dormitorios
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Datos básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos Principales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={draft.suggested_title || ''}
                  onChange={(e) => setDraft({ ...draft, suggested_title: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="operation">Operación</Label>
                  <select
                    id="operation"
                    value={draft.detected_operation || ''}
                    onChange={(e) => setDraft({ ...draft, detected_operation: e.target.value as 'sale' | 'rent' | null })}
                    className="w-full mt-1.5 h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="sale">Venta</option>
                    <option value="rent">Arriendo</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    value={draft.detected_type || ''}
                    onChange={(e) => setDraft({ ...draft, detected_type: e.target.value as 'house' | 'apartment' | 'office' | 'land' | null })}
                    className="w-full mt-1.5 h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="house">Casa</option>
                    <option value="apartment">Departamento</option>
                    <option value="office">Oficina</option>
                    <option value="land">Terreno</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commune">Comuna</Label>
                  <Input
                    id="commune"
                    value={draft.detected_commune || ''}
                    onChange={(e) => setDraft({ ...draft, detected_commune: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="region">Región</Label>
                  <Input
                    id="region"
                    value={draft.detected_region || 'Metropolitana'}
                    onChange={(e) => setDraft({ ...draft, detected_region: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="price">Precio</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="price"
                    type="number"
                    value={draft.detected_price_original || ''}
                    onChange={(e) => setDraft({ ...draft, detected_price_original: e.target.value ? parseInt(e.target.value) : null })}
                    className="flex-1"
                  />
                  <select
                    value={draft.detected_price_currency || 'CLP'}
                    onChange={(e) => setDraft({ ...draft, detected_price_currency: e.target.value as 'CLP' | 'UF' | 'USD' })}
                    className="h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="CLP">CLP</option>
                    <option value="UF">UF</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Características */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Características</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Dormitorios</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={draft.detected_bedrooms || ''}
                    onChange={(e) => setDraft({ ...draft, detected_bedrooms: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Baños</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={draft.detected_bathrooms || ''}
                    onChange={(e) => setDraft({ ...draft, detected_bathrooms: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total_area">Superficie Total (m²)</Label>
                  <Input
                    id="total_area"
                    type="number"
                    value={draft.detected_total_area || ''}
                    onChange={(e) => setDraft({ ...draft, detected_total_area: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="built_area">Superficie Construida (m²)</Label>
                  <Input
                    id="built_area"
                    type="number"
                    value={draft.detected_built_area || ''}
                    onChange={(e) => setDraft({ ...draft, detected_built_area: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parking">Estacionamientos</Label>
                  <Input
                    id="parking"
                    type="number"
                    value={draft.detected_parking_count || ''}
                    onChange={(e) => setDraft({ ...draft, detected_parking_count: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="storage">Bodegas</Label>
                  <Input
                    id="storage"
                    type="number"
                    value={draft.detected_storage_count || ''}
                    onChange={(e) => setDraft({ ...draft, detected_storage_count: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Año Construcción</Label>
                  <Input
                    id="year"
                    type="number"
                    value={draft.detected_year_built || ''}
                    onChange={(e) => setDraft({ ...draft, detected_year_built: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="expenses">Gastos Comunes (CLP)</Label>
                  <Input
                    id="expenses"
                    type="number"
                    value={draft.detected_common_expenses || ''}
                    onChange={(e) => setDraft({ ...draft, detected_common_expenses: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={draft.detected_has_suite}
                    onChange={(e) => setDraft({ ...draft, detected_has_suite: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Suite</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={draft.detected_in_condo}
                    onChange={(e) => setDraft({ ...draft, detected_in_condo: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Condominio</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={draft.detected_has_terrace}
                    onChange={(e) => setDraft({ ...draft, detected_has_terrace: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Terraza</span>
                </label>
              </div>

              {/* Amenities */}
              <div className="pt-4 border-t">
                <Label className="mb-2 block">Amenities Detectadas</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {draft.detected_amenities?.map((amenity: string) => (
                    <span key={amenity} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {amenity}
                      <button
                        type="button"
                        onClick={() => setDraft({
                          ...draft,
                          detected_amenities: draft.detected_amenities?.filter((a: string) => a !== amenity) || []
                        })}
                        className="ml-1 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  placeholder="Agregar amenity (Enter para agregar)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value && !draft.detected_amenities?.includes(value)) {
                        setDraft({
                          ...draft,
                          detected_amenities: [...(draft.detected_amenities || []), value]
                        });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>

              {/* Seguridad */}
              <div className="pt-4">
                <Label className="mb-2 block">Seguridad Detectada</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {draft.detected_security_features?.map((feature: string) => (
                    <span key={feature} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {feature}
                      <button
                        type="button"
                        onClick={() => setDraft({
                          ...draft,
                          detected_security_features: draft.detected_security_features?.filter((f: string) => f !== feature) || []
                        })}
                        className="ml-1 hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  placeholder="Agregar seguridad (Enter para agregar)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value && !draft.detected_security_features?.includes(value)) {
                        setDraft({
                          ...draft,
                          detected_security_features: [...(draft.detected_security_features || []), value]
                        });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Descripción única */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Descripción Comercial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">
                Descripción completa (se mostrará en la publicación)
              </Label>
              <Textarea
                id="description"
                value={draft.description_full || ''}
                onChange={(e) => setDraft({ ...draft, description_full: e.target.value })}
                rows={20}
                className="mt-1.5 min-h-[400px] resize-y"
                placeholder="Descripción comercial de la propiedad..."
              />
              <p className="text-xs text-muted-foreground mt-2">
                {draft.description_full?.length || 0} caracteres. 
                Recomendado: 600-900 palabras. Esta descripción es la que verán los clientes.
              </p>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
