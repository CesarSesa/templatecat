import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function PropertyNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <Search className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4">Propiedad no encontrada</h1>
        <p className="text-muted-foreground mb-8">
          Lo sentimos, la propiedad que buscas no existe o ya no está disponible.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link href="/propiedades">
              <Search className="w-4 h-4 mr-2" />
              Ver propiedades
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
