'use client';

export function BusinessName({ className = '' }: { className?: string }) {
  return (
    <span className={className}>
      {process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Mi Catálogo'}
    </span>
  );
}

export function BusinessLogo({ className = '' }: { className?: string }) {
  return (
    <span className={className}>
      {process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Mi Catálogo'}
    </span>
  );
}

export function Copyright({ className = '' }: { className?: string }) {
  const year = new Date().getFullYear();
  const name = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Mi Catálogo';
  return (
    <span className={className}>
      © {year} {name} - Todos los derechos reservados
    </span>
  );
}
