'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Loader2, Send, Image as ImageIcon } from 'lucide-react';

export default function UploadPropertyPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newImages = Array.from(e.dataTransfer.files).filter(
        file => file.type.startsWith('image/')
      );
      setImages(prev => [...prev, ...newImages]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).filter(
        file => file.type.startsWith('image/')
      );
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Por favor ingresa la descripción de la propiedad');
      return;
    }
    if (images.length === 0) {
      setError('Por favor adjunta al menos una foto');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('text', text);
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      const response = await fetch('/api/process-property', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar');
      }

      const data = await response.json();
      
      // Redirigir al borrador creado
      router.push(`/admin/borradores/${data.draft_id}`);
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Subir Nueva Propiedad</h1>
        <p className="text-muted-foreground">
          Pega el texto recibido y adjunta las fotos. La IA analizará y creará un borrador.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información de la propiedad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Input */}
          <div className="space-y-2">
            <Label htmlFor="text">Texto recibido (descripción) *</Label>
            <Textarea
              id="text"
              placeholder="Pega aquí el mensaje recibido por WhatsApp...&#10;&#10;Ejemplo:&#10;Arriendo departamento 2D2B en Macul, recién remodelado, $580.000 mensual. Tiene estacionamiento y bodega. Edificio con piscina y quincho."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Incluye todos los detalles: precio, comuna, metros, dormitorios, etc.
            </p>
          </div>

          {/* Drag & Drop Area */}
          <div className="space-y-2">
            <Label>Fotos de la propiedad *</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:bg-muted/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <label 
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="font-medium mb-1">
                  {dragActive ? 'Suelta las fotos aquí' : 'Arrastra fotos aquí'}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  o haz click para seleccionar
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP hasta 10MB cada una
                </p>
              </label>
            </div>
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div>
              <Label className="mb-2 block">
                {images.length} foto{images.length !== 1 ? 's' : ''} seleccionada{images.length !== 1 ? 's' : ''}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-primary text-white text-[10px] px-2 py-0.5 rounded">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button 
              size="lg" 
              className="flex-1"
              onClick={handleSubmit}
              disabled={uploading || !text.trim() || images.length === 0}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analizando con IA...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Analizar y Crear Borrador
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                setText('');
                setImages([]);
                setError(null);
              }}
              disabled={uploading}
            >
              Limpiar
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Se enviará una notificación por email a sesaworkshop1@gmail.com cuando el borrador esté listo.
          </p>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">💡 Consejos para mejor resultado</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Incluye el <strong>precio</strong> explícitamente (ej: "580 lukas" o "85 millones")</p>
          <p>• Menciona la <strong>comuna</strong> claramente</p>
          <p>• Indica <strong>dormitorios y baños</strong> (ej: "2D2B")</p>
          <p>• Sube fotos de buena calidad y que muestren todos los ambientes</p>
          <p>• Menciona amenities: piscina, quincho, estacionamiento, bodega, etc.</p>
        </CardContent>
      </Card>
    </div>
  );
}
