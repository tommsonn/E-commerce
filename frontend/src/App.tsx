import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { Auth } from './pages/Auth';
import { Admin } from './pages/Admin';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Profile } from './pages/Profile';
import { NotificationsPage } from './pages/Notifications';
import { NotificationSettings } from './pages/NotificationSettings';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { VerifyEmail } from './pages/VerifyEmail';
import { MyMessages } from './pages/MyMessages';
import { PaymentStatus } from './pages/PaymentStatus';
import { AdminPayments } from './pages/AdminPayments';
import { AdminPaymentDetail } from './pages/AdminPaymentDetail';

type Page = 
  | 'home' 
  | 'shop' 
  | 'product' 
  | 'cart' 
  | 'checkout' 
  | 'orders' 
  | 'login' 
  | 'admin' 
  | 'admin-payments'
  | 'admin-payment-detail'
  | 'contact' 
  | 'about' 
  | 'profile'
  | 'notifications'
  | 'notification-settings'
  | 'verify-email'
  | 'my-messages'
  | 'payment-status'
  | 'payment-callback';

// Inner component that has access to auth context
function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [productSlug, setProductSlug] = useState<string>('');
  const [initialCategory, setInitialCategory] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');
  const [paymentOrderId, setPaymentOrderId] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | undefined>();
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | undefined>();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const { user } = useAuth();

  // Check URL for parameters on mount and URL changes
  useEffect(() => {
    const checkUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const orderId = urlParams.get('orderId');
      const status = urlParams.get('status');
      const paymentStatus = urlParams.get('payment');
      const path = window.location.pathname;
      
      console.log('Current path:', path);
      console.log('URL params:', { token, orderId, status, paymentStatus });
      
      // Check for email verification
      if (path.includes('/verify-email') && token) {
        handleNavigate('verify-email', { token });
      } else if (path.includes('/verify-email') && !token) {
        handleNavigate('verify-email');
      }
      
      // Check for payment status
      if (path.includes('/payment/status') && orderId) {
        handleNavigate('payment-status', { orderId, status });
      }

      // Check for payment callback
      if (path.includes('/payment/callback')) {
        handleNavigate('payment-callback', { status: paymentStatus });
      }

      // Check for message ID in path
      if (path.startsWith('/my-messages/')) {
        const messageId = path.split('/')[2];
        if (messageId) {
          console.log('Found message ID in URL:', messageId);
          setSelectedMessageId(messageId);
          setCurrentPage('my-messages');
        }
      }

      // Check for admin payment ID in path
      if (path.startsWith('/admin/payments/')) {
        const paymentId = path.split('/')[3];
        if (paymentId) {
          console.log('Found payment ID in URL:', paymentId);
          setSelectedPaymentId(paymentId);
          setCurrentPage('admin-payment-detail');
        }
      }
    };

    checkUrlParams();
    
    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', checkUrlParams);
    
    return () => {
      window.removeEventListener('popstate', checkUrlParams);
    };
  }, []);

  // Handle auth loading state
  useEffect(() => {
    // Simulate auth loading check
    const timer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);

  // Redirect admins to admin dashboard after login
  useEffect(() => {
    // Only redirect if auth is not loading
    if (!isAuthLoading) {
      // If user is admin and currently on home page, redirect to admin dashboard
      if (user?.isAdmin && currentPage === 'home') {
        console.log('Admin user detected on home page, redirecting to admin dashboard');
        handleNavigate('admin');
      }
      
      // If user is not admin and somehow landed on admin page, redirect to home
      if (user && !user.isAdmin && currentPage === 'admin') {
        console.log('Non-admin user tried to access admin page, redirecting to home');
        handleNavigate('home');
      }
    }
  }, [user, isAuthLoading, currentPage]);

  const handleNavigate = (page: string, data?: any) => {
    console.log('Navigating to:', page, data);
    
    // Handle nested routes for messages
    if (page.startsWith('my-messages/')) {
      const messageId = page.split('/')[1];
      console.log('Setting message ID:', messageId);
      setSelectedMessageId(messageId);
      setCurrentPage('my-messages');
      
      // Update URL
      const url = new URL(window.location.href);
      url.pathname = `/${page}`;
      window.history.pushState({}, '', url.toString());
    }
    // Handle admin payment detail routes
    else if (page.startsWith('admin/payments/')) {
      const paymentId = page.split('/')[2];
      console.log('Setting payment ID:', paymentId);
      setSelectedPaymentId(paymentId);
      setCurrentPage('admin-payment-detail');
      
      // Update URL
      const url = new URL(window.location.href);
      url.pathname = `/${page}`;
      window.history.pushState({}, '', url.toString());
    }
    else {
      setCurrentPage(page as Page);
      
      if (page === 'product' && data?.slug) {
        setProductSlug(data.slug);
      }
      
      if (page === 'shop' && data?.category) {
        setInitialCategory(data.category);
      }
      
      if (page === 'verify-email' && data?.token) {
        setVerificationToken(data.token);
      }
      
      if (page === 'payment-status' && data?.orderId) {
        setPaymentOrderId(data.orderId);
        setPaymentStatus(data.status);
      }

      if (page === 'payment-callback' && data?.status) {
        setPaymentStatus(data.status);
      }
      
      if (page === 'admin-payment-detail' && data?.paymentId) {
        setSelectedPaymentId(data.paymentId);
      }
      
      if (page !== 'my-messages') {
        setSelectedMessageId(undefined);
      }
      
      // Update URL without reload (for better UX)
      const url = new URL(window.location.href);
      
      if (page === 'verify-email') {
        url.pathname = '/verify-email';
        if (data?.token) {
          url.searchParams.set('token', data.token);
        } else {
          url.searchParams.delete('token');
        }
      } else if (page === 'payment-status') {
        url.pathname = '/payment/status';
        if (data?.orderId) {
          url.searchParams.set('orderId', data.orderId);
        }
        if (data?.status) {
          url.searchParams.set('status', data.status);
        }
      } else if (page === 'payment-callback') {
        url.pathname = '/payment/callback';
        if (data?.status) {
          url.searchParams.set('payment', data.status);
        }
      } else if (page === 'admin-payments') {
        url.pathname = '/admin/payments';
      } else if (page.startsWith('admin/')) {
        url.pathname = `/${page}`;
      } else {
        url.pathname = '/';
        url.search = '';
      }
      
      window.history.pushState({}, '', url.toString());
    }
    
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    console.log('Rendering page:', currentPage, 'with data:', {
      productSlug,
      initialCategory,
      verificationToken,
      paymentOrderId,
      paymentStatus,
      selectedMessageId,
      selectedPaymentId
    });
    
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      
      case 'shop':
        return <Shop onNavigate={handleNavigate} initialCategory={initialCategory} />;
      
      case 'product':
        return <ProductDetail onNavigate={handleNavigate} slug={productSlug} />;
      
      case 'cart':
        return <Cart onNavigate={handleNavigate} />;
      
      case 'checkout':
        return <Checkout onNavigate={handleNavigate} />;
      
      case 'orders':
        return (
          <ProtectedRoute onNavigate={handleNavigate}>
            <Orders onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      
      case 'login':
        return <Auth onNavigate={handleNavigate} />;
      
      case 'admin':
        return (
          <ProtectedRoute requireAdmin={true} onNavigate={handleNavigate}>
            <Admin onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      
      case 'admin-payments':
        return (
          <ProtectedRoute requireAdmin={true} onNavigate={handleNavigate}>
            <AdminPayments onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      
      case 'admin-payment-detail':
        return (
          <ProtectedRoute requireAdmin={true} onNavigate={handleNavigate}>
            <AdminPaymentDetail 
              onNavigate={handleNavigate} 
              paymentId={selectedPaymentId} 
            />
          </ProtectedRoute>
        );
      
      case 'contact':
        return <Contact onNavigate={handleNavigate} />;
      
      case 'about':
        return <About onNavigate={handleNavigate} />;
      
      case 'profile':
        return (
          <ProtectedRoute onNavigate={handleNavigate}>
            <Profile onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      
      case 'notifications':
        return (
          <ProtectedRoute onNavigate={handleNavigate}>
            <NotificationsPage onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      
      case 'notification-settings':
        return (
          <ProtectedRoute onNavigate={handleNavigate}>
            <NotificationSettings onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      
      case 'verify-email':
        return <VerifyEmail onNavigate={handleNavigate} token={verificationToken} />;
      
      case 'my-messages':
        return (
          <ProtectedRoute onNavigate={handleNavigate}>
            <MyMessages onNavigate={handleNavigate} messageId={selectedMessageId} />
          </ProtectedRoute>
        );
      
      case 'payment-status':
        return <PaymentStatus 
          onNavigate={handleNavigate} 
          orderId={paymentOrderId} 
          status={paymentStatus} 
        />;

      case 'payment-callback':
        return <PaymentStatus 
          onNavigate={handleNavigate} 
          status={paymentStatus} 
        />;
      
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Pages that should not show header and footer
  const isAuthPage = currentPage === 'login';
  const isFullPage = currentPage === 'checkout' || 
                     currentPage === 'verify-email' || 
                     currentPage === 'payment-status' ||
                     currentPage === 'payment-callback';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex flex-col transition-colors duration-500">
      
      {/* Header - Hidden on login page, verify email page, payment status page, and payment callback */}
      {!isAuthPage && currentPage !== 'verify-email' && 
       currentPage !== 'payment-status' && currentPage !== 'payment-callback' && (
        <Header 
          onNavigate={handleNavigate} 
          currentPage={currentPage} 
        />
      )}
      
      {/* Main Content */}
      <main className="flex-grow">
        {renderPage()}
      </main>
      
      {/* Footer - Hidden on login, checkout, verify email, payment status, and payment callback pages */}
      {!isAuthPage && !isFullPage && (
        <Footer 
          onNavigate={handleNavigate} 
        />
      )}
    </div>
  );
}

// Main App component with providers
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
