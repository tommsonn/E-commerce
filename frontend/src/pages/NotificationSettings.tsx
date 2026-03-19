import { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  ShoppingBag, 
  Megaphone, 
  Save, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  Shield
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { notificationService, NotificationPreferences } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

interface NotificationSettingsProps {
  onNavigate: (page: string) => void;
}

export function NotificationSettings({ onNavigate }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    orderUpdates: true,
    promotions: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { user, sendVerificationEmail } = useAuth();

  // Fetch preferences on component mount
  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  // Clear success messages after timeout
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  useEffect(() => {
    if (verifySuccess) {
      const timer = setTimeout(() => setVerifySuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [verifySuccess]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getPreferences();
      console.log('📨 Fetched preferences:', data);
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      await notificationService.updatePreferences(preferences);
      setSaveSuccess(true);
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      alert(error.response?.data?.message || t('Failed to save preferences', 'ምርጫዎችን ማስቀመጥ አልተሳካም'));
    } finally {
      setSaving(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      setSendingVerification(true);
      setVerifyError('');
      setVerifySuccess(false);
      
      await sendVerificationEmail();
      setVerifySuccess(true);
      
    } catch (error: any) {
      console.error('Error sending verification:', error);
      setVerifyError(error.message || t('Failed to send verification email', 'የማረጋገጫ ኢሜይል መላክ አልተሳካም'));
    } finally {
      setSendingVerification(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 
                    dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 
                    flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-20 h-20 
                        flex items-center justify-center mx-auto mb-4">
            <Bell className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('Sign in to manage notifications', 'ማሳወቂያዎችን ለማስተዳደር ይግቡ')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('You need to be logged in to view and manage your notification preferences.', 
               'የማሳወቂያ ምርጫዎችን ለማየት እና ለማስተዳደር መግባት ያስፈልጋል።')}
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white 
                     rounded-xl transition-all transform hover:scale-105
                     shadow-lg hover:shadow-xl"
          >
            {t('Go to Login', 'ወደ መግቢያ ይሂዱ')}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 
                    dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 
                    flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 
                        border-indigo-200 border-t-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Bell className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 
                  dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => onNavigate('profile')}
          className="group flex items-center text-gray-600 dark:text-gray-400 
                   hover:text-indigo-600 dark:hover:text-indigo-400 
                   transition-colors mb-6 px-4 py-2 rounded-lg
                   hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t('Back to Profile', 'ወደ መገለጫ ተመለስ')}
        </button>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl 
                      border border-gray-100 dark:border-gray-700 overflow-hidden">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 
                        bg-gradient-to-r from-indigo-50 to-indigo-100 
                        dark:from-indigo-900/30 dark:to-indigo-800/30">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
                <Bell className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('Notification Settings', 'የማሳወቂያ ቅንብሮች')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('Choose how you want to receive notifications', 'ማሳወቂያዎችን እንዴት መቀበል እንደሚፈልጉ ይምረጡ')}
                </p>
              </div>
            </div>
          </div>

          {/* Save Success Message */}
          {saveSuccess && (
            <div className="mx-6 mt-6 p-4 bg-green-50 dark:bg-green-900/20 
                          border border-green-200 dark:border-green-800 
                          rounded-xl flex items-center space-x-3 animate-slideDown">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-800 dark:text-green-300">
                {t('Preferences saved successfully!', 'ምርጫዎች በተሳካ ሁኔታ ተቀምጠዋል!')}
              </p>
            </div>
          )}

          {/* Email Verification Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              {t('Email Verification', 'የኢሜይል ማረጋገጫ')}
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.isEmailVerified 
                        ? t('Your email is verified', 'ኢሜይልዎ ተረጋግጧል')
                        : t('Verify your email to get important updates', 'አስፈላጊ መረጃዎችን ለማግኘት ኢሜይልዎን ያረጋግጡ')}
                    </p>
                  </div>
                </div>
                
                {user?.isEmailVerified ? (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 
                                dark:bg-green-900/30 text-green-800 dark:text-green-400 
                                rounded-xl">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{t('Verified', 'የተረጋገጠ')}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSendVerification}
                    disabled={sendingVerification}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 
                             text-white rounded-xl text-sm font-medium 
                             transition-all transform hover:scale-105 
                             disabled:bg-gray-400 disabled:cursor-not-allowed 
                             disabled:transform-none shadow-md hover:shadow-lg
                             flex items-center justify-center space-x-2"
                  >
                    {sendingVerification ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 
                                      border-2 border-white border-t-transparent"></div>
                        <span>{t('Sending...', 'በመላክ ላይ...')}</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        <span>{t('Send Verification Email', 'የማረጋገጫ ኢሜይል ላክ')}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Verification Success Message */}
              {verifySuccess && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 
                              border border-green-200 dark:border-green-800 
                              rounded-lg flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-800 dark:text-green-300">
                    {t('Verification email sent! Please check your inbox.', 
                       'የማረጋገጫ ኢሜይል ተልኳል! እባክዎ ኢሜይልዎን ያረጋግጡ።')}
                  </p>
                </div>
              )}

              {/* Verification Error Message */}
              {verifyError && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 
                              border border-red-200 dark:border-red-800 
                              rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-800 dark:text-red-300">{verifyError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notification Channels */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              {t('Notification Channels', 'የማሳወቂያ መንገዶች')}
            </h2>
            
            <div className="space-y-4">
              {/* Email Notifications */}
              <label className="flex items-center justify-between p-4 
                              bg-gray-50 dark:bg-gray-700/50 rounded-xl
                              hover:bg-gray-100 dark:hover:bg-gray-700 
                              transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('Email Notifications', 'የኢሜይል ማሳወቂያዎች')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('Receive notifications via email', 'ማሳወቂያዎችን በኢሜይል ይቀበሉ')}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email}
                    onChange={() => handleToggle('email')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none 
                                peer-focus:ring-4 peer-focus:ring-indigo-300 
                                dark:peer-focus:ring-indigo-800 rounded-full peer 
                                dark:bg-gray-700 peer-checked:after:translate-x-full 
                                peer-checked:after:border-white after:content-[''] 
                                after:absolute after:top-[2px] after:left-[2px] 
                                after:bg-white after:border-gray-300 after:border 
                                after:rounded-full after:h-5 after:w-5 after:transition-all 
                                dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </label>

              {/* Push Notifications */}
              <label className="flex items-center justify-between p-4 
                              bg-gray-50 dark:bg-gray-700/50 rounded-xl
                              hover:bg-gray-100 dark:hover:bg-gray-700 
                              transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                    <Smartphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('Push Notifications', 'የግፋ ማሳወቂያዎች')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('Receive notifications in browser', 'ማሳወቂያዎችን በአሳሽ ይቀበሉ')}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.push}
                    onChange={() => handleToggle('push')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none 
                                peer-focus:ring-4 peer-focus:ring-indigo-300 
                                dark:peer-focus:ring-indigo-800 rounded-full peer 
                                dark:bg-gray-700 peer-checked:after:translate-x-full 
                                peer-checked:after:border-white after:content-[''] 
                                after:absolute after:top-[2px] after:left-[2px] 
                                after:bg-white after:border-gray-300 after:border 
                                after:rounded-full after:h-5 after:w-5 after:transition-all 
                                dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </label>
            </div>
          </div>

          {/* Notification Types */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              {t('Notification Types', 'የማሳወቂያ አይነቶች')}
            </h2>
            
            <div className="space-y-4">
              {/* Order Updates */}
              <label className="flex items-center justify-between p-4 
                              bg-gray-50 dark:bg-gray-700/50 rounded-xl
                              hover:bg-gray-100 dark:hover:bg-gray-700 
                              transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('Order Updates', 'የትዕዛዝ ማሻሻያዎች')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('Get updates about your orders', 'ስለ ትዕዛዞችዎ ማሻሻያዎችን ያግኙ')}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.orderUpdates}
                    onChange={() => handleToggle('orderUpdates')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none 
                                peer-focus:ring-4 peer-focus:ring-indigo-300 
                                dark:peer-focus:ring-indigo-800 rounded-full peer 
                                dark:bg-gray-700 peer-checked:after:translate-x-full 
                                peer-checked:after:border-white after:content-[''] 
                                after:absolute after:top-[2px] after:left-[2px] 
                                after:bg-white after:border-gray-300 after:border 
                                after:rounded-full after:h-5 after:w-5 after:transition-all 
                                dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </label>

              {/* Promotions */}
              <label className="flex items-center justify-between p-4 
                              bg-gray-50 dark:bg-gray-700/50 rounded-xl
                              hover:bg-gray-100 dark:hover:bg-gray-700 
                              transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                    <Megaphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('Promotions', 'ማስተዋወቂያዎች')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('Receive special offers and deals', 'ልዩ ቅናሾችን እና ስጦታዎችን ይቀበሉ')}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.promotions}
                    onChange={() => handleToggle('promotions')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none 
                                peer-focus:ring-4 peer-focus:ring-indigo-300 
                                dark:peer-focus:ring-indigo-800 rounded-full peer 
                                dark:bg-gray-700 peer-checked:after:translate-x-full 
                                peer-checked:after:border-white after:content-[''] 
                                after:absolute after:top-[2px] after:left-[2px] 
                                after:bg-white after:border-gray-300 after:border 
                                after:rounded-full after:h-5 after:w-5 after:transition-all 
                                dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </label>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {t('You will always receive important security and account notifications regardless of these settings.',
                     'አስፈላጊ የደህንነት እና የመለያ ማሳወቂያዎችን ከነዚህ ቅንብሮች ውጪ ሁልጊዜ ይቀበላሉ።')}
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white 
                       py-4 rounded-xl font-semibold text-lg
                       transition-all duration-500 transform hover:scale-105 
                       disabled:bg-gray-400 disabled:cursor-not-allowed 
                       disabled:transform-none flex items-center justify-center 
                       space-x-3 shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 
                                border-2 border-white border-t-transparent"></div>
                  <span>{t('Saving...', 'በማስቀመጥ ላይ...')}</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>{t('Save Preferences', 'ምርጫዎችን አስቀምጥ')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
