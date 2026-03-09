import { CreditCard, Smartphone, Landmark, Truck, CheckCircle, Clock, Shield, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PaymentMethodSelectorProps {
  selectedMethod: 'cod' | 'telebirr' | 'bank' | 'chapa';
  onSelect: (method: 'cod' | 'telebirr' | 'bank' | 'chapa') => void;
  depositAmount: number;
  totalAmount: number;
}

export function PaymentMethodSelector({ 
  selectedMethod, 
  onSelect, 
  depositAmount, 
  totalAmount 
}: PaymentMethodSelectorProps) {
  const { t, language } = useLanguage();

  const paymentMethods = [
    {
      id: 'cod' as const,
      name: t('Cash on Delivery', 'በአደራ ላይ ጥሬ ገንዘብ'),
      description: t('Pay 20% now, 80% on delivery', '20% አሁን ይክፈሉ፣ 80% ሲቀበሉ'),
      icon: Truck,
      amount: depositAmount,
      color: 'blue',
      features: [
        t('No card required', 'ካርድ አያስፈልግም'),
        t('Pay when you receive', 'ሲቀበሉ ይክፈሉ'),
        t('Inspect before payment', 'ከመክፈልዎ በፊት ይፈትሹ')
      ]
    },
    {
      id: 'telebirr' as const,
      name: t('Telebirr', 'ቴሌብር'),
      description: t('Fast & secure mobile money', 'ፈጣን እና አስተማማኝ የሞባይል ገንዘብ'),
      icon: Smartphone,
      amount: totalAmount,
      color: 'purple',
      features: [
        t('Instant confirmation', 'ፈጣን ማረጋገጫ'),
        t('No extra fees', 'ተጨማሪ ክፍያ የለም'),
        t('24/7 available', '24/7 ይገኛል')
      ]
    },
    {
      id: 'chapa' as const,
      name: t('Chapa', 'ቻፓ'),
      description: t('Pay with Card or Bank', 'በካርድ ወይም ባንክ ይክፈሉ'),
      icon: CreditCard,
      amount: totalAmount,
      color: 'green',
      features: [
        t('All cards accepted', 'ሁሉም ካርዶች ይቀበላሉ'),
        t('Bank transfer option', 'የባንክ ዝውውር አማራጭ'),
        t('Secure payment', 'አስተማማኝ ክፍያ')
      ]
    },
    {
      id: 'bank' as const,
      name: t('Bank Transfer', 'የባንክ ዝውውር'),
      description: t('Direct bank transfer', 'ቀጥታ የባንክ ዝውውር'),
      icon: Landmark,
      amount: totalAmount,
      color: 'amber',
      features: [
        t('All banks accepted', 'ሁሉም ባንኮች ይቀበላሉ'),
        t('24h processing', '24 ሰአት ማስኬጃ'),
        t('Reference number', 'የማጣቀሻ ቁጥር')
      ]
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-blue-200 dark:border-blue-800',
        bg: isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800',
        icon: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-purple-200 dark:border-purple-800',
        bg: isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-white dark:bg-gray-800',
        icon: 'text-purple-600 dark:text-purple-400',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      },
      green: {
        border: isSelected ? 'border-green-500' : 'border-green-200 dark:border-green-800',
        bg: isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800',
        icon: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      },
      amber: {
        border: isSelected ? 'border-amber-500' : 'border-amber-200 dark:border-amber-800',
        bg: isSelected ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-white dark:bg-gray-800',
        icon: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <CreditCard className="h-5 w-5 mr-2 text-indigo-600" />
        {t('Payment Method', 'የክፍያ መንገድ')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => {
          const colors = getColorClasses(method.color, selectedMethod === method.id);
          const Icon = method.icon;
          
          return (
            <div
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
                        hover:shadow-lg transform hover:-translate-y-1
                        ${colors.border} ${colors.bg}`}
            >
              {/* Selected Badge */}
              {selectedMethod === method.id && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600" />
                </div>
              )}

              {/* Icon and Title */}
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl bg-white dark:bg-gray-700 shadow-sm`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {method.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {method.description}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {method.id === 'cod' ? t('Deposit', 'ቅድመ ክፍያ') : t('Total', 'ድምር')}
                </span>
                <span className={`text-lg font-bold ${colors.icon}`}>
                  {method.amount.toLocaleString()} {language === 'am' ? 'ብር' : 'ETB'}
                </span>
              </div>

              {/* Features */}
              <div className="mt-4 grid grid-cols-1 gap-2">
                {method.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <CheckCircle className={`h-3 w-3 mr-2 ${colors.icon}`} />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Promo Badge for COD */}
              {method.id === 'cod' && (
                <div className="mt-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${colors.badge}`}>
                    <Clock className="h-3 w-3 mr-1" />
                    {t('Pay later option', 'በኋላ የሚከፈል አማራጭ')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
              {t('Secure Payment Guarantee', 'ደህንነቱ የተጠበቀ ክፍያ')}
            </p>
            <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
              {t('All payments are encrypted and secure. Your information is protected.', 
                 'ሁሉም ክፍያዎች የተመሰጠሩ እና አስተማማኝ ናቸው። መረጃዎ ተጠብቆ ይቆያል።')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}