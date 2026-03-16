import { useState } from 'react';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  Globe, 
  Sun, 
  Moon, 
  LogOut, 
  Package, 
  Shield, 
  Bell, 
  Mail, 
  Settings,
  ChevronDown,
  MessageSquare,
  BarChart3,
  CreditCard,
  Users,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationBell } from '../components/NotificationBell';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

// Define types for navigation items
interface BaseNavItem {
  id: string;
  label: string;
}

interface NavItemWithIcon extends BaseNavItem {
  icon: JSX.Element;
}

type NavItem = BaseNavItem | NavItemWithIcon;

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, signOut, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Regular navigation items for non-admin users ONLY (no icons)
  const regularNavItems: BaseNavItem[] = !isAdmin ? [
    { id: 'home', label: t('Home', 'ቤት') },
    { id: 'shop', label: t('Shop', 'መደብር') },
    { id: 'about', label: t('About', 'ስለ እኛ') },
    { id: 'contact', label: t('Contact', 'አግኙን') },
  ] : [];

  // Admin only navigation items (with icons)
  const adminNavItems: NavItemWithIcon[] = isAdmin ? [
    { id: 'admin', label: t('Dashboard', 'ዳሽቦርድ'), icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    // You can add more admin nav items here if needed
  ] : [];

  // Combine based on role - but only show one set
  const navItems: NavItem[] = isAdmin ? adminNavItems : regularNavItems;

  // Type guard to check if an item has an icon
  const hasIcon = (item: NavItem): item is NavItemWithIcon => {
    return 'icon' in item;
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    handleNavigate('home');
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo - Clicking logo goes to home for regular users, admin dashboard for admins */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => handleNavigate(isAdmin ? 'admin' : 'home')}
          >
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/40 transition-colors">
              <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="ml-2 text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              {t('TomShop', 'ቶምሾፕ')}
            </span>
            {isAdmin && (
              <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
                {t('Admin', 'አስተዳዳሪ')}
              </span>
            )}
          </div>

          {/* Desktop Navigation - Only show if there are items to show */}
          {navItems.length > 0 && (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center
                    ${currentPage === item.id || (item.id.startsWith('admin') && currentPage.startsWith('admin'))
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                >
                  {/* Only render icon if it exists (for admin items) */}
                  {hasIcon(item) && item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            
            {/* Notification Bell - Show for all users (admins might need notifications too) */}
            <NotificationBell onNavigate={handleNavigate} />
            
            {/* Theme Toggle - Show for all users */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-gray-800 
                       transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Language Toggle - Show for all users */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="flex items-center px-3 py-2 rounded-lg
                       text-gray-700 dark:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-gray-800
                       transition-colors duration-200"
            >
              <Globe className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'አማርኛ' : 'English'}
              </span>
            </button>

            {/* Cart - Only show for non-admin users */}
            {!isAdmin && (
              <button
                onClick={() => handleNavigate('cart')}
                className="relative p-2 rounded-lg text-gray-700 dark:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-800 
                         transition-colors duration-200"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 dark:bg-indigo-500 
                                 text-white text-xs font-bold rounded-full 
                                 h-5 w-5 flex items-center justify-center
                                 animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
            )}

            {/* User Menu - Show for all authenticated users */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg
                           text-gray-700 dark:text-gray-200 
                           hover:bg-gray-100 dark:hover:bg-gray-800
                           transition-colors duration-200 group"
                >
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-1 relative">
                    <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    {!user?.isEmailVerified && !isAdmin && (
                      <span className="absolute -top-1 -right-1 bg-yellow-500 rounded-full h-2 w-2 animate-pulse"></span>
                    )}
                  </div>
                  <span className="text-sm font-medium hidden lg:inline">
                    {user.fullName?.split(' ')[0] || t('User', 'ተጠቃሚ')}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 
                                  rounded-lg shadow-xl border border-gray-100 dark:border-gray-700
                                  animate-slideDown overflow-hidden z-50">
                      
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-2">
                            <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                        
                        {/* Email Verification Warning - Only for non-admin users */}
                        {!user?.isEmailVerified && !isAdmin && (
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              handleNavigate('notification-settings');
                            }}
                            className="mt-3 w-full text-xs text-yellow-600 dark:text-yellow-400 
                                     hover:text-yellow-700 dark:hover:text-yellow-300 
                                     bg-yellow-50 dark:bg-yellow-900/20 
                                     px-3 py-2 rounded-lg flex items-center justify-center
                                     transition-colors"
                          >
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                            {t('Verify your email', 'ኢሜይልዎን ያረጋግጡ')}
                          </button>
                        )}
                      </div>
                      
                      {/* Menu Items - Conditional based on user role */}
                      <div className="py-1">
                        {/* Profile - Show for all users */}
                        <button
                          onClick={() => handleNavigate('profile')}
                          className="flex items-center w-full px-4 py-2 text-sm
                                   text-gray-700 dark:text-gray-200 
                                   hover:bg-gray-50 dark:hover:bg-gray-700 
                                   transition-colors"
                        >
                          <User className="h-4 w-4 mr-3 text-indigo-600 dark:text-indigo-400" />
                          {t('My Profile', 'መገለጫዬ')}
                        </button>

                        {/* Admin Dashboard Link - Only for admin users */}
                        {isAdmin && (
                          <button
                            onClick={() => handleNavigate('admin')}
                            className="flex items-center w-full px-4 py-2 text-sm
                                     text-gray-700 dark:text-gray-200 
                                     hover:bg-gray-50 dark:hover:bg-gray-700 
                                     transition-colors"
                          >
                            <BarChart3 className="h-4 w-4 mr-3 text-indigo-600 dark:text-indigo-400" />
                            {t('Admin Dashboard', 'የአስተዳዳሪ ዳሽቦርድ')}
                          </button>
                        )}

                        {/* Orders - Show for non-admin users only */}
                        {!isAdmin && (
                          <button
                            onClick={() => handleNavigate('orders')}
                            className="flex items-center w-full px-4 py-2 text-sm
                                     text-gray-700 dark:text-gray-200 
                                     hover:bg-gray-50 dark:hover:bg-gray-700 
                                     transition-colors"
                          >
                            <Package className="h-4 w-4 mr-3 text-indigo-600 dark:text-indigo-400" />
                            {t('My Orders', 'ትዕዛዞቼ')}
                          </button>
                        )}

                        {/* Messages - Show for non-admin users only */}
                        {!isAdmin && (
                          <button
                            onClick={() => handleNavigate('my-messages')}
                            className="flex items-center w-full px-4 py-2 text-sm
                                     text-gray-700 dark:text-gray-200 
                                     hover:bg-gray-50 dark:hover:bg-gray-700 
                                     transition-colors"
                          >
                            <MessageSquare className="h-4 w-4 mr-3 text-indigo-600 dark:text-indigo-400" />
                            {t('My Messages', 'መልእክቶቼ')}
                          </button>
                        )}

                        {/* Notifications - Show for all users */}
                        <button
                          onClick={() => handleNavigate('notifications')}
                          className="flex items-center w-full px-4 py-2 text-sm
                                   text-gray-700 dark:text-gray-200 
                                   hover:bg-gray-50 dark:hover:bg-gray-700 
                                   transition-colors"
                        >
                          <Bell className="h-4 w-4 mr-3 text-indigo-600 dark:text-indigo-400" />
                          <span className="flex-1">{t('Notifications', 'ማሳወቂያዎች')}</span>
                        </button>

                        {/* Notification Settings - Show for all users */}
                        <button
                          onClick={() => handleNavigate('notification-settings')}
                          className="flex items-center w-full px-4 py-2 text-sm
                                   text-gray-700 dark:text-gray-200 
                                   hover:bg-gray-50 dark:hover:bg-gray-700 
                                   transition-colors"
                        >
                          <Settings className="h-4 w-4 mr-3 text-indigo-600 dark:text-indigo-400" />
                          {t('Settings', 'ቅንብሮች')}
                        </button>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

                      {/* Sign Out */}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm
                                 text-red-600 dark:text-red-400 
                                 hover:bg-red-50 dark:hover:bg-red-900/20 
                                 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        {t('Sign Out', 'ውጣ')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavigate('login')}
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 
                         dark:hover:bg-indigo-700 text-white px-5 py-2 
                         rounded-lg text-sm font-medium transition-all 
                         transform hover:scale-105 shadow-md hover:shadow-lg
                         focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                         dark:focus:ring-offset-gray-900"
              >
                {t('Sign In', 'ግባ')}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-200 
                     hover:bg-gray-100 dark:hover:bg-gray-800 
                     transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 
                      animate-slideDown">
          <div className="px-4 pt-2 pb-3 space-y-1">
            
            {/* Mobile Navigation - Only show admin items for admin users */}
            {isAdmin ? (
              // Admin Mobile Navigation
              <>
                <button
                  onClick={() => handleNavigate('admin')}
                  className={`flex items-center w-full text-left px-4 py-3 rounded-lg text-base font-medium
                    ${currentPage === 'admin' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <BarChart3 className="h-5 w-5 mr-3" />
                  {t('Dashboard', 'ዳሽቦርድ')}
                </button>
                <button
                  onClick={() => handleNavigate('admin-products')}
                  className={`flex items-center w-full text-left px-4 py-3 rounded-lg text-base font-medium
                    ${currentPage === 'admin-products' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <Package className="h-5 w-5 mr-3" />
                  {t('Products', 'ምርቶች')}
                </button>
                <button
                  onClick={() => handleNavigate('admin-orders')}
                  className={`flex items-center w-full text-left px-4 py-3 rounded-lg text-base font-medium
                    ${currentPage === 'admin-orders' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <ShoppingBag className="h-5 w-5 mr-3" />
                  {t('Orders', 'ትዕዛዞች')}
                </button>
                <button
                  onClick={() => handleNavigate('admin-customers')}
                  className={`flex items-center w-full text-left px-4 py-3 rounded-lg text-base font-medium
                    ${currentPage === 'admin-customers' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <Users className="h-5 w-5 mr-3" />
                  {t('Customers', 'ደንበኞች')}
                </button>
                <button
                  onClick={() => handleNavigate('admin-payments')}
                  className={`flex items-center w-full text-left px-4 py-3 rounded-lg text-base font-medium
                    ${currentPage === 'admin-payments' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <CreditCard className="h-5 w-5 mr-3" />
                  {t('Payments', 'ክፍያዎች')}
                </button>
                <button
                  onClick={() => handleNavigate('admin-contacts')}
                  className={`flex items-center w-full text-left px-4 py-3 rounded-lg text-base font-medium
                    ${currentPage === 'admin-contacts' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <MessageSquare className="h-5 w-5 mr-3" />
                  {t('Messages', 'መልእክቶች')}
                </button>
              </>
            ) : (
              // Regular User Mobile Navigation
              regularNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium
                    ${currentPage === item.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                    } transition-colors duration-200`}
                >
                  {item.label}
                </button>
              ))
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-3">
            
            {/* User Section */}
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-2 py-2">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-2 relative">
                    <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    {!user?.isEmailVerified && !isAdmin && (
                      <span className="absolute -top-1 -right-1 bg-yellow-500 rounded-full h-2 w-2 animate-pulse"></span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                
                {/* Email Verification Warning - Mobile - Only for non-admin users */}
                {!user?.isEmailVerified && !isAdmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNavigate('notification-settings');
                    }}
                    className="w-full text-xs text-yellow-600 dark:text-yellow-400 
                             bg-yellow-50 dark:bg-yellow-900/20 
                             px-4 py-2 rounded-lg flex items-center justify-center
                             transition-colors"
                  >
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                    {t('Verify your email', 'ኢሜይልዎን ያረጋግጡ')}
                  </button>
                )}
                
                <button
                  onClick={() => handleNavigate('profile')}
                  className="flex items-center w-full px-4 py-3 rounded-lg
                           text-gray-700 dark:text-gray-200 
                           hover:bg-gray-50 dark:hover:bg-gray-800
                           transition-colors duration-200"
                >
                  <User className="h-5 w-5 mr-3 text-indigo-600 dark:text-indigo-400" />
                  {t('My Profile', 'መገለጫዬ')}
                </button>

                {/* Admin Dashboard Link in Mobile Menu */}
                {isAdmin && (
                  <button
                    onClick={() => handleNavigate('admin')}
                    className="flex items-center w-full px-4 py-3 rounded-lg
                             text-gray-700 dark:text-gray-200 
                             hover:bg-gray-50 dark:hover:bg-gray-800
                             transition-colors duration-200"
                  >
                    <BarChart3 className="h-5 w-5 mr-3 text-indigo-600 dark:text-indigo-400" />
                    {t('Admin Dashboard', 'የአስተዳዳሪ ዳሽቦርድ')}
                  </button>
                )}

                {/* Orders - Only for non-admin users */}
                {!isAdmin && (
                  <button
                    onClick={() => handleNavigate('orders')}
                    className="flex items-center w-full px-4 py-3 rounded-lg
                             text-gray-700 dark:text-gray-200 
                             hover:bg-gray-50 dark:hover:bg-gray-800
                             transition-colors duration-200"
                  >
                    <Package className="h-5 w-5 mr-3 text-indigo-600 dark:text-indigo-400" />
                    {t('My Orders', 'ትዕዛዞቼ')}
                  </button>
                )}

                {/* Messages - Only for non-admin users */}
                {!isAdmin && (
                  <button
                    onClick={() => handleNavigate('my-messages')}
                    className="flex items-center w-full px-4 py-3 rounded-lg
                             text-gray-700 dark:text-gray-200 
                             hover:bg-gray-50 dark:hover:bg-gray-800
                             transition-colors duration-200"
                  >
                    <MessageSquare className="h-5 w-5 mr-3 text-indigo-600 dark:text-indigo-400" />
                    {t('My Messages', 'መልእክቶቼ')}
                  </button>
                )}

                <button
                  onClick={() => handleNavigate('notifications')}
                  className="flex items-center w-full px-4 py-3 rounded-lg
                           text-gray-700 dark:text-gray-200 
                           hover:bg-gray-50 dark:hover:bg-gray-800
                           transition-colors duration-200"
                >
                  <Bell className="h-5 w-5 mr-3 text-indigo-600 dark:text-indigo-400" />
                  {t('Notifications', 'ማሳወቂያዎች')}
                </button>

                <button
                  onClick={() => handleNavigate('notification-settings')}
                  className="flex items-center w-full px-4 py-3 rounded-lg
                           text-gray-700 dark:text-gray-200 
                           hover:bg-gray-50 dark:hover:bg-gray-800
                           transition-colors duration-200"
                >
                  <Settings className="h-5 w-5 mr-3 text-indigo-600 dark:text-indigo-400" />
                  {t('Settings', 'ቅንብሮች')}
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-3 rounded-lg
                           text-red-600 dark:text-red-400 
                           hover:bg-red-50 dark:hover:bg-red-900/20
                           transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  {t('Sign Out', 'ውጣ')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavigate('login')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 
                         dark:hover:bg-indigo-700 text-white px-4 py-3 
                         rounded-lg text-sm font-medium transition-all 
                         transform hover:scale-105 shadow-md"
              >
                {t('Sign In', 'ግባ')}
              </button>
            )}

            {/* Mobile Actions - Theme, Language, Cart - Cart only for non-admin users */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={toggleTheme}
                className="flex flex-col items-center justify-center p-3 rounded-lg
                         text-gray-700 dark:text-gray-200 
                         hover:bg-gray-50 dark:hover:bg-gray-800
                         transition-colors duration-200"
              >
                {theme === 'light' ? <Moon className="h-5 w-5 mb-1" /> : <Sun className="h-5 w-5 mb-1" />}
                <span className="text-xs">
                  {theme === 'light' ? t('Dark', 'ጨለማ') : t('Light', 'ብርሃን')}
                </span>
              </button>

              <button
                onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                className="flex flex-col items-center justify-center p-3 rounded-lg
                         text-gray-700 dark:text-gray-200 
                         hover:bg-gray-50 dark:hover:bg-gray-800
                         transition-colors duration-200"
              >
                <Globe className="h-5 w-5 mb-1" />
                <span className="text-xs">
                  {language === 'en' ? 'አማርኛ' : 'English'}
                </span>
              </button>

              {/* Cart - Only show for non-admin users */}
              {!isAdmin && (
                <button
                  onClick={() => handleNavigate('cart')}
                  className="flex flex-col items-center justify-center p-3 rounded-lg
                           text-gray-700 dark:text-gray-200 
                           hover:bg-gray-50 dark:hover:bg-gray-800
                           transition-colors duration-200 relative"
                >
                  <ShoppingCart className="h-5 w-5 mb-1" />
                  <span className="text-xs">{t('Cart', 'ጋሪ')}</span>
                  {totalItems > 0 && (
                    <span className="absolute top-1 right-6 bg-indigo-600 dark:bg-indigo-500 
                                   text-white text-xs font-bold rounded-full 
                                   h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
