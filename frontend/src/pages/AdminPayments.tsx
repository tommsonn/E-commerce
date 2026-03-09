import { useState, useEffect } from 'react';
import { 
  Smartphone, 
  CreditCard, 
  Landmark, 
  CheckCircle, 
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  RefreshCw,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface AdminPaymentsProps {
  onNavigate: (page: string) => void;
}

interface Payment {
  _id: string;
  orderId: {
    _id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
  };
  paymentMethod: 'telebirr' | 'bank_transfer' | 'chapa';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  transactionId?: string;
  assignedAdmin?: { _id: string; fullName: string; email: string };
  verifiedBy?: { _id: string; fullName: string; email: string };
  verifiedAt?: string;
  completedAt?: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
}

interface PaymentStats {
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  todayPayments: number;
  totalAmount: number;
  todayAmount: number;
}

export function AdminPayments({ onNavigate }: AdminPaymentsProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filterStatus, filterMethod, currentPage]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/payments', {
        params: {
          status: filterStatus,
          method: filterMethod,
          page: currentPage,
          limit: 10
        }
      });
      setPayments(response.data.payments || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/payments/stats/summary');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments();
    fetchStats();
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'telebirr': 
        return <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'chapa': 
        return <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'bank_transfer': 
        return <Landmark className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default: 
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
      expired: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: XCircle }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' ETB';
  };

  const handleViewPayment = (paymentId: string) => {
    onNavigate(`admin/payments/${paymentId}`);
  };

  const filteredPayments = payments.filter(p => 
    search ? 
      p.customerInfo?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.customerInfo?.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.orderId?.orderNumber?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('Payment Management', 'የክፍያ አስተዳደር')}
        </h2>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                   rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 
                   dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{t('Refresh', 'አድስ')}</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPayments}</p>
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{formatCurrency(stats.totalAmount)}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedPayments}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                <p className="text-2xl font-bold text-purple-600">{stats.todayPayments}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{formatCurrency(stats.todayAmount)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('Search by customer or order...', 'በደንበኛ ወይም ትዕዛዝ ይፈልጉ...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">{t('All Status', 'ሁሉም ሁኔታ')}</option>
            <option value="pending">{t('Pending', 'በመጠባበቅ ላይ')}</option>
            <option value="processing">{t('Processing', 'በማስኬድ ላይ')}</option>
            <option value="completed">{t('Completed', 'ተጠናቅቋል')}</option>
            <option value="failed">{t('Failed', 'አልተሳካም')}</option>
          </select>

          {/* Method Filter */}
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">{t('All Methods', 'ሁሉም ዘዴዎች')}</option>
            <option value="telebirr">{t('Telebirr', 'ቴሌብር')}</option>
            <option value="chapa">{t('Chapa', 'ቻፓ')}</option>
            <option value="bank_transfer">{t('Bank Transfer', 'የባንክ ዝውውር')}</option>
          </select>

          {/* Auto-assign button */}
          <button
            onClick={async () => {
              if (confirm(t('Auto-assign pending payments?', 'በመጠባበቅ ላይ ያሉ ክፍያዎችን በራስ-ሰር ይመድቡ?'))) {
                try {
                  const response = await api.post('/admin/payments/assign-auto');
                  alert(response.data.message);
                  fetchPayments();
                } catch (error) {
                  alert('Failed to auto-assign payments');
                }
              }
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg
                     text-sm font-medium transition-colors"
          >
            {t('Auto-Assign', 'ራስ-ሰር መድብ')}
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('Method', 'ዘዴ')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('Order/Customer', 'ትዕዛዝ/ደንበኛ')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('Amount', 'መጠን')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('Status', 'ሁኔታ')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('Assigned To', 'የተመደበለት')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('Date', 'ቀን')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('Actions', 'ድርጊቶች')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPaymentIcon(payment.paymentMethod)}
                          <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                            {payment.paymentMethod.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.orderId?.orderNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.customerInfo?.name || payment.orderId?.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {payment.assignedAdmin?.fullName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewPayment(payment._id)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title={t('View Details', 'ዝርዝሮችን ይመልከቱ')}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  {t('Previous', 'ቀዳሚ')}
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t(`Page ${currentPage} of ${totalPages}`, `ገጽ ${currentPage} ከ ${totalPages}`)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  {t('Next', 'ቀጣይ')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}