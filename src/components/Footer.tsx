import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">
              {t('EthioShop', 'ኢትዮሾፕ')}
            </h3>
            <p className="text-sm">
              {t(
                'Your trusted online marketplace for quality products across Ethiopia.',
                'በኢትዮጵያ ውስጥ ለጥራት ምርቶች የሚታመን የመስመር ላይ ገበያዎ።'
              )}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('Quick Links', 'ፈጣን አገናኞች')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-green-400 transition-colors"
                >
                  {t('Home', 'ቤት')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-green-400 transition-colors"
                >
                  {t('Shop', 'መደብር')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-green-400 transition-colors"
                >
                  {t('About Us', 'ስለ እኛ')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-green-400 transition-colors"
                >
                  {t('Contact', 'አግኙን')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('Customer Service', 'የደንበኛ አገልግሎት')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-green-400 transition-colors">
                  {t('FAQ', 'ተደጋጋሚ ጥያቄዎች')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition-colors">
                  {t('Shipping Info', 'የማድረስ መረጃ')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition-colors">
                  {t('Returns', 'መመለሻ')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition-colors">
                  {t('Privacy Policy', 'የግላዊነት ፖሊሲ')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('Contact Us', 'አግኙን')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-green-400" />
                <span>{t('Addis Ababa, Ethiopia', 'አዲስ አበባ፣ ኢትዮጵያ')}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0 text-green-400" />
                <span>+251 94 128 7843</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0 text-green-400" />
                <span>thomastes@gmail.com</span>
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a
                href="#"
                className="text-gray-400 hover:text-green-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-green-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-green-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} {t('EthioShop. All rights reserved.', 'ኢትዮሾፕ። ሁሉም መብቶች የተጠበቁ ናቸው።')}
          </p>
        </div>
      </div>
    </footer>
  );
}
