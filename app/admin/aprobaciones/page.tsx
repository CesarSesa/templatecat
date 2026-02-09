import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle2, 
  XCircle, 
  Clock,
  Building2,
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';

export const metadata = {
  title: 'Pendientes de Aprobación | Admin',
};

export default async function ApprovalsPage() {
  const supabase = await createClient();
  
  const { data: drafts } = await supabase
    .from('property_drafts')
    .select('*')
    .eq('status', 'ready_for_approval')
    .order('ready_for_approval_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pendientes de Aprobación</h1>
          <p className="text-muted-foreground">
            Propiedades revisadas y listas para publicar. Solo necesitan tu aprobación final.
          </p>
        </div>
        {drafts && drafts.length > 0 && (
          <Badge variant="default" className="text-lg px-4 py-2">
            {drafts.length} pendiente{drafts.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {drafts && drafts.length > 0 ? (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="hover:shadow-md transition-shadow border-green-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Imagen y precio */}
                  <div className="lg:col-span-1">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                      {draft.raw_image_urls && draft.raw_image_urls[0] ? (
                        <img 
                          src={draft.raw_image_urls[0]} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Building2 className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-primary">
                      ${draft.detected_price?.toLocaleString('es-CL') || 'Precio no definido'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {draft.detected_commune}, {draft.detected_region}
                    </p>
                  </div>

                  {/* Info principal */}
                  <div className="lg:col-span-1">
                    <Badge variant="secondary" className="mb-2">
                      <Clock className="w-3 h-3 mr-1" />
                      Listo desde {formatDistanceToNow(new Date(draft.ready_for_approval_at))}
                    </Badge>
                    
                    <h3 className="text-xl font-semibold mb-2">
                      {draft.suggested_title}
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Operación:</span> {draft.detected_operation === 'sale' ? 'Venta' : 'Arriendo'}</p>
                      <p><span className="font-medium">Tipo:</span> {draft.detected_type}</p>
                      <p><span className="font-medium">Dormitorios:</span> {draft.detected_bedrooms}</p>
                      <p><span className="font-medium">Baños:</span> {draft.detected_bathrooms}</p>
                      {draft.detected_built_area && (
                        <p><span className="font-medium">Metros:</span> {draft.detected_built_area} m²</p>
                      )}
                    </div>

                    {draft.reviewed_by && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Revisado y preparado por el equipo técnico
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="lg:col-span-1 flex flex-col justify-center gap-3">
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" asChild>
                      <Link href={`/admin/aprobaciones/${draft.id}/aprobar`}>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Publicar Ahora
                      </Link>
                    </Button>
                    
                    <Button variant="outline" size="lg" className="w-full" asChild>
                      <Link href={`/admin/aprobaciones/${draft.id}`}>
                        <Eye className="w-5 h-5 mr-2" />
                        Ver Detalles
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      asChild
                    >
                      <Link href={`/admin/aprobaciones/${draft.id}/rechazar`}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Solicitar Cambios
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted rounded-lg">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">¡Todo al día!</h3>
          <p className="text-muted-foreground">
            No hay propiedades pendientes de aprobación. Cuando el equipo técnico 
            termine de revisar una, aparecerá aquí.
          </p>
        </div>
      )}
    </div>
  );
}

import { Eye } from 'lucide-react';
