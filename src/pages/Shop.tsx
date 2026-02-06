import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface Product {
  id: string;
  name: string;
  name_am: string | null;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  name_am: string | null;
  slug: string;
}

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
  const { t, language } = useLanguage();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (data) setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (selectedCategory) {
        const category = categories.find(c => c.slug === selectedCategory);
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
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

  const filteredProducts = products
    .filter((product) => {
      const name = getProductName(product).toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'name') return getProductName(a).localeCompare(getProductName(b));
      return 0;
    });

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t('Shop All Products', 'ሁሉንም ምርቶች ይግዙ')}
          </h1>
          <p className="text-green-100">
            {t('Browse our complete collection', 'ሙሉ ስብስባችንን ያስሱ')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('Search products...', 'ምርቶችን ፈልግ...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              {t('Filters', 'ማጣሪያዎች')}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="name">{t('Name', 'ስም')}</option>
              <option value="price_asc">{t('Price: Low to High', 'ዋጋ: ዝቅተኛ ወደ ከፍተኛ')}</option>
              <option value="price_desc">{t('Price: High to Low', 'ዋጋ: ከፍተኛ ወደ ዝቅተኛ')}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h3 className="font-semibold text-lg">{t('Filters', 'ማጣሪያዎች')}</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('Categories', 'ምድቦች')}
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === null
                        ? 'bg-green-50 text-green-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t('All Categories', 'ሁሉም ምድቦች')}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.slug);
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category.slug
                          ? 'bg-green-50 text-green-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {getCategoryName(category)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('Price Range', 'የዋጋ ክልል')}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{priceRange[0]} {t('ETB', 'ብር')}</span>
                    <span>{priceRange[1]} {t('ETB', 'ብር')}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  {t(`Showing ${filteredProducts.length} products`, `${filteredProducts.length} ምርቶችን በማሳየት ላይ`)}
                </div>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      {t('No products found', 'ምንም ምርቶች አልተገኙም')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => {
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
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
