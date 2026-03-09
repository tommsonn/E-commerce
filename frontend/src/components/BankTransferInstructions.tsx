import { useState } from 'react';
import { Landmark, Copy, CheckCircle, Clock, Download, AlertCircle, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BankTransferInstructionsProps {
  amount: number;
  orderNumber: string;
  onComplete: () => void;
}

export function BankTransferInstructions({ amount, orderNumber, onComplete }: BankTransferInstructionsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const { t, language } = useLanguage();

  const bankDetails = {
    bankName: 'Commercial Bank of Ethiopia',
    accountName: 'TomShop PLC',
    accountNumber: '1000134567890',
    swiftCode: 'CBETETAA',
    branch: 'Head Office, Addis Ababa'
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const steps = [
    {
      title: t('Transfer the exact amount', 'ትክክለኛውን መጠን ይላኩ'),
      description: t(
        `Transfer exactly ${amount.toLocaleString()} ETB to the bank account below`,
        `በትክክል ${amount.toLocaleString()} ብር ከዚህ በታች ወደሚገኘው የባንክ ሂሳብ ይላኩ`
      )
    },
    {
      title: t('Use this reference number', 'ይህን ማጣቀሻ ቁጥር ይጠቀሙ'),
      description: t(
        'Include this number in your transfer reference',
        'ይህን ቁጥር በዝውውር ማጣቀሻዎ ውስጥ ያካትቱ'
      )
    },
    {
      title: t('Confirm your payment', 'ክፍያዎን ያረጋግጡ'),
      description: t(
        'Click the button below after making the transfer',
        'ዝውውሩን ካደረጉ በኋላ ከታች ያለውን ቁልፍ ጠቅ ያድርጉ'
      )
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <Landmark className="h-6 w-6 text-white" />
          <h3 className="text-lg font-semibold text-white">
            {t('Bank Transfer Instructions', 'የባንክ ዝውውር መመሪያዎች')}
          </h3>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${step > index + 1 
                  ? 'bg-green-500 text-white' 
                  : step === index + 1
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                {step > index + 1 ? <CheckCircle className="h-4 w-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded
                  ${step > index + 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Step Content */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            {steps[step - 1].title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {steps[step - 1].description}
          </p>
        </div>

        {/* Bank Details Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('Bank', 'ባንክ')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{bankDetails.bankName}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('Account Name', 'የመለያ ስም')}</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">{bankDetails.accountName}</span>
                <button
                  onClick={() => handleCopy(bankDetails.accountName, 'name')}
                  className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
                >
                  {copiedField === 'name' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('Account Number', 'የመለያ ቁጥር')}</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-medium text-gray-900 dark:text-white">{bankDetails.accountNumber}</span>
                <button
                  onClick={() => handleCopy(bankDetails.accountNumber, 'account')}
                  className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
                >
                  {copiedField === 'account' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('SWIFT Code', 'SWIFT ኮድ')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{bankDetails.swiftCode}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('Branch', 'ቅርንጫፍ')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{bankDetails.branch}</span>
            </div>
          </div>
        </div>

        {/* Reference Number */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
              {t('Your Reference Number', 'የማጣቀሻ ቁጥርዎ')}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {orderNumber}
              </span>
              <button
                onClick={() => handleCopy(orderNumber, 'ref')}
                className="p-1 hover:bg-white dark:hover:bg-indigo-800 rounded transition-colors"
              >
                {copiedField === 'ref' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-indigo-500" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400">
            {t('Include this number in your transfer reference', 'ይህን ቁጥር በዝውውር ማጣቀሻዎ ውስጥ ያካትቱ')}
          </p>
        </div>

        {/* Amount Box */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-center">
          <p className="text-sm text-green-700 dark:text-green-300 mb-1">
            {t('Total Amount to Transfer', 'ጠቅላላ የሚላክ መጠን')}
          </p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {amount.toLocaleString()} {language === 'am' ? 'ብር' : 'ETB'}
          </p>
        </div>

        {/* Warning */}
        <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {t(
              'Please ensure you transfer the exact amount. Transfers may take 1-2 business days to process.',
              'እባክዎ ትክክለኛውን መጠን መላክዎን ያረጋግጡ። ዝውውሮች ለማስኬድ 1-2 የስራ ቀናት ሊወስዱ ይችላሉ።'
            )}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                     text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('Previous', 'ቀዳሚ')}
          </button>
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl
                       transition-colors"
            >
              {t('Next', 'ቀጣይ')}
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl
                       flex items-center space-x-2 transition-colors"
            >
              <CheckCircle className="h-5 w-5" />
              <span>{t('I have made the transfer', 'ዝውውሩን አድርጌአለሁ')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}