/**
 * Servicio de conversión de monedas para el catálogo inmobiliario
 * Soporta: CLP, UF, USD
 * UF se actualiza desde la API de Mindicador o valor fijo de respaldo
 */

export type Currency = 'CLP' | 'UF' | 'USD';

interface CurrencyRates {
  UF: number;    // 1 UF en CLP
  USD: number;   // 1 USD en CLP
  updated_at: string;
}

// Valores de respaldo (actualizar manualmente si la API falla)
const FALLBACK_RATES: CurrencyRates = {
  UF: 38000,     // Ajustar según valor actual
  USD: 950,      // Ajustar según valor actual
  updated_at: new Date().toISOString(),
};

let cachedRates: CurrencyRates | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora

/**
 * Obtiene tasas de cambio actualizadas
 * Usa Mindicador API (Chile) para UF y USD
 */
export async function getCurrencyRates(): Promise<CurrencyRates> {
  const now = Date.now();
  
  // Usar cache si es reciente
  if (cachedRates && (now - lastFetch) < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    // Intentar obtener UF desde Mindicador
    const response = await fetch('https://mindicador.cl/api');
    const data = await response.json();
    
    if (data.uf && data.dolar) {
      cachedRates = {
        UF: parseFloat(data.uf.valor),
        USD: parseFloat(data.dolar.valor),
        updated_at: new Date().toISOString(),
      };
      lastFetch = now;
      return cachedRates;
    }
  } catch (error) {
    console.warn('Failed to fetch currency rates, using fallback:', error);
  }

  // Retornar valores de respaldo
  return FALLBACK_RATES;
}

/**
 * Convierte cualquier moneda a CLP
 */
export async function convertToCLP(amount: number, from: Currency): Promise<number> {
  if (from === 'CLP') return amount;
  
  const rates = await getCurrencyRates();
  return Math.round(amount * rates[from]);
}

/**
 * Convierte CLP a otra moneda
 */
export async function convertFromCLP(amountCLP: number, to: Currency): Promise<number> {
  if (to === 'CLP') return amountCLP;
  
  const rates = await getCurrencyRates();
  return Math.round((amountCLP / rates[to]) * 100) / 100; // 2 decimales para UF/USD
}

/**
 * Formatea precio según moneda
 */
export function formatPrice(amount: number, currency: Currency): string {
  switch (currency) {
    case 'CLP':
      return `$${amount.toLocaleString('es-CL')} CLP`;
    case 'UF':
      return `${amount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UF`;
    case 'USD':
      return `US$${amount.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    default:
      return `$${amount}`;
  }
}

/**
 * Detecta moneda desde texto
 * Busca patrones: "UF", "$", "USD", "dólares", etc.
 */
export function detectCurrency(text: string): Currency {
  const lower = text.toLowerCase();
  
  // UF tiene prioridad (más específico)
  if (lower.includes('uf') || lower.includes('uf ')) {
    return 'UF';
  }
  
  // USD/Dólares
  if (lower.includes('usd') || 
      lower.includes('dolar') || 
      lower.includes('dólar') ||
      lower.includes('dollars') ||
      lower.includes('us$')) {
    return 'USD';
  }
  
  // CLP/Pesos (default)
  return 'CLP';
}

/**
 * Extrae número de precio desde texto
 * Maneja: "8500 UF", "$85.000.000", "85 millones", etc.
 */
export function extractPrice(text: string): { amount: number; currency: Currency } | null {
  const currency = detectCurrency(text);
  
  // Patrones de búsqueda
  const patterns = [
    // 8.500 UF o 8500 UF
    /(\d{1,3}(?:[.,]\d{3})*|\d+)[\s]*(?:uf)/i,
    // $85.000.000 o $85,000,000
    /\$[\s]*(\d{1,3}(?:[.,]\d{3})+)/,
    // 85.000.000 o 85,000,000 (sin símbolo)
    /(\d{1,3}(?:[.,]\d{3}){2,})(?:\s|$)/,
    // 85000000 (número grande)
    /(\d{8,})/,
    // "85 millones" o "85 millon"
    /(\d+)\s*(?:millones?|millon)/i,
    // "850 lukas" o "850 lucas"
    /(\d+)\s*(?:lukas?|lucas)/i,
    // Número simple grande (posible precio)
    /(\d{7,})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let numStr = match[1].replace(/[.,]/g, '');
      let amount = parseInt(numStr, 10);
      
      // Ajustar "millones"
      if (pattern.toString().includes('millon')) {
        amount = amount * 1000000;
      }
      
      // Ajustar "lucas"
      if (pattern.toString().includes('lucas')) {
        amount = amount * 1000;
      }
      
      return { amount, currency };
    }
  }
  
  return null;
}

/**
 * Genera título formateado según especificación:
 * "Se (vende/arrienda) tipo de propiedad (en condominio) en Comuna (X-Y) en Precio Moneda"
 */
export function generateTitle(
  operation: 'sale' | 'rent' | null,
  type: 'house' | 'apartment' | 'office' | 'land' | null,
  commune: string | null,
  bedrooms: number | null,
  bathrooms: number | null,
  price: number | null,
  currency: Currency,
  inCondo: boolean
): string {
  // Verbos
  const verb = operation === 'sale' ? 'Se vende' : operation === 'rent' ? 'Se arrienda' : 'Se ofrece';
  
  // Tipo de propiedad
  const typeLabels: Record<string, string> = {
    house: 'casa',
    apartment: 'departamento',
    office: 'oficina',
    land: 'terreno',
  };
  const typeLabel = typeLabels[type || ''] || 'propiedad';
  
  // Condominio
  const condoText = inCondo ? ' en condominio' : '';
  
  // Comuna
  const communeText = commune || 'Santiago';
  
  // Dormitorios-Baños
  const bedText = bedrooms !== null ? `${bedrooms}D` : '';
  const bathText = bathrooms !== null ? `${bathrooms}B` : '';
  const roomText = bedText || bathText ? ` (${bedText}${bathText ? '-' + bathText : ''})` : '';
  
  // Precio formateado
  const priceText = price !== null ? ` en ${formatPrice(price, currency)}` : '';
  
  return `${verb} ${typeLabel}${condoText} en ${communeText}${roomText}${priceText}`;
}
