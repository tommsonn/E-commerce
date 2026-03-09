import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthProps {
  onNavigate: (page: string) => void;
}

export function Auth({ onNavigate }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [existingEmail, setExistingEmail] = useState('');

  const { signIn, signUp, resendVerification } = useAuth();
  const { t } = useLanguage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
    setShowVerificationMessage(false);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setShowVerificationMessage(false);

    // Validation
    if (!formData.email || !formData.password) {
      setError(t('Please fill in all fields', 'እባክዎ ሁሉንም መስኮች ይሙሉ'));
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError(t('Please enter a valid email', 'እባክዎ የሚሰራ ኢሜይል ያስገቡ'));
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!formData.fullName) {
        setError(t('Full name is required', 'ሙሉ ስም ያስፈልጋል'));
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError(t('Password must be at least 6 characters', 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት'));
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError(t('Passwords do not match', 'የይለፍ ቃሎች አይዛመዱም'));
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        onNavigate('home');
      } else {
        const result = await signUp(formData.email, formData.password, formData.fullName);
        setSuccess(result.message || t(
          'Registration successful! Please check your email to verify your account.',
          'ምዝገባ ተሳክቷል! እባክዎ መለያዎን ለማረጋገጥ ኢሜይልዎን ያረጋግጡ።'
        ));
        setShowVerificationMessage(true);
        setExistingEmail(formData.email);
        
        // Clear password fields
        setFormData({
          ...formData,
          password: '',
          confirmPassword: '',
        });
      }
    } catch (err: any) {
      // Check if error is because user already exists but not verified
      if (err.message?.includes('already exists')) {
        setExistingEmail(formData.email);
        setShowVerificationMessage(true);
        setError(t(
          'An account with this email already exists. Please verify your email or request a new verification link.',
          'በዚህ ኢሜይል መለያ ቀድሞ አለ። እባክዎ ኢሜይልዎን ያረጋግጡ ወይም አዲስ የማረጋገጫ ሊንክ ይጠይቁ።'
        ));
      } else if (err.message?.includes('verify your email')) {
        setShowVerificationMessage(true);
        setExistingEmail(formData.email);
        setError(err.message);
      } else {
        setError(err.message || t('An error occurred. Please try again.', 'ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!existingEmail && !formData.email) {
      setError(t('Please enter your email', 'እባክዎ ኢሜይልዎን ያስገቡ'));
      return;
    }

    const email = existingEmail || formData.email;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await resendVerification(email);
      if (result.success) {
        setSuccess(t(
          'Verification email sent! Please check your inbox and spam folder.',
          'የማረጋገጫ ኢሜይል ተልኳል! እባክዎ የኢሜይል ሳጥንዎን እና የስፓም አቃፊዎን ያረጋግጡ።'
        ));
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setShowVerificationMessage(false);
    setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
    setExistingEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {isLogin ? t('Welcome Back!', 'እንኳን ደህና መጡ!') : t('Join TomShop Today!', 'ዛሬ ቶምሾፕን ይቀላቀሉ!')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isLogin 
              ? t('Sign in to continue shopping', 'ግብዣዎን ለመቀጠል ይግቡ')
              : t('Create an account to start shopping', 'ግብዣ ለመጀመር መለያ ይፍጠሩ')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-300">{success}</p>
            </div>
          )}

          {/* Error Message (when not showing verification message) */}
          {error && !showVerificationMessage && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Verification Message - Show for existing unverified users */}
          {showVerificationMessage && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <div className="flex flex-col space-y-3">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                      {t('Email not verified?', 'ኢሜይል አልተረጋገጠም?')}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                      {t(
                        'If you already registered but haven\'t verified your email, click the button below to resend the verification email.',
                        'ቀድሞ ከተመዘገቡ ነገር ግን ኢሜይልዎን ካላረጋገጡ፣ የማረጋገጫ ኢሜይል እንደገና ለመላክ ከታች ያለውን ቁልፍ ጠቅ ያድርጉ።'
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="self-start px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? t('Sending...', 'በመላክ ላይ...') : t('Resend Verification Email', 'የማረጋገጫ ኢሜይል እንደገና ይላኩ')}
                </button>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Full Name', 'ሙሉ ስም')} *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required={!isLogin}
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('John Doe', 'ጆን ዶ')}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('Email address', 'የኢሜይል አድራሻ')} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('Password', 'የይለፍ ቃል')} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Confirm Password', 'የይለፍ ቃል አረጋግጥ')} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('Processing...', 'በሂደት ላይ...')}
                </>
              ) : isLogin ? (
                t('Sign In', 'ግባ')
              ) : (
                t('Create Account', 'መለያ ፍጠር')
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {isLogin ? t('New to TomShop?', 'አዲስ ወደ ቶምሾፕ?') : t('Already have an account?', 'ቀድሞውኑ መለያ አለዎት?')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={toggleMode}
                className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                {isLogin ? t('Create an account', 'መለያ ፍጠር') : t('Sign in instead', 'በምትኩ ይግቡ')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}