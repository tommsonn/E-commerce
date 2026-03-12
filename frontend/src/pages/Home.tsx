import { useEffect, useState } from 'react';
import { ArrowRight, Star, Shield, Truck, CreditCard, Award, TrendingUp, Users, Package } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { productService, Product, Category } from '../services/productService';
import { getImageUrl, getCategoryImageUrl, isCloudinaryImage } from '../utils/imageUtils';

interface HomeProps {
  onNavigate: (page: string, data?: any) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { theme } = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching home page data...');
      
      const [categoriesData, productsData] = await Promise.all([
        productService.getCategories(),
        productService.getFeaturedProducts()
      ]);

      console.log('✅ Categories received:', categoriesData?.length || 0);
      console.log('✅ Featured products received:', productsData?.length || 0);
      
      if (categoriesData && categoriesData.length > 0) {
        console.log('📦 Category images:');
        categoriesData.forEach(cat => {
          console.log(`  - ${cat.name}:`, {
            imageUrl: cat.imageUrl,
            isCloudinary: isCloudinaryImage(cat.imageUrl),
            fullUrl: getImageUrl(cat.imageUrl)
          });
        });
      }
      
      if (productsData && productsData.length > 0) {
        console.log('📦 First product details:', {
          name: productsData[0].name,
          isFeatured: productsData[0].isFeatured,
          isActive: productsData[0].isActive,
          hasImages: productsData[0].images?.length > 0,
          imageUrl: productsData[0].images?.[0]
        });
      } else {
        console.log('⚠️ No featured products found. Trying to fetch regular products...');
        
        try {
          const regularProducts = await productService.getProducts({ limit: 8 });
          if (regularProducts.products && regularProducts.products.length > 0) {
            console.log('✅ Using regular products as fallback:', regularProducts.products.length);
            setFeaturedProducts(regularProducts.products);
          } else {
            setError('No products available');
          }
        } catch (fallbackError) {
          console.error('❌ Fallback fetch failed:', fallbackError);
          setError('Failed to load products');
        }
      }
      
      setCategories(categoriesData || []);
      
