import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  onNavigate: (page: string) => void;
}

export function Checkout({ onNavigate }: CheckoutProps) {
  const { items, totalAmount, clearCart } = useCart();
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    address: '',
    city: '',
    region: '',
    paymentMethod: 'cash_on_delivery',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert(t('Please sign in to place an order', 'ትዕዛዝ ለማድረግ እባክዎ ይግቡ'));
      onNavigate('login');
      return;
    }

    if (items.length === 0) {
      alert(t('Your cart is empty', 'የእርስዎ ጋሪ ባዶ ነው'));
      return;
    }

    setLoading(true);

    try {
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            order_number: orderNumber,
            status: 'pending',
            total_amount: totalAmount,
            customer_name: formData.fullName,
            customer_email: formData.email,
            customer_phone: formData.phone,
            shipping_address: {
              address: formData.address,
              city: formData.city,
              region: formData.region,
            },
            payment_method: formData.paymentMethod,
            payment_status: 'pending',
            notes: formData.notes,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await clearCart();

      alert(t(
        `Order placed successfully! Your order number is ${orderNumber}`,
        `ትዕዛዝ በተሳካ ሁኔታ ተደርጓል! የትዕዛዝ ቁጥርዎ ${orderNumber} ነው`
      ));

      onNavigate('orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert(t('Failed to place order. Please try again.', 'ትዕዛዝ ማድረግ አልተሳካም። እባክዎ እንደገና ይሞክሩ።'));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('Your cart is empty', 'የእርስዎ ጋሪ ባዶ ነው')}
          </h2>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('Checkout', 'ክፍያ')}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('Shipping Information', 'የማድረስ መረጃ')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Full Name', 'ሙሉ ስም')} *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Phone Number', 'ስልክ ቁጥር')} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Email', 'ኢሜይል')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Address', 'አድራሻ')} *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder={t('Street address, building name, etc.', 'የመንገድ አድራሻ፣ የህንፃ ስም ወዘተ።')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('City', 'ከተማ')} *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Region', 'ክልል')} *
                    </label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('Payment Method', 'የክፍያ መንገድ')}
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">{t('Cash on Delivery', 'በአደራ ላይ ጥሬ ገንዘብ')}</p>
                      <p className="text-sm text-gray-600">{t('Pay when you receive', 'ሲቀበሉ ይክፈሉ')}</p>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="telebirr"
                      checked={formData.paymentMethod === 'telebirr'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">{t('Telebirr', 'ቴሌብር')}</p>
                      <p className="text-sm text-gray-600">{t('Pay with Telebirr', 'በቴሌብር ይክፈሉ')}</p>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">{t('Bank Transfer', 'የባንክ ዝውውር')}</p>
                      <p className="text-sm text-gray-600">{t('Transfer to our bank account', 'ወደ የባንክ ሂሳባችን ይዘዋወሩ')}</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Order Notes (Optional)', 'የትዕዛዝ ማስታወሻዎች (አማራጭ)')}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={t('Special instructions for delivery...', 'ለማድረስ ልዩ መመሪያዎች...')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {t('Order Summary', 'የትዕዛዝ ማጠቃለያ')}
                </h2>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.product.name} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        {(item.product.price * item.quantity).toLocaleString()} {t('ETB', 'ብር')}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between text-gray-600">
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
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? t('Processing...', 'በማስኬድ ላይ...') : t('Place Order', 'ትዕዛዝ ያድርጉ')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
