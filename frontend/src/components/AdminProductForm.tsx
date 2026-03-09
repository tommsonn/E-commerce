import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, Plus, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { productService } from '../services/productService';

interface Category {
  _id: string;
  name: string;
  nameAm?: string;
  imageUrl?: string;
}

interface ProductFormData {
  name: string;
  nameAm: string;
  description: string;
  descriptionAm: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  categoryId: string;
  stockQuantity: number;
  isFeatured: boolean;
  isActive: boolean;
}

interface AdminProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories: Category[];
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export function AdminProductForm({ 
  initialData, 
  categories, 
  onSubmit, 
  onCancel,
  isEditing = false 
}: AdminProductFormProps) {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    nameAm: initialData?.nameAm || '',
    description: initialData?.description || '',
    descriptionAm: initialData?.descriptionAm || '',
    price: initialData?.price || 0,
    compareAtPrice: initialData?.compareAtPrice || null,
    images: initialData?.images || [],
    categoryId: initialData?.categoryId || '',
    stockQuantity: initialData?.stockQuantity || 0,
    isFeatured: initialData?.isFeatured || false,
    isActive: initialData?.isActive ?? true,
  });

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'price' || name === 'compareAtPrice' || name === 'stockQuantity') {
      setFormData({ ...formData, [name]: value === '' ? null : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(previewUrls[index]);
    
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleAddImageUrl = () => {
    if (imageUrl && imageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl.trim()]
      });
      setImageUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitFormData = new FormData();
      
      // Append all form fields
      submitFormData.append('name', formData.name);
      submitFormData.append('nameAm', formData.nameAm);
      submitFormData.append('description', formData.description);
      submitFormData.append('descriptionAm', formData.descriptionAm);
      submitFormData.append('price', formData.price.toString());
      if (formData.compareAtPrice) {
        submitFormData.append('compareAtPrice', formData.compareAtPrice.toString());
      }
      submitFormData.append('categoryId', formData.categoryId);
      submitFormData.append('stockQuantity', formData.stockQuantity.toString());
      submitFormData.append('isFeatured', formData.isFeatured.toString());
      submitFormData.append('isActive', formData.isActive.toString());
      
      // Append existing image URLs as JSON string
      if (formData.images.length > 0) {
        submitFormData.append('existingImages', JSON.stringify(formData.images));
      }
      
      // Append new image files
      selectedFiles.forEach(file => {
        submitFormData.append('images', file);
      });

      await onSubmit(submitFormData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('Basic Information', 'መሰረታዊ መረጃ')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* English Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Product Name (English)', 'የምርት ስም (እንግሊዝኛ)')} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Amharic Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Product Name (Amharic)', 'የምርት ስም (አማርኛ)')}
            </label>
            <input
              type="text"
              name="nameAm"
              value={formData.nameAm}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* English Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Description (English)', 'መግለጫ (እንግሊዝኛ)')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Amharic Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Description (Amharic)', 'መግለጫ (አማርኛ)')}
            </label>
            <textarea
              name="descriptionAm"
              value={formData.descriptionAm}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('Pricing & Stock', 'ዋጋ እና ክምችት')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Price (ETB)', 'ዋጋ (ብር)')} *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price || ''}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Compare at Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Compare at Price', 'የማነጻጸሪያ ዋጋ')}
            </label>
            <input
              type="number"
              name="compareAtPrice"
              value={formData.compareAtPrice || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Stock Quantity', 'የክምችት ብዛት')} *
            </label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity || ''}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Category & Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('Category & Status', 'ምድብ እና ሁኔታ')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category - FIXED: Now shows categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Category', 'ምድብ')} *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">{t('Select Category', 'ምድብ ይምረጡ')}</option>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {language === 'am' && category.nameAm ? category.nameAm : category.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {t('No categories available', 'ምንም ምድቦች የሉም')}
                </option>
              )}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                {t('Please create categories first', 'እባክዎ መጀመሪያ ምድቦችን ይፍጠሩ')}
              </p>
            )}
          </div>

          {/* Status Toggles */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('Active (Visible in store)', 'ንቁ (በመደብር ውስጥ ይታያል)')}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('Featured (Show on homepage)', 'ተለይቶ የቀረበ (በመነሻ ገጽ ላይ ይታያል)')}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Product Images - FIXED: Added file upload */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('Product Images', 'የምርት ምስሎች')}
        </h3>
        
        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('Upload Images', 'ምስሎችን ያስገቡ')}
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                       rounded-md transition-colors flex items-center space-x-2"
            >
              <Upload className="h-5 w-5" />
              <span>{t('Choose Files', 'ፋይሎችን ይምረጡ')}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedFiles.length} {t('files selected', 'ፋይሎች ተመርጠዋል')}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t('Max 5 images, 5MB each. Supported formats: JPG, PNG, GIF, WEBP', 
               'ቢበዛ 5 ምስሎች፣ እያንዳንዱ 5ሜባ። የሚደገፉ ቅርጸቶች፡ JPG, PNG, GIF, WEBP')}
          </p>
        </div>

        {/* Image URL Input (Alternative) */}
        <div className="flex gap-2 mb-6">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder={t('Or enter image URL', 'ወይም የምስል አድራሻ ያስገቡ')}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                     rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAddImageUrl}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white 
                     rounded-md transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>{t('Add URL', 'አድራሻ ጨምር')}</span>
          </button>
        </div>

        {/* Image Preview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* New file upload previews */}
          {previewUrls.map((url, index) => (
            <div key={`new-${index}`} className="relative group">
              <img
                src={url}
                alt={`New product ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border-2 border-green-500"
              />
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white 
                         rounded-full p-1 opacity-0 group-hover:opacity-100 
                         transition-opacity hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <span className="absolute bottom-1 left-1 bg-green-600 text-white 
                           text-xs px-2 py-1 rounded-full">
                {t('New', 'አዲስ')}
              </span>
            </div>
          ))}

          {/* Existing images */}
          {formData.images.map((image, index) => (
            <div key={`existing-${index}`} className="relative group">
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <button
                type="button"
                onClick={() => handleRemoveExistingImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white 
                         rounded-full p-1 opacity-0 group-hover:opacity-100 
                         transition-opacity hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-green-600 text-white 
                             text-xs px-2 py-1 rounded-full">
                  {t('Main', 'ዋና')}
                </span>
              )}
            </div>
          ))}

          {/* Empty state */}
          {formData.images.length === 0 && previewUrls.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center 
                          h-32 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 
                          border-dashed border-gray-300 dark:border-gray-600">
              <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('No images added', 'ምንም ምስሎች አልተጨመሩም')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 
                   rounded-md text-gray-700 dark:text-gray-300 
                   hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {t('Cancel', 'ሰርዝ')}
        </button>
        <button
          type="submit"
          disabled={loading || categories.length === 0}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white 
                   rounded-md transition-colors disabled:bg-gray-400 
                   disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{t('Saving...', 'በማስቀመጥ ላይ...')}</span>
            </>
          ) : (
            <span>{isEditing ? t('Update Product', 'ምርት አዘምን') : t('Create Product', 'ምርት ፍጠር')}</span>
          )}
        </button>
      </div>

      {/* Warning if no categories */}
      {categories.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-700 dark:text-yellow-400 text-sm">
            {t('You need to create categories before adding products.', 
               'ምርቶችን ከመጨመርዎ በፊት ምድቦችን መፍጠር ያስፈልጋል።')}
          </p>
        </div>
      )}
    </form>
  );
}