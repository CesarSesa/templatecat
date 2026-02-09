'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, StickyNote, AlertCircle, CheckCircle2 } from 'lucide-react';
import { debounce } from 'lodash';

export function QuickNotes() {
  const supabase = createClient();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Fetch user and initial content
  useEffect(() => {
    fetchUserAndNotes();
  }, []);

  const fetchUserAndNotes = async () => {
    try {
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('No hay usuario autenticado');
        setLoading(false);
        return;
      }
      
      setUserId(user.id);
      
      // Try to fetch existing note
      const { data, error: fetchError } = await supabase
        .from('user_notes')
        .select('content, updated_at')
        .eq('user_id', user.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('Error fetching notes:', fetchError);
      }
      
      if (data) {
        setContent(data.content || '');
        setLastSaved(new Date(data.updated_at));
      } else {
        // No existing note, that's ok - will create on first save
        setContent('');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar notas');
    } finally {
      setLoading(false);
    }
  };

  // Save function
  const performSave = async (newContent: string, currentUserId: string) => {
    if (!currentUserId) return;
    
    setSaving(true);
    setSaveStatus('saving');
    setError(null);
    
    try {
      const { error: upsertError } = await supabase
        .from('user_notes')
        .upsert({ 
          user_id: currentUserId,
          content: newContent,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id' 
        });
      
      if (upsertError) {
        console.error('Error saving:', upsertError);
        setError('Error al guardar: ' + upsertError.message);
        setSaveStatus('error');
      } else {
        setLastSaved(new Date());
        setSaveStatus('saved');
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error inesperado');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  // Auto-save with debounce
  const debouncedSave = useCallback(
    debounce((content: string, uid: string) => {
      performSave(content, uid);
    }, 1500),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setSaveStatus('idle');
    if (userId) {
      debouncedSave(newContent, userId);
    }
  };

  const handleManualSave = async () => {
    if (!userId) {
      setError('No hay usuario autenticado');
      return;
    }
    // Cancel pending debounced save
    debouncedSave.cancel();
    await performSave(content, userId);
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="pt-6">
          <div className="h-[300px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchUserAndNotes} className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-amber-200/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-amber-50/30 rounded-t-lg">
        <CardTitle className="text-lg flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-amber-500" />
          Notas Rápidas
        </CardTitle>
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              Guardando...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Guardado
            </span>
          )}
          {saveStatus === 'idle' && lastSaved && (
            <span className="text-xs text-muted-foreground">
              {lastSaved.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleManualSave} 
            disabled={saving}
            className="hover:bg-amber-100"
          >
            <Save className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <Textarea
          placeholder="Escribe aquí tus ideas, pendientes o recordatorios...&#10;&#10;Ejemplo:&#10;- Revisar stock de productos destacados&#10;- Subir fotos nuevas de la colección&#10;- Actualizar precios antes del fin de semana"
          value={content}
          onChange={handleChange}
          className="min-h-[280px] resize-none bg-amber-50/20 border-amber-100 focus-visible:ring-amber-200"
        />
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Se guarda automáticamente al dejar de escribir
        </p>
      </CardContent>
    </Card>
  );
}
