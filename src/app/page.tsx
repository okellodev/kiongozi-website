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
  const [email, setEmail] = useState('');
  const [signupStatus, setSignupStatus] = useState<{message: string, type: 'success' | 'error' | null}>({message: '', type: null});
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [cart, setCart] = useState<{product: Product; variant: any; quantity: number}[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Checkout State
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [orderComplete, setOrderComplete] = useState<{id: string, total: number} | null>(null);
  
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

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setIsSubmittingOrder(true);
    try {
      const { createOrder } = await import('@/lib/api');
      const orderData = {
        customer_name: orderForm.name,
        customer_phone: orderForm.phone,
        customer_email: orderForm.email,
        shipping_address: orderForm.address,
        brand_source: 'KIONGOZI',
        items: cart.map(item => ({
          variant_id: item.variant.id,
          quantity: item.quantity
        }))
      };
      
      const res = await createOrder(orderData);
      if (res.order_id) {
        setOrderComplete({ id: res.order_id, total: res.total });
        // Clear cart
        setCart([]);
        localStorage.removeItem('kiongozi-cart');
      }
    } catch (err) {
      console.error("Order failed:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('kiongozi-cart', JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = products
    .filter(p => {
      const matchesCategory = !selectedCategory || (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));
      const matchesShoeBrand = !selectedShoeBrand || (p.shoe_brand && p.shoe_brand.toLowerCase() === selectedShoeBrand.toLowerCase());
      
      const search = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        (p.name && p.name.toLowerCase().includes(search)) || 
        (p.shoe_brand && p.shoe_brand.toLowerCase().includes(search)) ||
        (p.description && p.description.toLowerCase().includes(search)) ||
        (p.category && p.category.toLowerCase().includes(search));
        
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSigningUp(true);
    try {
      const { newsletterSignup } = await import('@/lib/api');
      const res = await newsletterSignup(email);
      setSignupStatus({
        message: res.coupon_code 
          ? `Success! Your 15% discount code is: ${res.coupon_code}` 
          : res.message || 'Thank you for subscribing!',
        type: 'success'
      });
      setEmail('');
    } catch (err) {
      setSignupStatus({ message: 'Failed to subscribe. Please try again.', type: 'error' });
    } finally {
      setIsSigningUp(false);
    }
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
    accent: '#ff6b35',
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
        
        .product-card {
          position: relative;
          background: ${theme.surface} !important;
          border: 1px solid ${theme.border} !important;
          backdrop-filter: blur(10px);
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1) !important;
        }
        .product-card:hover {
          transform: translateY(-12px) scale(1.02) !important;
          border-color: ${theme.primary} !important;
          box-shadow: 0 40px 80px -20px ${theme.primaryGlow}, 0 0 0 1px ${theme.primary} !important;
          z-index: 10;
        }
        .product-card:hover .product-image {
          transform: scale(1.1);
        }
        .product-image-container {
          overflow: hidden;
          position: relative;
        }
        .product-image {
          transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .artisan-badge {
          background: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(8px);
          color: ${theme.gold};
          border: 1px solid ${theme.gold};
          letter-spacing: 2px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        .section-title {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 700;
          color: ${theme.gold};
          margin-bottom: 2rem;
          text-align: center;
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

      {/* Announcement & Social Top Bar */}
      <div style={{
        background: `linear-gradient(90deg, ${theme.dark}, ${theme.surfaceLight})`,
        padding: '8px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
        position: 'relative', zIndex: 1010, borderBottom: `1px solid ${theme.border}`
      }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span>Proudly made in Kenya — by Kenyans, for the world.</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <a href="https://api.whatsapp.com/send/?phone=254111955273&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Need help? Chat with us
          </a>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <a href="https://www.facebook.com/people/Kioo-Ngozi-Leather/61582796257082/" target="_blank" rel="noopener noreferrer" style={{ color: theme.text, transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = theme.primary} onMouseLeave={e => e.currentTarget.style.color = theme.text}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
          </a>
          <a href="https://www.instagram.com/kioo_ngozi_leather/" target="_blank" rel="noopener noreferrer" style={{ color: theme.text, transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = theme.primary} onMouseLeave={e => e.currentTarget.style.color = theme.text}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://www.youtube.com/@KiooNgoziLeather" target="_blank" rel="noopener noreferrer" style={{ color: theme.text, transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = theme.primary} onMouseLeave={e => e.currentTarget.style.color = theme.text}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
          <a href="https://www.tiktok.com/@kioo_ngozi_leather" target="_blank" rel="noopener noreferrer" style={{ color: theme.text, transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = theme.primary} onMouseLeave={e => e.currentTarget.style.color = theme.text}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 448 512"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.32h0q2.55,10.05,7.24,19.31h0a122.51,122.51,0,0,0,111.44,79.52Z"/></svg>
          </a>
          <a href="https://x.com/kioo_ngozi_" target="_blank" rel="noopener noreferrer" style={{ color: theme.text, transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = theme.primary} onMouseLeave={e => e.currentTarget.style.color = theme.text}>
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
        </div>
      </div>

      {/* Announcement */}
      <div style={{
        background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
        padding: '10px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700,
        letterSpacing: '2px', textTransform: 'uppercase', position: 'relative', zIndex: 1010
      }}>
        📸 Featured on KTN, Citizen TV & Ramogi — See our story below ✦ Free Shipping Across Kenya
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
          {['HOME', 'SHOP', 'OUR CRAFT', 'CONTACT'].map((item) => (
            <a 
              key={item} href={item === 'SHOP' ? '#products' : (item === 'OUR CRAFT' ? '#craft' : '#')}
              style={{ color: theme.text, textDecoration: 'none', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '1px', position: 'relative' }}
            >
              {item}
            </a>
          ))}
          
          {/* Search Bar */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text"
              placeholder="Search rare pieces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: searchQuery ? `1px solid ${theme.primary}` : `1px solid ${theme.border}`,
                borderRadius: '20px',
                padding: '10px 15px 10px 40px',
                color: 'white',
                fontSize: '0.9rem',
                width: searchQuery ? '250px' : '180px',
                outline: 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: searchQuery ? `0 0 15px ${theme.primaryGlow}` : 'none'
              }}
            />
            <svg style={{ position: 'absolute', left: '15px' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={searchQuery ? theme.primary : theme.textMuted} strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', padding: '5px' }}
              >
                ✕
              </button>
            )}
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
        backgroundImage: 'url(/duffle.jpg)',
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.9) 100%)', zIndex: 0 }}></div>
        <div style={{ textAlign: 'center', maxWidth: '1000px', position: 'relative', zIndex: 1 }}>
          <p style={{ color: theme.primary, fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '20px' }}>Limited Production</p>
          <h1 style={{
            fontSize: 'clamp(3.5rem, 12vw, 8rem)', fontWeight: 900, lineHeight: 0.9, marginBottom: '20px',
            background: `linear-gradient(135deg, ${theme.text} 0%, ${theme.primary} 50%, ${theme.gold} 100%)`,
            backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'gradient-shift 5s ease infinite', letterSpacing: '-2px'
          }}>
            STEP INTO LEADERSHIP.
          </h1>
          <h2 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 300, color: theme.gold, marginBottom: '30px', fontFamily: 'var(--font-cormorant), serif' }}>Become a Kiongozi.</h2>
          <p style={{ fontSize: '1.2rem', color: theme.textMuted, marginBottom: '40px', maxWidth: '700px', margin: '0 auto 50px', fontWeight: 300, lineHeight: 1.6 }}>
            Premium Kenyan leather goods handcrafted in limited batches. Each piece is designed for leaders who understand that what you wear reflects who you are — and the legacy you're building.
          </p>
          <button 
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: theme.primary, color: 'white', border: 'none', padding: '18px 45px',
              fontSize: '0.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: '50px', animation: 'glow 2s ease-in-out infinite', transition: 'all 0.3s ease'
            }}
          >
            Shop the Collection
          </button>
        </div>
      </section>

      {/* Value Props */}
      <section style={{ padding: '40px 20px', background: theme.dark, borderBottom: `1px solid ${theme.border}`, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', textAlign: 'center' }}>
          {[
            { icon: "🚚", title: "Swift Delivery", desc: "Within 24–48 hrs across Kenya" },
            { icon: "🔄", title: "Easy Exchanges", desc: "Real leather guarantee" },
            { icon: "🏬", title: "Free Pickup", desc: "Mithoo Business Center, Nairobi" },
            { icon: "💬", title: "Fast Support", desc: "WhatsApp: +254 111 955 273" }
          ].map((item, i) => (
            <div key={i} style={{ padding: '20px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '15px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: theme.gold }}>{item.title}</h3>
              <p style={{ color: theme.textMuted, fontSize: '0.85rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why We Are Different */}
      <section style={{ padding: '100px 20px', background: theme.surface, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="section-title">WHY KIOO NGOZI IS DIFFERENT</h2>
          <p style={{ textAlign: 'center', color: theme.textMuted, maxWidth: '800px', margin: '-1rem auto 4rem', fontSize: '1.1rem' }}>
            We don't compete with mass-market brands. We craft rare, intentional leather goods for leaders who value presence, quality, and African excellence.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
            {[
              { title: "Limited-Edition Production", desc: "We never mass-produce. Each release is limited so your leather stays rare — just like your presence." },
              { title: "Master Kenyan Artisans", desc: "Every piece is shaped by skilled Kenyan hands — not factory lines — so no two leaders wear the same story." },
              { title: "Built for Leaders", desc: "Our designs are made for people who walk into rooms and command them — without saying a word." },
              { title: "Leather That Lasts", desc: "We choose leather that grows more powerful with time — just like the people who wear it." }
            ].map((item, i) => (
              <div key={i} style={{ padding: '30px', background: theme.dark, borderRadius: '20px', border: `1px solid ${theme.border}` }}>
                <h3 style={{ color: theme.gold, fontSize: '1.2rem', fontWeight: 700, marginBottom: '15px' }}>{item.title}</h3>
                <p style={{ color: theme.textMuted, lineHeight: 1.6, fontSize: '0.95rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Craft - Process */}
      <section id="craft" style={{ padding: '100px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 className="section-title">HOW YOUR PIECE IS MADE</h2>
          <p style={{ textAlign: 'center', color: theme.textMuted, marginBottom: '60px' }}>Every piece reflects our commitment to quality, craftsmanship, and Kenyan artisan excellence.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '80px' }}>
            {[
              { step: "1", title: "Design & Leather Selection", desc: "We begin by selecting premium hides chosen for strength, texture, and character — because a leader’s leather should never look ordinary." },
              { step: "2", title: "Small-Batch Crafting", desc: "Your piece is crafted in small batches by skilled Kenyan artisans — ensuring attention, care, and consistency in every stitch." },
              { step: "3", title: "Quality Control", desc: "Every stitch, edge, and panel is carefully inspected so only leather worthy of the Kioo Ngozi name leaves our workshop." },
              { step: "4", title: "Ready for You", desc: "Only pieces that pass our strict standards are released — so when you receive yours, it arrives ready to lead with you." }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', padding: '30px', background: theme.surface, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, flexShrink: 0 }}>{item.step}</div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>{item.title}</h3>
                  <p style={{ color: theme.textMuted, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Limited Edition Standards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '40px' }}>
            {[
              { title: "Limited-Edition Craftsmanship", desc: "Every Kioo Ngozi piece is produced in controlled batches to ensure uncompromising quality and exclusivity." },
              { title: "Uncompromising Standards", desc: "We never rush production. Every Kioo Ngozi piece is given the time, attention, and skill it deserves." },
              { title: "High Demand, Limited Supply", desc: "Popular styles sell out quickly and may take time to return. We never flood the market—we protect our quality." },
              { title: "Own Something Exclusive", desc: "A Kioo Ngozi piece is not for everyone. It's for those who value true craftsmanship and exclusivity." }
            ].map((item, i) => (
              <div key={i} style={{ padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                <h3 style={{ color: theme.gold, fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px', textTransform: 'uppercase' }}>{item.title}</h3>
                <p style={{ color: theme.textMuted, fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <p style={{ fontSize: '1.2rem', color: theme.text, fontWeight: 600, marginBottom: '20px' }}>Don't wait—Secure your Kioo Ngozi piece before this edition closes.</p>
          </div>
        </div>
      </section>

      {/* Filters & Products */}
      <section style={{ maxWidth: '1200px', margin: '40px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <h2 className="section-title" id="products">THE COLLECTION</h2>
        <div style={{ background: theme.surface, borderRadius: '40px', padding: '20px', border: `1px solid ${theme.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
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
              All Items
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
                <option value="newest" style={{ background: theme.surface }}>Newest</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 20px 120px', position: 'relative', zIndex: 1 }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', background: theme.surface, borderRadius: '40px', border: `1px solid ${theme.border}` }}>
            <svg style={{ marginBottom: '20px', opacity: 0.3 }} width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.gold, marginBottom: '10px' }}>No matching pieces found</h3>
            <p style={{ color: theme.textMuted }}>Try adjusting your search or filters to explore our rare collection.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory(''); setSelectedShoeBrand(''); }}
              style={{ marginTop: '30px', background: 'transparent', border: `1px solid ${theme.primary}`, color: theme.primary, padding: '10px 25px', borderRadius: '25px', cursor: 'pointer' }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            {filteredProducts.map((product) => (
              <div 
                key={product.id} className="product-card"
                style={{ borderRadius: '24px', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => openProductDetail(product.id)}
              >
                {/* Image Container with Zoom Effect */}
                <div className="product-image-container" style={{ height: '340px', background: theme.surfaceLight }}>
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="product-image"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted }}>No Image</div>
                  )}
                  
                  {/* Luxury Artisan Badge */}
                  <div style={{ position: 'absolute', top: '15px', left: '15px' }}>
                    <span className="artisan-badge" style={{ fontSize: '0.65rem', fontWeight: 800, padding: '6px 14px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {product.shoe_brand || 'Authentic Leather'}
                    </span>
                  </div>

                  {/* Glass Overlay on hover (handled by CSS) */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 40%)', opacity: 0.6 }}></div>
                </div>

                {/* Content Section */}
                <div style={{ padding: '24px', position: 'relative' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: theme.textMuted, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px' }}>{product.category}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: theme.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Investment</p>
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: theme.primary }}>KSh {product.min_price?.toLocaleString()}</span>
                    </div>
                    <div style={{ 
                      width: '44px', height: '44px', borderRadius: '50%', 
                      background: `linear-gradient(135deg, ${theme.surfaceLight}, ${theme.surface})`,
                      border: `1px solid ${theme.border}`, display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', color: theme.primary,
                      boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                    }}>
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 4v16m8-8H4" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Who Kioo Ngozi is For */}
      <section style={{ padding: '100px 20px', background: `linear-gradient(180deg, ${theme.dark}, ${theme.surface})`, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="section-title">WHO KIOO NGOZI IS FOR</h2>
          <p style={{ color: theme.textMuted, fontSize: '1.2rem', marginBottom: '60px', fontStyle: 'italic', maxWidth: '800px', margin: '0 auto 60px' }}>
            "For those who understand that what you wear is more than fashion—it's a statement of who you are and what you're building."
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', textAlign: 'left' }}>
            {[
              { title: "Quality Over Price", text: "You choose true craftsmanship because you know it's an investment, not just a purchase." },
              { title: "Presence Without Words", text: "You believe your presence should be felt before you ever speak." },
              { title: "Refusal to Blend In", text: "You know what you wear reflects who you are — and you refuse to be ordinary." },
              { title: "Building a Legacy", text: "You are building something that should last — a career, a legacy, a life of impact." },
              { title: "Driven by Principles", text: "You follow your own path and values, not the latest passing trends." },
              { title: "True Luxury", text: "You know true luxury isn’t about logos — it’s about how it makes you feel." }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <div style={{ color: theme.primary, fontSize: '1.5rem', fontWeight: 900 }}>✦</div>
                <div>
                  <h3 style={{ color: theme.gold, fontSize: '1rem', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase' }}>{item.title}</h3>
                  <p style={{ color: theme.textMuted, fontSize: '0.9rem', lineHeight: 1.6 }}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media & Testimonials */}
      <section style={{ padding: '100px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="section-title">AS SEEN ON</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', marginBottom: '100px' }}>
            {[
              { name: 'Citizen TV', logo: '/media/citizen.avif', link: 'https://www.youtube.com/watch?v=8zZAjbLyHVM', desc: 'Showcased on "Made in Kenya" segment for our craftsmanship and vision.' },
              { name: 'Ramogi TV', logo: '/media/ramogi.avif', link: 'https://www.youtube.com/watch?v=itS2Palyct8', desc: 'Featured on "Pok Opogore" segment discussing local vs imported goods.' },
              { name: 'Dr. King\'ori', logo: '/media/kingori.webp', link: 'https://www.youtube.com/watch?v=b5uMIBqAwD8', desc: 'Discussing the founder\'s story and building a premium Kenyan brand.' },
              { name: 'KTN News', logo: '/media/ktn.webp', link: 'https://www.youtube.com/watch?v=ST5uLGnx7E8', desc: 'Sharing expert insight on leather quality standards on "Entrepreneur".' }
            ].map((media, i) => (
              <a key={i} href={media.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ padding: '30px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '20px', textAlign: 'center', transition: 'all 0.3s ease', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ height: '80px', width: '80px', marginBottom: '20px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                    <img src={media.logo} alt={media.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: theme.gold, display: 'block', marginBottom: '15px' }}>{media.name}</span>
                  <p style={{ color: theme.textMuted, fontSize: '0.85rem', lineHeight: 1.6 }}>{media.desc}</p>
                </div>
              </a>
            ))}
          </div>

          <h2 className="section-title">TRUSTED BY LEADERS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {[
              { name: "Amina Wanjiru", loc: "Nairobi", text: "The craftsmanship is exceptional. Every stitch tells a story of quality and care. I feel confident wearing Kioo Ngozi." },
              { name: "David Omondi", loc: "Kisumu", text: "I've never owned leather this beautiful. It's not just a bag, it's a statement. Kioo Ngozi understands luxury." },
              { name: "Grace Muthoni", loc: "Mombasa", text: "The attention to detail is remarkable. I can feel the passion in every piece. This is what true craftsmanship looks like." }
            ].map((t, i) => (
              <div key={i} style={{ padding: '40px', background: theme.surface, borderRadius: '24px', borderLeft: `4px solid ${theme.primary}` }}>
                <p style={{ fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '25px', lineHeight: 1.6 }}>"{t.text}"</p>
                <h4 style={{ fontWeight: 700, color: theme.gold }}>{t.name}</h4>
                <p style={{ fontSize: '0.8rem', color: theme.textMuted }}>{t.loc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: theme.surface, padding: '100px 40px 60px', borderTop: `3px solid ${theme.primary}`, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '80px' }}>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: theme.gold, marginBottom: '20px' }}>KIOO NGOZI</h3>
            <p style={{ color: theme.textMuted, lineHeight: 1.8, marginBottom: '30px' }}>The mark of authentic Kenyan craftsmanship. Excellence in leather since 2020.</p>
            <p style={{ color: theme.text, fontSize: '0.9rem', marginBottom: '10px' }}>🏬 Mithoo Business Center, Moi Ave</p>
            <p style={{ color: theme.textMuted, fontSize: '0.9rem', marginLeft: '25px' }}>3rd Flr Shop T45, Nairobi</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '25px', color: 'white' }}>SUPPORT</h4>
              <div style={{ color: theme.textMuted, fontSize: '0.85rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="https://api.whatsapp.com/send/?phone=254111955273&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp Support
                </a>
                <a href="tel:+254111955273" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" fill="#4CAF50" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  +254 111 955 273
                </a>
                <a href="https://api.whatsapp.com/send/?phone=254111955273&text=I%20need%20expert%20advice%20on%20leather" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" fill={theme.gold} viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                  Talk to an Advisor
                </a>
                <span>🚚 Delivery: 24-48 hrs</span>
                <span>🔄 Easy Exchanges</span>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '25px', color: 'white' }}>SHOP</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {categories.slice(0, 4).map(c => <li key={c.id} style={{ color: theme.textMuted, fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => setSelectedCategory(c.name)}>{c.name}</li>)}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '25px', color: 'white' }}>SOCIAL</h4>
              <div style={{ display: 'flex', gap: '15px' }}>
                <a href="https://www.facebook.com/people/Kioo-Ngozi-Leather/61582796257082/" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '10px', background: theme.surfaceLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = theme.primary} onMouseLeave={e => e.currentTarget.style.background = theme.surfaceLight}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                </a>
                <a href="https://www.instagram.com/kioo_ngozi_leather/" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '10px', background: theme.surfaceLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = theme.primary} onMouseLeave={e => e.currentTarget.style.background = theme.surfaceLight}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://www.youtube.com/@KiooNgoziLeather" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '10px', background: theme.surfaceLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = theme.primary} onMouseLeave={e => e.currentTarget.style.background = theme.surfaceLight}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@kioo_ngozi_leather" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '10px', background: theme.surfaceLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = theme.primary} onMouseLeave={e => e.currentTarget.style.background = theme.surfaceLight}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 448 512"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.32h0q2.55,10.05,7.24,19.31h0a122.51,122.51,0,0,0,111.44,79.52Z"/></svg>
                </a>
                <a href="https://x.com/kioo_ngozi_" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '10px', background: theme.surfaceLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = theme.primary} onMouseLeave={e => e.currentTarget.style.background = theme.surfaceLight}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '25px', color: 'white' }}>SUBSCRIBE</h4>
              <p style={{ color: theme.textMuted, fontSize: '0.8rem', marginBottom: '15px' }}>Join our community for 15% off your first rare piece.</p>
              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email" 
                  required
                  style={{ background: theme.dark, border: `1px solid ${theme.border}`, padding: '12px', borderRadius: '10px', width: '100%', color: 'white', outline: 'none' }} 
                />
                <button 
                  type="submit" 
                  disabled={isSigningUp}
                  style={{ background: theme.primary, color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', opacity: isSigningUp ? 0.7 : 1 }}
                >
                  {isSigningUp ? 'SUBSCRIBING...' : 'GET MY 15% OFF'}
                </button>
              </form>
              {signupStatus.message && (
                <p style={{ marginTop: '15px', fontSize: '0.8rem', color: signupStatus.type === 'success' ? '#25D366' : '#ff4444', fontWeight: 600 }}>
                  {signupStatus.message}
                </p>
              )}
            </div>
          </div>
          <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: `1px solid ${theme.border}`, textAlign: 'center', gridColumn: 'span 2' }}>
            <p style={{ color: theme.textMuted, fontSize: '0.8rem', marginBottom: '15px' }}>&copy; 2026 KIOO NGOZI LEATHER. ALL RIGHTS RESERVED. REAL LEATHER GUARANTEE.</p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', fontSize: '0.75rem' }}>
              <a href="/privacy" style={{ color: theme.textMuted, textDecoration: 'none' }}>Privacy Policy</a>
              <a href="/terms" style={{ color: theme.textMuted, textDecoration: 'none' }}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)' }} onClick={() => setSelectedProduct(null)}></div>
          <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', background: theme.surface, borderRadius: '32px', overflow: 'hidden', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 50px 100px rgba(0,0,0,0.8)' }}>
            <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', height: '100%', overflow: 'auto' }} className="no-scrollbar">
              <div style={{ height: '600px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selectedProduct.image_url ? (
                  <img src={selectedProduct.image_url} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                )}
              </div>
              <div style={{ padding: '50px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: theme.primary, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>{selectedProduct.shoe_brand || 'Artisan Handcrafted'}</span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1, fontFamily: 'var(--font-cormorant), serif' }}>{selectedProduct.name}</h2>
                <p style={{ color: theme.textMuted, lineHeight: 1.6, marginBottom: '30px', fontSize: '0.95rem' }}>{selectedProduct.description}</p>
                
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', marginBottom: '15px', textTransform: 'uppercase' }}>Available Sizes</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {selectedProduct.variants.map((v) => (
                      <button 
                        key={v.id} disabled={v.stock_quantity <= 0} onClick={() => setSelectedVariant(v)}
                        style={{
                          padding: '12px 20px', borderRadius: '12px', cursor: v.stock_quantity > 0 ? 'pointer' : 'not-allowed', border: `2px solid ${selectedVariant?.id === v.id ? theme.primary : theme.border}`,
                          background: selectedVariant?.id === v.id ? theme.primary : 'transparent',
                          color: 'white', opacity: v.stock_quantity > 0 ? 1 : 0.3, transition: 'all 0.2s ease', fontWeight: 600
                        }}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '25px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: theme.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Price</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>KSh {selectedVariant?.price.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => addToCart(selectedProduct, selectedVariant)}
                    disabled={!selectedVariant || selectedVariant.stock_quantity <= 0}
                    style={{ background: theme.primary, color: 'white', border: 'none', padding: '15px 35px', borderRadius: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: `0 10px 20px ${theme.primaryGlow}` }}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }} onClick={() => setShowCart(false)}></div>
          <div style={{ position: 'relative', width: '100%', maxWidth: '450px', background: theme.surface, height: '100%', display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${theme.border}`, boxShadow: '-20px 0 50px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '30px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: theme.gold, fontFamily: 'var(--font-cormorant), serif' }}>YOUR COLLECTION</h3>
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
                      <p style={{ fontSize: '0.75rem', color: theme.textMuted, marginBottom: '8px' }}>Size: {item.variant.size} | {item.product.shoe_brand}</p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: theme.dark, borderRadius: '8px', padding: '2px' }}>
                          <button 
                            onClick={() => {
                              const newCart = [...cart];
                              if (newCart[idx].quantity > 1) {
                                newCart[idx].quantity -= 1;
                                setCart(newCart);
                              } else {
                                removeFromCart(item.variant.id);
                              }
                            }}
                            style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                          >-</button>
                          <span style={{ fontSize: '0.85rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                          <button 
                            onClick={() => {
                              const newCart = [...cart];
                              newCart[idx].quantity += 1;
                              setCart(newCart);
                            }}
                            style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                          >+</button>
                        </div>
                        <p style={{ color: theme.primary, fontWeight: 700, fontSize: '0.9rem' }}>KSh {(item.variant.price * item.quantity).toLocaleString()}</p>
                      </div>
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
                    setShowCart(false);
                    setShowCheckout(true);
                  }}
                  style={{ width: '100%', padding: '18px', background: theme.primary, color: 'white', border: 'none', borderRadius: '15px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: `0 10px 30px ${theme.primaryGlow}` }}
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }} onClick={() => !isSubmittingOrder && setShowCheckout(false)}></div>
          
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px', background: theme.surface, borderRadius: '32px', overflow: 'hidden', border: `1px solid ${theme.border}`, boxShadow: '0 50px 100px rgba(0,0,0,0.5)' }}>
            {orderComplete ? (
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
                  <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '15px' }}>ORDER RECEIVED</h2>
                <p style={{ color: theme.textMuted, marginBottom: '40px', lineHeight: 1.6 }}>Your order <b>{orderComplete.id}</b> is registered. Please complete payment via WhatsApp to start crafting.</p>
                
                <button 
                  onClick={() => {
                    const message = `Hi Kioo Ngozi, I've placed Order #${orderComplete.id} (Total: KSh ${orderComplete.total.toLocaleString()}). Please confirm my payment.`;
                    window.open(`https://wa.me/254740495890?text=${encodeURIComponent(message)}`, '_blank');
                    setShowCheckout(false);
                    setOrderComplete(null);
                  }}
                  style={{ width: '100%', padding: '20px', background: '#25D366', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}
                >
                  CONFIRM ON WHATSAPP
                </button>
              </div>
            ) : (
              <div style={{ padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: theme.gold, fontFamily: 'var(--font-cormorant), serif' }}>CHECKOUT</h2>
                  <button onClick={() => setShowCheckout(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Full Name</label>
                    <input 
                      required type="text" value={orderForm.name} onChange={e => setOrderForm({...orderForm, name: e.target.value})}
                      style={{ width: '100%', background: theme.dark, border: `1px solid ${theme.border}`, padding: '15px', borderRadius: '12px', color: 'white', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>WhatsApp Phone</label>
                    <input 
                      required type="tel" value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})}
                      style={{ width: '100%', background: theme.dark, border: `1px solid ${theme.border}`, padding: '15px', borderRadius: '12px', color: 'white', outline: 'none' }}
                      placeholder="e.g. 0712..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Delivery Address</label>
                    <textarea 
                      required rows={2} value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})}
                      style={{ width: '100%', background: theme.dark, border: `1px solid ${theme.border}`, padding: '15px', borderRadius: '12px', color: 'white', outline: 'none', resize: 'none' }}
                      placeholder="Street, Apartment, City"
                    />
                  </div>

                  <div style={{ marginTop: '10px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                      <span style={{ color: theme.textMuted }}>Total Payable</span>
                      <span style={{ fontWeight: 800, color: 'white' }}>KSh {cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    type="submit" disabled={isSubmittingOrder}
                    style={{ width: '100%', padding: '20px', background: theme.primary, color: 'white', border: 'none', borderRadius: '15px', fontWeight: 800, cursor: 'pointer', marginTop: '10px', boxShadow: `0 10px 20px ${theme.primaryGlow}`, opacity: isSubmittingOrder ? 0.7 : 1 }}
                  >
                    {isSubmittingOrder ? 'SECURING ORDER...' : 'PLACE ORDER'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
