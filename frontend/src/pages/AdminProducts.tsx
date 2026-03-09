import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { productService, Product, Category } from '../services/productService';
import { AdminProductForm } from '../components/AdminProductForm';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff,
  Package,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Tag
} from 'lucide-react';

interface AdminProductsProps {
  onNavigate: (page: string) => void;
  showForm?: boolean;
  setShowForm?: (show: boolean) => void;
  editingProduct?: Product | null;
  setEditingProduct?: (product: Product | null) => void;
}

export function AdminProducts({ 
  onNavigate, 
  showForm: externalShowForm, 
  setShowForm: externalSetShowForm,
  editingProduct: externalEditingProduct,
  setEditingProduct: externalSetEditingProduct
}: AdminProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalShowForm, setInternalShowForm] = useState(false);
  const [internalEditingProduct, setInternalEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  // Use external state if provided, otherwise use internal state
  const showForm = externalShowForm !== undefined ? externalShowForm : internalShowForm;
  const setShowForm = externalSetShowForm || setInternalShowForm;
  const editingProduct = externalEditingProduct !== undefined ? externalEditingProduct : internalEditingProduct;
  const setEditingProduct = externalSetEditingProduct || setInternalEditingProduct;

  useEffect(() => {
    fetchData();
  }, [currentPage, showInactive, searchQuery, selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      
      // FIXED: When showInactive is true, we want ALL products (no isActive filter)
      // When showInactive is false, we want ONLY active products
      if (!showInactive) {
        params.isActive = true; // Only show active products
      }
      // If showInactive is true, we don't send the isActive filter at all
      // This will return both active and inactive products
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (selectedCategory) {
        const selectedCat = categories.find(c => c._id === selectedCategory);
        if (selectedCat) {
          params.category = selectedCat.slug;
        }
      }
      
      console.log('Fetching products with params:', params); // Debug log
      
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(params),
        productService.getCategories()
      ]);
      
      console.log('Products received:', productsData); // Debug log
      console.log('Active products:', productsData.products?.filter(p => p.isActive).length);
      console.log('Inactive products:', productsData.products?.filter(p => !p.isActive).length);
      
      setProducts(productsData.products || []);
      setTotalPages(productsData.pages || 1);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setTogglingId(null);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCreateProduct = async (formData: FormData) => {
    try {
      await productService.createProductWithImages(formData);
      setShowForm(false);
      fetchData();
      alert(t('Product created successfully!', 'ምርት በተሳካ ሁኔታ ተፈጠረ!'));
    } catch (error) {
      console.error('Error creating product:', error);
      alert(t('Failed to create product', 'ምርት መፍጠር አልተሳካም'));
    }
  };

  const handleUpdateProduct = async (formData: FormData) => {
    if (!editingProduct) return;
    try {
      // Convert FormData to plain object for update
      const data: any = {};
      formData.forEach((value, key) => {
        if (key !== 'images' && key !== 'existingImages') {
          data[key] = value;
        }
      });
      
      await productService.updateProduct(editingProduct._id, data);
      setEditingProduct(null);
      setShowForm(false);
      fetchData();
      alert(t('Product updated successfully!', 'ምርት በተሳካ ሁኔታ ተዘምኗል!'));
    } catch (error) {
      console.error('Error updating product:', error);
      alert(t('Failed to update product', 'ምርት ማዘመን አልተሳካም'));
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(t('Are you sure you want to delete this product?', 'ይህን ምርት መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት?'))) {
      return;
    }
    try {
      await productService.deleteProduct(productId);
      fetchData();
      alert(t('Product deleted successfully!', 'ምርት በተሳካ ሁኔታ ተሰርዟል!'));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(t('Failed to delete product', 'ምርት መሰረዝ አልተሳካም'));
    }
  };

  // Toggle active status
  const handleToggleActive = async (product: Product) => {
    try {
      setTogglingId(product._id); // Show loading state
      
      const newStatus = !product.isActive;
      console.log(`Toggling product ${product._id} from ${product.isActive} to ${newStatus}`);
      
      const updatedProduct = await productService.toggleProductStatus(product._id, newStatus);
      console.log('Toggle response:', updatedProduct);
      
      // Update local state immediately for better UX
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p._id === product._id ? { ...p, isActive: newStatus } : p
        )
      );
      
      // If we're in "active only" mode and we deactivate a product, remove it from view
      if (!showInactive && !newStatus) {
        // Product was deactivated while in active-only mode, remove it from list
        setProducts(prevProducts => prevProducts.filter(p => p._id !== product._id));
      }
      
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert(t('Failed to update product status', 'የምርት ሁኔታ ማዘመን አልተሳካም'));
      // Revert on error by refetching
      fetchData();
    } finally {
      setTogglingId(null);
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (product: Product) => {
    try {
      setTogglingId(product._id); // Show loading state
      
      const newStatus = !product.isFeatured;
      console.log(`Toggling featured for product ${product._id} from ${product.isFeatured} to ${newStatus}`);
      
      const updatedProduct = await productService.toggleFeatured(product._id, newStatus);
      console.log('Toggle featured response:', updatedProduct);
      
      // Update local state immediately
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p._id === product._id ? { ...p, isFeatured: newStatus } : p
        )
      );
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert(t('Failed to update featured status', 'የተለየ ሁኔታ ማዘመን አልተሳካም'));
      fetchData();
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      await productService.createCategory({
        name: formData.get('name') as string,
        nameAm: formData.get('nameAm') as string,
        imageUrl: formData.get('imageUrl') as string,
        displayOrder: Number(formData.get('displayOrder')) || 0,
      });
      setShowCategoryForm(false);
      fetchData();
      alert(t('Category created successfully!', 'ምድብ በተሳካ ሁኔታ ተፈጠረ!'));
    } catch (error) {
      console.error('Error creating category:', error);
      alert(t('Failed to create category', 'ምድብ መፍጠር አልተሳካም'));
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.nameAm?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    if (!category) return t('Uncategorized', 'ምድብ ያልተመደበ');
    return language === 'am' && category.nameAm ? category.nameAm : category.name;
  };

  // Count active and inactive products
  const activeCount = products.filter(p => p.isActive).length;
  const inactiveCount = products.filter(p => !p.isActive).length;

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Package className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
            {t('Product Management', 'የምርት አስተዳደር')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {language === 'am' 
              ? `ጠቅላላ ${products.length} ምርቶች (${activeCount} ንቁ, ${inactiveCount} ያልተነቁ)`
              : `Total ${products.length} products (${activeCount} active, ${inactiveCount} inactive)`
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 
                     dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 
                     rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('Refresh', 'አድስ')}
          </button>
          
          <button
            onClick={() => setShowCategoryForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                     text-white rounded-xl transition-colors"
          >
            <Tag className="h-5 w-5 mr-2" />
            {t('Add Category', 'ምድብ ጨምር')}
          </button>
          
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            disabled={categories.length === 0}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 
                     text-white rounded-xl transition-all transform hover:scale-105
                     focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                     dark:focus:ring-offset-gray-800 disabled:bg-gray-400 
                     disabled:cursor-not-allowed disabled:transform-none"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('Add New Product', 'አዲስ ምርት ጨምር')}
          </button>
        </div>
      </div>

      {/* Category Warning */}
      {categories.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                {t('No Categories Found', 'ምንም ምድቦች አልተገኙም')}
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                {t('You need to create at least one category before adding products.', 
                   'ምርቶችን ከመጨመርዎ በፊት ቢያንስ አንድ ምድብ መፍጠር ያስፈልጋል።')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 
                    border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('Search products...', 'ምርቶችን ፈልግ...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                     rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t('All Categories', 'ሁሉም ምድቦች')}</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {language === 'am' && category.nameAm ? category.nameAm : category.name}
              </option>
            ))}
          </select>

          {/* Show Inactive Toggle */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => {
                  setShowInactive(e.target.checked);
                  setCurrentPage(1); // Reset to first page when toggling
                }}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none 
                            peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 
                            rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full 
                            rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white 
                            after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                            after:bg-white after:border-gray-300 after:border after:rounded-full 
                            after:h-5 after:w-5 after:transition-all dark:border-gray-600 
                            peer-checked:bg-indigo-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('Show inactive', 'ያልተነቁ አሳይ')}
              </span>
            </label>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setShowInactive(false);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                     rounded-md text-gray-700 dark:text-gray-300 
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                     flex items-center justify-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            {t('Reset', 'ዳግም አስጀምር')}
          </button>
        </div>
      </div>

      {/* Status Info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {showInactive ? (
          <p>{t('Showing all products (both active and inactive)', 'ሁሉም ምርቶች እየታዩ ነው (ንቁ እና ያልተነቁ)')}</p>
        ) : (
          <p>{t('Showing only active products', 'ንቁ የሆኑ ምርቶች ብቻ እየታዩ ነው')}</p>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden
                    border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Product', 'ምርት')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Category', 'ምድብ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Price', 'ዋጋ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Stock', 'ክምችት')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Status', 'ሁኔታ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Actions', 'እርምጃዎች')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!product.isActive ? 'bg-gray-50 dark:bg-gray-800/50 opacity-75' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          src={product.images[0] || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {language === 'am' && product.nameAm ? product.nameAm : product.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {product.slug}
                          {!product.isActive && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              {t('Inactive', 'ያልተነቃ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {getCategoryName(product.categoryId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {product.price.toLocaleString()} {t('ETB', 'ብር')}
                    </div>
                    {product.compareAtPrice && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                        {product.compareAtPrice.toLocaleString()} ETB
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      product.stockQuantity > 10 
                        ? 'text-green-600 dark:text-green-400' 
                        : product.stockQuantity > 0 
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {/* Active Status */}
                      <button
                        onClick={() => handleToggleActive(product)}
                        disabled={togglingId === product._id}
                        className={`p-1 rounded-md transition-colors ${
                          product.isActive
                            ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                            : 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                        } ${togglingId === product._id ? 'opacity-50 cursor-wait' : ''}`}
                        title={product.isActive ? t('Active - Click to deactivate', 'ንቁ - ለማቦዘን ይጫኑ') : t('Inactive - Click to activate', 'ያልተነቃ - ለማንቃት ይጫኑ')}
                      >
                        {togglingId === product._id ? (
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : product.isActive ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>

                      {/* Featured Status */}
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        disabled={togglingId === product._id}
                        className={`p-1 rounded-md transition-colors ${
                          product.isFeatured
                            ? 'text-yellow-500 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20'
                            : 'text-gray-400 hover:bg-gray-50 dark:text-gray-500 dark:hover:bg-gray-700'
                        } ${togglingId === product._id ? 'opacity-50 cursor-wait' : ''}`}
                        title={product.isFeatured ? t('Featured', 'ተለይቶ የቀረበ') : t('Not Featured', 'ያልተለየ')}
                      >
                        {product.isFeatured ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 
                                 dark:hover:text-blue-300 p-1 rounded-md
                                 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title={t('Edit', 'አስተካክል')}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 
                                 dark:hover:text-red-300 p-1 rounded-md
                                 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title={t('Delete', 'ሰርዝ')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        {t('No products found', 'ምንም ምርቶች አልተገኙም')}
                      </p>
                      {showInactive ? (
                        <p className="text-sm text-gray-500 mt-2">
                          {t('No inactive products available', 'ምንም ያልተነቁ ምርቶች የሉም')}
                        </p>
                      ) : null}
                      <button
                        onClick={() => {
                          setEditingProduct(null);
                          setShowForm(true);
                        }}
                        disabled={categories.length === 0}
                        className="mt-4 inline-flex items-center px-4 py-2 
                                 bg-green-600 hover:bg-green-700 text-white 
                                 rounded-lg transition-colors disabled:bg-gray-400 
                                 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        {t('Add Your First Product', 'የመጀመሪያ ምርትዎን ያክሉ')}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 
                        flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 disabled:opacity-50 
                       disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {language === 'am' 
                ? `ገጽ ${currentPage} ከ ${totalPages}`
                : `Page ${currentPage} of ${totalPages}`
              }
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 disabled:opacity-50 
                       disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 
                          px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingProduct 
                  ? t('Edit Product', 'ምርት አስተካክል') 
                  : t('Add New Product', 'አዲስ ምርት ጨምር')}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <AdminProductForm
                initialData={editingProduct || undefined}
                categories={categories}
                onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                onCancel={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                isEditing={!!editingProduct}
              />
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 
                          px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('Add New Category', 'አዲስ ምድብ ጨምር')}
              </h2>
              <button
                onClick={() => setShowCategoryForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Category Name (English)', 'የምድብ ስም (እንግሊዝኛ)')} *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Category Name (Amharic)', 'የምድብ ስም (አማርኛ)')}
                </label>
                <input
                  type="text"
                  name="nameAm"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Image URL', 'የምስል አድራሻ')}
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Display Order', 'የማሳያ ቅደም ተከተል')}
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  min="0"
                  defaultValue="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-md text-gray-700 dark:text-gray-300 
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('Cancel', 'ሰርዝ')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white 
                           rounded-md transition-colors"
                >
                  {t('Create Category', 'ምድብ ፍጠር')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}