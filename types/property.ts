export interface Property {
  id: string;
  slug: string;
  title: string;
  operation: 'sale' | 'rent';
  property_type: 'house' | 'apartment' | 'office' | 'land';
  status: 'draft' | 'published';
  commune: string;
  region: string | null;
  bedrooms: number;
  bathrooms: number;
  price_clp: number;
  description: string;
  images: string[];
  has_suite: boolean;
  in_condo: boolean;
  has_terrace: boolean;
  common_expenses: number | null;
  parking_count: number | null;
  parking_types: string[];
  storage_count: number | null;
  total_area: number | null;
  built_area: number | null;
  orientation: string[];
  year_built: number | null;
  security_features: string[];
  amenities: string[];
  created_at: string;
  updated_at: string;
}

export const operationLabels: Record<string, string> = {
  sale: 'Venta',
  rent: 'Arriendo',
};

export const propertyTypeLabels: Record<string, string> = {
  house: 'Casa',
  apartment: 'Departamento',
  office: 'Oficina',
  land: 'Terreno',
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatArea = (area: number | null): string => {
  if (!area) return 'N/A';
  return `${area} m²`;
};
