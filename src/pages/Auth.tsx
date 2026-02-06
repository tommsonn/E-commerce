import { useState } from 'react';
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
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          alert(t('Invalid email or password', 'ልክ ያልሆነ ኢሜይል ወይም የይለፍ ቃል'));
        } else {
          onNavigate('home');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          alert(t('Passwords do not match', 'የይለፍ ቃሎች አይዛመዱም'));
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          alert(t('Password must be at least 6 characters', 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት'));
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          alert(t('Sign up failed. Email may already be in use.', 'ምዝገባ አልተሳካም። ኢሜይል ቀደም ሲል ጥቅም ላይ ሊውል ይችላል።'));
        } else {
          alert(t('Account created successfully! Please sign in.', 'መለያ በተሳካ ሁኔታ ተፈጠረ! እባክዎ ይግቡ።'));
          setIsLogin(true);
          setFormData({ email: formData.email, password: '', fullName: '', confirmPassword: '' });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert(t('An error occurred. Please try again.', 'ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {isLogin ? t('Sign in to your account', 'ወደ መለያዎ ይግቡ') : t('Create new account', 'አዲስ መለያ ይፍጠሩ')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? t('Welcome back!', 'እንኳን ደህና መጡ!') : t('Join thousands of happy customers', 'ከሺዎች ደስተኛ ደንበኞች ጋር ይቀላቀሉ')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  {t('Full Name', 'ሙሉ ስም')}
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required={!isLogin}
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('Email address', 'የኢሜይል አድራሻ')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('Password', 'የይለፍ ቃል')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  {t('Confirm Password', 'የይለፍ ቃል አረጋግጥ')}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required={!isLogin}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading
                  ? t('Please wait...', 'እባክዎ ይጠብቁ...')
                  : isLogin
                  ? t('Sign in', 'ግባ')
                  : t('Sign up', 'ተመዝገብ')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? t('New to EthioShop?', 'አዲስ ወደ ኢትዮሾፕ?') : t('Already have an account?', 'ቀድሞውኑ መለያ አለዎት?')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
                }}
                className="w-full text-center text-sm font-medium text-green-600 hover:text-green-500"
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
