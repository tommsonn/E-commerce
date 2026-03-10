import { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingCart, Star, Check, ChevronLeft, Heart, Share2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { productService, Product } from '../services/productService';
import { getImageUrl } from '../utils/imageUtils';

interface ProductDetailProps {
  slug: string;
  onNavigate: (page: string, data?: any) => void;
}

export function ProductDetail({ slug, onNavigate }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { theme } = useTheme();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching product with slug:', slug);
      const data = await productService.getProductBySlug(slug);
      console.log('Product data received:', data);
      setProduct(data);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      setError(error.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product._id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart');
    }
  };

  const calculateDiscount = () => {
    if (!product || !product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  };

  if (loading) {
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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('Product not found', 'ምርት አልተገኘም')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || t('The product you are looking for does not exist.', 'የሚፈልጉት ምርት የለም።')}
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl 
                     transition-all duration-300 transform hover:scale-105"
          >
            {t('Back to Shop', 'ወደ መደብር ተመለስ')}
          </button>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();
  const productName = language === 'am' && product.nameAm ? product.nameAm : product.name;
  const productDescription = language === 'am' && product.descriptionAm 
    ? product.descriptionAm 
    : product.description || t('No description available', 'ምንም መግለጫ የለም');

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('shop')}
            className="group flex items-center text-gray-600 dark:text-gray-400 
                     hover:text-indigo-600 dark:hover:text-indigo-400 
                     transition-colors px-4 py-2 rounded-lg
                     hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
          >
            <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            {t('Back to Shop', 'ወደ መደብር ተመለስ')}
          </button>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 
                             dark:hover:text-indigo-400 hover:bg-indigo-50 
                             dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
              <Heart className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 
                             dark:hover:text-indigo-400 hover:bg-indigo-50 
                             dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Product Detail Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden 
                      border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-10">
            
            {/* Product Images Section */}
            <div>
              {/* Main Image */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-indigo-50 
                            dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden mb-4
                            border border-gray-100 dark:border-gray-700">
                <img
                  src={getImageUrl(images[selectedImage])}
                  alt={productName}
                  className="w-full h-full object-contain p-8"
                  onError={(e) => {
                    console.error('Image failed to load:', images[selectedImage]);
                    e.currentTarget.src = 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600';
                  }}
                />
                {discount > 0 && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 
                                text-white px-3 py-1.5 rounded-full text-sm font-bold
                                shadow-lg transform hover:scale-110 transition-transform">
                    -{discount}%
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-gray-100 dark:bg-gray-700 
                               rounded-xl overflow-hidden transition-all duration-300
                               border-2 ${selectedImage === index 
                                 ? 'border-indigo-600 dark:border-indigo-400 shadow-lg scale-105' 
                                 : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                               }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${productName} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="space-y-6">
              {/* Product Title & Rating */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {productName}
                </h1>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 ml-2 font-medium">
                      4.8
                    </span>
                  </div>
                  <span className="text-gray-400 dark:text-gray-600">•</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    127 {t('reviews', 'ግምገማዎች')}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-4">
                <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {product.price.toLocaleString()} 
                  <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-2">
                    {t('ETB', 'ብር')}
                  </span>
                </span>
                {product.compareAtPrice && (
                  <span className="text-xl text-gray-400 dark:text-gray-500 line-through">
                    {product.compareAtPrice.toLocaleString()} {t('ETB', 'ብር')}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {productDescription}
                </p>
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-3 py-4 border-y border-gray-100 dark:border-gray-700">
                <div className={`w-3 h-3 rounded-full ${
                  product.stockQuantity > 0 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-red-500'
                }`}></div>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{t('Availability:', 'ተገኝነት:')}</span>
                  <span className={`ml-2 font-semibold ${
                    product.stockQuantity > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {product.stockQuantity > 0
                      ? t(`${product.stockQuantity} in stock`, `${product.stockQuantity} በእቃ ማስቀመጫ`)
                      : t('Out of stock', 'ከእቃ ወጥቷል')}
                  </span>
                </p>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('Quantity', 'ብዛት')}
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 
                                rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 
                               transition-colors text-gray-600 dark:text-gray-400
                               disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="px-6 py-3 font-semibold text-gray-900 dark:text-white 
                                   bg-gray-50 dark:bg-gray-700 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 
                               transition-colors text-gray-600 dark:text-gray-400
                               disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity >= product.stockQuantity}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('Total:', 'ድምር:')} 
                    <span className="ml-2 text-indigo-600 dark:text-indigo-400">
                      {(product.price * quantity).toLocaleString()} {t('ETB', 'ብር')}
                    </span>
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0 || addedToCart}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 
                         hover:from-indigo-700 hover:to-indigo-800
                         dark:from-indigo-600 dark:to-indigo-700 
                         dark:hover:from-indigo-700 dark:hover:to-indigo-800
                         text-white py-4 rounded-xl font-semibold text-lg
                         transition-all duration-500 transform hover:scale-105 
                         disabled:from-gray-400 disabled:to-gray-400 
                         dark:disabled:from-gray-600 dark:disabled:to-gray-600
                         disabled:cursor-not-allowed disabled:transform-none 
                         flex items-center justify-center space-x-3
                         shadow-lg hover:shadow-xl relative overflow-hidden
                         group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                {addedToCart ? (
                  <>
                    <Check className="h-6 w-6" />
                    <span>{t('Added to Cart!', 'ወደ ጋሪ ታክሏል!')}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-6 w-6" />
                    <span>{t('Add to Cart', 'ወደ ጋሪ ጨምር')}</span>
                  </>
                )}
              </button>

              {/* Product Features */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('Product Features', 'የምርት ባህሪያት')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 
                                bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                    <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span>{t('High Quality Materials', 'ከፍተኛ ጥራት ያላቸው ቁሳቁሶች')}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 
                                bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                    <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span>{t('Fast Delivery', 'ፈጣን ማድረስ')}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 
                                bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                    <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span>{t('Money Back Guarantee', 'ገንዘብ መመለሻ ዋስትና')}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 
                                bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                    <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span>{t('Secure Payment', 'ደህንነቱ የተጠበቀ ክፍያ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            {t('You May Also Like', 'ሊወዷቸው የሚችሉ ምርቶች')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-md 
                         hover:shadow-xl transition-all duration-500 
                         hover:-translate-y-2 cursor-pointer
                         overflow-hidden border border-gray-100 dark:border-gray-700"
                onClick={() => onNavigate('shop')}
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                  <img
                    src="https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Related product"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">
                    {t('Product Name', 'የምርት ስም')}
                  </h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold">
                    2,500 {t('ETB', 'ብር')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}