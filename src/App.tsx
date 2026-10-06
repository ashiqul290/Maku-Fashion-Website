import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { UserAuthProvider } from './context/UserAuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { Product, Order, Category } from './types.ts';

// Components
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { SearchModal } from './components/SearchModal.tsx';

// Pages
import { HomePage } from './pages/HomePage.tsx';
import { ShopPage } from './pages/ShopPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { AdminLoginPage } from './pages/AdminLoginPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { AccountPage } from './pages/AccountPage.tsx';
import { WishlistPage } from './pages/WishlistPage.tsx';

function MainApp() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Products Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Fetch initial products
  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products from API:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error(`Category request failed (${res.status})`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to load categories from API:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Hash-based simple routing support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const route = hash || path;

      if (!route) {
        setCurrentPage('home');
        return;
      }

      if (route.startsWith('shop/category/')) {
        setSelectedCategoryId(route.slice('shop/category/'.length));
        setCurrentPage('shop');
      } else if (route.startsWith('product/')) {
        const prodId = route.replace('product/', '');
        const found = products.find(p => p._id === prodId || p.id === prodId);
        if (found) {
          setSelectedProduct(found);
          setCurrentPage('product-detail');
        } else {
          setCurrentPage('shop');
        }
      } else if (
        ['shop', 'wishlist', 'about', 'contact', 'checkout', 'account', 'admin', 'admin-login'].includes(route)
      ) {
        if (route === 'shop') setSelectedCategoryId(null);
        setCurrentPage(route);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [products]);

  // Navigate helper
  const handleNavigate = (page: string, params?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);

    if (page === 'product-detail' && params?.product) {
      setSelectedProduct(params.product);
      window.location.hash = `product/${params.product._id}`;
    } else if (page === 'home') {
      setSelectedCategoryId(null);
      window.history.pushState({}, '', '/');
    } else if (page === 'shop') {
      const categoryId = params?.categoryId || null;
      setSelectedCategoryId(categoryId);
      window.location.hash = categoryId ? `shop/category/${categoryId}` : 'shop';
    } else {
      window.location.hash = page;
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    handleNavigate('product-detail', { product });
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    handleNavigate('order-confirmation');
    fetchProducts(); // refresh stock numbers
  };

  const isAdminView = currentPage === 'admin' || currentPage === 'admin-login';
  const isAdminRoute = isAdminView;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1F1D1B] font-sans antialiased selection:bg-[#F2E8D5] selection:text-[#856525]">
      {/* Header / Navbar (hidden in admin auth/dashboard views) */}
      {!isAdminView && (
        <Navbar
          currentPage={currentPage}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            products={products}
            isLoading={isLoadingProducts}
            onNavigate={handleNavigate}
            onViewProduct={handleViewProduct}
          />
        )}

        {currentPage === 'shop' && (
          <ShopPage
            products={products}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onClearCategory={() => handleNavigate('shop')}
            isLoading={isLoadingProducts}
            onViewProduct={handleViewProduct}
          />
        )}

        {currentPage === 'wishlist' && (
          <WishlistPage
            products={products}
            isLoading={isLoadingProducts}
            onViewProduct={handleViewProduct}
            onBrowseShop={() => handleNavigate('shop')}
          />
        )}

        {currentPage === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={products}
            onBackToShop={() => handleNavigate('shop')}
            onViewProduct={handleViewProduct}
            onDirectCheckout={() => handleNavigate('checkout')}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onBackToCart={() => handleNavigate('shop')}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentPage === 'order-confirmation' && confirmedOrder && (
          <OrderConfirmationPage
            order={confirmedOrder}
            onContinueShopping={() => handleNavigate('shop')}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onExploreShop={() => handleNavigate('shop')} />
        )}

        {currentPage === 'contact' && <ContactPage />}

        {currentPage === 'account' && <AccountPage onNavigate={handleNavigate} />}

        {isAdminRoute && (
          isAuthLoading ? (
            <div className="min-h-[80vh] flex items-center justify-center text-xs text-[#786A5E]">
              Checking admin session...
            </div>
          ) : isAuthenticated ? (
            <AdminDashboardPage
              onBackToStore={() => handleNavigate('home')}
              onRefreshProducts={fetchProducts}
              onRefreshCategories={fetchCategories}
            />
          ) : (
            <AdminLoginPage
              onLoginSuccess={() => handleNavigate('admin')}
              onBackToStore={() => handleNavigate('home')}
            />
          )
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        onCheckout={() => handleNavigate('checkout')}
        onNavigateShop={() => handleNavigate('shop')}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={handleViewProduct}
      />

      {/* Footer (hidden in full admin dashboard view) */}
      {!isAdminView && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <UserAuthProvider>
          <CartProvider>
            <WishlistProvider>
              <MainApp />
            </WishlistProvider>
          </CartProvider>
        </UserAuthProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
