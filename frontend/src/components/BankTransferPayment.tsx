import { useState, useEffect } from 'react';
import { Landmark, Copy, CheckCircle, Clock, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { paymentService, Bank, BankInstructions } from '../services/paymentService';

interface BankTransferPaymentProps {
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  orderId?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function BankTransferPayment({
  amount,
  customerName,
  customerEmail,
  customerPhone,
  orderId,
  onSuccess,
  onError
}: BankTransferPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [instructions, setInstructions] = useState<BankInstructions | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const result = await paymentService.getBanks();
      if (result.success) {
        setBanks(result.banks);
        if (result.banks.length > 0) {
          setSelectedBank(result.banks[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading banks:', error);
    }
  };

  const handleGenerateInstructions = async () => {
    if (!selectedBank) {
      alert(t('Please select a bank', 'እባክዎ ባንክ ይምረጡ'));
      return;
    }

    setLoading(true);

    try {
      const orderRef = orderId || paymentService.generateOrderNumber();

      const result = await paymentService.generateBankInstructions({
        amount,
        bankId: selectedBank,
        customerName,
        customerEmail,
        customerPhone,
        orderId: orderRef
      });

      if (result.success && result.instructions) {
        setInstructions(result.instructions);
      } else {
        if (onError) onError(result.message || 'Failed to generate instructions');
      }
    } catch (error: any) {
      console.error('Error generating instructions:', error);
      if (onError) onError(error.message || 'Failed to generate instructions');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerifyPayment = async () => {
    if (!instructions) return;

    setVerifying(true);

    try {
      const transactionId = prompt(t('Enter your transaction/reference number:', 'የግብይት ቁጥርዎን ያስገቡ:'));
      
      if (!transactionId) {
        setVerifying(false);
        return;
      }

      const result = await paymentService.verifyBankTransfer({
        orderId: instructions.orderId,
        reference: instructions.reference,
        amount: instructions.amount,
        transactionId
      });

      if (result.success && result.verified) {
        if (onSuccess) {
          onSuccess({
            ...result,
            orderId: instructions.orderId,
            reference: instructions.reference
          });
        }
        alert(t('Payment verification submitted! We will confirm within 24 hours.', 'የክፍያ ማረጋገጫ ቀርቧል! በ24 ሰዓታት ውስጥ እናረጋግጣለን።'));
      } else {
        alert(t('Payment verification failed', 'የክፍያ ማረጋገጫ አልተሳካም'));
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      alert(error.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const formatExpiryTime = (expiryTime: string) => {
    try {
      return new Date(expiryTime).toLocaleString(language === 'am' ? 'am-ET' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return expiryTime;
    }
  };

  if (!instructions) {
    return (
      <div className="space-y-4">
        {/* Amount Info */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
          <div className="flex items-start space-x-3">
            <Landmark className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300">
                {t('Bank Transfer', 'የባንክ ዝውውር')}
              </h4>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {paymentService.formatAmount(amount, language)}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('Select Bank', 'ባንክ ይምረጡ')}
          </label>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t('Choose a bank...', 'ባንክ ይምረጡ...')}</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateInstructions}
          disabled={loading || !selectedBank}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 
                   hover:from-purple-700 hover:to-purple-800
                   text-white py-4 rounded-xl font-semibold transition-all 
                   transform hover:scale-105 disabled:bg-gray-400 
                   disabled:cursor-not-allowed disabled:transform-none
                   disabled:from-gray-400 disabled:to-gray-400"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>{t('Generating...', 'በማዘጋጀት ላይ...')}</span>
            </div>
          ) : (
            t('Generate Payment Instructions', 'የክፍያ መመሪያዎችን ያዘጋጁ')
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Instructions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('Bank Transfer Instructions', 'የባንክ ዝውውር መመሪያዎች')}
        </h3>

        {/* Bank Info */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('Bank', 'ባንክ')}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {instructions.bank.name}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('Account Name', 'የመለያ ስም')}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {instructions.bank.accountName}
              </span>
              <button
                onClick={() => handleCopyToClipboard(instructions.bank.accountName, 'name')}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title={t('Copy', 'ቅዳ')}
              >
                {copiedField === 'name' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('Account Number', 'የመለያ ቁጥር')}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {instructions.bank.accountNumber}
              </span>
              <button
                onClick={() => handleCopyToClipboard(instructions.bank.accountNumber, 'account')}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title={t('Copy', 'ቅዳ')}
              >
                {copiedField === 'account' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('Branch', 'ቅርንጫፍ')}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {instructions.bank.branch}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('SWIFT Code', 'SWIFT ኮድ')}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {instructions.bank.swiftCode}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
              {t('Amount to Transfer', 'የሚላክ መጠን')}
            </span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {paymentService.formatAmount(instructions.amount, language)}
            </span>
          </div>
        </div>

        {/* Reference Number */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('Your Reference Number', 'የማጣቀሻ ቁጥርዎ')}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                {instructions.reference}
              </span>
              <button
                onClick={() => handleCopyToClipboard(instructions.reference, 'ref')}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title={t('Copy', 'ቅዳ')}
              >
                {copiedField === 'ref' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('Include this number in your transfer reference', 'ይህን ቁጥር በዝውውር ማጣቀሻዎ ውስጥ ያካትቱ')}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            {language === 'am' ? instructions.instructions.am : instructions.instructions.en}
          </p>
        </div>

        {/* Expiry Warning */}
        <div className="flex items-center space-x-2 mt-4 text-amber-600 dark:text-amber-400">
          <Clock className="h-4 w-4" />
          <span className="text-xs">
            {language === 'am'
              ? `እነዚህ መመሪያዎች በ${formatExpiryTime(instructions.expiryTime)} ያበቃሉ`
              : `These instructions expire on ${formatExpiryTime(instructions.expiryTime)}`}
          </span>
        </div>
      </div>

      {/* Verify Payment Button */}
      <button
        onClick={handleVerifyPayment}
        disabled={verifying}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 
                 hover:from-green-700 hover:to-green-800
                 text-white py-4 rounded-xl font-semibold transition-all 
                 transform hover:scale-105 disabled:bg-gray-400 
                 disabled:cursor-not-allowed disabled:transform-none
                 disabled:from-gray-400 disabled:to-gray-400
                 flex items-center justify-center space-x-2"
      >
        {verifying ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>{t('Verifying...', 'በማረጋገጥ ላይ...')}</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5" />
            <span>{t('I have made the transfer', 'ዝውውሩን አድርጌአለሁ')}</span>
          </>
        )}
      </button>

      {/* Note about manual verification */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        {t('Your payment will be verified manually by our team within 24 hours.', 'ክፍያዎ በ24 ሰዓታት ውስጥ በቡድናችን በእጅ ይረጋገጣል።')}
      </p>
    </div>
  );
}