      if (productsData && productsData.length > 0) {
        setFeaturedProducts(productsData);
      }
      
    } catch (error) {
      console.error('❌ Error fetching home page data:', error);
      setError('Failed to load content. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(productId, 1);
      alert(t('Product added to cart!', 'ምርት ወደ ጋሪ ታክሏል!'));
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart');
    }
  };

  const handleProductClick = (slug: string) => {
    console.log('Navigating to product:', slug);
    onNavigate('product', { slug });
  };

  const getProductName = (product: Product) => {
    return language === 'am' && product.nameAm ? product.nameAm : product.name;
  };

  const getCategoryName = (category: Category) => {
    return language === 'am' && category.nameAm ? category.nameAm : category.name;
  };

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 sm:h-8 sm:w-8 bg-indigo-600 dark:bg-indigo-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-5xl sm:text-6xl mb-4">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('Something went wrong', 'የሆነ ስህተት ተከስቷል')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl 
                     transition-all duration-300 transform hover:scale-105"
          >
            {t('Refresh Page', 'ገጹን አድስ')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-500 overflow-x-hidden">
      
      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-white overflow-hidden">
        {/* Background blur circles - hidden on mobile for performance */}
        <div className="hidden sm:block absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            {/* Premium Badge */}
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm text-indigo-100 text-xs sm:text-sm font-medium mb-6 sm:mb-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-indigo-300" />
              <span className="relative">
                {t('Ethiopia\'s Premier Marketplace', 'የኢትዮጵያ ቀዳሚ የገበያ ቦታ')}
                <span className="absolute -top-1 -right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-blue-200">
                {t(
                  'Discover Quality Products Delivered to Your Door',
                  'ወደ በሮዎ የሚደርሱ የጥራት ምርቶችን ያግኙ'
                )}
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 text-indigo-100 dark:text-indigo-200 opacity-90 leading-relaxed max-w-2xl">
              {t(
                'Shop from thousands of products with fast delivery across Ethiopia',
                'በኢትዮጵያ ውስጥ በፈጣን ማድረስ ከሺዎች ምርቶች ይግዙ'
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => onNavigate('shop')}
                className="w-full sm:w-auto group bg-white text-indigo-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base 
                         hover:bg-indigo-50 dark:bg-gray-900 dark:text-indigo-400 
                         dark:hover:bg-gray-800 dark:hover:text-indigo-300
                         transition-all duration-500 transform hover:scale-105 hover:shadow-2xl
                         flex items-center justify-center space-x-3
                         focus:ring-4 focus:ring-indigo-500/50 focus:ring-offset-2 
                         dark:focus:ring-offset-gray-900 relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                <span className="relative">{t('Shop Now', 'አሁን ግዙ')}</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 relative group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => onNavigate('about')}
                className="w-full sm:w-auto group bg-transparent border-2 border-white/30 text-white px-6 sm:px-8 py-3 sm:py-4 
                         rounded-xl font-semibold text-sm sm:text-base hover:bg-white/10 hover:border-white/50 
                         transition-all duration-500 flex items-center justify-center space-x-3
                         backdrop-blur-sm hover:backdrop-blur-md relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                <span className="relative">{t('Learn More', 'ተጨማሪ ይወቁ')}</span>
              </button>
            </div>

            {/* Trust indicators - hidden on very small screens */}
            <div className="hidden sm:flex items-center space-x-4 md:space-x-6 mt-8 sm:mt-10 md:mt-12 text-indigo-200">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">{t('Free Delivery', 'ነጻ ማድረስ')}</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">{t('Secure Payment', 'አስተማማኝ ክፍያ')}</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">{t('Quality Guaranteed', 'የተረጋገጠ ጥራት')}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 md:h-32 bg-gradient-to-t from-slate-50 via-slate-50/50 to-transparent dark:from-slate-950 dark:via-slate-950/50"></div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            {t('Shop by Category', 'በምድብ ይግዙ')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
            {t('Browse Our Collections', 'ስብስቦቻችንን ያስሱ')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            {t('Discover products tailored to your needs', 'ለፍላጎትዎ የተበጁ ምርቶችን ያግኙ')}
          </p>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 mx-auto mt-4 sm:mt-6 rounded-full"></div>
        </div>
        
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              {t('No categories available', 'ምንም ምድቦች የሉም')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {categories.map((category, index) => {
              const imageUrl = getCategoryImageUrl(category);
              return (
                <button
                  key={category._id}
                  onClick={() => onNavigate('shop', { category: category.slug })}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 
                           shadow-md hover:shadow-xl transition-all duration-500 
                           transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-105 
                           border border-gray-100 dark:border-gray-700
                           animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-square">
                    <img
                      src={imageUrl}
                      alt={getCategoryName(category)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onLoad={() => console.log(`✅ Category image loaded: ${category.name}`)}
                      onError={(e) => {
                        console.error('❌ Category image failed:', {
                          category: category.name,
                          originalUrl: category.imageUrl,
                          attemptedUrl: imageUrl
                        });
                        e.currentTarget.src = 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400';
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end">
                    <p className="text-white font-semibold p-2 sm:p-3 md:p-4 w-full text-center text-xs sm:text-sm md:text-base
                              transform group-hover:scale-105 group-hover:translate-y-[-4px] transition-all duration-300">
                      {getCategoryName(category)}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 transition-colors duration-500"></div>
                </button>
              );
            })}
          </div>
        )}
      </section>

{/* ===== FEATURED PRODUCTS SECTION ===== */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-12 md:mb-16">
    <div className="text-center sm:text-left mb-4 sm:mb-0">
      <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
        {t('Featured Products', 'ተለይተው የቀረቡ ምርቶች')}
      </span>
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4 tracking-tight">
        {t('Hand-Picked Just for You', 'ለእርስዎ ብቻ የተመረጡ')}
      </h2>
      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
        {t('Curated selection of our finest products', 'ከምርጥ ምርቶቻችን የተመረጡ')}
      </p>
    </div>
    
    <button
      onClick={() => onNavigate('shop')}
      className="group w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 
               bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm sm:text-base font-medium 
               hover:bg-indigo-100 dark:hover:bg-indigo-900/50 
               transition-all duration-300 transform hover:scale-105
               border border-indigo-200 dark:border-indigo-800"
    >
      <span>{t('View All Products', 'ሁሉንም ምርቶች ይመልከቱ')}</span>
      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-transform" />
    </button>
  </div>

  {featuredProducts.length === 0 ? (
    <div className="text-center py-10 sm:py-16 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md px-4">
      <div className="text-5xl sm:text-6xl mb-4">🛍️</div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {t('No featured products yet', 'ገና ተለይተው የቀረቡ ምርቶች የሉም')}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
        {t('Check back soon for our latest products', 'ለአዳዲስ ምርቶቻችን በቅርቡ ይመልከቱ')}
      </p>
      <button
        onClick={() => onNavigate('shop')}
        className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm sm:text-base 
                 transition-all duration-300 transform hover:scale-105"
      >
        {t('Browse All Products', 'ሁሉንም ምርቶች ይመልከቱ')}
      </button>
    </div>
  ) : (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
      {featuredProducts.map((product, index) => {
        const discount = calculateDiscount(product.price, product.compareAtPrice);
        
        return (
          <div
            key={product._id}
            className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm sm:shadow-md 
                     hover:shadow-lg transition-all duration-500 
                     hover:-translate-y-1 hover:scale-[1.02] cursor-pointer
                     overflow-hidden border border-gray-100 dark:border-gray-700
                     animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleProductClick(product.slug)}
          >
            <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={getImageUrl(product.images?.[0])}
                alt={getProductName(product)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onLoad={() => console.log(`✅ Product image loaded: ${product.name}`)}
                onError={(e) => {
                  console.error('❌ Product image failed:', {
                    product: product.name,
                    originalImage: product.images?.[0],
                    attemptedUrl: getImageUrl(product.images?.[0])
                  });
                  e.currentTarget.src = 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
              {discount > 0 && (
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-gradient-to-r from-amber-500 to-orange-500 
                              text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs font-bold
                              shadow-md transform group-hover:scale-110 transition-all duration-300 z-10">
                  -{discount}%
                </div>
              )}
              
              <button
                onClick={(e) => handleAddToCart(product._id, e)}
                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-indigo-600 text-white p-1 sm:p-2 
                         rounded-full opacity-0 group-hover:opacity-100 
                         transform translate-y-1 group-hover:translate-y-0 
                         transition-all duration-300 hover:bg-indigo-700
                         shadow-sm hover:shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
            
            <div className="p-2 sm:p-3">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1 
                           line-clamp-2 text-xs sm:text-sm hover:text-indigo-600 
                           dark:hover:text-indigo-400 transition-colors">
                {getProductName(product)}
              </h3>
              
              <div className="flex items-center mb-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-2 w-2 sm:h-3 sm:w-3 text-amber-400 fill-current"
                    />
                  ))}
                </div>
                <span className="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 ml-1">
                  4.8
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                    {product.price.toLocaleString()} 
                    <span className="text-2xs sm:text-xs font-normal text-gray-500 dark:text-gray-400 ml-0.5">
                      {t('ETB', 'ብር')}
                    </span>
                  </p>
                  {product.compareAtPrice && (
                    <p className="text-2xs sm:text-xs text-gray-400 dark:text-gray-500 line-through">
                      {product.compareAtPrice.toLocaleString()} {t('ETB', 'ብር')}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={(e) => handleAddToCart(product._id, e)}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 
                           dark:hover:bg-indigo-700 text-white p-1 sm:p-1.5 
                           rounded-full transition-all transform 
                           hover:scale-110 hover:shadow-sm"
                  aria-label={t('Add to cart', 'ወደ ጋሪ ጨምር')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )}
</section>

      {/* ===== STATS SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-6 sm:p-8 md:p-10 lg:p-12 
                      border border-gray-100 dark:border-gray-700
                      transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-500">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            <div className="text-center group">
              <div className="relative inline-block">
                <Package className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-indigo-600 dark:text-indigo-400 mb-2 sm:mb-3 md:mb-4 
                                  group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-1 sm:mb-2 md:mb-3 
                            group-hover:scale-110 transition-transform duration-300">
                10,000+
              </div>
              <div className="text-sm sm:text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                {t('Products Available', 'ያሉ ምርቶች')}
              </div>
              <div className="h-1 w-12 sm:w-14 md:w-16 bg-indigo-200 dark:bg-indigo-800 mx-auto rounded-full 
                            group-hover:w-16 sm:group-hover:w-20 md:group-hover:w-24 transition-all duration-500" />
            </div>
            
            <div className="text-center group">
              <div className="relative inline-block">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-indigo-600 dark:text-indigo-400 mb-2 sm:mb-3 md:mb-4 
                                group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-1 sm:mb-2 md:mb-3 
                            group-hover:scale-110 transition-transform duration-300">
                50,000+
              </div>
              <div className="text-sm sm:text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                {t('Happy Customers', 'ደስተኛ ደንበኞች')}
              </div>
              <div className="h-1 w-12 sm:w-14 md:w-16 bg-indigo-200 dark:bg-indigo-800 mx-auto rounded-full 
                            group-hover:w-16 sm:group-hover:w-20 md:group-hover:w-24 transition-all duration-500" />
            </div>
            
            <div className="text-center group sm:col-span-2 md:col-span-1">
              <div className="relative inline-block">
                <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-indigo-600 dark:text-indigo-400 mb-2 sm:mb-3 md:mb-4 
                                     group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-1 sm:mb-2 md:mb-3 
                            group-hover:scale-110 transition-transform duration-300">
                99%
              </div>
              <div className="text-sm sm:text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                {t('Satisfaction Rate', 'የእርካታ መጠን')}
              </div>
              <div className="h-1 w-12 sm:w-14 md:w-16 bg-indigo-200 dark:bg-indigo-800 mx-auto rounded-full 
                            group-hover:w-16 sm:group-hover:w-20 md:group-hover:w-24 transition-all duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            {t('Why Choose Us', 'ለምን እኛን ይምረጡ')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
            {t('The TomShop Advantage', 'የቶምሾፕ ጥቅም')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            {t('Experience the best online shopping in Ethiopia', 'በኢትዮጵያ ምርጥ የመስመር ላይ ግብይት ልምድ ያግኙ')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Card 1 */}
          <div className="group bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-md 
                        hover:shadow-xl transition-all duration-500 
                        transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-105
                        border border-gray-100 dark:border-gray-700
                        relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-indigo-600/0 
                          group-hover:from-indigo-600/5 group-hover:to-indigo-600/0 
                          transition-all duration-500"></div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 
                            dark:from-indigo-900/30 dark:to-indigo-800/30 
                            w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center 
                            mx-auto mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 
                            transition-all duration-500
                            group-hover:shadow-md sm:group-hover:shadow-lg">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-900 dark:text-white 
                           group-hover:text-indigo-600 dark:group-hover:text-indigo-400 
                           transition-colors">
                {t('Guaranteed Quality', 'የተረጋገጠ ጥራት')}
              </h3>
              
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-5 md:mb-6">
                {t(
                  'All products are verified for authenticity and quality before reaching you',
                  'ሁሉም ምርቶች ወደ እርስዎ ከመድረሳቸው በፊት ለትክክለኛነት እና ጥራት ተረጋግጠዋል'
                )}
              </p>
              
              <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium">
                <span>{t('Learn more', 'ተጨማሪ ይወቁ')}</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-md 
                        hover:shadow-xl transition-all duration-500 
                        transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-105
                        border border-gray-100 dark:border-gray-700
                        relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-indigo-600/0 
                          group-hover:from-indigo-600/5 group-hover:to-indigo-600/0 
                          transition-all duration-500"></div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 
                            dark:from-indigo-900/30 dark:to-indigo-800/30 
                            w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center 
                            mx-auto mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 group-hover:-rotate-3 
                            transition-all duration-500
                            group-hover:shadow-md sm:group-hover:shadow-lg">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-900 dark:text-white 
                           group-hover:text-indigo-600 dark:group-hover:text-indigo-400 
                           transition-colors">
                {t('Fast Delivery', 'ፈጣን ማድረስ')}
              </h3>
              
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-5 md:mb-6">
                {t(
                  'Quick and reliable delivery across all major Ethiopian cities',
                  'በሁሉም ዋና ዋና የኢትዮጵያ ከተሞች ፈጣን እና አስተማማኝ ማድረስ'
                )}
              </p>
              
              <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium">
                <span>{t('Learn more', 'ተጨማሪ ይወቁ')}</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-md 
                        hover:shadow-xl transition-all duration-500 
                        transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-105
                        border border-gray-100 dark:border-gray-700
                        relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-indigo-600/0 
                          group-hover:from-indigo-600/5 group-hover:to-indigo-600/0 
                          transition-all duration-500"></div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 
                            dark:from-indigo-900/30 dark:to-indigo-800/30 
                            w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center 
                            mx-auto mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 
                            transition-all duration-500
                            group-hover:shadow-md sm:group-hover:shadow-lg">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-900 dark:text-white 
                           group-hover:text-indigo-600 dark:group-hover:text-indigo-400 
                           transition-colors">
                {t('Secure Payment', 'ደህንነቱ የተጠበቀ ክፍያ')}
              </h3>
              
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-5 md:mb-6">
                {t(
                  'Multiple payment options including Telebirr and cash on delivery',
                  'ቴሌብር እና በአደራ ላይ ጥሬ ገንዘብን ጨምሮ በርካታ የክፍያ አማራጮች'
                )}
              </p>
              
              <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium">
                <span>{t('Learn more', 'ተጨማሪ ይወቁ')}</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
