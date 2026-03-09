import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';

interface ProfileProps {
  onNavigate: (page: string) => void;
}

interface Address {
  street: string;
  city: string;
  region: string;
}

interface FormData {
  fullName: string;
  phone: string;
  address: Address;
}

export function Profile({ onNavigate }: ProfileProps) {
  const { user, updateUserProfile } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      region: user?.address?.region || '',
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      // FIXED: Type-safe way to update nested objects
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof FormData] as Address),
          [child]: value,
        },
      });
    } else {
      setFormData({ 
        ...formData, 
        [name]: value 
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(formData);
      alert(t('Profile updated successfully!', 'መገለጫ በተሳካ ሁኔታ ተዘምኗል!'));
    } catch (error: any) {
      alert(error.message || t('Failed to update profile', 'መገለጫ ማዘመን አልተሳካም'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white dark:bg-gray-900 rounded-full p-4">
                <User className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {t('My Profile', 'መገለጫዬ')}
                </h1>
                <p className="text-green-100 dark:text-green-200">
                  {t('Manage your account information', 'የመለያ መረጃዎን ያስተዳድሩ')}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('Personal Information', 'የግል መረጃ')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('Full Name', 'ሙሉ ስም')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                               rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('Email', 'ኢሜይል')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                               rounded-md bg-gray-50 dark:bg-gray-600 
                               text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('Phone Number', 'ስልክ ቁጥር')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                               rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('Address Information', 'የአድራሻ መረጃ')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('Street Address', 'የመንገድ አድራሻ')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                               rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('City', 'ከተማ')}
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('Region', 'ክልል')}
                  </label>
                  <input
                    type="text"
                    name="address.region"
                    value={formData.address.region}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 
                         dark:bg-green-600 dark:hover:bg-green-700 text-white 
                         rounded-lg font-semibold transition-all transform hover:scale-105
                         focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                         dark:focus:ring-offset-gray-800 disabled:bg-gray-400 
                         disabled:cursor-not-allowed disabled:transform-none
                         flex items-center justify-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>
                  {loading 
                    ? t('Saving...', 'በማስቀመጥ ላይ...') 
                    : t('Save Changes', 'ለውጦችን አስቀምጥ')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}