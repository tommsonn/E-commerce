import { useEffect, useState } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface Category {
  id: string;
  name: string;
  name_am: string | null;
  slug: string;
  image_url: string | null;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  name_am: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  slug: string;
}

interface HomeProps {
  onNavigate: (page: string, data?: any) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesResult, productsResult] = await Promise.all([
        supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true }),
        supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .eq('is_active', true)
          .limit(8),
      ]);

      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (productsResult.data) setFeaturedProducts(productsResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  const getProductName = (product: Product) => {
    return language === 'am' && product.name_am ? product.name_am : product.name;
  };

  const getCategoryName = (category: Category) => {
    return language === 'am' && category.name_am ? category.name_am : category.name;
  };

  const calculateDiscount = (price: number, comparePrice: number | null) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {t(
                'Discover Quality Products Delivered to Your Door',
                'ወደ በሮዎ የሚደርሱ የጥራት ምርቶችን ያግኙ'
              )}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-green-50">
              {t(
                'Shop from thousands of products with fast delivery across Ethiopia',
                'በኢትዮጵያ ውስጥ በፈጣን ማድረስ ከሺዎች ምርቶች ይግዙ'
              )}
            </p>
            <button
              onClick={() => onNavigate('shop')}
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <span>{t('Shop Now', 'አሁን ግዙ')}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          {t('Shop by Category', 'በምድብ ይግዙ')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onNavigate('shop', { category: category.slug })}
              className="group relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="aspect-square">
                <img
                  src={category.image_url || 'https://via.placeholder.com/300'}
                  alt={getCategoryName(category)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                <p className="text-white font-semibold p-4 w-full text-center">
                  {getCategoryName(category)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {t('Featured Products', 'ተለይተው የቀረቡ ምርቶች')}
          </h2>
          <button
            onClick={() => onNavigate('shop')}
            className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
          >
            <span>{t('View All', 'ሁሉንም ይመልከቱ')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => {
            const discount = calculateDiscount(product.price, product.compare_at_price);
            return (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.images[0] || 'https://via.placeholder.com/400'}
                    alt={getProductName(product)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                    onClick={() => onNavigate('product', { slug: product.slug })}
                  />
                  {discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
                      -{discount}%
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3
                    className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-green-600 transition-colors line-clamp-2"
                    onClick={() => onNavigate('product', { slug: product.slug })}
                  >
                    {getProductName(product)}
                  </h3>
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">(4.8)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {product.price.toLocaleString()} {t('ETB', 'ብር')}
                      </p>
                      {product.compare_at_price && (
                        <p className="text-sm text-gray-500 line-through">
                          {product.compare_at_price.toLocaleString()} {t('ETB', 'ብር')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      {t('Add', 'ጨምር')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <p className="text-green-100">{t('Products Available', 'ያሉ ምርቶች')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <p className="text-green-100">{t('Happy Customers', 'ደስተኛ ደንበኞች')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99%</div>
              <p className="text-green-100">{t('Satisfaction Rate', 'የእርካታ መጠን')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {t('Why Choose EthioShop?', 'ለምን ኢትዮሾፕን መምረጥ?')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t('Guaranteed Quality', 'የተረጋገጠ ጥራት')}
            </h3>
            <p className="text-gray-600">
              {t(
                'All products are verified for authenticity and quality',
                'ሁሉም ምርቶች ለትክክለኛነት እና ጥራት ተረጋግጠዋል'
              )}
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t('Fast Delivery', 'ፈጣን ማድረስ')}
            </h3>
            <p className="text-gray-600">
              {t(
                'Quick and reliable delivery across all major Ethiopian cities',
                'በሁሉም ዋና ዋና የኢትዮጵያ ከተሞች ፈጣን እና አስተማማኝ ማድረስ'
              )}
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t('Secure Payment', 'ደህንነቱ የተጠበቀ ክፍያ')}
            </h3>
            <p className="text-gray-600">
              {t(
                'Multiple payment options including Telebirr and cash on delivery',
                'ቴሌብር እና በአደራ ላይ ጥሬ ገንዘብን ጨምሮ በርካታ የክፍያ አማራጮች'
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
