import { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingCart, Star, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface Product {
  id: string;
  name: string;
  name_am: string | null;
  description: string | null;
  description_am: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  stock_quantity: number;
}

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
  const { t, language } = useLanguage();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const calculateDiscount = () => {
    if (!product || !product.compare_at_price || product.compare_at_price <= product.price) return 0;
    return Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('Product not found', 'ምርት አልተገኘም')}
          </h2>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            {t('Back to Shop', 'ወደ መደብር ተመለስ')}
          </button>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();
  const productName = language === 'am' && product.name_am ? product.name_am : product.name;
  const productDescription = language === 'am' && product.description_am ? product.description_am : product.description;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('shop')}
          className="text-green-600 hover:text-green-700 mb-6 flex items-center"
        >
          <span className="mr-2">←</span>
          {t('Back to Shop', 'ወደ መደብር ተመለስ')}
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={product.images[selectedImage] || 'https://via.placeholder.com/600'}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-md font-bold">
                    -{discount}%
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-gray-100 rounded-md overflow-hidden ${
                        selectedImage === index ? 'ring-2 ring-green-600' : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${productName} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{productName}</h1>

              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600 ml-2">(4.8) - 127 {t('reviews', 'ግምገማዎች')}</span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {product.price.toLocaleString()} {t('ETB', 'ብር')}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-xl text-gray-500 line-through">
                      {product.compare_at_price.toLocaleString()} {t('ETB', 'ብር')}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{productDescription}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  {t('Availability:', 'ተገኝነት:')}
                  <span className={`ml-2 font-semibold ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock_quantity > 0
                      ? t(`${product.stock_quantity} in stock`, `${product.stock_quantity} በእቃ ማስቀመጫ`)
                      : t('Out of stock', 'ከእቃ ወጥቷል')}
                  </span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Quantity', 'ብዛት')}
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="px-4 py-2 font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {t('Total:', 'ድምር:')} <span className="font-bold text-gray-900">{(product.price * quantity).toLocaleString()} {t('ETB', 'ብር')}</span>
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || addedToCart}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {addedToCart ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>{t('Added to Cart!', 'ወደ ጋሪ ታክሏል!')}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    <span>{t('Add to Cart', 'ወደ ጋሪ ጨምር')}</span>
                  </>
                )}
              </button>

              <div className="mt-6 border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('Product Features', 'የምርት ባህሪያት')}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                    {t('High Quality Materials', 'ከፍተኛ ጥራት ያላቸው ቁሳቁሶች')}
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                    {t('Fast Delivery', 'ፈጣን ማድረስ')}
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                    {t('Money Back Guarantee', 'ገንዘብ መመለሻ ዋስትና')}
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                    {t('Secure Payment', 'ደህንነቱ የተጠበቀ ክፍያ')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
