// Kiongozi Website - API utilities
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://phoelix-inventory.onrender.com';

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  image_url: string;
  external_id: string;
  min_price: number;
  max_price: number;
  in_stock: boolean;
}

export interface ProductDetail extends Product {
  variants: {
    id: number;
    sku: string;
    size: string;
    color: string;
    price: number;
    stock_quantity: number;
  }[];
}

export async function getProducts(brand: string = 'KIONGOZI', category?: string): Promise<Product[]> {
  const params = new URLSearchParams({ brand });
  if (category) params.append('category', category);
  
  const res = await fetch(`${API_BASE}/api/products/?${params}`, {
    next: { revalidate: 60 }
  });
  const data = await res.json();
  return data.products || [];
}

export async function getProduct(id: number): Promise<ProductDetail> {
  const res = await fetch(`${API_BASE}/api/products/${id}/`, {
    next: { revalidate: 60 }
  });
  return res.json();
}

export async function getCategories(): Promise<{id: number; name: string}[]> {
  const res = await fetch(`${API_BASE}/api/categories/`, {
    next: { revalidate: 3600 }
  });
  const data = await res.json();
  return data.categories || [];
}
