import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Eye, 
  Edit, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Bot
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';

export const metadata = {
  title: 'Borradores | Admin',
};

export default async function DraftsPage() {
  const supabase = await createClient();
  
  const { data: drafts } = await supabase
    .from('property_drafts')
    .select('*')
    .in('status', ['auto_detected', 'in_review', 'ready_for_approval'])
    .order('created_at', { ascending: false });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'auto_detected':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Bot className="w-3 h-3 mr-1" /> Detectado por IA</Badge>;
      case 'in_review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Edit className="w-3 h-3 mr-1" /> En revisión</Badge>;
      case 'ready_for_approval':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Listo para aprobar</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Borradores</h1>
          <p className="text-muted-foreground">
            Propiedades detectadas automáticamente que necesitan revisión antes de publicar.
          </p>
        </div>
      </div>

      {drafts && drafts.length > 0 ? (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(draft.status)}
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(draft.created_at))}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-1">
                      {draft.suggested_title || 'Sin título'}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>📍 {draft.detected_commune || 'Sin comuna'}</span>
                      <span>💰 {draft.detected_price_original ? 
                        (draft.detected_price_currency === 'UF' ? 
                          `${draft.detected_price_original.toLocaleString('es-CL')} UF` :
                          draft.detected_price_currency === 'USD' ?
                          `US$${draft.detected_price_original.toLocaleString('es-CL')}` :
                          `$${draft.detected_price_original.toLocaleString('es-CL')} CLP`
                        ) : 'Sin precio'
                      }</span>
                      <span>🛏️ {draft.detected_bedrooms || '?'} Dorm</span>
                      <span>🚿 {draft.detected_bathrooms || '?'} Baños</span>
                    </div>

                    {draft.missing_data && draft.missing_data.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>Faltan: {draft.missing_data.join(', ')}</span>
                      </div>
                    )}

                    {draft.confidence_score && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Confianza IA: </span>
                        <span className={draft.confidence_score > 0.8 ? 'text-green-600' : draft.confidence_score > 0.6 ? 'text-yellow-600' : 'text-red-600'}>
                          {Math.round(draft.confidence_score * 100)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/borradores/${draft.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Revisar
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/admin/borradores/${draft.id}/editar`}>
                        Editar
                        <ArrowRight className="w-4 h-4 ml-2" />
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
          <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay borradores pendientes</h3>
          <p className="text-muted-foreground">
            Cuando envíes una propiedad por WhatsApp con la palabra "SUBIR", aparecerá aquí.
          </p>
        </div>
      )}
    </div>
  );
}
