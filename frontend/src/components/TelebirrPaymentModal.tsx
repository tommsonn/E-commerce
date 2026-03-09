import { useState, useEffect, useRef } from 'react';
import { X, Smartphone, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { paymentService } from '../services/paymentService';

interface TelebirrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  onSuccess?: () => void;
}

export function TelebirrPaymentModal({
  isOpen,
  onClose,
  amount,
  orderId,
  customerName,
  customerPhone,
  customerEmail,
  onSuccess
}: TelebirrPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [outTradeNo, setOutTradeNo] = useState<string | null>(null);
  const [status, setStatus] = useState<'init' | 'processing' | 'success' | 'error'>('init');
  const [errorMessage, setErrorMessage] = useState('');
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

  const handleInitiatePayment = async () => {
    setLoading(true);
    setStatus('processing');

    try {
      const result = await paymentService.initiateTelebirrPayment({
        amount,
        orderId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || '',
        subject: `Payment for Order ${orderId}`
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
      } else {
        setStatus('error');
        setErrorMessage(result.message || t('Payment initiation failed', 'ክፍያ መጀመር አልተሳካም'));
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setStatus('error');
      setErrorMessage(error.message || t('Payment failed', 'ክፍያ አልተሳካም'));
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
            onSuccess();
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

  const handleClose = () => {
    // Clean up polling on close
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full relative max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('Telebirr Payment', 'የቴሌብር ክፍያ')}
            </h2>
          </div>

          {/* Amount Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-800 dark:text-blue-300">
                {t('Amount', 'መጠን')}
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {amount.toLocaleString()} {language === 'am' ? 'ብር' : 'ETB'}
              </span>
            </div>
          </div>

          {/* Step: Init */}
          {status === 'init' && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t(
                    'You will be redirected to Telebirr payment page. Complete the payment on your phone.',
                    'ወደ ቴሌብር ክፍያ ገጽ ይዛወራሉ። ክፍያዎን በስልክዎ ያጠናቅቁ።'
                  )}
                </p>
              </div>

              <button
                onClick={handleInitiatePayment}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium
                         disabled:bg-gray-400 disabled:cursor-not-allowed
                         flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>{t('Initiating...', 'በመጀመር ላይ...')}</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="h-5 w-5" />
                    <span>{t('Pay with Telebirr', 'በቴሌብር ይክፈሉ')}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step: Processing */}
          {status === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-pulse mb-4">
                <Smartphone className="h-16 w-16 text-blue-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('Processing...', 'በማስኬድ ላይ...')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('Please wait while we initiate your payment.', 'እባክዎ ክፍያዎን ስናስኬድ ይጠብቁ።')}
              </p>
            </div>
          )}

          {/* Step: Success */}
          {status === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('Payment Initiated!', 'ክፍያ ተጀምሯል!')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {outTradeNo ? (
                  t(
                    'Please complete the payment on your phone. We are checking the status automatically.',
                    'እባክዎ ክፍያዎን በስልክዎ ያጠናቅቁ። ሁኔታውን በራስ-ሰር እየፈተሽን ነው።'
                  )
                ) : (
                  t(
                    'Please complete the payment on your phone. You can close this window.',
                    'እባክዎ ክፍያዎን በስልክዎ ያጠናቅቁ። ይህን መስኮት መዝጋት ይችላሉ።'
                  )
                )}
              </p>
              {paymentUrl && (
                <div className="space-y-3">
                  <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-blue-600 hover:text-blue-700 text-sm underline"
                  >
                    {t('Open payment page again', 'የክፍያ ገጹን እንደገና ይክፈቱ')}
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="block w-full text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400"
                  >
                    {t('Copy payment link', 'የክፍያ አገናኝ ቅዳ')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step: Error */}
          {status === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('Payment Failed', 'ክፍያ አልተሳካም')}
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mb-6">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setStatus('init')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  {t('Try Again', 'እንደገና ይሞክሩ')}
                </button>
                <button
                  onClick={handleClose}
                  className="w-full text-gray-600 hover:text-gray-700 dark:text-gray-400 text-sm"
                >
                  {t('Cancel', 'ሰርዝ')}
                </button>
              </div>
            </div>
          )}

          {/* Cancel button for init state */}
          {status === 'init' && (
            <button
              onClick={handleClose}
              className="w-full mt-4 text-gray-600 hover:text-gray-700 dark:text-gray-400 text-sm"
            >
              {t('Cancel', 'ሰርዝ')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}