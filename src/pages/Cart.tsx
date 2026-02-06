import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface CartProps {
  onNavigate: (page: string) => void;
}

export function Cart({ onNavigate }: CartProps) {
  const { items, updateQuantity, removeFromCart, totalAmount, loading } = useCart();
  const { t, language } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('Your cart is empty', 'የእርስዎ ጋሪ ባዶ ነው')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('Add some products to get started', 'ለመጀመር አንዳንድ ምርቶችን ያክሉ')}
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('Start Shopping', 'ግዢ ይጀምሩ')}
          </button>
        </div>
      </div>
    );
  }

  const getProductName = (item: any) => {
    return language === 'am' && item.product.name_am ? item.product.name_am : item.product.name;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('Shopping Cart', 'የግዢ ጋሪ')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={item.product.images[0] || 'https://via.placeholder.com/200'}
                    alt={getProductName(item)}
                    className="w-full sm:w-32 h-32 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {getProductName(item)}
                    </h3>
                    <p className="text-xl font-bold text-green-600 mb-4">
                      {item.product.price.toLocaleString()} {t('ETB', 'ብር')}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          disabled={item.quantity >= item.product.stock_quantity}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                      >
                        <Trash2 className="h-5 w-5" />
                        <span>{t('Remove', 'አስወግድ')}</span>
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">{t('Subtotal', 'ንዑስ ድምር')}</p>
                    <p className="text-xl font-bold text-gray-900">
                      {(item.product.price * item.quantity).toLocaleString()} {t('ETB', 'ብር')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t('Order Summary', 'የትዕዛዝ ማጠቃለያ')}
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{t('Subtotal', 'ንዑስ ድምር')}</span>
                  <span>{totalAmount.toLocaleString()} {t('ETB', 'ብር')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('Shipping', 'ማድረስ')}</span>
                  <span>{t('Free', 'ነጻ')}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>{t('Total', 'ድምር')}</span>
                  <span>{totalAmount.toLocaleString()} {t('ETB', 'ብር')}</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('checkout')}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105"
              >
                {t('Proceed to Checkout', 'ወደ ክፍያ ይቀጥሉ')}
              </button>
              <button
                onClick={() => onNavigate('shop')}
                className="w-full mt-3 border border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                {t('Continue Shopping', 'ግዢ ይቀጥሉ')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
