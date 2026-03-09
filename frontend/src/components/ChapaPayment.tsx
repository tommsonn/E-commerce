import { useState } from 'react';
import { CreditCard, Smartphone, Landmark, Loader, CheckCircle, AlertCircle, ExternalLink, Copy } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { paymentService } from '../services/paymentService';

interface ChapaPaymentProps {
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  orderNumber: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function ChapaPayment({
  amount,
  email,
  firstName,
  lastName,
  orderNumber,
  onSuccess,
  onError
}: ChapaPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'bank' | 'telebirr'>('card');
  const { t, language } = useLanguage();

  const handlePayWithChapa = async () => {
    setLoading(true);
    setStatus('processing');
    setErrorMessage('');

    try {
      const chapaData = {
        amount,
        email,
        first_name: firstName,
        last_name: lastName,
        tx_ref: orderNumber,
        callback_url: `${window.location.origin}/payment/callback`,
        return_url: `${window.location.origin}/orders`
      };

      console.log('📤 Initiating Chapa payment:', chapaData);
      
      const result = await paymentService.initiateChapaPayment(chapaData);
      console.log('📥 Chapa response:', result);

      // Extract checkout URL from response
      const checkoutUrl = result?.checkout_url || result?.data?.checkout_url;
      
      if (result.success && checkoutUrl) {
        setPaymentUrl(checkoutUrl);
        setStatus('success');
        
        // Open payment page
        const paymentWindow = window.open(checkoutUrl, '_blank');
        
        if (!paymentWindow) {
          alert(t('Please allow popups to complete payment', 'እባክዎ ክፍያ ለማጠናቀቅ ፖፕአፕ ይፍቀዱ'));
        }
        
        if (onSuccess) onSuccess();
      } else {
        setStatus('error');
        setErrorMessage(result.message || t('Payment initiation failed', 'የክፍያ መጀመር አልተሳካም'));
        if (onError) onError(result.message || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Chapa payment error:', error);
      setStatus('error');
      setErrorMessage(error.message || t('Payment failed', 'ክፍያ አልተሳካም'));
      if (onError) onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (paymentUrl) {
      navigator.clipboard.writeText(paymentUrl);
      alert(t('Payment link copied!', 'የክፍያ አገናኝ ተቀድቷል!'));
    }
  };

  const paymentMethods = [
    {
      id: 'card' as const,
      name: t('Card Payment', 'የካርድ ክፍያ'),
      icon: CreditCard,
      description: t('Visa, Mastercard, Amex', 'ቪዛ፣ ማስተርካርድ፣ አሜክስ'),
      color: 'blue'
    },
    {
      id: 'bank' as const,
      name: t('Bank Transfer', 'የባንክ ዝውውር'),
      icon: Landmark,
      description: t('Direct bank transfer', 'ቀጥታ የባንክ ዝውውር'),
      color: 'green'
    },
    {
      id: 'telebirr' as const,
      name: t('Telebirr', 'ቴሌብር'),
      icon: Smartphone,
      description: t('Mobile money', 'የሞባይል ገንዘብ'),
      color: 'purple'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <CreditCard className="h-6 w-6 text-white" />
          <h3 className="text-lg font-semibold text-white">
            {t('Chapa Payment', 'የቻፓ ክፍያ')}
          </h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Amount Display */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {t('Total Amount', 'ጠቅላላ መጠን')}
          </p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {amount.toLocaleString()} {language === 'am' ? 'ብር' : 'ETB'}
          </p>
        </div>

        {/* Payment Method Selection */}
        {status === 'idle' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-xl border-2 transition-all
                      ${isSelected 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                      }`}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-2
                      ${isSelected ? 'text-green-600' : 'text-gray-400'}`} />
                    <p className={`text-xs font-medium
                      ${isSelected ? 'text-green-600' : 'text-gray-500'}`}>
                      {method.name}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayWithChapa}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 
                       hover:from-green-700 hover:to-emerald-700 text-white 
                       py-4 rounded-xl font-semibold transition-all transform hover:scale-105
                       disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none
                       flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>{t('Processing...', 'በማስኬድ ላይ...')}</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <span>{t('Pay with Chapa', 'በቻፓ ይክፈሉ')}</span>
                </>
              )}
            </button>
          </>
        )}

        {/* Processing State */}
        {status === 'processing' && (
          <div className="text-center py-8">
            <Loader className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('Initiating Payment...', 'ክፍያ በመጀመር ላይ...')}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('Please wait while we redirect you to Chapa.', 'እባክዎ ወደ ቻፓ ስንልክዎ ይጠብቁ።')}
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && paymentUrl && (
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('Payment Page Opened!', 'የክፍያ ገጽ ተከፍቷል!')}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t('Complete your payment on the Chapa page.', 'ክፍያዎን በቻፓ ገጽ ያጠናቅቁ።')}
            </p>
            
            <div className="space-y-3">
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 w-full px-4 py-3 
                         bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>{t('Open Payment Page', 'የክፍያ ገጽ ክፈት')}</span>
              </a>
              
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center space-x-2 w-full px-4 py-3 
                         bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span>{t('Copy Payment Link', 'የክፍያ አገናኝ ቅዳ')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center py-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('Payment Failed', 'ክፍያ አልተሳካም')}
            </h4>
            <p className="text-sm text-red-600 dark:text-red-400 mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 
                       dark:bg-gray-700 dark:hover:bg-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              {t('Try Again', 'እንደገና ሞክር')}
            </button>
          </div>
        )}

        {/* Security Note */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>{t('Secured by Chapa', 'በቻፓ የተጠበቀ')}</span>
        </div>
      </div>
    </div>
  );
}