import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Star, X, ChevronLeft, ChevronRight, ShoppingBag, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { productService, Product, Category } from '../services/productService';
import { getImageUrl } from '../utils/imageUtils';
import { ArrowRight, Truck, Shield, Award } from 'lucide-react';
interface ShopProps {
  onNavigate: (page: string, data?: any) => void;
  initialCategory?: string;
}

export function Shop({ onNavigate, initialCategory }: ShopProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { theme } = useTheme();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, searchQuery, priceRange, currentPage]);

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: currentPage,
        limit: 12,
        sort: sortBy,
      };
      
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (priceRange[1] < 100000) {
        params.maxPrice = priceRange[1];
      }
      
      if (priceRange[0] > 0) {
        params.minPrice = priceRange[0];
      }
      
      const response = await productService.getProducts(params);
      console.log('Products fetched:', response);
      setProducts(response.products || []);
      setTotalPages(response.pages || 1);
      setTotalProducts(response.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (product: Product) => {
    return language === 'am' && product.nameAm ? product.nameAm : product.name;
  };

  const getCategoryName = (category: Category | undefined) => {
    if (!category) return t('Uncategorized', 'ምድብ ያልተመደበ');
    return language === 'am' && category.nameAm ? category.nameAm : category.name;
  };

  const calculateDiscount = (price: number, comparePrice?: number) => {
    return productService.calculateDiscount(price, comparePrice);
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

  const handleCategoryClick = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (value: number) => {
    setPriceRange([0, value]);
    setCurrentPage(1);
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-indigo-600 dark:bg-indigo-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-500">
      
{/* ===== HERO SECTION ===== */}
<section className="relative h-[500px] sm:h-[600px] md:h-[700px] overflow-hidden">
  {/* Background Image */}
  <div 
    className="absolute inset-0 w-full h-full bg-cover bg-center"
    style={{
      backgroundImage: 'url("https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1920")',
    }}
  >
    {/* Dark overlay for text readability */}
    <div className="absolute inset-0 bg-black/50"></div>
  </div>
  
  <div className="relative z-10 h-full flex items-center">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-3xl mx-auto text-center text-white">
        {/* Simple badge */}
        
        
        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          {t(
            'Shop All Products',
            'ሁሉንም ምርቶች ይግዙ'
          )}
        </h1>
        
        {/* Subheading */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto">
          {t(
            'Browse our complete collection',
            'ሙሉ ስብስባችንን ያስሱ'
          )}
        </p>       
      </div>
    </div>
  </div>
</section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
            <input
              type="text"
              placeholder={t('Search products...', 'ምርቶችን ፈልግ...')}
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl 
                       focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 bg-white dark:bg-gray-800 
                       border border-gray-200 dark:border-gray-700 rounded-xl 
                       hover:bg-gray-50 dark:hover:bg-gray-700 
                       transition-all duration-300 text-gray-700 dark:text-gray-200
                       shadow-sm hover:shadow-md"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              {t('Filters', 'ማጣሪያዎች')}
            </button>
            
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-4 py-3 bg-white dark:bg-gray-800 
                       border border-gray-200 dark:border-gray-700 rounded-xl 
                       focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       text-gray-900 dark:text-white shadow-sm"
            >
              <option value="name">{t('Name', 'ስም')}</option>
              <option value="price_asc">{t('Price: Low to High', 'ዋጋ: ዝቅተኛ ወደ ከፍተኛ')}</option>
              <option value="price_desc">{t('Price: High to Low', 'ዋጋ: ከፍተኛ ወደ ዝቅተኛ')}</option>
              <option value="newest">{t('Newest First', 'አዲሱ መጀመሪያ')}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-24 
                          border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {t('Filters', 'ማጣሪያዎች')}
                </h3>
                <button 
                  onClick={() => setShowFilters(false)} 
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Categories Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {t('Categories', 'ምድቦች')}
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  <button
                    onClick={() => handleCategoryClick(null)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-300 ${
                      selectedCategory === null
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t('All Categories', 'ሁሉም ምድቦች')}
                  </button>
                  
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleCategoryClick(category.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-300 ${
                        selectedCategory === category.slug
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {getCategoryName(category)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {t('Price Range', 'የዋጋ ክልል')}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{priceRange[0].toLocaleString()} {t('ETB', 'ብር')}</span>
                    <span>{priceRange[1].toLocaleString()} {t('ETB', 'ብር')}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 dark:accent-indigo-500"
                  />
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setPriceRange([0, 100000]);
                        setCurrentPage(1);
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 
                               rounded-xl text-gray-600 dark:text-gray-400 
                               hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {t('Reset', 'ዳግም አስጀምር')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400"></div>
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === 'am' 
                      ? `${products.length} ምርቶች በማሳየት ላይ`
                      : `Showing ${products.length} products`
                    }
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {language === 'am'
                      ? `ገጽ ${currentPage} ከ ${totalPages}`
                      : `Page ${currentPage} of ${totalPages}`
                    }
                  </p>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {t('No products found', 'ምንም ምርቶች አልተገኙም')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {t('Try adjusting your search or filter', 'ፍለጋዎን ወይም ማጣሪያዎን ያስተካክሉ')}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                        setPriceRange([0, 100000]);
                        setCurrentPage(1);
                      }}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl 
                               transition-all duration-300 transform hover:scale-105"
                    >
                      {t('Clear Filters', 'ማጣሪያዎችን አጽዳ')}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product) => {
                        const discount = calculateDiscount(product.price, product.compareAtPrice);
                        const productCategory = categories.find(c => c._id === product.categoryId);
                        
                        return (
                          <div
                            key={product._id}
                            className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl 
                                     transition-all duration-500 hover:-translate-y-1.5 cursor-pointer
                                     overflow-hidden border border-gray-100 dark:border-gray-700 relative"
                            onClick={() => handleProductClick(product.slug)}
                          >
                            {/* Image Container */}
                            <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                              <img
                                src={getImageUrl(product.images[0])}
                                alt={getProductName(product)}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                onError={(e) => {
                                  console.error('Image failed to load:', product.images[0]);
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
                              
                              {/* Category badge */}
                              {product.categoryId && productCategory && (
                                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm 
                                              text-white text-xs px-2.5 py-1.5 rounded-lg">
                                  {getCategoryName(productCategory)}
                                </div>
                              )}
                            </div>
                            
                            {/* Product Info */}
                            <div className="p-4">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 
                                           line-clamp-2 text-base group-hover:text-indigo-600 
                                           dark:group-hover:text-indigo-400 transition-colors">
                                {getProductName(product)}
                              </h3>
                              
                              {/* Rating */}
                              <div className="flex items-center gap-1 mb-3">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className="h-3.5 w-3.5 text-yellow-400 fill-current"
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
                                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
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
                                  <ShoppingBag className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-12 flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 
                                   text-gray-700 dark:text-gray-300 disabled:opacity-50 
                                   disabled:cursor-not-allowed hover:bg-gray-50 
                                   dark:hover:bg-gray-700 transition-all duration-300
                                   hover:scale-105"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        
                        {[...Array(totalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-12 h-12 rounded-xl font-medium transition-all duration-300
                                          ${currentPage === pageNum
                                            ? 'bg-indigo-600 text-white shadow-lg scale-110'
                                            : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105'
                                          }`}
                              >
                                {pageNum}
                              </button>
                            );
                          } else if (
                            pageNum === currentPage - 2 ||
                            pageNum === currentPage + 2
                          ) {
                            return <span key={pageNum} className="text-gray-400">...</span>;
                          }
                          return null;
                        })}
                        
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 
                                   text-gray-700 dark:text-gray-300 disabled:opacity-50 
                                   disabled:cursor-not-allowed hover:bg-gray-50 
                                   dark:hover:bg-gray-700 transition-all duration-300
                                   hover:scale-105"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
