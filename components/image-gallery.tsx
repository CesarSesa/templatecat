'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // Si no hay imágenes, mostrar placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Sin imágenes disponibles</span>
      </div>
    );
  }

  const mainImage = images[0];
  const thumbnails = images.slice(1, 5); // Máximo 4 thumbnails
  const hasMoreImages = images.length > 5;

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <>
      {/* Grid de imágenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-lg overflow-hidden">
        {/* Imagen principal */}
        <div 
          className="relative aspect-[4/3] md:aspect-square lg:aspect-[4/3] cursor-pointer group overflow-hidden"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={mainImage}
            alt={`${title} - Principal`}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Thumbnails - solo en desktop */}
        {thumbnails.length > 0 && (
          <div className="hidden md:grid grid-cols-2 gap-2">
            {thumbnails.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square cursor-pointer group overflow-hidden"
                onClick={() => openLightbox(index + 1)}
              >
                <Image
                  src={image}
                  alt={`${title} - ${index + 2}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {/* Overlay "Ver más" en la última imagen si hay más */}
                {hasMoreImages && index === thumbnails.length - 1 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      +{images.length - 5} fotos
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contador de imágenes */}
      <div className="flex justify-center mt-2">
        <Button variant="outline" size="sm" onClick={() => openLightbox(0)}>
          Ver todas las fotos ({images.length})
        </Button>
      </div>

      {/* Lightbox */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Botón cerrar */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Botón anterior */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-50 text-white hover:bg-white/20"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}

            {/* Imagen actual */}
            {selectedIndex !== null && (
              <div className="relative w-full h-full p-4">
                <Image
                  src={images[selectedIndex]}
                  alt={`${title} - ${selectedIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            )}

            {/* Botón siguiente */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-50 text-white hover:bg-white/20"
                onClick={goToNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}

            {/* Contador */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
              {selectedIndex !== null ? selectedIndex + 1 : 0} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
