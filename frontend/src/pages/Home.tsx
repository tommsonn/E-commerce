import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Star, Shield, Truck, CreditCard, Award, TrendingUp, Users, Package, ChevronLeft, ChevronRight, Pause, Play, ShoppingBag, Heart } from 'lucide-react';
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
  
  // Slideshow states
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Category scroll states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const categoryContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Slideshow images
  const slides = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/2988232/pexels-photo-2988232.jpeg?auto=compress&cs=tinysrgb&w=1920',
      caption: {
        en: '',
        am: ''
      }
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1920',
      caption: {
        en: 'Fast Delivery Across Ethiopia',
        am: 'በኢትዮጵያ ውስጥ ፈጣን ማድረስ'
      }
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/34577/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1920',
      caption: {
        en: 'Secure Payment Options',
        am: 'አስተማማኝ የክፍያ አማራጮች'
      }
    },
    {
      id: 4,
      image: 'https://t4.ftcdn.net/jpg/18/56/56/77/240_F_1856567775_V7UNhjQaaZ2aCVf1zg4O6hCqLXi3Kfdl.jpg',
      caption: {
        en: '24/7 Customer Support',
        am: '24/7 የደንበኛ ድጋፍ'
      }
    }
  ];

  // Auto-play slideshow
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, slides.length]);

  // Continuous infinite scroll for categories
  useEffect(() => {
    const container = categoryContainerRef.current;
    if (!container || categories.length === 0) return;

    const scroll = () => {
      if (!isPaused && container) {
        container.scrollLeft += 1;
        if (container.scrollLeft >= (container.scrollWidth / 2)) {
          container.scrollLeft = 0;
        }
      }
      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [categories.length, isPaused]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }
    if (touchStart - touchEnd < -100) {
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 10000);
  };

  // Category drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!categoryContainerRef.current) return;
    setIsDragging(true);
    setIsPaused(true);
    setStartX(e.pageX - categoryContainerRef.current.offsetLeft);
    setScrollLeft(categoryContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !categoryContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - categoryContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    categoryContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

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
        setFeaturedProducts(productsData);
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
      
      {/* ===== PROFESSIONAL HERO SLIDESHOW ===== */}
<section 
  className="relative h-[500px] sm:h-[600px] md:h-[700px] overflow-hidden bg-gray-900"
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
  {/* Slides */}
  <div className="relative w-full h-full">
    {slides.map((slide, index) => (
      <div
        key={slide.id}
        className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
          index === currentSlide
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-105'
        }`}
        style={{
          backgroundImage: `url(${slide.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradient overlay - doesn't block clicks */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 pointer-events-none"></div>
        
        {/* Buttons on ALL slides - positioned at bottom center */}
        <div className="absolute bottom-20 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Shop Now clicked from slide', index + 1);
                onNavigate('shop');
              }}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{t('Shop Now', 'አሁን ግዙ')}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Learn More clicked from slide', index + 1);
                onNavigate('about');
              }}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-base transition-all duration-300 border border-white/30 cursor-pointer"
            >
              {t('Learn More', 'ተጨማሪ ይወቁ')}
            </button>
          </div>
        </div>

        {/* Slide caption - if you want to keep it */}
        {slide.caption.en && (
          <div className="absolute top-32 left-4 sm:left-8 md:left-16 text-white z-30 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
              {language === 'am' ? slide.caption.am : slide.caption.en}
            </h2>
            <div className="w-20 h-1 bg-indigo-500 rounded-full mx-auto sm:mx-0"></div>
          </div>
        )}
      </div>
    ))}
  </div>

  {/* Main Content Overlay - Only shown on first slide - FIXED to not block buttons */}
  {currentSlide === 0 && (
    <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl pointer-events-none">
          {/* Premium badge */}
          <div className="transform transition-all duration-700 delay-300 translate-y-0 opacity-100 pointer-events-none">
            <div className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full mb-6 shadow-lg pointer-events-none">
              {t('Ethiopia\'s Premier Marketplace', 'የኢትዮጵያ ቀዳሚ የገበያ ቦታ')}
            </div>
          </div>
          
          {/* Main heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight pointer-events-none">
            {t(
              'Discover Quality Products Delivered to Your Door',
              'ወደ በሮዎ የሚደርሱ የጥራት ምርቶችን ያግኙ'
            )}
          </h1>
          
          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 max-w-2xl pointer-events-none">
            {t(
              'Shop from thousands of products with fast delivery across Ethiopia',
              'በኢትዮጵያ ውስጥ በፈጣን ማድረስ ከሺዎች ምርቶች ይግዙ'
            )}
          </p>
        
          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-6 mt-12 pointer-events-none">
            <div className="flex items-center gap-2 text-gray-200 pointer-events-none">
              <Truck className="h-5 w-5 text-indigo-400 pointer-events-none" />
              <span className="text-sm pointer-events-none">{t('Free Delivery', 'ነጻ ማድረስ')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-200 pointer-events-none">
              <Shield className="h-5 w-5 text-indigo-400 pointer-events-none" />
              <span className="text-sm pointer-events-none">{t('Secure Payment', 'አስተማማኝ ክፍያ')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-200 pointer-events-none">
              <Award className="h-5 w-5 text-indigo-400 pointer-events-none" />
              <span className="text-sm pointer-events-none">{t('Quality Guaranteed', 'የተረጋገጠ ጥራት')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Navigation Arrows */}
  <button
    onClick={prevSlide}
    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 cursor-pointer"
    aria-label="Previous slide"
  >
    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
  </button>
  
  <button
    onClick={nextSlide}
    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 cursor-pointer"
    aria-label="Next slide"
  >
    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
  </button>

  {/* Slide Indicators */}
  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-3">
    {slides.map((_, index) => (
      <button
        key={index}
        onClick={() => goToSlide(index)}
        className={`group relative h-1.5 rounded-full transition-all duration-500 ${
          index === currentSlide ? 'w-10 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
        } cursor-pointer`}
        aria-label={`Go to slide ${index + 1}`}
      >
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs px-2 py-1 rounded transition-opacity whitespace-nowrap">
          {index + 1}
        </span>
      </button>
    ))}
    
    {/* Play/Pause Button */}
    <button
      onClick={() => setIsPlaying(!isPlaying)}
      className="ml-4 w-8 h-8 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 cursor-pointer"
      aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
    >
      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
    </button>
  </div>

  {/* Progress Bar */}
  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20 pointer-events-none">
    <div 
      className="h-full bg-indigo-500 transition-all duration-500 ease-linear"
      style={{ 
        width: isPlaying ? `${((currentSlide + 1) / slides.length) * 100}%` : '0%'
      }}
    />
  </div>
</section>

      {/* ===== CATEGORIES SECTION WITH CONTINUOUS INFINITE SCROLL ===== */}
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
          <div className="relative">
            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-950 z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-950 z-10 pointer-events-none"></div>
            
            {/* Navigation Buttons */}
            <button 
              onClick={() => {
                if (categoryContainerRef.current) {
                  categoryContainerRef.current.scrollLeft -= 300;
                }
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 transform hover:scale-110"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button 
              onClick={() => {
                if (categoryContainerRef.current) {
                  categoryContainerRef.current.scrollLeft += 300;
                }
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 transform hover:scale-110"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            
            {/* Scroll Container with Continuous Animation */}
            <div 
              ref={categoryContainerRef}
              className="overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
              }}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
            >
              <div className="flex space-x-4" style={{ width: 'max-content' }}>
                {/* Duplicate categories twice for seamless loop */}
                {[...categories, ...categories].map((category, index) => {
                  const imageUrl = getCategoryImageUrl(category);
                  return (
                    <button
                      key={`${category._id}-${index}`}
                      onClick={() => onNavigate('shop', { category: category.slug })}
                      className="w-40 sm:w-48 md:w-56 flex-none group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 
                               shadow-md hover:shadow-xl transition-all duration-500 
                               transform hover:-translate-y-1 hover:scale-105 
                               border border-gray-100 dark:border-gray-700"
                    >
                      <div className="aspect-square">
                        <img
                          src={imageUrl}
                          alt={getCategoryName(category)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
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
            </div>
          </div>
        )}
      </section>

      {/* ===== PROFESSIONAL FEATURED PRODUCTS SECTION ===== */}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {featuredProducts.map((product, index) => {
              const discount = calculateDiscount(product.price, product.compareAtPrice);
              
              return (
                <div
                  key={product._id}
                  className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 
                           hover:-translate-y-1.5 cursor-pointer overflow-hidden border border-gray-100 dark:border-gray-700
                           animate-fadeIn relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleProductClick(product.slug)}
                >
                  {/* Image Container with Badge */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={getImageUrl(product.images?.[0])}
                      alt={getProductName(product)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400';
                      }}
                    />
                    
                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 
                                    text-white px-2.5 py-1 rounded-lg text-xs font-bold
                                    shadow-lg transform group-hover:scale-110 transition-all duration-300 z-10">
                        -{discount}%
                      </div>
                    )}
                    
                    {/* Quick Add Button - Appears on hover */}
                    <button
                      onClick={(e) => handleAddToCart(product._id, e)}
                      className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 
                               rounded-xl opacity-0 group-hover:opacity-100 
                               transform translate-y-2 group-hover:translate-y-0 
                               transition-all duration-300 hover:scale-110
                               shadow-lg hover:shadow-xl"
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                    
                    {/* Wishlist Button - Appears on hover */}
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 right-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-2 
                               rounded-full opacity-0 group-hover:opacity-100 
                               transform -translate-y-2 group-hover:translate-y-0 
                               transition-all duration-300 hover:scale-110
                               shadow-md hover:shadow-lg hover:text-red-500"
                    >
                      <Heart className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 
                                 line-clamp-2 text-sm sm:text-base group-hover:text-indigo-600 
                                 dark:group-hover:text-indigo-400 transition-colors">
                      {getProductName(product)}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        (4.8)
                      </span>
                    </div>
                    
                    {/* Price and Add to Cart */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400">
                          {product.price.toLocaleString()} 
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                            {t('ETB', 'ብር')}
                          </span>
                        </p>
                        {product.compareAtPrice && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 line-through">
                            {product.compareAtPrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => handleAddToCart(product._id, e)}
                        className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 
                                 rounded-lg transition-all transform hover:scale-110 hover:bg-indigo-600 
                                 hover:text-white dark:hover:bg-indigo-600"
                        aria-label={t('Add to cart', 'ወደ ጋሪ ጨምር')}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 md:gap-8">
            <div className="text-center group">
              <div className="relative inline-block">
                <Package className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-indigo-600 dark:text-indigo-400 mb-3 sm:mb-4 
                                  group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-1 sm:mb-2">
                10,000+
              </div>
              <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                {t('Products Available', 'ያሉ ምርቶች')}
              </div>
            </div>
            
            <div className="text-center group">
              <div className="relative inline-block">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-indigo-600 dark:text-indigo-400 mb-3 sm:mb-4 
                                group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-1 sm:mb-2">
                50,000+
              </div>
              <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                {t('Happy Customers', 'ደስተኛ ደንበኞች')}
              </div>
            </div>
            
            <div className="text-center group">
              <div className="relative inline-block">
                <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-indigo-600 dark:text-indigo-400 mb-3 sm:mb-4 
                                     group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-1 sm:mb-2">
                99%
              </div>
              <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                {t('Satisfaction Rate', 'የእርካታ መጠን')}
              </div>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1 */}
          <div className="group bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md 
                        hover:shadow-xl transition-all duration-500 
                        transform hover:-translate-y-1 hover:scale-105
                        border border-gray-100 dark:border-gray-700">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 
                          dark:from-indigo-900/30 dark:to-indigo-800/30 
                          w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center 
                          mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 
                          transition-all duration-500">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 dark:text-white 
                         group-hover:text-indigo-600 dark:group-hover:text-indigo-400 
                         transition-colors text-center">
              {t('Guaranteed Quality', 'የተረጋገጠ ጥራት')}
            </h3>
            
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed text-center">
              {t(
                'All products are verified for authenticity and quality before reaching you',
                'ሁሉም ምርቶች ወደ እርስዎ ከመድረሳቸው በፊት ለትክክለኛነት እና ጥራት ተረጋግጠዋል'
              )}
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md 
                        hover:shadow-xl transition-all duration-500 
                        transform hover:-translate-y-1 hover:scale-105
                        border border-gray-100 dark:border-gray-700">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 
                          dark:from-indigo-900/30 dark:to-indigo-800/30 
                          w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center 
                          mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:-rotate-3 
                          transition-all duration-500">
              <Truck className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 dark:text-white 
                         group-hover:text-indigo-600 dark:group-hover:text-indigo-400 
                         transition-colors text-center">
              {t('Fast Delivery', 'ፈጣን ማድረስ')}
            </h3>
            
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed text-center">
              {t(
                'Quick and reliable delivery across all major Ethiopian cities',
                'በሁሉም ዋና ዋና የኢትዮጵያ ከተሞች ፈጣን እና አስተማማኝ ማድረስ'
              )}
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md 
                        hover:shadow-xl transition-all duration-500 
                        transform hover:-translate-y-1 hover:scale-105
                        border border-gray-100 dark:border-gray-700">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 
                          dark:from-indigo-900/30 dark:to-indigo-800/30 
                          w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center 
                          mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 
                          transition-all duration-500">
              <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 dark:text-white 
                         group-hover:text-indigo-600 dark:group-hover:text-indigo-400 
                         transition-colors text-center">
              {t('Secure Payment', 'ደህንነቱ የተጠበቀ ክፍያ')}
            </h3>
            
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed text-center">
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
