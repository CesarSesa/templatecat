// Configuración del sitio - Template CatalogKit
// Personaliza estos valores para cada cliente

export const siteConfig = {
  // Información básica
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Mi Catálogo',
  description: process.env.NEXT_PUBLIC_BUSINESS_DESCRIPTION || 'Catálogo de productos y servicios',
  
  // URL
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  
  // Contacto
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || '',
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '',
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '',
  
  // Redes sociales
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
  
  // Año para copyright
  year: new Date().getFullYear(),
};

// Colores del tema (pueden ser sobrescritos via CSS variables)
export const themeConfig = {
  colors: {
    primary: {
      DEFAULT: '#8B5CF6', // Violet-500
      foreground: '#ffffff',
    },
    secondary: {
      DEFAULT: '#EC4899', // Pink-500
      foreground: '#ffffff',
    },
  },
};

// Tipo de negocio (afecta campos y funcionalidades)
export type BusinessType = 'retail' | 'services' | 'restaurant';

export const businessConfig: {
  type: BusinessType;
  features: {
    inventory: boolean;
    variants: boolean; // Tallas, colores, etc.
    sales: boolean;
    expenses: boolean;
  };
} = {
  type: (process.env.NEXT_PUBLIC_BUSINESS_TYPE as BusinessType) || 'retail',
  features: {
    inventory: true,
    variants: true,
    sales: true,
    expenses: true,
  },
};
