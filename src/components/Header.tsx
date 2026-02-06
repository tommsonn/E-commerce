import { useState } from 'react';
import { Menu, X, ShoppingCart, User, Search, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { id: 'home', label: t('Home', 'ቤት') },
    { id: 'shop', label: t('Shop', 'መደብር') },
    { id: 'about', label: t('About', 'ስለ እኛ') },
    { id: 'contact', label: t('Contact', 'አግኙን') },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer" onClick={() => handleNavigate('home')}>
            <ShoppingCart className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              {t('EthioShop', 'ኢትዮሾፕ')}
            </span>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`${
                  currentPage === item.id
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-700 hover:text-green-600'
                } px-3 py-2 text-sm font-medium transition-colors`}
              >
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => handleNavigate('admin')}
                className={`${
                  currentPage === 'admin'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-700 hover:text-green-600'
                } px-3 py-2 text-sm font-medium transition-colors`}
              >
                {t('Admin', 'አስተዳዳሪ')}
              </button>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="flex items-center text-gray-700 hover:text-green-600 transition-colors"
            >
              <Globe className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">{language === 'en' ? 'አማ' : 'EN'}</span>
            </button>

            <button
              onClick={() => handleNavigate('cart')}
              className="relative text-gray-700 hover:text-green-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative group">
                <button className="flex items-center text-gray-700 hover:text-green-600 transition-colors">
                  <User className="h-6 w-6" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                  <button
                    onClick={() => handleNavigate('profile')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('My Profile', 'መገለጫዬ')}
                  </button>
                  <button
                    onClick={() => handleNavigate('orders')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('My Orders', 'ትዕዛዞቼ')}
                  </button>
                  <button
                    onClick={signOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('Sign Out', 'ውጣ')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavigate('login')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                {t('Sign In', 'ግባ')}
              </button>
            )}
          </div>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`${
                  currentPage === item.id
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-700 hover:bg-gray-50'
                } block w-full text-left px-3 py-2 rounded-md text-base font-medium`}
              >
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => handleNavigate('admin')}
                className={`${
                  currentPage === 'admin'
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-700 hover:bg-gray-50'
                } block w-full text-left px-3 py-2 rounded-md text-base font-medium`}
              >
                {t('Admin', 'አስተዳዳሪ')}
              </button>
            )}
          </div>
          <div className="border-t px-4 py-3 space-y-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="flex items-center w-full text-gray-700 hover:text-green-600 py-2"
            >
              <Globe className="h-5 w-5 mr-2" />
              <span>{language === 'en' ? 'Switch to Amharic' : 'Switch to English'}</span>
            </button>
            <button
              onClick={() => handleNavigate('cart')}
              className="flex items-center justify-between w-full text-gray-700 hover:text-green-600 py-2"
            >
              <span>{t('Shopping Cart', 'የግዢ ጋሪ')}</span>
              {totalItems > 0 && (
                <span className="bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            {user ? (
              <>
                <button
                  onClick={() => handleNavigate('profile')}
                  className="block w-full text-left py-2 text-gray-700 hover:text-green-600"
                >
                  {t('My Profile', 'መገለጫዬ')}
                </button>
                <button
                  onClick={() => handleNavigate('orders')}
                  className="block w-full text-left py-2 text-gray-700 hover:text-green-600"
                >
                  {t('My Orders', 'ትዕዛዞቼ')}
                </button>
                <button
                  onClick={signOut}
                  className="block w-full text-left py-2 text-gray-700 hover:text-green-600"
                >
                  {t('Sign Out', 'ውጣ')}
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigate('login')}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                {t('Sign In', 'ግባ')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
