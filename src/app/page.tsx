"use client";

import { useState, useEffect } from 'react';
import { getProducts, getCategories, Product } from '@/lib/api';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: number; name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{product: Product; quantity: number}[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [productsData, categoriesData] = await Promise.all([
        getProducts('KIONGOZI'),
        getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setLoading(false);
    }
    loadData();
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('kiongozi-cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('kiongozi-cart', JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    : products;

  const addToCart = (product: Product) => {
    setCart([...cart, { product, quantity: 1 }]);
    setShowCart(true);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.min_price || 0) * item.quantity, 0);

  // Yaru Dark Theme - Ubuntu-inspired
  const yaruColors = {
    primary: '#E95420', // Ubuntu Orange
    primaryHover: '#F6733A',
    secondary: '#2C2C2C', // Dark gray
    background: '#1A1A1A', // Very dark
    surface: '#252525', // Card background
    surfaceLight: '#333333',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    border: '#444444',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: yaruColors.background, color: yaruColors.primary }}>
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: yaruColors.background, color: yaruColors.text }}>
      {/* Header */}
      <header className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: yaruColors.secondary, borderBottom: `3px solid ${yaruColors.primary}` }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: yaruColors.primary }}>
            Kioo Ngozi Leather
          </h1>
          <button 
            onClick={() => setShowCart(!showCart)}
            className="relative p-2 rounded-full transition hover:bg-white/10"
            style={{ color: yaruColors.primary }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center" style={{ backgroundColor: yaruColors.secondary }}>
        <div className="absolute inset-0 bg-black/50" style={{ backgroundImage: 'linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%)' }}></div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-5xl font-bold mb-4" style={{ color: yaruColors.primary }}>
            Artisan Leather
          </h2>
          <p className="text-xl mb-8" style={{ color: yaruColors.textSecondary }}>
            Handcrafted leather goods, Kenyan excellence
          </p>
          <button 
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 font-semibold rounded-full transition transform hover:scale-105 hover:bg-orange-600"
            style={{ backgroundColor: yaruColors.primary }}
          >
            Explore Collection
          </button>
        </div>
      </section>

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full font-medium transition ${
              selectedCategory === '' ? 'text-white' : ''
            }`}
            style={selectedCategory === '' ? { backgroundColor: yaruColors.primary } : { backgroundColor: yaruColors.surface, color: yaruColors.textSecondary }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                selectedCategory === cat.name ? 'text-white' : ''
              }`}
              style={selectedCategory === cat.name ? { backgroundColor: yaruColors.primary } : { backgroundColor: yaruColors.surface, color: yaruColors.textSecondary }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="max-w-7xl mx-auto px-4 py-8">
        <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: yaruColors.primary }}>
          Our Collection
        </h3>
        
        {filteredProducts.length === 0 ? (
          <p className="text-center" style={{ color: yaruColors.textSecondary }}>No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                className="rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02] hover:shadow-2xl"
                style={{ backgroundColor: yaruColors.surface, border: `1px solid ${yaruColors.border}` }}
              >
                <div className="relative h-64" style={{ backgroundColor: yaruColors.surfaceLight }}>
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: yaruColors.textSecondary }}>
                      No Image
                    </div>
                  )}
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-white font-semibold">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium mb-1" style={{ color: yaruColors.textSecondary }}>{product.category}</p>
                  <h4 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold" style={{ color: yaruColors.primary }}>
                        KSh {product.min_price?.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.in_stock}
                      className="px-4 py-2 rounded-full text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: product.in_stock ? yaruColors.primary : '#666' }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: yaruColors.secondary, borderTop: `3px solid ${yaruColors.primary}` }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h4 className="text-xl font-bold mb-4" style={{ color: yaruColors.primary }}>Kioo Ngozi Leather</h4>
          <p className="opacity-80" style={{ color: yaruColors.textSecondary }}>Handcrafted leather excellence from Kenya</p>
          <p className="mt-4 text-sm opacity-60">&copy; 2026 Kioo Ngozi Leather. All rights reserved.</p>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowCart(false)}></div>
          <div className="relative w-full max-w-md shadow-2xl h-full overflow-y-auto" style={{ backgroundColor: yaruColors.surface }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold" style={{ color: yaruColors.primary }}>Your Cart</h3>
                <button onClick={() => setShowCart(false)} className="hover:text-white" style={{ color: yaruColors.textSecondary }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {cart.length === 0 ? (
                <p className="text-center py-8" style={{ color: yaruColors.textSecondary }}>Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-3 rounded-lg" style={{ backgroundColor: yaruColors.background }}>
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0" style={{ backgroundColor: yaruColors.surfaceLight }}>
                          {item.product.image_url && (
                            <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                          <p className="font-bold" style={{ color: yaruColors.primary }}>
                            KSh {item.product.min_price?.toLocaleString()}
                          </p>
                        </div>
                        <button 
                          onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4" style={{ borderColor: yaruColors.border }}>
                    <div className="flex justify-between text-lg font-bold mb-4">
                      <span>Total</span>
                      <span style={{ color: yaruColors.primary }}>KSh {cartTotal.toLocaleString()}</span>
                    </div>
                    <button 
                      className="w-full py-3 rounded-full font-semibold transition hover:bg-orange-600"
                      style={{ backgroundColor: yaruColors.primary, color: 'white' }}
                    >
                      Checkout (Coming Soon)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
