import { useState, useEffect } from 'react';
import { X, Mail, Smartphone, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { verificationService } from '../services/verificationService';
import { useAuth } from '../context/AuthContext';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  method: 'email' | 'sms';
  email?: string;
  phone?: string;
  onVerified?: () => void;
}

export function VerificationModal({ isOpen, onClose, method, email, phone, onVerified }: VerificationModalProps) {
  const [step, setStep] = useState<'send' | 'verify' | 'success' | 'error'>('send');
  const [phoneNumber, setPhoneNumber] = useState(phone || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const { t, language } = useLanguage();
  const { user, updateUserProfile } = useAuth();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('send');
      setVerificationCode('');
      setErrorMessage('');
      setCountdown(0);
      if (phone) setPhoneNumber(phone);
    }
  }, [isOpen, phone]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendVerification = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      // For email verification
      if (method === 'email') {
        const userEmail = email || user?.email;
        if (!userEmail) {
          setStep('error');
          setErrorMessage('No email address provided');
          return;
        }

        const result = await verificationService.sendVerificationEmail(userEmail);
        
        if (result.success) {
          setStep('verify');
          setCountdown(60); // 60 second cooldown
        } else {
          setStep('error');
          setErrorMessage(result.message);
        }
      } else {
        // For SMS verification - Not implemented yet
        setStep('error');
        setErrorMessage('SMS verification is not available yet. Please use email verification.');
      }
    } catch (error: any) {
      setStep('error');
      setErrorMessage(error.response?.data?.message || 'Failed to send verification');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      // For email verification with token (this is handled by the verify-email page)
      // This modal is for SMS verification which isn't implemented yet
      setStep('error');
      setErrorMessage('Please check your email and click the verification link.');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      if (method === 'email') {
        const userEmail = email || user?.email;
        if (!userEmail) {
          throw new Error('No email address provided');
        }
        
        const result = await verificationService.resendVerificationEmail(userEmail);
        
        if (result.success) {
          setCountdown(60);
        } else {
          setErrorMessage(result.message);
        }
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to resend verification');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    try {
      if (method === 'email') {
        const userEmail = email || user?.email;
        if (!userEmail) {
          throw new Error('No email address provided');
        }
        
        const result = await verificationService.checkVerificationStatus(userEmail);
        
        if (result.isVerified) {
          setStep('success');
          
          // Update user verification status in auth context
          if (updateUserProfile) {
            await updateUserProfile({ 
              isEmailVerified: true 
            });
          }
          
          // Call onVerified callback if provided
          if (onVerified) {
            onVerified();
          }
          
          // Auto close after success
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setErrorMessage('Email not verified yet. Please check your inbox and click the verification link.');
        }
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to check verification status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-3 rounded-full ${
              method === 'email' 
                ? 'bg-blue-100 dark:bg-blue-900/30' 
                : 'bg-green-100 dark:bg-green-900/30'
            }`}>
              {method === 'email' 
                ? <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                : <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
              }
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {method === 'email' 
                ? t('Verify Email', 'ኢሜይል አረጋግጥ')
                : t('Verify Phone', 'ስልክ አረጋግጥ')
              }
            </h2>
          </div>

          {/* Step: Send */}
          {step === 'send' && (
            <div className="space-y-4">
              {method === 'sms' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('Phone Number', 'ስልክ ቁጥር')}
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('Enter Ethiopian phone number', 'የኢትዮጵያ ስልክ ቁጥር ያስገቡ')}
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                    {t('Note: SMS verification is coming soon. Please use email verification for now.', 'ማስታወሻ: የኤስኤምኤስ ማረጋገጫ በቅርቡ ይመጣል። እባክዎ ለአሁኑ የኢሜይል ማረጋገጫ ይጠቀሙ።')}
                  </p>
                </div>
              )}

              {method === 'email' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {t(
                      'We will send a verification link to your email:',
                      'የማረጋገጫ አገናኝ ወደ ኢሜይልዎ እንልካለን:'
                    )}
                  </p>
                  <p className="font-medium text-blue-900 dark:text-blue-200 mt-2 break-all">
                    {email || user?.email}
                  </p>
                </div>
              )}

              <button
                onClick={handleSendVerification}
                disabled={loading || (method === 'sms' && !phoneNumber)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium
                         disabled:bg-gray-400 disabled:cursor-not-allowed transition-all
                         transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>{t('Sending...', 'በመላክ ላይ...')}</span>
                  </div>
                ) : (
                  t('Send Verification Email', 'የማረጋገጫ ኢሜይል ላክ')
                )}
              </button>
            </div>
          )}

          {/* Step: Verify */}
          {step === 'verify' && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">
                  {method === 'email' 
                    ? t(
                        'Verification link sent to your email. Please check your inbox and spam folder.',
                        'የማረጋገጫ አገናኝ ወደ ኢሜይልዎ ተልኳል። እባክዎ ኢሜይልዎን እና የስፓም አቃፊዎን ያረጋግጡ።'
                      )
                    : t(
                        'Verification code sent to your phone via SMS.',
                        'የማረጋገጫ ኮድ በኤስኤምኤስ ወደ ስልክዎ ተልኳል።'
                      )
                  }
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  {t(
                    'After clicking the verification link in your email, click the button below to check your verification status.',
                    'በኢሜይልዎ ውስጥ ያለውን የማረጋገጫ አገናኝ ጠቅ ካደረጉ በኋላ፣ የማረጋገጫ ሁኔታዎን ለማየት ከታች ያለውን ቁልፍ ጠቅ ያድርጉ።'
                  )}
                </p>
              </div>

              <button
                onClick={handleCheckStatus}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium
                         disabled:bg-gray-400 disabled:cursor-not-allowed transition-all
                         transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>{t('Checking...', 'በመፈተሽ ላይ...')}</span>
                  </div>
                ) : (
                  t('Check Verification Status', 'የማረጋገጫ ሁኔታ ይፈትሹ')
                )}
              </button>

              <button
                onClick={handleResend}
                disabled={countdown > 0 || loading}
                className="w-full text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400
                         py-2 transition-colors"
              >
                {countdown > 0 
                  ? t(`Resend in ${countdown}s`, `በ${countdown}ሰከንድ እንደገና ላክ`)
                  : t('Resend Email', 'ኢሜይል እንደገና ላክ')
                }
              </button>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('Verified!', 'ተረጋግጧል!')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {method === 'email' 
                  ? t('Your email has been verified.', 'ኢሜይልዎ ተረጋግጧል።')
                  : t('Your phone number has been verified.', 'ስልክ ቁጥርዎ ተረጋግጧል።')
                }
              </p>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="text-center py-6">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('Error', 'ስህተት')}
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                {errorMessage}
              </p>
              <button
                onClick={() => setStep('send')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg
                         transition-all transform hover:scale-105"
              >
                {t('Try Again', 'እንደገና ሞክር')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}