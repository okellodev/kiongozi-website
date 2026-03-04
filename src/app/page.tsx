"use client";

import { useState, useEffect } from 'react';
import { getProducts, getCategories, getProduct, Product, ProductDetail } from '@/lib/api';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: number; name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedShoeBrand, setSelectedShoeBrand] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{product: Product; variant: any; quantity: number}[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts('KIONGOZI'),
          getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    
    const savedCart = localStorage.getItem('kiongozi-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart:", e);
      }
    }
    
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('kiongozi-cart', JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = products
    .filter(p => {
      const matchesCategory = !selectedCategory || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesShoeBrand = !selectedShoeBrand || p.shoe_brand.toLowerCase() === selectedShoeBrand.toLowerCase();
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.shoe_brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && matchesShoeBrand;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return (a.min_price || 0) - (b.min_price || 0);
      if (sortBy === 'price-high') return (b.min_price || 0) - (a.min_price || 0);
      if (sortBy === 'newest') return b.id - a.id;
      return 0; // featured/default
    });

  const shoeBrands = Array.from(new Set(products.map(p => p.shoe_brand))).filter(Boolean);

  const openProductDetail = async (id: number) => {
    setIsModalLoading(true);
    try {
      const details = await getProduct(id);
      setSelectedProduct(details);
      // Auto-select first in-stock variant
      const firstInStock = details.variants.find(v => v.stock_quantity > 0);
      setSelectedVariant(firstInStock || details.variants[0]);
    } catch (err) {
      console.error("Failed to load product details:", err);
    } finally {
      setIsModalLoading(false);
    }
  };

  const addToCart = (product: Product, variant: any) => {
    if (!variant) return;
    
    const existingIndex = cart.findIndex(item => item.variant.id === variant.id);
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { product, variant, quantity: 1 }]);
    }
    
    setSelectedProduct(null); // Close modal
    setShowCart(true);
  };

  const removeFromCart = (variantId: number) => {
    setCart(cart.filter(item => item.variant.id !== variantId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.variant.price || 0) * item.quantity, 0);

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
    <div className="min-h-screen" style={{ backgroundColor: theme.dark, color: theme.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .product-card:hover {
          transform: translateY(-15px) !important;
          border-color: ${theme.primary} !important;
          box-shadow: 0 30px 60px ${theme.primaryGlow} !important;
        }
      `}</style>

      {/* Animated Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          width: '600px', height: '600px',
          background: `radial-gradient(circle, ${theme.primaryGlow} 0%, transparent 70%)`,
          top: '-200px', left: '-200px',
          animation: 'float 8s ease-in-out infinite',
        }}></div>
        <div style={{
          position: 'absolute',
          width: '800px', height: '800px',
          background: `radial-gradient(circle, rgba(207, 174, 129, 0.15) 0%, transparent 70%)`,
          bottom: '-300px', right: '-300px',
          animation: 'float 10s ease-in-out infinite reverse',
        }}></div>
      </div>

      {/* Announcement */}
      <div style={{
        background: `linear-gradient(90deg, ${theme.primary}, #ff6b35)`,
        padding: '10px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700,
        letterSpacing: '2px', textTransform: 'uppercase', position: 'relative', zIndex: 10
      }}>
        Free Shipping Across Kenya ✦ Artisan Excellence Since 2020
      </div>

      {/* Header */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: scrolled ? '12px 40px' : '20px 40px',
        background: scrolled ? 'rgba(10,10,10,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${theme.border}` : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        {/* Logo */}
        <div style={{
          width: scrolled ? '70px' : '90px',
          height: scrolled ? '70px' : '90px',
          borderRadius: '50%', overflow: 'hidden', border: `2px solid ${theme.primary}`,
          boxShadow: `0 0 20px ${theme.primaryGlow}`, transition: 'all 0.3s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <img src="/kiongozi_logo.png" alt="Kioo Ngozi" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.8)' }} />
        </div>

        <nav style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          {['HOME', 'SHOP', 'ABOUT', 'CONTACT'].map((item) => (
            <a 
              key={item} href={item === 'SHOP' ? '#products' : '#'}
              style={{ color: theme.text, textDecoration: 'none', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '1px', position: 'relative' }}
            >
              {item}
            </a>
          ))}
          
          {/* Search Toggle/Input */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${theme.border}`,
                borderRadius: '20px',
                padding: '8px 15px 8px 35px',
                color: 'white',
                fontSize: '0.85rem',
                width: '200px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            />
            <svg style={{ position: 'absolute', left: '12px' }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={theme.textMuted} strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
        </nav>

        <button 
          onClick={() => setShowCart(true)}
          style={{
            background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}`,
            borderRadius: '30px', padding: '10px 20px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s ease'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={theme.primary} strokeWidth="2">
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>CART</span>
          {cart.length > 0 && (
            <span style={{ background: theme.primary, color: 'white', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1, padding: '120px 40px 80px',
        backgroundImage: 'url(https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1920)',
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)', zIndex: 0 }}></div>
        <div style={{ textAlign: 'center', maxWidth: '1000px', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: 'clamp(3.5rem, 12vw, 8rem)', fontWeight: 900, lineHeight: 0.9, marginBottom: '20px',
            background: `linear-gradient(135deg, ${theme.text} 0%, ${theme.primary} 50%, ${theme.gold} 100%)`,
            backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'gradient-shift 5s ease infinite', letterSpacing: '-2px'
          }}>
            KIOO NGOZI
          </h1>
          <p style={{ fontSize: '1.4rem', color: theme.textMuted, marginBottom: '40px', maxWidth: '700px', margin: '0 auto 50px', fontWeight: 300, letterSpacing: '1px' }}>
            Artisan Handcrafted Leather Goods. Defined by Quality, Driven by Heritage.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button 
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: theme.primary, color: 'white', border: 'none', padding: '18px 45px',
                fontSize: '0.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
                cursor: 'pointer', borderRadius: '50px', animation: 'glow 2s ease-in-out infinite', transition: 'all 0.3s ease'
              }}
            >
              Shop Collection
            </button>
          </div>
        </div>
      </section>

      {/* Filters & Sorting */}
      <section style={{ maxWidth: '1200px', margin: '-40px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ background: theme.surface, borderRadius: '40px', padding: '20px', border: `1px solid ${theme.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Category Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => setSelectedCategory('')}
              style={{
                padding: '10px 25px', borderRadius: '25px', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.3s ease', cursor: 'pointer',
                background: selectedCategory === '' ? theme.primary : 'transparent',
                color: selectedCategory === '' ? 'white' : theme.textMuted,
                border: `1px solid ${selectedCategory === '' ? theme.primary : 'transparent'}`
              }}
            >
              All Collection
            </button>
            {categories.filter(c => products.some(p => p.category === c.name)).map((cat) => (
              <button
                key={cat.id} onClick={() => setSelectedCategory(cat.name)}
                style={{
                  padding: '10px 25px', borderRadius: '25px', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.3s ease', cursor: 'pointer',
                  background: selectedCategory === cat.name ? theme.primary : 'transparent',
                  color: selectedCategory === cat.name ? 'white' : theme.textMuted,
                  border: `1px solid ${selectedCategory === cat.name ? theme.primary : 'transparent'}`
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${theme.border}`, paddingTop: '15px', flexWrap: 'wrap', gap: '15px' }}>
            {/* Shoe Brand Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: theme.textMuted, fontWeight: 600 }}>BRAND:</span>
              <select 
                value={selectedShoeBrand}
                onChange={(e) => setSelectedShoeBrand(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: theme.gold, fontSize: '0.85rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
              >
                <option value="" style={{ background: theme.surface }}>All Brands</option>
                {shoeBrands.map(brand => (
                  <option key={brand} value={brand} style={{ background: theme.surface }}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: theme.textMuted, fontWeight: 600 }}>SORT:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: theme.text, fontSize: '0.85rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
              >
                <option value="featured" style={{ background: theme.surface }}>Featured</option>
                <option value="price-low" style={{ background: theme.surface }}>Price: Low to High</option>
                <option value="price-high" style={{ background: theme.surface }}>Price: High to Low</option>
                <option value="newest" style={{ background: theme.surface }}>Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 20px 120px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {filteredProducts.map((product, idx) => (
            <div 
              key={product.id}
              className="product-card"
              style={{ 
                background: theme.surface, borderRadius: '24px', overflow: 'hidden', border: `1px solid ${theme.border}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', cursor: 'pointer'
              }}
              onClick={() => openProductDetail(product.id)}
            >
              <div style={{ position: 'relative', height: '320px', background: theme.surfaceLight }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted }}>No Image</div>
                )}
                <div style={{ position: 'absolute', top: '15px', left: '15px' }}>
                  <span style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', color: theme.gold, fontSize: '0.7rem', fontWeight: 800, padding: '5px 12px', borderRadius: '20px', border: `1px solid ${theme.gold}` }}>
                    {product.shoe_brand || 'ARTISAN'}
                  </span>
                </div>
                {!product.in_stock && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontWeight: 800, padding: '10px 25px', border: '2px solid white', borderRadius: '30px', fontSize: '0.8rem' }}>OUT OF STOCK</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, flex: 1 }}>{product.name}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: theme.primary }}>KSh {product.min_price?.toLocaleString()}</span>
                  <div style={{ width: '35px', height: '35px', borderRadius: '50%', border: `1px solid ${theme.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.primary }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }} onClick={() => setSelectedProduct(null)}></div>
          <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', background: theme.surface, borderRadius: '32px', overflow: 'hidden', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%', overflow: 'auto' }} className="no-scrollbar">
              <div style={{ height: '500px', background: '#000' }}>
                {selectedProduct.image_url ? (
                  <img src={selectedProduct.image_url} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                )}
              </div>
              <div style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: theme.primary, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>{selectedProduct.shoe_brand}</span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1 }}>{selectedProduct.name}</h2>
                <p style={{ color: theme.textMuted, lineHeight: 1.6, marginBottom: '30px', fontSize: '0.95rem' }}>{selectedProduct.description}</p>
                
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', marginBottom: '15px', textTransform: 'uppercase' }}>Available Sizes</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {selectedProduct.variants.map((v) => (
                      <button 
                        key={v.id}
                        disabled={v.stock_quantity <= 0}
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          padding: '12px 20px', borderRadius: '12px', cursor: v.stock_quantity > 0 ? 'pointer' : 'not-allowed', border: `2px solid ${selectedVariant?.id === v.id ? theme.primary : theme.border}`,
                          background: selectedVariant?.id === v.id ? theme.primary : 'transparent',
                          color: v.stock_quantity > 0 ? (selectedVariant?.id === v.id ? 'white' : 'white') : theme.textMuted,
                          opacity: v.stock_quantity > 0 ? 1 : 0.4, transition: 'all 0.2s ease', fontWeight: 600
                        }}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: theme.textMuted, textTransform: 'uppercase' }}>Price</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>KSh {selectedVariant?.price.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => addToCart(selectedProduct, selectedVariant)}
                    disabled={!selectedVariant || selectedVariant.stock_quantity <= 0}
                    style={{
                      background: theme.primary, color: 'white', border: 'none', padding: '15px 35px', borderRadius: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease'
                    }}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }} onClick={() => setShowCart(false)}></div>
          <div style={{ position: 'relative', width: '100%', maxWidth: '450px', background: theme.surface, height: '100%', display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${theme.border}`, boxShadow: '-20px 0 50px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '30px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: theme.gold }}>YOUR CART</h3>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="no-scrollbar">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                  <svg style={{ marginBottom: '20px', opacity: 0.3 }} width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  <p style={{ color: theme.textMuted }}>Your artisan collection is empty.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '15px', padding: '15px', background: theme.surfaceLight, borderRadius: '18px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', background: theme.dark }}>
                      {item.product.image_url && <img src={item.product.image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '2px' }}>{item.product.name}</p>
                      <p style={{ fontSize: '0.75rem', color: theme.textMuted, marginBottom: '8px' }}>Size: {item.variant.size} | Color: {item.variant.color}</p>
                      <p style={{ color: theme.primary, fontWeight: 700 }}>KSh {item.variant.price.toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.variant.id)} style={{ background: 'rgba(255,68,68,0.1)', border: 'none', cursor: 'pointer', color: '#ff4444', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {cart.length > 0 && (
              <div style={{ padding: '30px', background: theme.surfaceLight, borderTop: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                  <span style={{ color: theme.textMuted, fontWeight: 600 }}>SUBTOTAL</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>KSh {cartTotal.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => {
                    const message = `Hello, I'd like to order:\n${cart.map(item => `- ${item.product.name} (Size: ${item.variant.size}, Color: ${item.variant.color}) x1`).join('\n')}\n\nTotal: KSh ${cartTotal.toLocaleString()}`;
                    window.open(`https://wa.me/254740495890?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  style={{ width: '100%', padding: '18px', background: theme.primary, color: 'white', border: 'none', borderRadius: '15px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: `0 10px 30px ${theme.primaryGlow}` }}
                >
                  ORDER VIA WHATSAPP
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: theme.surface, padding: '100px 40px 60px', borderTop: `1px solid ${theme.border}`, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '80px' }}>
          <div>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${theme.primary}`, marginBottom: '30px' }}>
              <img src="/kiongozi_logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.8)' }} />
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: theme.gold, marginBottom: '20px' }}>KIOO NGOZI</h3>
            <p style={{ color: theme.textMuted, lineHeight: 1.8 }}>The mark of authentic Kenyan craftsmanship. Excellence in leather since 2020.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px' }}>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '25px', color: 'white' }}>SHOP</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {categories.slice(0, 4).map(c => <li key={c.id} style={{ color: theme.textMuted, fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => setSelectedCategory(c.name)}>{c.name}</li>)}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '25px', color: 'white' }}>CONTACT</h4>
              <p style={{ color: theme.textMuted, fontSize: '0.9rem', marginBottom: '10px' }}>Nairobi, Kenya</p>
              <p style={{ color: theme.textMuted, fontSize: '0.9rem' }}>+254 740 495890</p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '25px', color: 'white' }}>SOCIAL</h4>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: theme.surfaceLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: `1px solid ${theme.border}`, textAlign: 'center', gridColumn: 'span 2' }}>
            <p style={{ color: theme.textMuted, fontSize: '0.8rem' }}>&copy; 2026 KIOO NGOZI LEATHER. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
