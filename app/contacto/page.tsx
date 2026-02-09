'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  MessageCircle,
  Send,
  CheckCircle2,
  Home
} from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulación de envío - Aquí conectarías con tu servicio de email
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">¡Mensaje enviado!</h1>
            <p className="text-muted-foreground mb-8">
              Gracias por contactarnos. Te responderemos a la brevedad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/">Volver al inicio</Link>
              </Button>
              <Button asChild>
                <Link href="/propiedades">Ver propiedades</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">Estamos para ayudarte</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contacto
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ¿Tienes preguntas sobre alguna propiedad? ¿Buscas algo específico? 
            Escríbenos y te ayudamos en lo que necesites.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulario */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Envíanos un mensaje</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre *</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="Tu nombre"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel"
                        placeholder="+56 9 XXXX XXXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email"
                      placeholder="tu@email.com"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input 
                      id="subject" 
                      name="subject" 
                      placeholder="¿Sobre qué nos quieres consultar?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje *</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="Cuéntanos en qué podemos ayudarte..."
                      rows={5}
                      required 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar mensaje
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    También puedes contactarnos directamente por WhatsApp para respuesta inmediata
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info de contacto */}
          <div className="space-y-6">
            {/* WhatsApp destacado */}
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">WhatsApp</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Respuesta más rápida. Escríbenos directamente.
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-green-500 text-green-700 hover:bg-green-100"
                      asChild
                    >
                      <a 
                        href="https://wa.me/569XXXXXXXX?text=¡Hola!%20Tengo%20una%20consulta%20sobre%20sus%20propiedades."
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Abrir WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Otros medios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-sm text-muted-foreground">+56 9 XXXX XXXX</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">contacto@ejemplo.cl</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Ubicación</p>
                      <p className="text-sm text-muted-foreground">Santiago, Chile</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Horario</p>
                      <p className="text-sm text-muted-foreground">Lun-Vie 9:00-18:00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mapa placeholder */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-64 bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Mapa de ubicación</p>
                    <p className="text-sm">(Integrar Google Maps aquí)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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

function Header() {
  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          <Home className="w-5 h-5" />
          <span>Catálogo Inmobiliario</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/propiedades">Propiedades</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/sobre-nosotros">Sobre Nosotros</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
