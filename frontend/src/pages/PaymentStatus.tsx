import { useEffect } from 'react';
import { CheckCircle, XCircle, Loader, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PaymentStatusProps {
  onNavigate: (page: string) => void;
  orderId?: string;
  status?: string;
}

export function PaymentStatus({ onNavigate, orderId, status }: PaymentStatusProps) {
  const { t } = useLanguage();

  useEffect(() => {
    // Auto redirect after 5 seconds on success
    if (status === 'success') {
      const timer = setTimeout(() => {
        onNavigate('orders');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, onNavigate]);

  const getStatusConfig = () => {
    if (status === 'success') {
      return {
        icon: <CheckCircle className="h-20 w-20 text-green-500" />,
        title: t('Payment Successful!', 'ክፍያ ተሳክቷል!'),
        message: t(
          'Your payment has been processed successfully.',
          'ክፍያዎ በተሳካ ሁኔታ ተከናውኗል።'
        ),
        buttonText: t('View Orders', 'ትዕዛዞችን ይመልከቱ'),
        buttonAction: () => onNavigate('orders'),
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800'
      };
    } else if (status === 'error' || status === 'failed') {
      return {
        icon: <XCircle className="h-20 w-20 text-red-500" />,
        title: t('Payment Failed', 'ክፍያ አልተሳካም'),
        message: t(
          'There was an error processing your payment. Please try again.',
          'ክፍያዎን በማስኬድ ላይ ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።'
        ),
        buttonText: t('Try Again', 'እንደገና ይሞክሩ'),
        buttonAction: () => onNavigate('cart'),
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800'
      };
    } else {
      return {
        icon: <Loader className="h-20 w-20 text-blue-500 animate-spin" />,
        title: t('Processing Payment', 'ክፍያ በማስኬድ ላይ'),
        message: t(
          'Please wait while we process your payment...',
          'እባክዎ ክፍያዎን በማስኬድ ላይ ሳለ ይጠብቁ...'
        ),
        buttonText: t('Back to Home', 'ወደ መነሻ ገጽ ይሂዱ'),
        buttonAction: () => onNavigate('home'),
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800'
      };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className={`max-w-md w-full ${config.bgColor} rounded-2xl shadow-xl p-8 border ${config.borderColor} text-center`}>
        
        {/* Icon */}
        <div className="mb-6">
          {config.icon}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {config.title}
        </h1>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {config.message}
        </p>

        {/* Order ID if available */}
        {orderId && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('Order ID', 'የትዕዛዝ መለያ')}
            </p>
            <p className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {orderId}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={config.buttonAction}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold
                     transition-all transform hover:scale-105 shadow-lg hover:shadow-xl
                     flex items-center justify-center space-x-2"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>{config.buttonText}</span>
          </button>

          <button
            onClick={() => onNavigate('shop')}
            className="w-full text-gray-600 hover:text-gray-700 dark:text-gray-400 
                     dark:hover:text-gray-300 text-sm transition-colors"
          >
            {t('Continue Shopping', 'ግዢ ይቀጥሉ')}
          </button>
        </div>

        {/* Auto-redirect message for success */}
        {status === 'success' && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            {t('Redirecting to orders in 5 seconds...', 'በ5 ሰከንዶች ውስጥ ወደ ትዕዛዞች በማዛወር ላይ...')}
          </p>
        )}
      </div>
    </div>
  );
}