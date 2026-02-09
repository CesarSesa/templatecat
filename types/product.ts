// Tipos genéricos para el template CatalogKit
// Adaptable a diferentes tipos de negocio

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size?: string;
  color?: string;
  stock_quantity: number;
  sku?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  cost_price?: number; // Para calcular margen
  category_id: string;
  images: string[];
  
  // Para retail
  stock_quantity?: number;
  low_stock_threshold?: number;
  
  // Estados
  active: boolean;
  featured: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
  
  // Relaciones
  category?: Category;
  variants?: ProductVariant[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

export interface Sale {
  id: string;
  total: number;
  date: string;
  notes?: string;
  created_at: string;
  items?: SaleItem[];
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  created_at: string;
}

// Para servicios (alternativa a Product)
export interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  duration?: number; // En minutos
  category_id: string;
  images: string[];
  available: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}
