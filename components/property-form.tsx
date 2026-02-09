'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  GripVertical,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import { Property, operationLabels, propertyTypeLabels } from '@/types/property';

interface PropertyFormProps {
  property?: Property;
  isEditing?: boolean;
}

const CHILEAN_COMMUNES = [
  'Macul', 'Ñuñoa', 'La Florida', 'Las Condes', 'Providencia', 
  'Santiago', 'Puente Alto', 'Maipú', 'La Reina', 'Peñalolén',
  'Vitacura', 'Lo Barnechea', 'San Miguel', 'La Cisterna', 'El Bosque'
];

export function PropertyForm({ property, isEditing = false }: PropertyFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(property?.images || []);
  const [uploading, setUploading] = useState(false);
  const [amenities, setAmenities] = useState<string[]>(property?.amenities || []);
  const [securityFeatures, setSecurityFeatures] = useState<string[]>(property?.security_features || []);
  const [newAmenity, setNewAmenity] = useState('');
  const [newSecurityFeature, setNewSecurityFeature] = useState('');

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('properties')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('properties')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    setImages(prev => [...prev, ...uploadedUrls]);
    setUploading(false);
  }, [supabase]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    setImages(newImages);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const data = {
      slug: formData.get('slug') as string || generateSlug(formData.get('title') as string),
      title: formData.get('title') as string,
      operation: formData.get('operation') as string,
      property_type: formData.get('property_type') as string,
      status: formData.get('status') as string,
      commune: formData.get('commune') as string,
      region: formData.get('region') as string || null,
      bedrooms: parseInt(formData.get('bedrooms') as string) || 0,
      bathrooms: parseInt(formData.get('bathrooms') as string) || 0,
      price_clp: parseInt(formData.get('price_clp') as string) || 0,
      description: formData.get('description') as string,
      has_suite: formData.get('has_suite') === 'on',
      in_condo: formData.get('in_condo') === 'on',
      has_terrace: formData.get('has_terrace') === 'on',
      common_expenses: parseInt(formData.get('common_expenses') as string) || null,
      parking_count: parseInt(formData.get('parking_count') as string) || null,
      parking_types: (formData.get('parking_types') as string)?.split(',').filter(Boolean) || [],
      storage_count: parseInt(formData.get('storage_count') as string) || null,
      total_area: parseFloat(formData.get('total_area') as string) || null,
      built_area: parseFloat(formData.get('built_area') as string) || null,
      orientation: (formData.get('orientation') as string)?.split(',').filter(Boolean) || [],
      year_built: parseInt(formData.get('year_built') as string) || null,
      security_features: securityFeatures,
      amenities: amenities,
      images: images,
    };

    try {
      if (isEditing && property) {
        const { error } = await supabase
          .from('properties')
          .update(data)
          .eq('id', property.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([data]);

        if (error) throw error;
      }

      router.push('/admin/propiedades');
      router.refresh();
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Error al guardar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input 
                id="title" 
                name="title" 
                defaultValue={property?.title}
                required 
                placeholder="Ej: Departamento moderno 2D 2B"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input 
                id="slug" 
                name="slug" 
                defaultValue={property?.slug}
                placeholder="Se genera automáticamente del título"
              />
              <p className="text-xs text-muted-foreground">
                Dejar vacío para generar automáticamente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select name="status" defaultValue={property?.status || 'draft'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="published">Publicada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operation">Operación *</Label>
              <Select name="operation" defaultValue={property?.operation || 'sale'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">{operationLabels.sale}</SelectItem>
                  <SelectItem value="rent">{operationLabels.rent}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_type">Tipo de propiedad *</Label>
              <Select name="property_type" defaultValue={property?.property_type || 'apartment'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">{propertyTypeLabels.house}</SelectItem>
                  <SelectItem value="apartment">{propertyTypeLabels.apartment}</SelectItem>
                  <SelectItem value="office">{propertyTypeLabels.office}</SelectItem>
                  <SelectItem value="land">{propertyTypeLabels.land}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_clp">Precio (CLP) *</Label>
              <Input 
                id="price_clp" 
                name="price_clp" 
                type="number"
                defaultValue={property?.price_clp}
                required 
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commune">Comuna *</Label>
              <Select name="commune" defaultValue={property?.commune || CHILEAN_COMMUNES[0]}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHILEAN_COMMUNES.map(commune => (
                    <SelectItem key={commune} value={commune}>{commune}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Región</Label>
              <Input 
                id="region" 
                name="region" 
                defaultValue={property?.region || 'Metropolitana'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea 
              id="description" 
              name="description" 
              defaultValue={property?.description}
              required 
              rows={5}
              placeholder="Describe la propiedad en detalle..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Características</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Dormitorios *</Label>
              <Input 
                id="bedrooms" 
                name="bedrooms" 
                type="number"
                defaultValue={property?.bedrooms || 0}
                required 
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Baños *</Label>
              <Input 
                id="bathrooms" 
                name="bathrooms" 
                type="number"
                defaultValue={property?.bathrooms || 0}
                required 
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parking_count">Estacionamientos</Label>
              <Input 
                id="parking_count" 
                name="parking_count" 
                type="number"
                defaultValue={property?.parking_count || 0}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage_count">Bodegas</Label>
              <Input 
                id="storage_count" 
                name="storage_count" 
                type="number"
                defaultValue={property?.storage_count || 0}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_area">Superficie total (m²)</Label>
              <Input 
                id="total_area" 
                name="total_area" 
                type="number"
                step="0.1"
                defaultValue={property?.total_area || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="built_area">Superficie construida (m²)</Label>
              <Input 
                id="built_area" 
                name="built_area" 
                type="number"
                step="0.1"
                defaultValue={property?.built_area || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_built">Año construcción</Label>
              <Input 
                id="year_built" 
                name="year_built" 
                type="number"
                defaultValue={property?.year_built || ''}
                min="1900"
                max="2100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="common_expenses">Gastos comunes (CLP)</Label>
              <Input 
                id="common_expenses" 
                name="common_expenses" 
                type="number"
                defaultValue={property?.common_expenses || ''}
                min="0"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="has_suite" 
                name="has_suite"
                defaultChecked={property?.has_suite}
              />
              <Label htmlFor="has_suite">Tiene suite</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="in_condo" 
                name="in_condo"
                defaultChecked={property?.in_condo}
              />
              <Label htmlFor="in_condo">En condominio</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="has_terrace" 
                name="has_terrace"
                defaultChecked={property?.has_terrace}
              />
              <Label htmlFor="has_terrace">Tiene terraza</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Amenities y Seguridad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amenities */}
          <div>
            <Label className="mb-2 block">Amenities</Label>
            <div className="flex gap-2 mb-3">
              <Input 
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Ej: Piscina, Gimnasio..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newAmenity.trim()) {
                      setAmenities([...amenities, newAmenity.trim()]);
                      setNewAmenity('');
                    }
                  }
                }}
              />
              <Button 
                type="button"
                onClick={() => {
                  if (newAmenity.trim()) {
                    setAmenities([...amenities, newAmenity.trim()]);
                    setNewAmenity('');
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {amenity}
                  <button
                    type="button"
                    onClick={() => setAmenities(amenities.filter((_, i) => i !== index))}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Security Features */}
          <div>
            <Label className="mb-2 block">Características de seguridad</Label>
            <div className="flex gap-2 mb-3">
              <Input 
                value={newSecurityFeature}
                onChange={(e) => setNewSecurityFeature(e.target.value)}
                placeholder="Ej: Conserjería, Cámaras..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newSecurityFeature.trim()) {
                      setSecurityFeatures([...securityFeatures, newSecurityFeature.trim()]);
                      setNewSecurityFeature('');
                    }
                  }
                }}
              />
              <Button 
                type="button"
                onClick={() => {
                  if (newSecurityFeature.trim()) {
                    setSecurityFeatures([...securityFeatures, newSecurityFeature.trim()]);
                    setNewSecurityFeature('');
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {securityFeatures.map((feature, index) => (
                <Badge key={index} variant="outline" className="gap-1">
                  {feature}
                  <button
                    type="button"
                    onClick={() => setSecurityFeatures(securityFeatures.filter((_, i) => i !== index))}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Imágenes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={uploading}
            />
            <label 
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {uploading ? (
                <Loader2 className="w-10 h-10 text-muted-foreground mb-4 animate-spin" />
              ) : (
                <Upload className="w-10 h-10 text-muted-foreground mb-4" />
              )}
              <p className="font-medium mb-1">
                {uploading ? 'Subiendo...' : 'Arrastra imágenes o haz click para seleccionar'}
              </p>
              <p className="text-sm text-muted-foreground">
                PNG, JPG, WEBP hasta 10MB cada una
              </p>
            </label>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div key={index} className="relative group aspect-square">
                  <img 
                    src={url} 
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      disabled={index === 0}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 disabled:opacity-50"
                    >
                      <GripVertical className="w-4 h-4 rotate-90" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      disabled={index === images.length - 1}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 disabled:opacity-50"
                    >
                      <GripVertical className="w-4 h-4 -rotate-90" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {index === 0 && (
                    <Badge className="absolute top-2 left-2 bg-primary">
                      Principal
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" size="lg" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditing ? 'Guardar cambios' : 'Crear propiedad'}
        </Button>
        <Button type="button" variant="outline" size="lg" asChild>
          <Link href="/admin/propiedades">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
