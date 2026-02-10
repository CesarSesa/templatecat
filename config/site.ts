export const siteConfig = {
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Mi Catálogo',
  description: process.env.NEXT_PUBLIC_BUSINESS_DESCRIPTION || 'Catálogo de productos',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || '',
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '',
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
  year: new Date().getFullYear(),
};

export const themeConfig = {
  colors: {
    primary: { DEFAULT: '#8B5CF6', foreground: '#ffffff' },
    secondary: { DEFAULT: '#EC4899', foreground: '#ffffff' },
  },
};

export type BusinessType = 'retail' | 'services' | 'restaurant';

export const businessConfig = {
  type: (process.env.NEXT_PUBLIC_BUSINESS_TYPE as BusinessType) || 'retail',
  features: { inventory: true, variants: true, sales: true, expenses: true },
};