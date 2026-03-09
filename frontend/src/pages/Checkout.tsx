import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { TelebirrPaymentModal } from '../components/TelebirrPaymentModal';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector';
import { BankTransferInstructions } from '../components/BankTransferInstructions';
import { ChapaPayment } from '../components/ChapaPayment';
import { 
  ArrowLeft, 
  ShoppingBag,
  Truck,
  Shield,
  Clock,
  CheckCircle,
  Loader,
  Info
} from 'lucide-react';

interface CheckoutProps {
  onNavigate: (page: string, data?: any) => void;
}

export function Checkout({ onNavigate }: CheckoutProps) {
  const { items, totalAmount, clearCart } = useCart();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<'cod' | 'telebirr' | 'bank' | 'chapa'>('cod');
  const [depositAmount, setDepositAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [showTelebirrModal, setShowTelebirrModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    region: '',
    notes: '',
  });

  // Calculate deposit and remaining amounts (20% for COD)
  useEffect(() => {
    const deposit = totalAmount * 0.2;
    const remaining = totalAmount - deposit;
    setDepositAmount(deposit);
    setRemainingAmount(remaining);
  }, [totalAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTelebirrSuccess = () => {
    setShowTelebirrModal(false);
    clearCart();
    onNavigate('orders');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert(t('Please sign in', 'እባክዎ ይግቡ'));
      onNavigate('login');
      return;
    }

    if (items.length === 0) {
      alert(t('Cart is empty', 'ጋሪ ባዶ ነው'));
      return;
    }

    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.region) {
      alert(t('Please fill all shipping information', 'እባክዎ ሁሉንም የማድረስ መረጃ ይሙሉ'));
      return;
    }

    setLoading(true);

    try {
      // Map payment method to backend enum
      const paymentMethodMap = {
        cod: 'cash_on_delivery',
        telebirr: 'telebirr',
        bank: 'bank_transfer',
        chapa: 'chapa'
      };

      const isCOD = paymentType === 'cod';

      // Prepare order items
      const orderItems = items.map(item => ({
        product_id: typeof item.productId === 'string' ? item.productId : item.productId._id,
        quantity: item.quantity,
        product: {
          name: item.productSnapshot.name,
          price: item.productSnapshot.price
        }
      }));

      // Create order data
      const orderData = {
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          region: formData.region,
        },
        paymentMethod: paymentMethodMap[paymentType],
        paymentStatus: isCOD ? 'partial' : 'pending',
        totalAmount: totalAmount,
        amountPaid: isCOD ? depositAmount : 0,
        remainingAmount: isCOD ? remainingAmount : 0,
        notes: formData.notes || '',
        items: orderItems,
        userId: user._id
      };

      console.log('📝 Creating order:', orderData);

      // Create the order
      const order = await orderService.createOrder(orderData);
      console.log('✅ Order created:', order);

      // Handle payment based on type
      if (isCOD) {
        // Cash on Delivery - just show success
        await clearCart();
        alert(t(
          `Order placed! Pay ${depositAmount.toLocaleString()} ETB on delivery. Order #: ${order.orderNumber}`,
          `ትዕዛዝ ተሳክቷል! ${depositAmount.toLocaleString()} ብር ሲቀበሉ ይክፈሉ። ትዕዛዝ ቁጥር: ${order.orderNumber}`
        ));
        onNavigate('orders');
      } 
      else if (paymentType === 'telebirr') {
        // Store order and show Telebirr modal
        setCurrentOrder(order);
        setShowTelebirrModal(true);
        // Don't clear cart yet - wait for payment success
      }
      else if (paymentType === 'chapa') {
        // Store order for Chapa payment
        setCurrentOrder(order);
      }
      else if (paymentType === 'bank') {
        // Store order for bank transfer
        setCurrentOrder(order);
      }

    } catch (error: any) {
      console.error('❌ Error:', error);
      console.error('❌ Response:', error.response?.data);
      alert(error.response?.data?.message || t('Failed to place order', 'ትዕዛዝ ማስቀመጥ አልተሳካም'));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('Your cart is empty', 'የእርስዎ ጋሪ ባዶ ነው')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('Add some products to your cart to continue', 'ለመቀጠል አንዳንድ ምርቶችን ወደ ጋሪዎ ያክሉ')}
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold
                     transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {t('Start Shopping', 'ግዢ ይጀምሩ')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => onNavigate('cart')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 
                       transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              {t('Back to Cart', 'ወደ ጋሪ ተመለስ')}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {items.length} {items.length === 1 ? t('item', 'እቃ') : t('items', 'እቃዎች')}
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            {t('Checkout', 'ክፍያ')}
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Shipping Information & Payment Method */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Shipping Information */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
                      <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    {t('Shipping Information', 'የማድረስ መረጃ')}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Full Name', 'ሙሉ ስም')} *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                                 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 transition-all duration-300"
                        placeholder={t('John Doe', 'ጆን ዶ')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Email', 'ኢሜይል')} *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                                 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="john@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Phone', 'ስልክ')} *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                                 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="+251 91 234 5678"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Address', 'አድራሻ')} *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                                 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={t('Street address, building name', 'የመንገድ አድራሻ፣ የህንፃ ስም')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('City', 'ከተማ')} *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                                 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={t('Addis Ababa', 'አዲስ አበባ')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Region', 'ክልል')} *
                      </label>
                      <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                                 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={t('Addis Ababa', 'አዲስ አበባ')}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <PaymentMethodSelector
                  selectedMethod={paymentType}
                  onSelect={setPaymentType}
                  depositAmount={depositAmount}
                  totalAmount={totalAmount}
                />

                {/* Order Notes */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('Order Notes (Optional)', 'የትዕዛዝ ማስታወሻዎች (አማራጭ)')}
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                             rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             resize-none transition-all duration-300"
                    placeholder={t('Special instructions for delivery...', 'ለማድረስ ልዩ መመሪያዎች...')}
                  />
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
                  
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
                      <ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    {t('Order Summary', 'የትዕዛዝ ማጠቃለያ')}
                  </h2>
                  
                  {/* Items List */}
                  <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item._id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.productSnapshot.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('Qty', 'ብዛት')}: {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {(item.productSnapshot.price * item.quantity).toLocaleString()} ETB
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('Subtotal', 'ንዑስ ድምር')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{totalAmount.toLocaleString()} ETB</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('Shipping', 'ማድረስ')}</span>
                      <span className="text-green-600 font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t('Free', 'ነጻ')}
                      </span>
                    </div>

                    {paymentType === 'cod' && (
                      <>
                        <div className="flex justify-between text-sm text-indigo-600">
                          <span>{t('Deposit (20%)', 'ቅድመ ክፍያ (20%)')}</span>
                          <span className="font-bold">{depositAmount.toLocaleString()} ETB</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{t('Remaining on Delivery', 'ሲቀበሉ የሚከፈል')}</span>
                          <span>{remainingAmount.toLocaleString()} ETB</span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white">
                        {paymentType === 'cod' ? t('Due Now', 'አሁን የሚከፈል') : t('Total', 'ድምር')}
                      </span>
                      <span className="text-indigo-600">
                        {paymentType === 'cod' ? depositAmount.toLocaleString() : totalAmount.toLocaleString()} ETB
                      </span>
                    </div>
                  </div>

                  {/* Free Delivery Message */}
                  {totalAmount > 1000 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 mt-6 text-center border border-amber-200 dark:border-amber-800">
                      <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center justify-center">
                        <span className="text-2xl mr-2">🎉</span>
                        {t('Free delivery!', 'ነጻ ማድረስ!')}
                      </span>
                    </div>
                  )}

                  {/* Place Order Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 
                             hover:from-indigo-700 hover:to-indigo-800 text-white 
                             py-4 rounded-xl font-semibold mt-6
                             disabled:bg-gray-400 disabled:cursor-not-allowed 
                             disabled:from-gray-400 disabled:to-gray-400
                             flex items-center justify-center space-x-2
                             transition-all transform hover:scale-105 
                             disabled:transform-none shadow-lg hover:shadow-xl
                             relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>{t('Processing...', 'በማስኬድ ላይ...')}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-5 w-5" />
                        <span>{t('Place Order', 'ትዕዛዝ ያድርጉ')}</span>
                      </>
                    )}
                  </button>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="group">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                          <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('Secure', 'ደህንነቱ የተጠበቀ')}
                        </p>
                      </div>
                      <div className="group">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                          <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('Fast', 'ፈጣን')}
                        </p>
                      </div>
                      <div className="group">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                          <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('Guaranteed', 'የተረጋገጠ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Telebirr Payment Modal */}
      {currentOrder && showTelebirrModal && (
        <TelebirrPaymentModal
          isOpen={showTelebirrModal}
          onClose={() => {
            setShowTelebirrModal(false);
            onNavigate('orders');
          }}
          amount={totalAmount}
          orderId={currentOrder._id}
          customerName={formData.fullName}
          customerPhone={formData.phone}
          customerEmail={formData.email}
          onSuccess={handleTelebirrSuccess}
        />
      )}

      {/* Chapa Payment Modal */}
      {currentOrder && paymentType === 'chapa' && !showTelebirrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="max-w-lg w-full my-8">
            <ChapaPayment
              amount={totalAmount}
              email={formData.email}
              firstName={formData.fullName.split(' ')[0]}
              lastName={formData.fullName.split(' ').slice(1).join(' ')}
              orderNumber={currentOrder.orderNumber}
              onSuccess={() => {
                clearCart();
                onNavigate('orders');
              }}
              onError={(error) => {
                console.error('Chapa error:', error);
              }}
            />
          </div>
        </div>
      )}

      {/* Bank Transfer Instructions Modal */}
      {currentOrder && paymentType === 'bank' && !showTelebirrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="max-w-2xl w-full my-8">
            <BankTransferInstructions
              amount={totalAmount}
              orderNumber={currentOrder.orderNumber}
              onComplete={() => {
                clearCart();
                onNavigate('orders');
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}