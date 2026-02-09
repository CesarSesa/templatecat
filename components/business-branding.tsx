// Componente de branding centralizado - Template CatalogKit
// Lee configuración desde variables de entorno

import { siteConfig } from '@/config/site';

export function BusinessName({ className = '' }: { className?: string }) {
  return (
    <span className={className}>
      {siteConfig.name}
    </span>
  );
}

export function BusinessLogo({ className = '' }: { className?: string }) {
  return (
    <span className={className}>
      ✨ {siteConfig.name}
    </span>
  );
}

export function Copyright({ className = '' }: { className?: string }) {
  return (
    <p className={className}>
      © {siteConfig.year} {siteConfig.name} - Todos los derechos reservados
    </p>
  );
}

export function WelcomeMessage({ className = '' }: { className?: string }) {
  return (
    <p className={className}>
      Bienvenido a {siteConfig.name}
    </p>
  );
}
