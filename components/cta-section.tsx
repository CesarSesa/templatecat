import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MessageCircle } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-lg opacity-90 mb-6">
              Contamos con un catálogo extendido de propiedades y un servicio personalizado 
              para ayudarte a encontrar exactamente lo que necesitas.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="secondary" asChild>
                <a 
                  href="https://wa.me/?text=Hola,%20estoy%20buscando%20una%20propiedad%20y%20me%20gustaría%20más%20información."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10" asChild>
                <Link href="/propiedades">
                  Ver catálogo completo
                </Link>
              </Button>
            </div>
          </div>

          {/* Right - Contact Info */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-6">Contacto directo</h3>
            <div className="space-y-4">
              <a 
                href="tel:+569XXXXXXXX" 
                className="flex items-center gap-3 p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <div>
                  <p className="text-sm opacity-70">Llámanos</p>
                  <p className="font-medium">+56 9 XXXX XXXX</p>
                </div>
              </a>
              <a 
                href="mailto:contacto@ejemplo.cl" 
                className="flex items-center gap-3 p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <div>
                  <p className="text-sm opacity-70">Escríbenos</p>
                  <p className="font-medium">contacto@ejemplo.cl</p>
                </div>
              </a>
            </div>
            <p className="mt-6 text-sm opacity-70">
              Horario de atención: Lunes a Viernes 9:00 - 18:00
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
