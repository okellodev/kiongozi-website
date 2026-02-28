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

  // Kioo Ngozi Theme - From user's design
  const theme = {
    black: '#0a0a0a',
    surface: '#1a1a1a',
    accent: '#e95420', // Yaru Orange
    gold: '#cfae81',
    text: '#f5f5f5',
    muted: '#a0a0a0',
    border: 'rgba(255,255,255,0.1)',
    glass: 'rgba(26, 26, 26, 0.8)',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.black, color: theme.accent }}>
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.black, color: theme.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Announcement Bar */}
      <div style={{ backgroundColor: theme.accent, color: 'white', textAlign: 'center', padding: '8px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
        Free Shipping Across Kenya | Artisan Excellence Since 2020
      </div>

      {/* Header */}
      <header style={{ background: theme.glass, backdropFilter: 'blur(15px)', padding: '20px 40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, zIndex: 1000 }}>
        {/* Logo would go here */}
        <div style={{ position: 'absolute', left: '20px', width: '60px', height: '60px', borderRadius: '50%', border: `2px solid ${theme.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <span style={{ color: theme.accent, fontWeight: 'bold', fontSize: '1.5rem' }}>K</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <nav style={{ display: 'flex', gap: '40px', marginRight: '40px' }}>
            <a href="#" style={{ color: theme.text, textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '1px' }}>HOME</a>
            <a href="#products" style={{ color: theme.text, textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '1px' }}>SHOP</a>
            <a href="#" style={{ color: theme.text, textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '1px' }}>ABOUT</a>
            <a href="#" style={{ color: theme.text, textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '1px' }}>CONTACT</a>
          </nav>

          <button 
            onClick={() => setShowCart(!showCart)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '10px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={theme.accent} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cart.length > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: theme.gold, color: theme.black, fontSize: '0.65rem', fontWeight: 'bold', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${theme.black} 0%, ${theme.surface} 100%)` }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 50%, ${theme.accent}15 0%, transparent 50%)` }}></div>
        
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 20px' }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 700, marginBottom: '20px', color: theme.text, lineHeight: 1.1 }}>
            Artisan <span style={{ color: theme.accent }}>Leather</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: theme.muted, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Handcrafted leather goods of unmatched quality. Each piece tells a story of Kenyan craftsmanship.
          </p>
          <button 
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ 
              backgroundColor: theme.accent, 
              color: 'white', 
              border: 'none', 
              padding: '16px 48px', 
              fontSize: '1rem', 
              fontWeight: 600, 
              letterSpacing: '2px',
              textTransform: 'uppercase',
              borderRadius: '0',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Explore Collection
          </button>
        </div>
      </section>

      {/* Category Filter */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => setSelectedCategory('')}
            style={{
              padding: '10px 24px',
              borderRadius: '30px',
              border: `1px solid ${theme.border}`,
              background: selectedCategory === '' ? theme.accent : 'transparent',
              color: selectedCategory === '' ? 'white' : theme.muted,
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.3s ease'
            }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              style={{
                padding: '10px 24px',
                borderRadius: '30px',
                border: `1px solid ${theme.border}`,
                background: selectedCategory === cat.name ? theme.accent : 'transparent',
                color: selectedCategory === cat.name ? 'white' : theme.muted,
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.3s ease'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px 80px' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', textAlign: 'center', marginBottom: '60px', color: theme.gold }}>
          Our Collection
        </h2>
        
        {filteredProducts.length === 0 ? (
          <p style={{ textAlign: 'center', color: theme.muted }}>No products found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                style={{ 
                  backgroundColor: theme.surface, 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  border: `1px solid ${theme.border}`,
                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `0 20px 40px rgba(233, 84, 32, 0.15)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ position: 'relative', height: '300px', backgroundColor: '#252525' }}>
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.muted }}>
                      No Image
                    </div>
                  )}
                  {!product.in_stock && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontWeight: 600 }}>Out of Stock</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '24px' }}>
                  <p style={{ fontSize: '0.75rem', color: theme.muted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category}</p>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', lineHeight: 1.4, color: theme.text }}>
                    {product.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.accent }}>
                        KSh {product.min_price?.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.in_stock}
                      style={{
                        backgroundColor: product.in_stock ? 'transparent' : '#444',
                        color: product.in_stock ? theme.accent : '#888',
                        border: `1px solid ${product.in_stock ? theme.accent : '#444'}`,
                        padding: '10px 24px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: product.in_stock ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: theme.surface, padding: '60px 20px', borderTop: `3px solid ${theme.accent}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: theme.accent, marginBottom: '16px' }}>Kioo Ngozi Leather</h3>
          <p style={{ color: theme.muted, marginBottom: '8px' }}>Handcrafted leather excellence from Kenya</p>
          <p style={{ color: theme.muted, fontSize: '0.85rem', opacity: 0.6 }}>&copy; 2026 Kioo Ngozi Leather. All rights reserved.</p>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={() => setShowCart(false)}></div>
          <div style={{ position: 'relative', width: '100%', maxWidth: '450px', backgroundColor: theme.surface, height: '100%', overflowY: 'auto', padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', color: theme.gold }}>Your Cart</h3>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.muted }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', color: theme.muted, padding: '40px 0' }}>Your cart is empty</p>
            ) : (
              <>
                <div style={{ marginBottom: '30px' }}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: theme.black, borderRadius: '8px', marginBottom: '12px' }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#333', flexShrink: 0 }}>
                        {item.product.image_url && (
                          <img src={item.product.image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '4px' }}>{item.product.name}</p>
                        <p style={{ color: theme.accent, fontWeight: 700 }}>KSh {item.product.min_price?.toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444', alignSelf: 'flex-start' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>
                    <span>Total</span>
                    <span style={{ color: theme.accent }}>KSh {cartTotal.toLocaleString()}</span>
                  </div>
                  <button 
                    style={{ width: '100%', padding: '16px', backgroundColor: theme.accent, color: 'white', border: 'none', fontSize: '1rem', fontWeight: 600, letterSpacing: '1px', cursor: 'pointer' }}
                  >
                    Checkout (Coming Soon)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
