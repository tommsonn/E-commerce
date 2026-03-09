import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Smartphone,
  CreditCard,
  Landmark,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Copy,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface AdminPaymentDetailProps {
  onNavigate: (page: string) => void;
  paymentId?: string;
}

export function AdminPaymentDetail({ onNavigate, paymentId }: AdminPaymentDetailProps) {
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/payments/${paymentId}`);
      setPayment(response.data.payment);
    } catch (error) {
      console.error('Error fetching payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!transactionId.trim()) {
      alert(t('Please enter transaction ID', 'እባክዎ የግብይት መለያ ያስገቡ'));
      return;
    }

    setVerifying(true);
    try {
      const response = await api.post(`/admin/payments/${paymentId}/verify`, {
        transactionId
      });
      
      if (response.data.success) {
        alert(t('Payment verified successfully!', 'ክፍያ በተሳካ ሁኔታ ተረጋግጧል!'));
        fetchPaymentDetails();
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert(t('Failed to verify payment', 'ክፍያ ማረጋገጥ አልተሳካም'));
    } finally {
      setVerifying(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      const response = await api.put(`/admin/payments/${paymentId}/assign`, {
        adminId: user?._id
      });
      
      if (response.data.success) {
        alert(t('Payment assigned to you!', 'ክፍያ ለእርስዎ ተመድቧል!'));
        fetchPaymentDetails();
      }
    } catch (error) {
      console.error('Error assigning payment:', error);
      alert(t('Failed to assign payment', 'ክፍያ መመደብ አልተሳካም'));
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleBackToPayments = () => {
    onNavigate('admin-payments');
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'telebirr': return <Smartphone className="h-6 w-6 text-purple-600" />;
      case 'chapa': return <CreditCard className="h-6 w-6 text-green-600" />;
      case 'bank_transfer': return <Landmark className="h-6 w-6 text-blue-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Failed' },
      expired: { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'Expired' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t('Payment not found', 'ክፍያ አልተገኘም')}
        </h2>
        <button
          onClick={handleBackToPayments}
          className="text-indigo-600 hover:text-indigo-700"
        >
          {t('Back to Payments', 'ወደ ክፍያዎች ተመለስ')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={handleBackToPayments}
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        {t('Back to Payments', 'ወደ ክፍያዎች ተመለስ')}
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getPaymentIcon(payment.paymentMethod)}
              <h1 className="text-xl font-bold text-white">
                {t('Payment Details', 'የክፍያ ዝርዝሮች')}
              </h1>
            </div>
            {getStatusBadge(payment.status)}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                {t('Order Information', 'የትዕዛዝ መረጃ')}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Order #</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {payment.orderId?.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                  <span className="text-sm font-bold text-indigo-600">
                    {payment.amount.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Method</span>
                  <span className="text-sm capitalize text-gray-900 dark:text-white">
                    {payment.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Date</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(payment.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                {t('Customer Information', 'የደንበኛ መረጃ')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {payment.customerInfo?.name || payment.orderId?.customerName}
                  </span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {payment.customerInfo?.email || payment.orderId?.customerEmail}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {payment.customerInfo?.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details (if bank transfer) */}
          {payment.paymentMethod === 'bank_transfer' && payment.bankDetails && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">
                {t('Bank Transfer Details', 'የባንክ ዝውውር ዝርዝሮች')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Bank</p>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    {payment.bankDetails.bankName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Account Name</p>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    {payment.bankDetails.accountName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Account Number</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-mono font-medium text-blue-900 dark:text-blue-200">
                      {payment.bankDetails.accountNumber}
                    </p>
                    <button
                      onClick={() => handleCopy(payment.bankDetails.accountNumber, 'account')}
                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                    >
                      {copiedField === 'account' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-blue-500" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Reference</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-mono font-medium text-blue-900 dark:text-blue-200">
                      {payment.bankDetails.reference}
                    </p>
                    <button
                      onClick={() => handleCopy(payment.bankDetails.reference, 'ref')}
                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                    >
                      {copiedField === 'ref' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-blue-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              {t('Transaction Information', 'የግብይት መረጃ')}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">
                  {payment.transactionId || '-'}
                </span>
              </div>
              {payment.verifiedBy && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Verified By</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {payment.verifiedBy.fullName}
                  </span>
                </div>
              )}
              {payment.verifiedAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Verified At</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(payment.verifiedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {payment.status === 'pending' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {!payment.assignedAdmin && (
                <button
                  onClick={handleAssignToMe}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl
                           transition-colors flex items-center justify-center space-x-2"
                >
                  <Shield className="h-5 w-5" />
                  <span>{t('Assign to Me', 'ለእኔ መድብ')}</span>
                </button>
              )}
              
              {payment.paymentMethod === 'bank_transfer' && (
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder={t('Enter transaction ID', 'የግብይት መለያ ያስገቡ')}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleVerifyPayment}
                    disabled={verifying}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl
                             transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {verifying ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>{t('Verifying...', 'በማረጋገጥ ላይ...')}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>{t('Verify Payment', 'ክፍያ አረጋግጥ')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}