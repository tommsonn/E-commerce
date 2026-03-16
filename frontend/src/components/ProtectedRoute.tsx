import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  onNavigate?: (page: string, data?: any) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  onNavigate 
}) => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    // Don't redirect while still loading
    if (loading) return;

    // If not authenticated, redirect to login
    if (!user && onNavigate) {
      console.log('ProtectedRoute: User not authenticated, redirecting to login');
      onNavigate('login');
      return;
    }

    // If requires admin but user is not admin, redirect to dashboard
    if (user && requireAdmin && !user.isAdmin && onNavigate) {
      console.log('ProtectedRoute: User not admin, redirecting to dashboard');
      onNavigate('dashboard');
      return;
    }

    // Optional: Check verification if needed
    // if (user && !user.isVerified && onNavigate) {
    //   onNavigate('verify-email', { email: user.email });
    //   return;
    // }
  }, [user, loading, requireAdmin, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 bg-indigo-600 dark:bg-indigo-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show loading (useEffect will handle redirect)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('Checking authentication...', 'ይረጋገጣል...')}</p>
        </div>
      </div>
    );
  }

  // Check admin requirement
  if (requireAdmin && !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center transition-colors duration-500">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <svg className="h-12 w-12 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6V7m0 0V5m0 2h2m-2 0H9" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('Access Denied', 'መዳረሻ ተከልክሏል')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('You do not have permission to access this page', 'ይህንን ገጽ ለማግኘት ፈቃድ የለዎትም')}
          </p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 
                       text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105
                       focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                       dark:focus:ring-offset-gray-900 shadow-lg hover:shadow-xl"
            >
              {t('Go to Dashboard', 'ወደ ዳሽቦርድ ይሂዱ')}
            </button>
          )}
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
};
