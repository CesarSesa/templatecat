'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  draftId: string;
}

export function ApproveButton({ draftId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    if (!confirm('¿Estás seguro de aprobar y publicar esta propiedad?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/drafts/${draftId}/approve`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al aprobar');
      }

      // Redirigir a la propiedad publicada
      router.push(data.url);
      router.refresh();
    } catch (error) {
      alert('Error: ' + (error as Error).message);
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleApprove} disabled={loading} className="bg-green-600 hover:bg-green-700">
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <CheckCircle2 className="w-4 h-4 mr-2" />
      )}
      Aprobar y Publicar
    </Button>
  );
}
