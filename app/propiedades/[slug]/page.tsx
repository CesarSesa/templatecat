import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ImageGallery } from '@/components/image-gallery';
import { PropertyContactCTA } from '@/components/property-contact-cta';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bed, Bath, Car, Square, MapPin, Calendar, 
  Shield, Sparkles, ArrowLeft, MessageCircle 
} from 'lucide-react';
import { 
  Property, 
  operationLabels, 
  propertyTypeLabels, 
  formatPrice, 
  formatArea 
} from '@/types/property';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: property } = await supabase
    .from('properties')
    .select('title, description, commune, operation, property_type')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!property) {
    return { title: 'Propiedad no encontrada' };
  }

  return {
    title: `${property.title} | ${operationLabels[property.operation]}`,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      type: 'article',
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!property) {
    notFound();
  }

  // URL completa de la propiedad para el mensaje
  const propertyUrl = `https://tudominio.cl/propiedades/${property.slug}`; // Reemplazar con tu dominio real

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            🏠 Catálogo Inmobiliario
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/propiedades">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Link>
            </Button>
            <Button variant="default" asChild>
              <Link href="/auth/login">Acceder</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:underline">Inicio</Link>
          {' / '}
          <Link href="/propiedades" className="hover:underline">Propiedades</Link>
          {' / '}
          <span className="text-foreground">{property.title}</span>
        </nav>

        {/* Title Section */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className="bg-primary text-primary-foreground">
              {operationLabels[property.operation]}
            </Badge>
            <Badge variant="secondary">
              {propertyTypeLabels[property.property_type]}
            </Badge>
            {property.has_suite && (
              <Badge variant="outline">Suite</Badge>
            )}
            {property.in_condo && (
              <Badge variant="outline">Condominio</Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{property.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-5 h-5" />
            <span className="text-lg">
              {property.commune}{property.region ? `, ${property.region}` : ''}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Gallery & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <ImageGallery images={property.images} title={property.title} />

            {/* Price & CTA Mobile */}
            <div className="lg:hidden bg-muted p-6 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Precio</p>
              <p className="text-3xl font-bold text-primary mb-4">
                {formatPrice(property.price_clp)}
              </p>
              {property.common_expenses && (
                <p className="text-sm text-muted-foreground mb-4">
                  Gastos comunes: {formatPrice(property.common_expenses)}
                </p>
              )}
              <Button className="w-full" size="lg" asChild>
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `¡Hola! 👋 Estaba revisando su catálogo y me interesa: ${property.title} en ${property.commune}. ¿Podrían darme más información? ${propertyUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Consultar por WhatsApp
                </a>
              </Button>
            </div>

            {/* Main Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FeatureCard 
                icon={<Bed className="w-6 h-6" />}
                value={property.bedrooms}
                label="Dormitorios"
              />
              <FeatureCard 
                icon={<Bath className="w-6 h-6" />}
                value={property.bathrooms}
                label="Baños"
              />
              {property.parking_count !== null && property.parking_count > 0 && (
                <FeatureCard 
                  icon={<Car className="w-6 h-6" />}
                  value={property.parking_count}
                  label="Estacionamientos"
                />
              )}
              {property.built_area && (
                <FeatureCard 
                  icon={<Square className="w-6 h-6" />}
                  value={`${property.built_area} m²`}
                  label="Superficie construida"
                />
              )}
              {property.total_area && (
                <FeatureCard 
                  icon={<Square className="w-6 h-6" />}
                  value={`${property.total_area} m²`}
                  label="Superficie total"
                />
              )}
              {property.storage_count !== null && property.storage_count > 0 && (
                <FeatureCard 
                  icon={<Square className="w-6 h-6" />}
                  value={property.storage_count}
                  label="Bodegas"
                />
              )}
              {property.year_built && (
                <FeatureCard 
                  icon={<Calendar className="w-6 h-6" />}
                  value={property.year_built}
                  label="Año construcción"
                />
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Descripción</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Amenities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Security Features */}
            {property.security_features && property.security_features.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Seguridad
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.security_features.map((feature: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-sm px-3 py-1">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contact CTA - Sección de contacto orgánica */}
            <div className="pt-6 border-t">
              <PropertyContactCTA 
                propertyTitle={property.title}
                propertyUrl={propertyUrl}
                price={property.price_clp}
                commune={property.commune}
              />
            </div>

            {/* Additional Info */}
            <div className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Información adicional</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {property.orientation && property.orientation.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Orientación:</span>
                    <p className="font-medium capitalize">
                      {property.orientation.join(', ')}
                    </p>
                  </div>
                )}
                {property.parking_types && property.parking_types.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Tipo estacionamiento:</span>
                    <p className="font-medium capitalize">
                      {property.parking_types.join(', ')}
                    </p>
                  </div>
                )}
                {property.has_terrace && (
                  <div>
                    <span className="text-muted-foreground">Terraza:</span>
                    <p className="font-medium">Sí</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sticky CTA */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-muted p-6 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Precio</p>
              <p className="text-3xl font-bold text-primary mb-4">
                {formatPrice(property.price_clp)}
              </p>
              
              {property.common_expenses && (
                <div className="mb-4 p-3 bg-background rounded">
                  <p className="text-sm text-muted-foreground">Gastos comunes</p>
                  <p className="font-semibold">{formatPrice(property.common_expenses)}</p>
                </div>
              )}

              <Button className="w-full mb-3" size="lg" asChild>
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `¡Hola! 👋\n\nEstaba revisando su catálogo y me interesa esta propiedad:\n\n🏠 ${property.title}\n📍 ${property.commune}\n💰 ${formatPrice(property.price_clp)}\n\n¿Podrían darme más información o agendar una visita?\n\n${propertyUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Consultar por WhatsApp
                </a>
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Respuesta en menos de 24 horas
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Catálogo Inmobiliario. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="bg-muted p-4 rounded-lg text-center">
      <div className="text-primary mb-2 flex justify-center">{icon}</div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
