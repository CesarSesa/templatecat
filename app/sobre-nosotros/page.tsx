import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Users, 
  Home, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  MessageCircle,
  ChevronRight,
  Quote
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre Nosotros | Catálogo Inmobiliario',
  description: 'Conoce a nuestra corredora de propiedades con años de experiencia en el mercado inmobiliario de Santiago.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
            <span>🏠</span>
            <span>Catálogo Inmobiliario</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/propiedades">Propiedades</Link>
            </Button>
            <Button variant="default" asChild>
              <Link href="/contacto">Contacto</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">Corredora de Propiedades</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Tu aliada en el <span className="text-primary">mercado inmobiliario</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Años de experiencia ayudando a familias a encontrar su hogar ideal y a inversionores 
            a encontrar las mejores oportunidades del mercado.
          </p>
        </div>

        {/* Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Photo placeholder */}
          <div className="relative">
            <div className="aspect-[4/5] bg-muted rounded-2xl overflow-hidden relative">
              {/* Aquí va la foto de tu jefa */}
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Users className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <p>Foto de la corredora</p>
                  <p className="text-sm">(Reemplazar con imagen real)</p>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg">
              <p className="text-2xl font-bold">15+</p>
              <p className="text-sm">años de experiencia</p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-4">[Nombre de tu jefa]</h2>
              <p className="text-primary font-medium mb-4">Corredora de Propiedades</p>
              <p className="text-muted-foreground leading-relaxed">
                [Breve biografía profesional. Ejemplo: Con más de 15 años en el mercado inmobiliario, 
                me he especializado en ayudar a familias a encontrar el hogar perfecto y a inversionores 
                a identificar oportunidades únicas en Santiago y alrededores.]
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Home className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">+500</p>
                    <p className="text-xs text-muted-foreground">Propiedades vendidas</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">+300</p>
                    <p className="text-xs text-muted-foreground">Familias felices</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 pt-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Información de contacto
              </h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  +56 9 XXXX XXXX
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  contacto@ejemplo.cl
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  Santiago, Chile
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Lunes a Viernes 9:00 - 18:00
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values/Services */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegirme?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Experiencia</h3>
                <p className="text-muted-foreground text-sm">
                  Más de 15 años en el mercado inmobiliario me permiten asesorarte 
                  con conocimiento profundo del sector.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Atención Personalizada</h3>
                <p className="text-muted-foreground text-sm">
                  Cada cliente es único. Escucho tus necesidades reales para encontrar 
                  la propiedad que mejor se adapte a ti.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Cartera Exclusiva</h3>
                <p className="text-muted-foreground text-sm">
                  Acceso a propiedades seleccionadas y oportunidades únicas 
                  en las mejores ubicaciones.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-muted/50 rounded-2xl p-8 md:p-12 mb-20">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="w-10 h-10 text-primary/30 mx-auto mb-6" />
            <blockquote className="text-xl md:text-2xl font-medium mb-6 italic">
              "[Testimonio de cliente satisfecho. Ejemplo: Gracias a su profesionalismo 
              encontramos la casa de nuestros sueños en tiempo récord. Su conocimiento 
              del mercado y paciencia hicieron todo el proceso muy simple.]"
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full" />
              <div className="text-left">
                <p className="font-semibold">[Nombre Cliente]</p>
                <p className="text-sm text-muted-foreground">Compró departamento en [Comuna]</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-primary text-primary-foreground rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-4">
            ¿Buscas tu próxima propiedad?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Estoy aquí para ayudarte en cada paso del proceso. Desde la búsqueda 
            hasta la firma, te acompaño personalmente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/propiedades">
                Ver propiedades
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 hover:bg-white/10"
              asChild
            >
              <a 
                href="https://wa.me/569XXXXXXXX?text=¡Hola!%20Vi%20su%20página%20y%20me%20gustaría%20conocer%20más%20sobre%20sus%20servicios."
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Escríbeme por WhatsApp
              </a>
            </Button>
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
