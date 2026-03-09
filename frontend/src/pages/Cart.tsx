import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard, Smartphone, Landmark, AlertCircle, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { CartItem } from '../services/cartService';
import { useState } from 'react';

interface CartProps {
  onNavigate: (page: string, data?: any) => void;
}

export function Cart({ onNavigate }: CartProps) {
  const { items, updateQuantity, removeFromCart, totalAmount, loading, refetchCart } = useCart();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedPaymentType, setSelectedPaymentType] = useState<'cod' | 'telebirr' | 'bank' | 'chapa'>('cod');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Calculate 20% deposit amount for COD
  const depositAmount = totalAmount * 0.2;
  const remainingAmount = totalAmount - depositAmount;

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    return imagePath;
  };

  const getProductName = (item: CartItem) => {
    if (typeof item.productId === 'object' && item.productId !== null) {
      return language === 'am' && (item.productId as any).nameAm 
        ? (item.productId as any).nameAm 
        : (item.productId as any).name;
    }
    return language === 'am' && item.productSnapshot.nameAm 
      ? item.productSnapshot.nameAm 
      : item.productSnapshot.name;
  };

  const getProductImage = (item: CartItem) => {
    let imagePath = '';
    
    if (typeof item.productId === 'object' && item.productId !== null) {
      imagePath = (item.productId as any).images?.[0] || item.productSnapshot.images[0];
    } else {
      imagePath = item.productSnapshot.images[0];
    }
    
    return getImageUrl(imagePath);
  };

  const getProductPrice = (item: CartItem) => {
    if (typeof item.productId === 'object' && item.productId !== null) {
      return (item.productId as any).price;
    }
    return item.productSnapshot.price;
  };

  const getStockQuantity = (item: CartItem) => {
    if (typeof item.productId === 'object' && item.productId !== null) {
      return (item.productId as any).stockQuantity || 999;
    }
    return 999;
  };

  // FIXED: Get a unique identifier for the cart item
  const getItemUniqueId = (item: CartItem, index: number): string => {
    // Use _id if available, otherwise create a composite key
    if (item._id) return item._id;
    if (item.id) return item.id;
    
    // Create a composite key using product ID and index as fallback
    const productId = typeof item.productId === 'object' && item.productId !== null
      ? (item.productId as any)._id || JSON.stringify(item.productId)
      : item.productId as string;
    
    return `${productId}-${index}`;
  };

  // FIXED: Get product ID from cart item
  const getProductIdFromItem = (item: CartItem): string => {
    if (typeof item.productId === 'object' && item.productId !== null) {
      return (item.productId as any)._id || '';
    }
    return item.productId as string;
  };

  // Handle quantity update
  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const itemId = getItemUniqueId(item, 0); // We'll use index in the map function
    const productId = getProductIdFromItem(item);
    
    if (!productId) {
      console.error('Could not determine product ID');
      return;
    }
    
    try {
      setProcessingId(itemId);
      console.log(`Updating quantity for product ${productId} to ${newQuantity}`);
      await updateQuantity(productId, newQuantity);
      await refetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert(t('Failed to update quantity', 'ብዛት ማዘመን አልተሳካም'));
    } finally {
      setProcessingId(null);
    }
  };

  // Handle remove from cart
  const handleRemoveFromCart = async (item: CartItem) => {
    if (!confirm(t('Are you sure you want to remove this item?', 'ይህን እቃ ማስወገድ እንደሚፈልጉ እርግጠኛ ነዎት?'))) {
      return;
    }
    
    const itemId = getItemUniqueId(item, 0);
    const productId = getProductIdFromItem(item);
    
    if (!productId) {
      console.error('Could not determine product ID');
      return;
    }
    
    try {
      setProcessingId(itemId);
      console.log(`Removing product ${productId} from cart`);
      await removeFromCart(productId);
      await refetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      alert(t('Failed to remove item', 'እቃውን ማስወገድ አልተሳካም'));
    } finally {
      setProcessingId(null);
    }
  };

  // Handle payment processing
  const handleProceedToCheckout = async () => {
    if (items.length === 0) {
      alert(t('Your cart is empty', 'የእርስዎ ጋሪ ባዶ ነው'));
      return;
    }

    setPaymentProcessing(true);

    try {
      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          productId: getProductIdFromItem(item),
          quantity: item.quantity,
          name: getProductName(item),
          price: getProductPrice(item)
        })),
        totalAmount,
        paymentType: selectedPaymentType,
        depositAmount: selectedPaymentType === 'cod' ? depositAmount : totalAmount,
        remainingAmount: selectedPaymentType === 'cod' ? remainingAmount : 0,
        orderNotes
      };

      onNavigate('checkout', orderData);
    } catch (error) {
      console.error('Error processing checkout:', error);
      alert(t('Failed to process checkout', 'ቼክአውት ማስኬድ አልተሳካም'));
    } finally {
      setPaymentProcessing(false);
    }
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-700">
            <ShoppingBag className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {t('Your cart is empty', 'የእርስዎ ጋሪ ባዶ ነው')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('Add some products to get started', 'ለመጀመር አንዳንድ ምርቶችን ያክሉ')}
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 
                     text-white px-8 py-3 rounded-xl font-medium transition-all 
                     transform hover:scale-105 shadow-lg hover:shadow-xl
                     focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                     dark:focus:ring-offset-gray-900"
          >
            {t('Start Shopping', 'ግዢ ይጀምሩ')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('shop')}
            className="group flex items-center text-gray-600 dark:text-gray-400 
                     hover:text-indigo-600 dark:hover:text-indigo-400 
                     transition-colors px-4 py-2 rounded-lg
                     hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t('Continue Shopping', 'ግዢ ይቀጥሉ')}
          </button>
          
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {t('Shopping Cart', 'የግዢ ጋሪ')}
            </h1>
            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 
                           px-4 py-2 rounded-full text-sm font-medium">
              {items.length} {items.length === 1 ? t('item', 'እቃ') : t('items', 'እቃዎች')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => {
              const productName = getProductName(item);
              const productImage = getProductImage(item);
              const productPrice = getProductPrice(item);
              const stockQuantity = getStockQuantity(item);
              const subtotal = productPrice * item.quantity;
              const itemUniqueId = getItemUniqueId(item, index);
              const isProcessing = processingId === itemUniqueId;

              return (
                <div 
                  key={itemUniqueId} 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 
                           border border-gray-100 dark:border-gray-700
                           hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    
                    {/* Product Image */}
                    <div className="relative w-full sm:w-32 h-32 flex-shrink-0">
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-full h-full object-cover rounded-xl bg-gray-100 dark:bg-gray-700"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400';
                        }}
                      />
                      {item.quantity > 1 && (
                        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white 
                                       text-xs font-bold rounded-full h-6 w-6 
                                       flex items-center justify-center shadow-lg">
                          {item.quantity}
                        </span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 
                                       line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 
                                       transition-colors">
                            {productName}
                          </h3>
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                            {productPrice.toLocaleString()} 
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                              {t('ETB', 'ብር')}
                            </span>
                          </p>
                        </div>
                        
                        {/* Subtotal - Desktop */}
                        <div className="hidden sm:block text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {t('Subtotal', 'ንዑስ ድምር')}
                          </p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {subtotal.toLocaleString()} 
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                              {t('ETB', 'ብር')}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls and Remove Button - FIXED */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t('Quantity:', 'ብዛት:')}
                          </span>
                          <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 
                                        rounded-xl overflow-hidden">
                            <button
                              onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isProcessing}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                                       transition-colors text-gray-600 dark:text-gray-400
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       border-r border-gray-200 dark:border-gray-700"
                              aria-label={t('Decrease quantity', 'ብዛት ቀንስ')}
                            >
                              {isProcessing ? (
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Minus className="h-4 w-4" />
                              )}
                            </button>
                            <span className="px-4 py-2 font-semibold text-gray-900 dark:text-white 
                                         bg-gray-50 dark:bg-gray-700 min-w-[48px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                              disabled={item.quantity >= stockQuantity || isProcessing}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                                       transition-colors text-gray-600 dark:text-gray-400
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       border-l border-gray-200 dark:border-gray-700"
                              aria-label={t('Increase quantity', 'ብዛት ጨምር')}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {/* Low stock warning */}
                          {stockQuantity < 10 && stockQuantity > 0 && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                              {language === 'am' 
                                ? `${stockQuantity} ብቻ ቀርቷል` 
                                : `Only ${stockQuantity} left`}
                            </span>
                          )}
                        </div>

                        {/* Remove Button - FIXED */}
                        <button
                          onClick={() => handleRemoveFromCart(item)}
                          disabled={isProcessing}
                          className="flex items-center justify-center space-x-2 
                                   text-red-600 dark:text-red-400 
                                   hover:text-red-700 dark:hover:text-red-300 
                                   transition-colors px-4 py-2 rounded-xl
                                   hover:bg-red-50 dark:hover:bg-red-900/20
                                   focus:ring-2 focus:ring-red-500 focus:ring-offset-2 
                                   dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                          <span className="text-sm font-medium">
                            {t('Remove', 'አስወግድ')}
                          </span>
                        </button>
                      </div>

                      {/* Subtotal - Mobile */}
                      <div className="sm:hidden flex justify-between items-center mt-4 pt-4 
                                    border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('Subtotal', 'ንዑስ ድምር')}
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {subtotal.toLocaleString()} 
                          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                            {t('ETB', 'ብር')}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Order Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 
                          border border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('Order Notes (Optional)', 'የትዕዛዝ ማስታወሻዎች (አማራጭ)')}
              </label>
              <textarea
                rows={3}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                placeholder={t('Special instructions for your order...', 'ለትዕዛዝዎ ልዩ መመሪያዎች...')}
              />
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 
                          border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('Payment Method', 'የክፍያ መንገድ')}
              </h3>
              
              <div className="space-y-3">
                {/* Cash on Delivery - 20% Deposit */}
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer 
                                transition-all duration-300 hover:border-indigo-500
                                ${selectedPaymentType === 'cod' 
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                                  : 'border-gray-200 dark:border-gray-700'}`}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="cod"
                    checked={selectedPaymentType === 'cod'}
                    onChange={() => setSelectedPaymentType('cod')}
                    className="mr-3 h-4 w-4 text-indigo-600"
                  />
                  <div className="flex items-center flex-1">
                    <Landmark className={`h-5 w-5 mr-3 ${selectedPaymentType === 'cod' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {t('Cash on Delivery - 20% Deposit', 'በአደራ ላይ ጥሬ ገንዘብ - 20% ቅድመ ክፍያ')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('Pay 20% now, 80% on delivery', '20% አሁን ይክፈሉ፣ 80% ሲቀበሉ')}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="font-bold text-indigo-600 block">
                        {depositAmount.toLocaleString()} {t('ETB', 'ብር')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {t('20% deposit', '20% ቅድመ ክፍያ')}
                      </span>
                    </div>
                  </div>
                </label>

                {/* Chapa - Full Payment */}
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer 
                                transition-all duration-300 hover:border-indigo-500
                                ${selectedPaymentType === 'chapa' 
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                                  : 'border-gray-200 dark:border-gray-700'}`}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="chapa"
                    checked={selectedPaymentType === 'chapa'}
                    onChange={() => setSelectedPaymentType('chapa')}
                    className="mr-3 h-4 w-4 text-indigo-600"
                  />
                  <div className="flex items-center flex-1">
                    <CreditCard className={`h-5 w-5 mr-3 ${selectedPaymentType === 'chapa' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {t('Chapa - Full Payment', 'ቻፓ - ሙሉ ክፍያ')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('Pay via Chapa (Credit/Debit Card, Bank Transfer)', 'በቻፓ ይክፈሉ (ካርድ፣ የባንክ ዝውውር)')}
                      </p>
                    </div>
                    <span className="ml-auto font-bold text-indigo-600">
                      {totalAmount.toLocaleString()} {t('ETB', 'ብር')}
                    </span>
                  </div>
                </label>

                {/* Telebirr - Full Payment */}
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer 
                                transition-all duration-300 hover:border-indigo-500
                                ${selectedPaymentType === 'telebirr' 
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                                  : 'border-gray-200 dark:border-gray-700'}`}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="telebirr"
                    checked={selectedPaymentType === 'telebirr'}
                    onChange={() => setSelectedPaymentType('telebirr')}
                    className="mr-3 h-4 w-4 text-indigo-600"
                  />
                  <div className="flex items-center flex-1">
                    <Smartphone className={`h-5 w-5 mr-3 ${selectedPaymentType === 'telebirr' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {t('Telebirr - Full Payment', 'ቴሌብር - ሙሉ ክፍያ')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('Pay via Telebirr mobile money', 'በቴሌብር የሞባይል ገንዘብ ይክፈሉ')}
                      </p>
                    </div>
                    <span className="ml-auto font-bold text-indigo-600">
                      {totalAmount.toLocaleString()} {t('ETB', 'ብር')}
                    </span>
                  </div>
                </label>

                {/* Bank Transfer - Full Payment */}
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer 
                                transition-all duration-300 hover:border-indigo-500
                                ${selectedPaymentType === 'bank' 
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                                  : 'border-gray-200 dark:border-gray-700'}`}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="bank"
                    checked={selectedPaymentType === 'bank'}
                    onChange={() => setSelectedPaymentType('bank')}
                    className="mr-3 h-4 w-4 text-indigo-600"
                  />
                  <div className="flex items-center flex-1">
                    <Landmark className={`h-5 w-5 mr-3 ${selectedPaymentType === 'bank' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {t('Bank Transfer - Full Payment', 'የባንክ ዝውውር - ሙሉ ክፍያ')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('Pay via bank transfer', 'በባንክ ዝውውር ይክፈሉ')}
                      </p>
                    </div>
                    <span className="ml-auto font-bold text-indigo-600">
                      {totalAmount.toLocaleString()} {t('ETB', 'ብር')}
                    </span>
                  </div>
                </label>
              </div>

              {/* Payment Info Boxes */}
              {selectedPaymentType === 'cod' && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        {t('Deposit Information', 'የቅድመ ክፍያ መረጃ')}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        {t('You will pay 20% deposit now. The remaining 80% will be paid upon delivery.', 
                           '20% ቅድመ ክፍያ አሁን ይከፍላሉ። ቀሪው 80% ሲቀበሉ ይከፍላሉ።')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedPaymentType === 'chapa' && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        {t('Chapa Payment', 'የቻፓ ክፍያ')}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        {t('You will be redirected to Chapa to complete your payment securely.', 
                           'ክፍያዎን ለማጠናቀቅ ወደ ቻፓ ይዛወራሉ።')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(selectedPaymentType === 'telebirr' || selectedPaymentType === 'bank') && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                        {t('Payment Instructions', 'የክፍያ መመሪያዎች')}
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">
                        {selectedPaymentType === 'telebirr' 
                          ? t('You will receive a payment request on your Telebirr app.', 'በቴሌብር አፕሊኬሽንዎ ላይ የክፍያ ጥያቄ ይደርስዎታል።')
                          : t('Our bank details will be provided after order confirmation.', 'ትዕዛዝዎ ከተረጋገጠ በኋላ የባንክ መረጃ ይሰጥዎታል።')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-24 
                          border border-gray-100 dark:border-gray-700">
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 
                           flex items-center">
                <span className="bg-indigo-100 dark:bg-indigo-900/30 w-8 h-8 rounded-xl 
                               flex items-center justify-center mr-3">
                  <ShoppingBag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </span>
                {t('Order Summary', 'የትዕዛዝ ማጠቃለያ')}
              </h2>
              
              <div className="space-y-4 mb-6">
                {/* Item Count */}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('Items', 'እቃዎች')}</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {items.length} {items.length === 1 ? t('item', 'እቃ') : t('items', 'እቃዎች')}
                  </span>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('Subtotal', 'ንዑስ ድምር')}</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {totalAmount.toLocaleString()} 
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                      {t('ETB', 'ብር')}
                    </span>
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('Shipping', 'ማድረስ')}</span>
                  <span className="text-green-600 dark:text-green-400 font-medium 
                                 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-sm">
                    {t('Free', 'ነጻ')}
                  </span>
                </div>

                {/* Estimated Tax */}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('Estimated Tax', 'ግምታዊ ቀረጥ')}</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    0.00 
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                      {t('ETB', 'ብር')}
                    </span>
                  </span>
                </div>

                {/* Deposit Amount (for COD) */}
                {selectedPaymentType === 'cod' && (
                  <>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{t('Deposit (20%)', 'ቅድመ ክፍያ (20%)')}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {depositAmount.toLocaleString()} {t('ETB', 'ብር')}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>{t('Remaining on delivery', 'ቀሪ ሲቀበሉ')}</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {remainingAmount.toLocaleString()} {t('ETB', 'ብር')}
                      </span>
                    </div>
                  </>
                )}

                {/* Total - Shows based on payment method */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 
                              flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">
                    {selectedPaymentType === 'cod' ? t('Due Now', 'አሁን የሚከፈል') : t('Total', 'ድምር')}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {selectedPaymentType === 'cod' 
                      ? depositAmount.toLocaleString()
                      : totalAmount.toLocaleString()} 
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                      {t('ETB', 'ብር')}
                    </span>
                  </span>
                </div>

                {/* Free Delivery Message */}
                {totalAmount > 1000 && (
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 
                                dark:from-amber-900/20 dark:to-amber-800/20 
                                rounded-xl p-4 mt-2 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-400 font-medium flex items-center">
                      <span className="text-2xl mr-2">🎉</span>
                      {t('You get free delivery!', 'ነጻ ማድረስ አግኝተዋል!')}
                    </p>
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                disabled={paymentProcessing || items.length === 0}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 
                         hover:from-indigo-700 hover:to-indigo-800
                         text-white py-4 rounded-xl font-semibold text-lg
                         transition-all duration-500 transform hover:scale-105 
                         shadow-lg hover:shadow-xl relative overflow-hidden
                         focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                         dark:focus:ring-offset-gray-800 group
                         disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-400 
                         disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                {paymentProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>{t('Processing...', 'በማስኬድ ላይ...')}</span>
                  </div>
                ) : (
                  t('Proceed to Checkout', 'ወደ ክፍያ ይቀጥሉ')
                )}
              </button>

              {/* Continue Shopping Link */}
              <button
                onClick={() => onNavigate('shop')}
                className="w-full mt-4 text-gray-600 dark:text-gray-400 
                         hover:text-indigo-600 dark:hover:text-indigo-400 
                         transition-colors text-sm font-medium
                         flex items-center justify-center space-x-2"
              >
                <span>←</span>
                <span>{t('Continue Shopping', 'ግዢ ይቀጥሉ')}</span>
              </button>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center mb-3">
                  {t('We accept:', 'እንቀበላለን:')}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Smartphone className="h-5 w-5 text-indigo-600 mb-1" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {t('Telebirr', 'ቴሌብር')}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-600 mb-1" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {t('Chapa', 'ቻፓ')}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Landmark className="h-5 w-5 text-amber-600 mb-1" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {t('Cash', 'ጥሬ')}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Landmark className="h-5 w-5 text-blue-600 mb-1" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {t('Bank', 'ባንክ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}