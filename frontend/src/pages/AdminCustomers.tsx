import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  UserCheck,
  UserX,
  Filter,
  Download,
  Eye,
  Star,
  TrendingUp,
  Clock,
  X
} from 'lucide-react';

interface Customer {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    region?: string;
  };
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  totalOrders?: number;
  totalSpent?: number;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  totalOrders: number;
  totalRevenue: number;
  customersWithOrders: number;
}

interface AdminCustomersProps {
  onNavigate: (page: string) => void;
}

export function AdminCustomers({ onNavigate }: AdminCustomersProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomersThisMonth: 0,
    totalOrders: 0,
    totalRevenue: 0,
    customersWithOrders: 0
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterAdmin, setFilterAdmin] = useState<'all' | 'admin' | 'customer'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [currentPage, searchQuery, filterStatus, filterAdmin, dateRange]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined
      };
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      if (filterAdmin !== 'all') {
        params.isAdmin = filterAdmin === 'admin';
      }
      
      if (dateRange !== 'all') {
        params.dateRange = dateRange;
      }
      
      const response = await api.get('/admin/customers', { params });
      setCustomers(response.data.customers || []);
      setTotalPages(response.data.pages || 1);
      setTotalCustomers(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/customer-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
    fetchStats();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const handleToggleAdmin = async (customerId: string, currentStatus: boolean) => {
    if (!confirm(t(
      `Are you sure you want to ${currentStatus ? 'remove admin privileges from' : 'make this user an admin'}?`,
      `እርግጠኛ ነዎት ${currentStatus ? 'የአስተዳዳሪ መብቶችን ለማስወገድ' : 'ይህን ተጠቃሚ አስተዳዳሪ ለማድረግ'}?`
    ))) {
      return;
    }

    try {
      await api.put(`/admin/customers/${customerId}/toggle-admin`, { isAdmin: !currentStatus });
      fetchCustomers();
      fetchStats();
      alert(t('User updated successfully!', 'ተጠቃሚ በተሳካ ሁኔታ ተዘምኗል!'));
    } catch (error) {
      console.error('Error toggling admin status:', error);
      alert(t('Failed to update user', 'ተጠቃሚን ማዘመን አልተሳካም'));
    }
  };

  const handleExportData = () => {
    const csvData = customers.map(c => ({
      Name: c.fullName,
      Email: c.email,
      Phone: c.phone || 'N/A',
      City: c.address?.city || 'N/A',
      Region: c.address?.region || 'N/A',
      'Member Since': new Date(c.createdAt).toLocaleDateString(),
      'Account Type': c.isAdmin ? 'Admin' : 'Customer',
      'Total Orders': c.totalOrders || 0,
      'Total Spent': c.totalSpent || 0
    }));

    const csv = convertToCSV(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const convertToCSV = (data: any[]) => {
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => JSON.stringify(obj[header] || '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ${t('ETB', 'ብር')}`;
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-indigo-600 dark:bg-indigo-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
            {t('Customer Management', 'የደንበኛ አስተዳደር')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {language === 'am' 
              ? `ጠቅላላ ${totalCustomers} ደንበኞች`
              : `Total ${totalCustomers} customers`
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExportData}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 
                     text-white rounded-xl transition-all transform hover:scale-105
                     shadow-md hover:shadow-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            {t('Export', 'ኤክስፖርት')}
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 
                     dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 
                     rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('Refresh', 'አድስ')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('Total', 'ጠቅላላ')}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.totalCustomers.toLocaleString()}
              </p>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('Active', 'ንቁ')}
              </p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {stats.activeCustomers.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('New This Month', 'በዚህ ወር አዲስ')}
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {stats.newCustomersThisMonth.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('With Orders', 'ትዕዛዝ ያላቸው')}
              </p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {stats.customersWithOrders.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('Total Orders', 'ጠቅላላ ትዕዛዞች')}
              </p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {stats.totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('Revenue', 'ገቢ')}
              </p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 
                    border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('Search by name or email...', 'በስም ወይም በኢሜይል ፈልግ...')}
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                       rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{t('All Customers', 'ሁሉም ደንበኞች')}</option>
            <option value="active">{t('Active Only', 'ንቁ ብቻ')}</option>
            <option value="inactive">{t('Inactive Only', 'ያልነቃሉ ብቻ')}</option>
          </select>

          {/* Admin Filter */}
          <select
            value={filterAdmin}
            onChange={(e) => setFilterAdmin(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{t('All Types', 'ሁሉም አይነቶች')}</option>
            <option value="admin">{t('Admins Only', 'አስተዳዳሪዎች ብቻ')}</option>
            <option value="customer">{t('Customers Only', 'ደንበኞች ብቻ')}</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{t('All Time', 'ሁልጊዜ')}</option>
            <option value="today">{t('Today', 'ዛሬ')}</option>
            <option value="week">{t('This Week', 'በዚህ ሳምንት')}</option>
            <option value="month">{t('This Month', 'በዚህ ወር')}</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden
                    border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Customer', 'ደንበኛ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Contact', 'መገኛ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Location', 'አካባቢ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Joined', 'የተቀላቀሉበት')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Orders', 'ትዕዛዞች')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Status', 'ሁኔታ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('Actions', 'እርምጃዎች')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {customers.map((customer) => (
                <tr 
                  key={customer._id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => handleViewCustomer(customer)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 
                                    rounded-full flex items-center justify-center text-white font-bold">
                        {customer.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.fullName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {customer._id.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white flex items-center mb-1">
                      <Mail className="h-3 w-3 mr-1 text-gray-400" />
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" />
                        {customer.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {customer.address ? (
                      <div className="text-sm text-gray-900 dark:text-white flex items-start">
                        <MapPin className="h-3 w-3 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                        <span>
                          {customer.address.city || customer.address.region || t('Not specified', 'አልተገለጸም')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-500">
                        {t('No address', 'አድራሻ የለም')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(customer.createdAt)}
                    </div>
                    {customer.lastLogin && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {t('Last login', 'የመጨረሻ ግቤት')}: {new Date(customer.lastLogin).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {customer.totalOrders || 0}
                    </div>
                    {customer.totalSpent ? (
                      <div className="text-xs text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {customer.isAdmin ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                     bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        {t('Admin', 'አስተዳዳሪ')}
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                     bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {t('Customer', 'ደንበኛ')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCustomer(customer);
                        }}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 
                                 dark:hover:text-indigo-300 p-1 rounded-md
                                 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        title={t('View Details', 'ዝርዝሮችን ተመልከት')}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAdmin(customer._id, customer.isAdmin);
                        }}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 
                                 dark:hover:text-indigo-300 p-1 rounded-md
                                 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        title={customer.isAdmin ? t('Remove Admin', 'አስተዳዳሪ አስወግድ') : t('Make Admin', 'አስተዳዳሪ አድርግ')}
                      >
                        {customer.isAdmin ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {customers.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        {t('No customers found', 'ምንም ደንበኞች አልተገኙም')}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 
                        flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 
                       text-gray-700 dark:text-gray-300 disabled:opacity-50 
                       disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {language === 'am' 
                ? `ገጽ ${currentPage} ከ ${totalPages}`
                : `Page ${currentPage} of ${totalPages}`
              }
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 
                       text-gray-700 dark:text-gray-300 disabled:opacity-50 
                       disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto
                        border border-gray-100 dark:border-gray-700">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 
                          px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('Customer Details', 'የደንበኛ ዝርዝሮች')}
              </h2>
              <button
                onClick={() => setShowCustomerDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-indigo-600 
                              rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedCustomer.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCustomer.fullName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('Phone', 'ስልክ')}
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                      {selectedCustomer.phone || t('Not provided', 'አልተሰጠም')}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('Address', 'አድራሻ')}
                    </label>
                    {selectedCustomer.address ? (
                      <>
                        <p className="text-gray-900 dark:text-white mt-1">{selectedCustomer.address.street}</p>
                        <p className="text-gray-900 dark:text-white">
                          {selectedCustomer.address.city}, {selectedCustomer.address.region}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t('No address provided', 'አድራሻ አልተሰጠም')}
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('Account Type', 'የመለያ አይነት')}
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                      {selectedCustomer.isAdmin 
                        ? t('Administrator', 'አስተዳዳሪ')
                        : t('Regular Customer', 'መደበኛ ደንበኛ')}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('Member Since', 'አባል የሆኑበት')}
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                      {formatDate(selectedCustomer.createdAt)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('Last Updated', 'መጨረሻ የተዘመነበት')}
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                      {formatDate(selectedCustomer.updatedAt)}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('Statistics', 'ስታቲስቲክስ')}
                    </label>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('Total Orders', 'ጠቅላላ ትዕዛዞች')}:
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {selectedCustomer.totalOrders || 0}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('Total Spent', 'ጠቅላላ ወጪ')}:
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {selectedCustomer.totalSpent ? formatCurrency(selectedCustomer.totalSpent) : '0 ETB'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCustomerDetails(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-xl text-gray-700 dark:text-gray-300 
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('Close', 'ዝጋ')}
                </button>
                <button
                  onClick={() => {
                    setShowCustomerDetails(false);
                    handleToggleAdmin(selectedCustomer._id, selectedCustomer.isAdmin);
                  }}
                  className={`px-4 py-2 rounded-xl transition-all transform hover:scale-105
                            ${selectedCustomer.isAdmin 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                  {selectedCustomer.isAdmin 
                    ? t('Remove Admin', 'አስተዳዳሪ አስወግድ')
                    : t('Make Admin', 'አስተዳዳሪ አድርግ')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}