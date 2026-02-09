import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Edit, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Car,
  Warehouse,
  Calendar,
  Banknote,
  Home,
  Bot,
  Send,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import { ApproveButton } from './approve-button';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DraftReviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: draft } = await supabase
    .from('property_drafts')
    .select('*')
    .eq('id', id)
    .single();

  if (!draft) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'auto_detected':
        return <Badge className="bg-blue-100 text-blue-800"><Bot className="w-3 h-3 mr-1" /> Detectado por IA</Badge>;
      case 'in_review':
        return <Badge className="bg-yellow-100 text-yellow-800"><Edit className="w-3 h-3 mr-1" /> En revisión</Badge>;
      case 'ready_for_approval':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Listo para aprobar</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOperationLabel = (op: string | null) => {
    if (op === 'sale') return 'Venta';
    if (op === 'rent') return 'Arriendo';
    return 'No detectado';
  };

  const getTypeLabel = (type: string | null) => {
    const types: Record<string, string> = {
      house: 'Casa',
      apartment: 'Departamento',
      office: 'Oficina',
      land: 'Terreno'
    };
    return types[type || ''] || 'No detectado';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/borradores">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Revisar Borrador</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(draft.status)}
              <span className="text-sm text-muted-foreground">
                Creado: {new Date(draft.created_at).toLocaleString('es-CL')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/borradores/${id}/editar`}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Link>
          </Button>
          <ApproveButton draftId={id} />
        </div>
      </div>

      {/* Slug Preview */}
      {draft.suggested_slug && (
        <Card className="bg-muted">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">URL pública será:</p>
            <Link 
              href={`/propiedades/${draft.suggested_slug}`}
              className="text-sm bg-background px-2 py-1 rounded inline-flex items-center gap-2 hover:underline text-blue-600"
              target="_blank"
            >
              /propiedades/{draft.suggested_slug}
              <ExternalLink className="w-3 h-3" />
            </Link>
            <p className="text-xs text-muted-foreground mt-2">
              Esta URL estará disponible después de aprobar la propiedad
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Datos detectados */}
        <div className="space-y-6">
          {/* Título sugerido */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Título Sugerido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-xl font-semibold">
                {draft.suggested_title || 'Sin título'}
              </h2>
              {draft.confidence_score && (
                <p className="text-sm mt-2">
                  <span className="text-muted-foreground">Confianza IA: </span>
                  <span className={draft.confidence_score > 0.8 ? 'text-green-600' : draft.confidence_score > 0.6 ? 'text-yellow-600' : 'text-red-600'}>
                    {Math.round(draft.confidence_score * 100)}%
                  </span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Datos principales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos Detectados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Operación</p>
                    <p className="font-medium">{getOperationLabel(draft.detected_operation)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">{getTypeLabel(draft.detected_type)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="font-medium">{draft.detected_commune || '?'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Precio</p>
                    <p className="font-medium">
                      {draft.detected_price_original ? (
                        <>
                          {draft.detected_price_currency === 'UF' && `${draft.detected_price_original.toLocaleString('es-CL')} UF`}
                          {draft.detected_price_currency === 'USD' && `US$${draft.detected_price_original.toLocaleString('es-CL')}`}
                          {draft.detected_price_currency === 'CLP' && `$${draft.detected_price_original.toLocaleString('es-CL')} CLP`}
                          {!draft.detected_price_currency && `$${draft.detected_price_original.toLocaleString('es-CL')}`}
                          {draft.detected_price_currency && draft.detected_price_currency !== 'CLP' && draft.detected_price && (
                            <span className="text-muted-foreground text-xs block">
                              (~${draft.detected_price.toLocaleString('es-CL')} CLP)
                            </span>
                          )}
                        </>
                      ) : 'No detectado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dormitorios</p>
                    <p className="font-medium">{draft.detected_bedrooms ?? '?'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Baños</p>
                    <p className="font-medium">{draft.detected_bathrooms ?? '?'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Superficie Total</p>
                    <p className="font-medium">{draft.detected_total_area ? `${draft.detected_total_area} m²` : '?'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Superficie Construida</p>
                    <p className="font-medium">{draft.detected_built_area ? `${draft.detected_built_area} m²` : '?'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estacionamientos</p>
                    <p className="font-medium">{draft.detected_parking_count ?? '?'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bodegas</p>
                    <p className="font-medium">{draft.detected_storage_count ?? '?'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Año Construcción</p>
                    <p className="font-medium">{draft.detected_year_built ?? '?'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gastos Comunes</p>
                    <p className="font-medium">{draft.detected_common_expenses ? `$${draft.detected_common_expenses.toLocaleString('es-CL')}` : '?'}</p>
                  </div>
                </div>
              </div>

              {/* Características */}
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-medium">Características:</p>
                <div className="flex flex-wrap gap-2">
                  {draft.detected_has_suite && <Badge variant="secondary">Suite</Badge>}
                  {draft.detected_in_condo && <Badge variant="secondary">Condominio</Badge>}
                  {draft.detected_has_terrace && <Badge variant="secondary">Terraza</Badge>}
                </div>
                
                {draft.detected_amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {draft.detected_amenities.map((amenity: string) => (
                      <Badge key={amenity} variant="outline">{amenity}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Datos faltantes */}
              {draft.missing_data && draft.missing_data.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Datos faltantes:</span>
                  </div>
                  <p className="text-sm mt-1">{draft.missing_data.join(', ')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Análisis de fotos */}
          {draft.fotos_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Análisis de Fotos (IA)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{draft.fotos_analysis}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna derecha: Descripciones e imágenes */}
        <div className="space-y-6">
          {/* Descripción completa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Descripción Comercial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{draft.description_full}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {draft.description_full?.length || 0} caracteres
              </p>
            </CardContent>
          </Card>

          {/* Imágenes */}
          {draft.raw_image_urls && draft.raw_image_urls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fotos ({draft.raw_image_urls.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {draft.raw_image_urls.map((url: string, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={url}
                        alt={`Foto ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Texto original */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Texto Original</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {draft.raw_input_text}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
