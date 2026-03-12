import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Star, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { productService, Product, Category } from '../services/productService';
import { getImageUrl } from '../utils/imageUtils';

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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setPriceRange([0, 100000]);
    setCurrentPage(1);
  };

  if (loading && products.length === 0) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-500 overflow-x-hidden">
      
      {/* Hero Section - Mobile Optimized */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-white overflow-hidden">
        {/* Background blur circles - hidden on mobile for performance */}
        <div className="hidden sm:block absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 tracking-tight">
            {t('Shop All Products', 'ሁሉንም ምርቶች ይግዙ')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-indigo-100 dark:text-indigo-200 mb-3 sm:mb-4">
            {t('Browse our complete collection', 'ሙሉ ስብስባችንን ያስሱ')}
          </p>
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm text-indigo-100 text-xs sm:text-sm">
            <span className="font-medium">{totalProducts}</span>
            <span className="mx-2">•</span>
            <span>{t('products available', 'ምርቶች ይገኛሉ')}</span>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-slate-50 via-slate-50/50 to-transparent dark:from-slate-950 dark:via-slate-950/50"></div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search and Filter Bar - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder={t('Search products...', 'ምርቶችን ፈልግ...')}
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base
                       border border-gray-200 dark:border-gray-700 rounded-xl 
                       focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
            />
          </div>
          
          <div className="flex gap-2 sm:gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex-1 sm:flex-none flex items-center justify-center 
                       px-4 py-2.5 sm:px-4 sm:py-3 bg-white dark:bg-gray-800 
                       border border-gray-200 dark:border-gray-700 rounded-xl 
                       hover:bg-gray-50 dark:hover:bg-gray-700 
                       transition-all duration-300 text-gray-700 dark:text-gray-200
                       shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {t('Filters', 'ማጣሪያዎች')}
              {(selectedCategory || priceRange[1] < 100000) && (
                <span className="ml-2 w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
              )}
            </button>
            
            {/* Desktop Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="hidden lg:flex items-center px-4 py-3 bg-white dark:bg-gray-800 
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
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base
                       bg-white dark:bg-gray-800 
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

        {/* Mobile Filters Drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            ></div>
            
            {/* Drawer */}
            <div className="absolute right-0 top-0 h-full w-80 max-w-[90%] bg-white dark:bg-gray-800 
                          shadow-2xl overflow-y-auto animate-slideIn">
              <div className="p-5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {t('Filters', 'ማጣሪያዎች')}
                  </h3>
                  <button 
                    onClick={() => setShowFilters(false)} 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Categories Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    {t('Categories', 'ምድቦች')}
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    <button
                      onClick={() => handleCategoryClick(null)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-300 text-sm ${
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
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-300 text-sm ${
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
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    {t('Price Range', 'የዋጋ ክልል')}
                  </h4>
                  <div className="space-y-3">
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
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={clearFilters}
                    className="flex-1 px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 
                             rounded-xl text-gray-600 dark:text-gray-400 
                             hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('Reset', 'ዳግም አስጀምር')}
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 px-4 py-3 text-sm bg-indigo-600 hover:bg-indigo-700 
                             text-white rounded-xl transition-colors"
                  >
                    {t('Apply', 'ተግብር')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:w-64">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-24 
                          border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                {t('Filters', 'ማጣሪያዎች')}
              </h3>

              {/* Categories Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {t('Categories', 'ምድቦች')}
                </h4>
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
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {t('Price Range', 'የዋጋ ክልል')}
                </h4>
                <div className="space-y-3">
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
                  <button
                    onClick={clearFilters}
                    className="w-full mt-4 px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 
                             rounded-xl text-gray-600 dark:text-gray-400 
                             hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('Reset Filters', 'ማጣሪያዎችን ዳግም አስጀምር')}
                  </button>
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
                {/* Results count - Mobile Optimized */}
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {language === 'am' 
                      ? `${products.length} ምርቶች በማሳየት ላይ`
                      : `Showing ${products.length} products`
                    }
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                    {language === 'am'
                      ? `ገጽ ${currentPage} ከ ${totalPages}`
                      : `Page ${currentPage} of ${totalPages}`
                    }
                  </p>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md px-4">
                    <div className="text-5xl sm:text-6xl mb-4">🔍</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {t('No products found', 'ምንም ምርቶች አልተገኙም')}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                      {t('Try adjusting your search or filter', 'ፍለጋዎን ወይም ማጣሪያዎን ያስተካክሉ')}
                    </p>
                    <button
                      onClick={clearFilters}
                      className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl 
                               transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                    >
                      {t('Clear Filters', 'ማጣሪያዎችን አጽዳ')}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Product Grid - Mobile Optimized */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                      {products.map((product) => {
                        const discount = calculateDiscount(product.price, product.compareAtPrice);
                        const productCategory = categories.find(c => c._id === product.categoryId);
                        
                        return (
                          <div
                            key={product._id}
                            className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm sm:shadow-md 
                                     hover:shadow-lg transition-all duration-500 
                                     hover:-translate-y-1 hover:scale-[1.02] cursor-pointer
                                     overflow-hidden border border-gray-100 dark:border-gray-700"
                            onClick={() => handleProductClick(product.slug)}
                          >
                            <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                              <img
                                src={getImageUrl(product.images[0])}
                                alt={getProductName(product)}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                loading="lazy"
                                onError={(e) => {
                                  console.error('Image failed to load:', product.images[0]);
                                  e.currentTarget.src = 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400';
                                }}
                              />
                              {discount > 0 && (
                                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 
                                              bg-gradient-to-r from-amber-500 to-orange-500 
                                              text-white px-1.5 sm:px-2 py-0.5 sm:py-1 
                                              rounded-full text-2xs sm:text-xs font-bold
                                              shadow-md transform group-hover:scale-110 
                                              transition-all duration-300 z-10">
                                  -{discount}%
                                </div>
                              )}
                              
                              {/* Category badge - Hidden on very small screens */}
                              {product.categoryId && productCategory && (
                                <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 
                                              bg-black/50 backdrop-blur-sm 
                                              text-white text-2xs sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 
                                              rounded-full">
                                  {getCategoryName(productCategory)}
                                </div>
                              )}
                              
                              {/* Quick add button - Visible on hover */}
                              <button
                                onClick={(e) => handleAddToCart(product._id, e)}
                                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 
                                         bg-indigo-600 text-white p-1.5 sm:p-2 
                                         rounded-full opacity-0 group-hover:opacity-100 
                                         transform translate-y-1 group-hover:translate-y-0 
                                         transition-all duration-300 hover:bg-indigo-700
                                         shadow-sm hover:shadow-md"
                                aria-label={t('Add to cart', 'ወደ ጋሪ ጨምር')}
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
                              
                              <div className="flex items-center mb-1 sm:mb-2">
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
                                           dark:hover:bg-indigo-700 text-white p-1.5 sm:p-2 
                                           rounded-full transition-all transform 
                                           hover:scale-110 hover:shadow-sm
                                           focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                                           dark:focus:ring-offset-gray-800"
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

                    {/* Pagination - Mobile Optimized */}
                    {totalPages > 1 && (
                      <div className="mt-8 sm:mt-12 flex items-center justify-center space-x-1 sm:space-x-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 
                                   text-gray-700 dark:text-gray-300 disabled:opacity-50 
                                   disabled:cursor-not-allowed hover:bg-gray-50 
                                   dark:hover:bg-gray-700 transition-all duration-300
                                   hover:scale-105"
                        >
                          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            
                            // Show first page, last page, and pages around current page
                            if (
                              pageNum === 1 ||
                              pageNum === totalPages ||
                              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl 
                                            text-xs sm:text-sm font-medium transition-all duration-300
                                            ${currentPage === pageNum
                                              ? 'bg-indigo-600 text-white shadow-md scale-110'
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
                              return (
                                <span 
                                  key={pageNum} 
                                  className="text-gray-400 text-xs sm:text-sm px-1"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 
                                   text-gray-700 dark:text-gray-300 disabled:opacity-50 
                                   disabled:cursor-not-allowed hover:bg-gray-50 
                                   dark:hover:bg-gray-700 transition-all duration-300
                                   hover:scale-105"
                        >
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
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
