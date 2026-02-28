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
  const [scrolled, setScrolled] = useState(false);

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
    
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Kioo Ngozi - Futuristic Dark Theme
  const theme = {
    primary: '#e95420',
    primaryGlow: 'rgba(233, 84, 32, 0.4)',
    dark: '#0a0a0a',
    surface: '#111111',
    surfaceLight: '#1a1a1a',
    text: '#ffffff',
    textMuted: '#888888',
    border: 'rgba(255,255,255,0.1)',
    gold: '#cfae81',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.dark }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.dark, color: theme.text }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px ${theme.primaryGlow}; }
          50% { box-shadow: 0 0 40px ${theme.primaryGlow}, 0 0 60px ${theme.primaryGlow}; }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .loading-spinner {
          width: 50px; height: 50px;
          border: 3px solid ${theme.border};
          border-top-color: ${theme.primary};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: `radial-gradient(circle, ${theme.primaryGlow} 0%, transparent 70%)`,
          top: '-200px',
          left: '-200px',
          animation: 'float 8s ease-in-out infinite',
        }}></div>
        <div style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          background: `radial-gradient(circle, rgba(207, 174, 129, 0.15) 0%, transparent 70%)`,
          bottom: '-300px',
          right: '-300px',
          animation: 'float 10s ease-in-out infinite reverse',
        }}></div>
      </div>

      {/* Announcement */}
      <div style={{
        background: `linear-gradient(90deg, ${theme.primary}, #ff6b35)`,
        padding: '10px',
        textAlign: 'center',
        fontSize: '0.8rem',
        fontWeight: 600,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        position: 'relative',
        zIndex: 10
      }}>
        Free Shipping Across Kenya ✦ Artisan Excellence Since 2020
      </div>

      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: scrolled ? '15px 40px' : '20px 40px',
        background: scrolled ? 'rgba(10,10,10,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${theme.border}` : 'none',
        transition: 'all 0.3s ease',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo - centered and zoomed to cover circle */}
        <div style={{
          width: scrolled ? '50px' : '70px',
          height: scrolled ? '50px' : '70px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: `2px solid ${theme.primary}`,
          boxShadow: `0 0 20px ${theme.primaryGlow}`,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.primary
        }}>
          <img 
            src="/kiongozi_logo.png" 
            alt="Kioo Ngozi"
            style={{ width: '200%', height: 'auto', minHeight: '100%', objectFit: 'cover', transform: 'translateX(-25%)' }}
          />
        </div>

        <nav style={{ display: 'flex', gap: '40px' }}>
          {['HOME', 'SHOP', 'ABOUT', 'CONTACT'].map((item) => (
            <a 
              key={item}
              href={item === 'SHOP' ? '#products' : '#'}
              style={{ 
                color: theme.text, 
                textDecoration: 'none', 
                fontWeight: 600, 
                fontSize: '0.85rem', 
                letterSpacing: '1px',
                position: 'relative',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.text}
            >
              {item}
              <span style={{
                position: 'absolute',
                bottom: '-5px',
                left: 0,
                width: '0%',
                height: '2px',
                background: theme.primary,
                transition: 'width 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.width = '100%'}
              onMouseLeave={(e) => e.currentTarget.style.width = '0%'}
              ></span>
            </a>
          ))}
        </nav>

        <button 
          onClick={() => setShowCart(!showCart)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${theme.border}`,
            borderRadius: '30px',
            padding: '10px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.primary;
            e.currentTarget.style.boxShadow = `0 0 20px ${theme.primaryGlow}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={theme.primary} strokeWidth="2">
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span style={{ fontWeight: 600 }}>Cart</span>
          {cart.length > 0 && (
            <span style={{
              background: theme.primary,
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {cart.length}
            </span>
          )}
        </button>
      </header>

      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        padding: '120px 40px 80px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '900px' }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 10vw, 7rem)',
            fontWeight: 800,
            lineHeight: 1,
            marginBottom: '20px',
            background: `linear-gradient(135deg, ${theme.text} 0%, ${theme.primary} 50%, ${theme.gold} 100%)`,
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient-shift 5s ease infinite',
          }}>
            KIOO NGOZI
          </h1>
          <p style={{
            fontSize: '1.5rem',
            color: theme.textMuted,
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Premium handcrafted leather goods of unmatched quality
          </p>
          <button 
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: theme.primary,
              color: 'white',
              border: 'none',
              padding: '18px 50px',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '50px',
              animation: 'glow 2s ease-in-out infinite',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Explore Collection
          </button>
        </div>
      </section>

      {/* Categories - only show categories with products */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
        {/* Get categories that have products */}
        {(() => {
          const catsWithProducts = categories.filter(cat => 
            products.some(p => p.category && p.category.toLowerCase().includes(cat.name.toLowerCase()))
          );
          
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setSelectedCategory('')}
                style={{
                  padding: '12px 28px',
                  borderRadius: '30px',
                  border: `1px solid ${selectedCategory === '' ? theme.primary : theme.border}`,
                  background: selectedCategory === '' ? theme.primary : 'transparent',
                  color: selectedCategory === '' ? 'white' : theme.textMuted,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.3s ease'
                }}
              >
                All
              </button>
              {catsWithProducts.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '30px',
                    border: `1px solid ${selectedCategory === cat.name ? theme.primary : theme.border}`,
                    background: selectedCategory === cat.name ? theme.primary : 'transparent',
                    color: selectedCategory === cat.name ? 'white' : theme.textMuted,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          );
        })()}
      </section>

      {/* Products */}
      <section id="products" style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 20px 120px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          textAlign: 'center', 
          marginBottom: '60px', 
          color: theme.gold,
          fontWeight: 700
        }}>
          OUR COLLECTION
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '25px' 
        }}>
          {filteredProducts.map((product, idx) => (
            <div 
              key={product.id}
              style={{ 
                background: theme.surface,
                borderRadius: '20px',
                overflow: 'hidden',
                border: `1px solid ${theme.border}`,
                transition: 'all 0.4s ease',
                animation: `float ${6 + (idx % 3)}s ease-in-out infinite`,
                animationDelay: `${idx * 0.2}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px)';
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.boxShadow = `0 30px 60px ${theme.primaryGlow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ position: 'relative', height: '300px', background: theme.surfaceLight }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted }}>
                    No Image
                  </div>
                )}
                {!product.in_stock && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontWeight: 700, padding: '10px 30px', border: '2px solid white', borderRadius: '30px' }}>OUT OF STOCK</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ fontSize: '0.75rem', color: theme.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {product.category}
                </p>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', lineHeight: 1.4 }}>
                  {product.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 700, color: theme.primary }}>
                    KSh {product.min_price?.toLocaleString()}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.in_stock}
                    style={{
                      background: product.in_stock ? 'transparent' : '#333',
                      color: product.in_stock ? theme.primary : '#666',
                      border: `1px solid ${product.in_stock ? theme.primary : '#333'}`,
                      padding: '10px 24px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: product.in_stock ? 'pointer' : 'not-allowed',
                      borderRadius: '25px',
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
      </section>

      {/* Footer */}
      <footer style={{ background: theme.surface, padding: '80px 20px', borderTop: `3px solid ${theme.primary}`, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: theme.primary, marginBottom: '16px', fontWeight: 700 }}>KIOO NGOZI LEATHER</h3>
          <p style={{ color: theme.textMuted }}>Handcrafted leather excellence from Kenya</p>
          <p style={{ color: theme.textMuted, marginTop: '30px', opacity: 0.5 }}>&copy; 2026 Kioo Ngozi Leather. All rights reserved.</p>
        </div>
      </footer>

      {/* Cart Modal */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => setShowCart(false)}></div>
          <div style={{ position: 'relative', width: '100%', maxWidth: '450px', background: theme.surface, height: '100%', overflowY: 'auto', padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.5rem', color: theme.gold, fontWeight: 700 }}>YOUR CART</h3>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', color: theme.textMuted, padding: '60px 0' }}>Your cart is empty</p>
            ) : (
              <>
                <div style={{ marginBottom: '30px' }}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', padding: '16px', background: theme.dark, borderRadius: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden', background: theme.surfaceLight }}>
                        {item.product.image_url && <img src={item.product.image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>{item.product.name}</p>
                        <p style={{ color: theme.primary, fontWeight: 700 }}>KSh {item.product.min_price?.toLocaleString()}</p>
                      </div>
                      <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>
                    <span>Total</span>
                    <span style={{ color: theme.primary }}>KSh {cartTotal.toLocaleString()}</span>
                  </div>
                  <button style={{ width: '100%', padding: '16px', background: theme.primary, color: 'white', border: 'none', fontSize: '1rem', fontWeight: 700, letterSpacing: '1px', cursor: 'pointer', borderRadius: '30px' }}>
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
