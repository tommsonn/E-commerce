import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { orderService, Order } from '../services/orderService';

interface OrdersProps {
  onNavigate: (page: string) => void;
}

export function Orders({ onNavigate }: OrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await orderService.getUserOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      default:
        return <Package className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: { en: string; am: string } } = {
      pending: { en: 'Pending', am: 'በመጠባበቅ ላይ' },
      processing: { en: 'Processing', am: 'በማቀድ ላይ' },
      shipped: { en: 'Shipped', am: 'ተልኳል' },
      delivered: { en: 'Delivered', am: 'ደርሷል' },
      cancelled: { en: 'Cancelled', am: 'ተሰርዟል' },
    };
    return t(statusMap[status]?.en || status, statusMap[status]?.am || status);
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap: { [key: string]: { en: string; am: string } } = {
      cash_on_delivery: { en: 'Cash on Delivery', am: 'በአደራ ላይ ጥሬ ገንዘብ' },
      telebirr: { en: 'Telebirr', am: 'ቴሌብር' },
      bank_transfer: { en: 'Bank Transfer', am: 'የባንክ ዝውውር' },
    };
    return t(methodMap[method]?.en || method, methodMap[method]?.am || method);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('Please sign in to view your orders', 'ትዕዛዞችዎን ለማየት እባክዎ ይግቡ')}
          </h2>
          <button
            onClick={() => onNavigate('login')}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 
                     text-white px-6 py-3 rounded-lg transition-colors 
                     focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                     dark:focus:ring-offset-gray-900"
          >
            {t('Sign In', 'ግባ')}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-500"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <Package className="h-24 w-24 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('No orders yet', 'ገና ምንም ትዕዛዞች የሉም')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('Start shopping to create your first order', 'የመጀመሪያ ትዕዛዝዎን ለመፍጠር ግዢ ይጀምሩ')}
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 
                     text-white px-6 py-3 rounded-lg transition-colors
                     focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                     dark:focus:ring-offset-gray-900"
          >
            {t('Start Shopping', 'ግዢ ይጀምሩ')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t('My Orders', 'ትዕዛዞቼ')}
        </h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order._id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 
                        border border-gray-100 dark:border-gray-700
                        hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('Order', 'ትዕዛዝ')} #{order.orderNumber}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('Placed on', 'ያደረጉበት')} {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {order.totalAmount.toLocaleString()} {t('ETB', 'ብር')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getPaymentMethodText(order.paymentMethod)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      {t('Payment Status', 'የክፍያ ሁኔታ')}
                    </p>
                    <p className={`font-medium ${
                      order.paymentStatus === 'paid' 
                        ? 'text-green-600 dark:text-green-400' 
                        : order.paymentStatus === 'pending'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {order.paymentStatus === 'paid'
                        ? t('Paid', 'ተከፍሏል')
                        : order.paymentStatus === 'pending'
                        ? t('Pending', 'በመጠባበቅ ላይ')
                        : t('Failed', 'አልተሳካም')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      {t('Order Status', 'የትዕዛዝ ሁኔታ')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getStatusText(order.status)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      {t('Payment Method', 'የክፍያ መንገድ')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getPaymentMethodText(order.paymentMethod)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}