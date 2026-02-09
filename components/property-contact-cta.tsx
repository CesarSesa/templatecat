'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Phone, Mail, Clock, Calendar, ArrowRight } from 'lucide-react';

interface PropertyContactCTAProps {
  propertyTitle: string;
  propertyUrl: string;
  price: number;
  commune: string;
}

export function PropertyContactCTA({ 
  propertyTitle, 
  propertyUrl, 
  price, 
  commune 
}: PropertyContactCTAProps) {
  // Mensaje personalizado y pulido para WhatsApp
  const whatsappMessage = encodeURIComponent(
    `¡Hola! 👋\n\n` +
    `Estaba revisando su catálogo de propiedades y me interesa mucho esta opción:\n\n` +
    `🏠 *${propertyTitle}*\n` +
    `📍 ${commune}\n` +
    `💰 ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price)}\n\n` +
    `¿Podrían darme más información o agendar una visita?\n\n` +
    `${propertyUrl}`
  );

  return (
    <div className="space-y-6">
      {/* CTA Principal - WhatsApp */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Icono animado */}
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            
            {/* Título atractivo */}
            <h3 className="text-xl font-bold mb-2">
              ¿Te interesa esta propiedad?
            </h3>
            
            {/* Mensaje orgánico */}
            <p className="text-muted-foreground mb-6 max-w-md">
              Estamos aquí para ayudarte. Escríbenos por WhatsApp y te respondemos con 
              <span className="font-medium text-foreground"> toda la información </span> 
              o agendamos una visita presencial.
            </p>
            
            {/* Botón principal WhatsApp */}
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all"
              asChild
            >
              <a 
                href={`https://wa.me/?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Consultar por WhatsApp
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            
            {/* Info de respuesta rápida */}
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Respuesta típica: <span className="font-medium text-green-600">menos de 1 hora</span></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opciones alternativas de contacto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="hover:border-primary/30 transition-colors cursor-pointer group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Llámanos</p>
              <p className="text-sm text-muted-foreground">+56 9 XXXX XXXX</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/30 transition-colors cursor-pointer group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Agendar visita</p>
              <p className="text-sm text-muted-foreground">Elige día y hora</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Horario de atención */}
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Horario de atención:</span> Lunes a Viernes 9:00 - 18:00 • Sábados 10:00 - 14:00
        </p>
      </div>
    </div>
  );
}
