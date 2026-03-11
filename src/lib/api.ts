// Kiongozi Website - API utilities
const API_BASE = 'https://phoelix-inventory.onrender.com';

export interface Product {
  id: number;
  name: string;
  brand: string;
  shoe_brand: string;
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
  
  const url = `${API_BASE}/api/products/?${params}`;
  console.log("Fetching products from:", url);

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error("Network Error fetching products:", err);
    throw err;
  }
}

export async function getProduct(id: number | string): Promise<ProductDetail> {
  const url = `${API_BASE}/api/products/${id}/`;
  console.log("Fetching product detail from:", url);

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  } catch (err) {
    console.error(`Network Error fetching product ${id}:`, err);
    throw err;
  }
}

export async function getCategories(): Promise<{id: number; name: string}[]> {
  const url = `${API_BASE}/api/categories/`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.categories || [];
  } catch (err) {
    console.error("Network Error fetching categories:", err);
    return [];
  }
}

export async function newsletterSignup(email: string, firstName: string = '') {
  const url = `${API_BASE}/api/newsletter-signup/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, first_name: firstName }),
  });
  return res.json();
}

export async function createOrder(orderData: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address?: string;
  brand_source: string;
  delivery_method: string;
  items: { variant_id: number; quantity: number }[];
}) {
  const url = `${API_BASE}/api/create-order/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  return res.json();
}
