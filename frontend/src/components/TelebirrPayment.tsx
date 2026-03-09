import { useState, useEffect, useRef } from 'react';
import { Smartphone, CheckCircle, XCircle, ExternalLink, Copy } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { paymentService } from '../services/paymentService';

interface TelebirrPaymentProps {
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderId?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function TelebirrPayment({
  amount,
  customerName,
  customerPhone,
  customerEmail,
  orderId,
  onSuccess,
  onError
}: TelebirrPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [outTradeNo, setOutTradeNo] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { t, language } = useLanguage();

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handlePayWithTelebirr = async () => {
    setLoading(true);
    setStatus('processing');
    setErrorMessage('');

    try {
      // Validate phone number
      if (!customerPhone) {
        throw new Error(t('Phone number is required', 'ስልክ ቁጥር ያስፈልጋል'));
      }

      // Generate order ID if not provided
      const orderRef = orderId || `ORD-${Date.now()}`;

      const result = await paymentService.initiateTelebirrPayment({
        amount,
        customerName,
        customerPhone,
        customerEmail: customerEmail || '',
        orderId: orderRef,
        subject: `Payment for Order ${orderRef}`
      });

      if (result.success && result.paymentUrl) {
        setPaymentUrl(result.paymentUrl);
        if (result.outTradeNo) {
          setOutTradeNo(result.outTradeNo);
          // Start polling for payment status
          startPolling(result.outTradeNo);
        }
        setStatus('success');
        
        // Open Telebirr payment page in new window
        const paymentWindow = window.open(result.paymentUrl, '_blank');
        
        if (!paymentWindow) {
          alert(t('Please allow popups to complete payment', 'እባክዎ ክፍያ ለማጠናቀቅ ፖፕአፕ ይፍቀዱ'));
        }
        
        if (onSuccess) onSuccess(result);
      } else {
        setStatus('error');
        setErrorMessage(result.message || t('Payment initiation failed', 'ክፍያ መጀመር አልተሳካም'));
        if (onError) onError(result.message || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error('Telebirr payment error:', error);
      setStatus('error');
      setErrorMessage(error.message || t('Payment failed', 'ክፍያ አልተሳካም'));
      if (onError) onError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (outTradeNo: string) => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll every 5 seconds for 2 minutes
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        attempts++;
        console.log(`🔄 Polling payment status for ${outTradeNo} (attempt ${attempts}/${maxAttempts})`);
        
        const statusResult = await paymentService.checkTelebirrStatus(outTradeNo);
        
        if (statusResult.success && statusResult.status === 'SUCCESS') {
          // Clear interval on success
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setStatus('success');
          setErrorMessage('');
          if (onSuccess) {
            onSuccess({
              ...statusResult,
              outTradeNo
            });
          }
        } else if (statusResult.status === 'FAILED' || statusResult.status === 'EXPIRED') {
          // Clear interval on failure
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setStatus('error');
          setErrorMessage(statusResult.message || 'Payment failed');
        }
        
        if (attempts >= maxAttempts) {
          // Clear interval after max attempts
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          console.log('⏱️ Payment status polling stopped after max attempts');
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts >= maxAttempts) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      }
    }, 5000);
  };

  const handleCopyLink = () => {
    if (paymentUrl) {
      navigator.clipboard.writeText(paymentUrl);
      alert(t('Payment link copied!', 'የክፍያ አገናኝ ተቀድቷል!'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
        <div className="flex items-start space-x-3">
          <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {t('Telebirr Payment', 'የቴሌብር ክፍያ')}
            </h4>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {language === 'am' 
                ? `የሚከፈል መጠን: ${amount.toLocaleString()} ብር`
                : `Amount to pay: ${amount.toLocaleString()} ETB`}
            </p>
            {customerPhone && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {language === 'am'
                  ? `ስልክ: ${customerPhone}`
                  : `Phone: ${customerPhone}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {status === 'processing' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent"></div>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              {t('Initiating payment...', 'ክፍያ በመጀመር ላይ...')}
            </p>
          </div>
        </div>
      )}

      {status === 'success' && paymentUrl && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {t('Payment initiated!', 'ክፍያ ተጀምሯል!')}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {t('Complete your payment using the Telebirr app.', 'ክፍያዎን በቴሌብር አፕ ያጠናቅቁ።')}
              </p>
              {outTradeNo && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {t('Checking payment status automatically...', 'የክፍያ ሁኔታ በራስ-ሰር እየተፈተሸ ነው...')}
                </p>
              )}
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{t('Open Payment Page', 'የክፍያ ገጽ ክፈት')}</span>
                </a>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>{t('Copy Link', 'አገናኝ ቅዳ')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {t('Payment failed', 'ክፍያ አልተሳካም')}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errorMessage || t('Please try again or choose another payment method.', 'እባክዎ እንደገና ይሞክሩ ወይም ሌላ የክፍያ ዘዴ ይምረጡ።')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pay Button - Only show when not in success state */}
      {status !== 'success' && (
        <button
          onClick={handlePayWithTelebirr}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                   text-white py-4 rounded-xl font-semibold transition-all transform hover:scale-105
                   disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-400
                   disabled:cursor-not-allowed disabled:transform-none
                   flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>{t('Processing...', 'በማስኬድ ላይ...')}</span>
            </>
          ) : (
            <>
              <Smartphone className="h-5 w-5" />
              <span>{t('Pay with Telebirr', 'በቴሌብር ይክፈሉ')}</span>
            </>
          )}
        </button>
      )}

      {/* Retry button for error state */}
      {status === 'error' && (
        <button
          onClick={() => {
            setStatus('idle');
            setErrorMessage('');
            setPaymentUrl(null);
            setOutTradeNo(null);
          }}
          className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                   text-gray-800 dark:text-gray-200 py-3 rounded-lg font-medium transition-colors"
        >
          {t('Try Again', 'እንደገና ሞክር')}
        </button>
      )}
    </div>
  );
}