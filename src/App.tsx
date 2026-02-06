import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Auth } from './pages/Auth';
import { Orders } from './pages/Orders';
import { Admin } from './pages/Admin';

type Page = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'about' | 'contact' | 'login' | 'orders' | 'profile' | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageData, setPageData] = useState<any>(null);

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page as Page);
    setPageData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'shop':
        return <Shop onNavigate={handleNavigate} initialCategory={pageData?.category} />;
      case 'product':
        return <ProductDetail slug={pageData?.slug} onNavigate={handleNavigate} />;
      case 'cart':
        return <Cart onNavigate={handleNavigate} />;
      case 'checkout':
        return <Checkout onNavigate={handleNavigate} />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'login':
        return <Auth onNavigate={handleNavigate} />;
      case 'orders':
        return <Orders onNavigate={handleNavigate} />;
      case 'admin':
        return <Admin onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Header onNavigate={handleNavigate} currentPage={currentPage} />
            <main className="flex-grow">
              {renderPage()}
            </main>
            <Footer onNavigate={handleNavigate} />
          </div>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
