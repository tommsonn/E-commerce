import { useEffect, useState, useRef } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface VerifyEmailProps {
  onNavigate: (page: string) => void;
  token?: string;
}

export function VerifyEmail({ onNavigate, token }: VerifyEmailProps) {
  const { t } = useLanguage();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const verificationDone = useRef(false); // Prevent double verification

  useEffect(() => {
    // Prevent multiple verification attempts
    if (verificationDone.current) return;
    
    const verify = async () => {
      try {
        // Get token from URL if not provided as prop
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = token || urlParams.get('token');
        
        console.log('🔍 Verification token:', urlToken);
        
        if (!urlToken) {
          setStatus('error');
          setMessage(t('Invalid verification link', 'ልክ ያልሆነ የማረጋገጫ አገናኝ'));
          return;
        }

        // Mark as done to prevent re-verification
        verificationDone.current = true;

        // Check if already verified in localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.isEmailVerified) {
            console.log('✅ User already verified in localStorage');
            setStatus('success');
            setMessage(t('Email already verified! Redirecting...', 'ኢሜይል ቀድሞ ተረጋግጧል! በማዛወር ላይ...'));
            setTimeout(() => onNavigate('home'), 2000);
            return;
          }
        }

        await verifyEmail(urlToken);
        console.log('✅ Email verified successfully!');
        setStatus('success');
        setMessage(t('Email verified successfully! Redirecting to home...', 'ኢሜይል በተሳካ ሁኔታ ተረጋገጠ! ወደ መነሻ ገጽ በመቀየር ላይ...'));
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          onNavigate('home');
        }, 3000);
      } catch (error: any) {
        console.error('❌ Verification error:', error);
        
        // Check if the error is because email is already verified
        if (error.message?.includes('already verified') || 
            error.response?.data?.message?.includes('already verified')) {
          setStatus('success');
          setMessage(t('Email already verified! Redirecting...', 'ኢሜይል ቀድሞ ተረጋግጧል! በማዛወር ላይ...'));
          setTimeout(() => onNavigate('home'), 2000);
        } else {
          setStatus('error');
          setMessage(error.message || t('Email verification failed', 'የኢሜይል ማረጋገጥ አልተሳካም'));
        }
      }
    };

    verify();
  }, [token, verifyEmail, onNavigate, t]); // Remove attempts from dependencies

  const handleRetry = () => {
    verificationDone.current = false;
    window.location.reload(); // Simple reload to retry
  };

  // Don't show error if we already have success
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div className="relative">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('Email Verified!', 'ኢሜይል ተረጋገጠ!')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('home')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {t('Go to Home', 'ወደ መነሻ ገጽ ይሂዱ')}
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold transition-all"
            >
              {t('Go to Login', 'ወደ መግቢያ ይሂዱ')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div className="relative">
              <XCircle className="h-20 w-20 text-red-500 mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('Verification Failed', 'ማረጋገጥ አልተሳካም')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
          
          {/* Check if email might already be verified */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              {t(
                'If you believe your email is already verified, try logging in.',
                'ኢሜይልዎ ቀድሞ የተረጋገጠ ነው ብለው የሚያስቡ ከሆነ፣ ወደ መለያዎ ለመግባት ይሞክሩ።'
              )}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {t('Go to Login', 'ወደ መግቢያ ይሂዱ')}
            </button>
            <button
              onClick={handleRetry}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold transition-all"
            >
              {t('Try Again', 'እንደገና ይሞክሩ')}
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {t('Go to Home', 'ወደ መነሻ ገጽ ይሂዱ')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="relative mb-6">
          <Loader className="h-16 w-16 text-indigo-600 animate-spin mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('Verifying your email...', 'ኢሜይልዎን በማረጋገጥ ላይ...')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('Please wait while we verify your email address.', 'እባክዎ ኢሜይልዎን ስናረጋግጥ ይጠብቁ።')}
        </p>
      </div>
    </div>
  );
}