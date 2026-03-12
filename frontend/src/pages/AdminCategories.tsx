import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { productService, Category } from '../services/productService';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Search,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  Image as ImageIcon,
  Upload,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

interface AdminCategoriesProps {
  onNavigate: (page: string) => void;
}

export function AdminCategories({ onNavigate }: AdminCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameAm: '',
    displayOrder: 0,
  });
  
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await productService.getCategories();
      // Sort by display order
      const sorted = data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setCategories(sorted);
      console.log('✅ Categories fetched:', sorted.length);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(t('File size must be less than 5MB', 'የፋይል መጠን ከ5ሜባ በታች መሆን አለበት'));
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(t('Please select an image file', 'እባክዎ የምስል ፋይል ይምረጡ'));
        return;
      }

      setSelectedFile(file);
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      console.log('✅ File selected:', file.name);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile && !editingCategory) {
      alert(t('Please select an image', 'እባክዎ ምስል ይምረጡ'));
      return;
    }
    
    setUploading(true);
    
    try {
      let finalImageUrl = '';
      
      // If it's a new category or image was changed, upload the file
      if (selectedFile) {
        console.log('📤 Uploading file:', selectedFile.name);
        
        const formDataObj = new FormData();
        formDataObj.append('image', selectedFile);
        
        try {
          console.log('📤 Sending upload request...');
          const uploadResponse = await productService.uploadCategoryImage(formDataObj);
          console.log('📥 Upload response:', uploadResponse);
          
          if (uploadResponse && uploadResponse.imageUrl) {
            finalImageUrl = uploadResponse.imageUrl;
            console.log('✅ Image uploaded, path:', finalImageUrl);
          } else {
            throw new Error('No image URL returned from server');
          }
        } catch (uploadError) {
          console.error('❌ Error uploading image:', uploadError);
          alert(t('Failed to upload image', 'ምስል መጫን አልተሳካም'));
          setUploading(false);
          return;
        }
      } else if (editingCategory) {
        // Keep existing image when editing
        finalImageUrl = editingCategory.imageUrl || '';
        console.log('📝 Keeping existing image:', finalImageUrl);
      }

      const categoryData = {
        name: formData.name,
        nameAm: formData.nameAm,
        imageUrl: finalImageUrl,
        displayOrder: formData.displayOrder,
      };

      console.log('📝 Submitting category data:', categoryData);

      if (editingCategory) {
        const response = await productService.updateCategory(editingCategory._id, categoryData);
        console.log('✅ Update response:', response);
        alert(t('Category updated successfully!', 'ምድብ በተሳካ ሁኔታ ተዘምኗል!'));
      } else {
        const response = await productService.createCategory(categoryData);
        console.log('✅ Create response:', response);
        alert(t('Category created successfully!', 'ምድብ በተሳካ ሁኔታ ተፈጠረ!'));
      }
      
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', nameAm: '', displayOrder: 0 });
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      fetchCategories();
    } catch (error) {
      console.error('❌ Error saving category:', error);
      alert(t('Failed to save category', 'ምድብ ማስቀመጥ አልተሳካም'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm(t(
      'Are you sure you want to delete this category? This action cannot be undone.',
      'ይህን ምድብ መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት? ይህ እርምጃ ሊቀለበስ አይችልም።'
    ))) {
      return;
    }
    try {
      await productService.deleteCategory(categoryId);
      fetchCategories();
      alert(t('Category deleted successfully!', 'ምድብ በተሳካ ሁኔታ ተሰርዟል!'));
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(t('Failed to delete category', 'ምድብ መሰረዝ አልተሳካም'));
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      nameAm: category.nameAm || '',
      displayOrder: category.displayOrder || 0,
    });
    setShowForm(true);
    console.log('✏️ Editing category:', category);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[index - 1];
    newCategories[index - 1] = temp;
    
    // Update display orders
    try {
      await Promise.all([
        productService.updateCategory(newCategories[index]._id, {
          displayOrder: index
        }),
        productService.updateCategory(newCategories[index - 1]._id, {
          displayOrder: index - 1
        })
      ]);
      setCategories(newCategories);
    } catch (error) {
      console.error('Error updating order:', error);
      alert(t('Failed to update order', 'ቅደም ተከተል ማዘመን አልተሳካም'));
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === categories.length - 1) return;
    
    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[index + 1];
    newCategories[index + 1] = temp;
    
    try {
      await Promise.all([
        productService.updateCategory(newCategories[index]._id, {
          displayOrder: index
        }),
        productService.updateCategory(newCategories[index + 1]._id, {
          displayOrder: index + 1
        })
      ]);
      setCategories(newCategories);
    } catch (error) {
      console.error('Error updating order:', error);
      alert(t('Failed to update order', 'ቅደም ተከተል ማዘመን አልተሳካም'));
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.nameAm?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  if (loading) {
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Tag className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
            {t('Category Management', 'የምድብ አስተዳደር')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {language === 'am' 
              ? `ጠቅላላ ${categories.length} ምድቦች`
              : `Total ${categories.length} categories`
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
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', nameAm: '', displayOrder: categories.length });
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 
                     text-white rounded-xl transition-all transform hover:scale-105
                     shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('Add Category', 'ምድብ ጨምር')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 
                    border border-gray-100 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('Search categories by name...', 'ምድቦችን በስም ፈልግ...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 w-20 h-20 rounded-full 
                        flex items-center justify-center mx-auto mb-4">
            <Tag className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('No categories found', 'ምንም ምድቦች አልተገኙም')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('Create your first category to organize your products', 'ምርቶችዎን ለማደራጀት የመጀመሪያ ምድብዎን ይፍጠሩ')}
          </p>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', nameAm: '', displayOrder: 0 });
              setShowForm(true);
            }}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 
                     text-white rounded-xl transition-all transform hover:scale-105
                     shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('Add Category', 'ምድብ ጨምር')}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentCategories.map((category, index) => {
              const actualIndex = categories.findIndex(c => c._id === category._id);
              const imageUrl = getImageUrl(category.imageUrl);
              
              return (
                <div
                  key={category._id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg 
                           hover:shadow-2xl transition-all duration-500 
                           transform hover:-translate-y-2 hover:scale-[1.02]
                           overflow-hidden border border-gray-100 dark:border-gray-700
                           relative"
                >
                  {/* Order controls */}
                  <div className="absolute top-2 left-2 z-10 flex space-x-1">
                    {actualIndex > 0 && (
                      <button
                        onClick={() => handleMoveUp(actualIndex)}
                        className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                                 p-1.5 rounded-lg shadow-md hover:bg-indigo-50 
                                 dark:hover:bg-indigo-900/30 hover:text-indigo-600 
                                 dark:hover:text-indigo-400 transition-colors"
                        title={t('Move Up', 'ወደ ላይ አንቀሳቅስ')}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    )}
                    {actualIndex < categories.length - 1 && (
                      <button
                        onClick={() => handleMoveDown(actualIndex)}
                        className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                                 p-1.5 rounded-lg shadow-md hover:bg-indigo-50 
                                 dark:hover:bg-indigo-900/30 hover:text-indigo-600 
                                 dark:hover:text-indigo-400 transition-colors"
                        title={t('Move Down', 'ወደ ታች አንቀሳቅስ')}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Image - FIXED: Using getImageUrl helper with error handling */}
                  <div className="h-40 overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 
                                dark:from-indigo-900/30 dark:to-indigo-800/30 relative">
                    {category.imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onLoad={() => console.log('✅ Category image loaded:', imageUrl)}
                          onError={(e) => {
                            console.error('❌ Category image failed to load:', {
                              name: category.name,
                              original: category.imageUrl,
                              processed: imageUrl
                            });
                            // Show placeholder on error
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'w-full h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30';
                              placeholder.innerHTML = '<div class="text-indigo-400 dark:text-indigo-300">📷</div>';
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {language === 'am' && category.nameAm ? category.nameAm : category.name}
                      </h3>
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 
                                     text-indigo-700 dark:text-indigo-400 
                                     px-2 py-1 rounded-full">
                        #{category.displayOrder}
                      </span>
                    </div>
                    
                    {language === 'am' && category.name && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {category.name}
                      </p>
                    )}
                    
                    {/* Action buttons */}
                    <div className="flex items-center justify-end space-x-2 mt-4 pt-3 
                                  border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => handleEdit(category)}
                        className="flex-1 flex items-center justify-center space-x-2 
                                 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 
                                 text-indigo-600 dark:text-indigo-400 rounded-xl
                                 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 
                                 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="text-sm font-medium">{t('Edit', 'አስተካክል')}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="flex-1 flex items-center justify-center space-x-2 
                                 px-3 py-2 bg-red-50 dark:bg-red-900/30 
                                 text-red-600 dark:text-red-400 rounded-xl
                                 hover:bg-red-100 dark:hover:bg-red-900/50 
                                 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm font-medium">{t('Delete', 'ሰርዝ')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 
                         text-gray-700 dark:text-gray-300 disabled:opacity-50 
                         disabled:cursor-not-allowed hover:bg-gray-50 
                         dark:hover:bg-gray-700 transition-all duration-300
                         hover:scale-105"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-medium transition-all duration-300
                            ${currentPage === i + 1
                              ? 'bg-indigo-600 text-white shadow-lg scale-110'
                              : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105'
                            }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 
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

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full
                        border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 
                          px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCategory 
                  ? t('Edit Category', 'ምድብ አስተካክል')
                  : t('Add New Category', 'አዲስ ምድብ ጨምር')}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                  setFormData({ name: '', nameAm: '', displayOrder: 0 });
                  setSelectedFile(null);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* English Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Name (English)', 'ስም (እንግሊዝኛ)')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('Electronics', 'ኤሌክትሮኒክስ')}
                />
              </div>
              
              {/* Amharic Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Name (Amharic)', 'ስም (አማርኛ)')}
                </label>
                <input
                  type="text"
                  name="nameAm"
                  value={formData.nameAm}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ኤሌክትሮኒክስ"
                />
              </div>
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Category Image', 'የምድብ ምስል')} *
                </label>
                
                {/* File Upload */}
                <div className="mb-4">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-10 w-10 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {t('Click to upload image', 'ምስል ለመጫን ይጫኑ')}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>

                {/* Show current image when editing - FIXED: Using getImageUrl helper */}
                {editingCategory && editingCategory.imageUrl && !selectedFile && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-2">{t('Current image:', 'አሁን ያለው ምስል:')}</p>
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img
                        src={getImageUrl(editingCategory.imageUrl)}
                        alt={editingCategory.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('❌ Failed to load current image:', {
                            original: editingCategory.imageUrl,
                            processed: getImageUrl(editingCategory.imageUrl)
                          });
                          e.currentTarget.src = 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Display Order', 'የማሳያ ቅደም ተከተል')}
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                    setFormData({ name: '', nameAm: '', displayOrder: 0 });
                    setSelectedFile(null);
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-xl text-gray-700 dark:text-gray-300 
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('Cancel', 'ሰርዝ')}
                </button>
                <button
                  type="submit"
                  disabled={uploading || (!selectedFile && !editingCategory)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white 
                           rounded-xl transition-all transform hover:scale-105
                           shadow-md hover:shadow-lg flex items-center space-x-2
                           disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>{t('Uploading...', 'በመጫን ላይ...')}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>{editingCategory ? t('Update', 'አዘምን') : t('Create', 'ፍጠር')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
