'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, X, Download, Eye } from 'lucide-react';

interface ReferenceFile {
  name: string;
  url: string;
  size: number;
  uploaded_at: string;
}

export default function ReferenciasPage() {
  const [files, setFiles] = useState<ReferenceFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const { data, error } = await supabase
      .storage
      .from('references')
      .list();

    if (error) {
      console.error('Error loading files:', error);
    } else if (data) {
      const filesWithUrls = await Promise.all(
        data.map(async (file) => {
          const { data: urlData } = supabase
            .storage
            .from('references')
            .getPublicUrl(file.name);
          
          return {
            name: file.name,
            url: urlData.publicUrl,
            size: file.metadata?.size || 0,
            uploaded_at: file.created_at || '',
          };
        })
      );
      setFiles(filesWithUrls);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    const { error } = await supabase
      .storage
      .from('references')
      .upload(file.name, file, {
        upsert: true,
      });

    setUploading(false);

    if (error) {
      alert('Error al subir: ' + error.message);
    } else {
      loadFiles();
      e.target.value = '';
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`¿Eliminar ${name}?`)) return;

    const { error } = await supabase
      .storage
      .from('references')
      .remove([name]);

    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      loadFiles();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Archivos de Referencia</h1>
        <p className="text-muted-foreground">
          Documentos, guías y archivos de referencia para la gestión del negocio.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Subir nuevo archivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="file">Seleccionar archivo</Label>
              <Input
                id="file"
                type="file"
                onChange={handleUpload}
                disabled={uploading}
                className="mt-1.5"
              />
            </div>
            {uploading && <span className="text-sm text-muted-foreground">Subiendo...</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Puedes subir PDFs, imágenes de referencia, documentos de precios, etc.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {files.length === 0 ? (
          <Card className="bg-muted">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay archivos de referencia aún</p>
            </CardContent>
          </Card>
        ) : (
          files.map((file) => (
            <Card key={file.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatSize(file.size)} • Subido el {new Date(file.uploaded_at).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={file.url} download={file.name}>
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
