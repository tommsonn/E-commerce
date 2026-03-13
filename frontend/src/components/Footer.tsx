import { Facebook, Instagram, Twitter, Phone, Mail, MapPin, Send, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 dark:from-gray-950 dark:to-black text-gray-300 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-500/10 p-2 rounded-lg">
                <Send className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-white text-xl font-bold">
                {t('EthioShop', 'ኢትዮሾፕ')}
              </h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t(
                'Your trusted online marketplace for quality products across Ethiopia.',
                'በኢትዮጵያ ውስጥ ለጥራት ምርቶች የሚታመን የመስመር ላይ ገበያዎ።'
              )}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Heart className="h-4 w-4 text-green-400" />
              <span>{t('100% Secure Shopping', '100% አስተማማኝ ግዢ')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 relative inline-block">
              {t('Quick Links', 'ፈጣን አገናኞች')}
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-green-500 rounded-full"></span>
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { id: 'home', label: t('Home', 'ቤት') },
                { id: 'shop', label: t('Shop', 'መደብር') },
                { id: 'about', label: t('About Us', 'ስለ እኛ') },
                { id: 'contact', label: t('Contact', 'አግኙን') },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-200 
                             flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4 relative inline-block">
              {t('Customer Service', 'የደንበኛ አገልግሎት')}
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-green-500 rounded-full"></span>
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: t('FAQ', 'ተደጋጋሚ ጥያቄዎች'), href: '#' },
                { label: t('Shipping Info', 'የማድረስ መረጃ'), href: '#' },
                { label: t('Returns', 'መመለሻ'), href: '#' },
                { label: t('Privacy Policy', 'የግላዊነት ፖሊሲ'), href: '#' },
                { label: t('Terms of Service', 'የአገልግሎት ውል'), href: '#' },
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-200 
                             flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 relative inline-block">
              {t('Contact Us', 'አግኙን')}
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-green-500 rounded-full"></span>
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start group">
                <div className="bg-gray-800 group-hover:bg-green-500/20 p-2 rounded-lg transition-colors duration-200 mr-3">
                  <MapPin className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {t('Addis Ababa, Ethiopia', 'አዲስ አበባ፣ ኢትዮጵያ')}
                </span>
              </li>
              <li className="flex items-start group">
                <div className="bg-gray-800 group-hover:bg-green-500/20 p-2 rounded-lg transition-colors duration-200 mr-3">
                  <Phone className="h-4 w-4 text-green-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 group-hover:text-gray-300">+251 94 128 7842</span>
                  <span className="text-gray-400 group-hover:text-gray-300">+251 90 234 7832</span>
                </div>
              </li>
              <li className="flex items-start group">
                <div className="bg-gray-800 group-hover:bg-green-500/20 p-2 rounded-lg transition-colors duration-200 mr-3">
                  <Mail className="h-4 w-4 text-green-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 group-hover:text-gray-300">info@ethioshop.com</span>
                  <span className="text-gray-400 group-hover:text-gray-300">support@ethioshop.com</span>
                </div>
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-6">
              <h5 className="text-white text-sm font-medium mb-3">
                {t('Follow Us', 'ይከተሉን')}
              </h5>
              <div className="flex space-x-3">
                <a
                  href="#"
                  className="bg-gray-800 hover:bg-green-600 text-gray-400 hover:text-white 
                           p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="bg-gray-800 hover:bg-green-600 text-gray-400 hover:text-white 
                           p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="bg-gray-800 hover:bg-green-600 text-gray-400 hover:text-white 
                           p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h5 className="text-white font-medium mb-1">
                {t('Subscribe to our newsletter', 'ለዜና መጽሔታችን ይመዝገቡ')}
              </h5>
              <p className="text-sm text-gray-400">
                {t('Get updates on new products and special offers', 'ስለ አዳዲስ ምርቶች እና ልዩ ቅናሾች መረጃ ያግኙ')}
              </p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder={t('Your email', 'ኢሜይልዎ')}
                className="flex-1 md:w-64 px-4 py-2 bg-gray-800 border border-gray-700 
                         rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 
                         focus:border-transparent text-white placeholder-gray-500"
              />
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 
                         rounded-r-lg font-medium transition-all duration-200 
                         transform hover:scale-105 focus:ring-2 focus:ring-green-500 
                         focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {t('Subscribe', 'መዝገብ')}
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {t('EthioShop. All rights reserved.', 'ኢትዮሾፕ። ሁሉም መብቶች የተጠበቁ ናቸው።')}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('Designed with ♥ in Ethiopia', 'በኢትዮጵያ በፍቅር የተሰራ')}
          </p>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 
                 text-white p-3 rounded-full shadow-lg transition-all 
                 duration-200 transform hover:scale-110 focus:ring-2 
                 focus:ring-green-500 focus:ring-offset-2 
                 dark:focus:ring-offset-gray-900 z-50"
        aria-label="Back to top"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </footer>
  );
}
