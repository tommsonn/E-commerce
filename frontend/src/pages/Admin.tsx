import { useEffect, useState } from 'react';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Star,
  StarOff,
  EyeOff,
  AlertCircle,
  BarChart3,
  Archive,
  Tag,
  Settings,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  User,
  Reply,
  Send,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard // Add this import for payments icon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { productService, Product, Category } from '../services/productService';
import { contactService, ContactMessage } from '../services/contactService';
import { AdminProductForm } from '../components/AdminProductForm';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminCustomers } from './AdminCustomers';
import { AdminContacts } from './AdminContacts';
import { AdminPayments } from './AdminPayments'; // Import the payments component

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  paymentStatus?: string;
  createdAt: string;
}

interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  monthlyRevenue: Array<{ _id: string; total: number }>;
  topProducts: Array<{ _id: string; name: string; sales: number }>;
}

interface ContactStats {
  total: number;
  unread: number;
  replied: number;
  today: number;
}

interface PaymentStats {
  pendingPayments: number;
  completedPayments: number;
  todayPayments: number;
}

interface AdminProps {
  onNavigate: (page: string) => void;
}

type TabType = 'dashboard' | 'products' | 'orders' | 'categories' | 'customers' | 'contacts' | 'payments' | 'settings';

export function Admin({ onNavigate }: AdminProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrders: [],
    monthlyRevenue: [],
    topProducts: []
  });
  const [contactStats, setContactStats] = useState<ContactStats>({
    total: 0,
    unread: 0,
    replied: 0,
    today: 0
  });
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    pendingPayments: 0,
    completedPayments: 0,
    todayPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contactFilter, setContactFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [contactPage, setContactPage] = useState(1);
  const [contactTotalPages, setContactTotalPages] = useState(1);
  const [contactTotal, setContactTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const { isAdmin, user } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
      fetchOrders();
      fetchCategories();
      fetchContacts();
      fetchContactStats();
      fetchPaymentStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'contacts') {
      fetchContacts();
      fetchContactStats();
    }
  }, [activeTab, contactPage, contactFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const data = await contactService.getContactMessages({
        page: contactPage,
        limit: 10,
        isRead: contactFilter === 'unread' ? false : undefined,
        isReplied: contactFilter === 'replied' ? true : undefined,
      });
      setContacts(data.messages);
      setContactTotalPages(data.pages);
      setContactTotal(data.total);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchContactStats = async () => {
    try {
      const data = await contactService.getContactStats();
      setContactStats(data);
    } catch (error) {
      console.error('Error fetching contact stats:', error);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await api.get('/admin/payments/stats/summary');
      setPaymentStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders();
      await fetchDashboardData();
      alert(t('Order status updated successfully', 'የትዕዛዝ ሁኔታ በተሳካ ሁኔታ ተዘምኗል'));
    } catch (error) {
      console.error('Error updating order:', error);
      alert(t('Failed to update order status', 'የትዕዛዝ ሁኔታ ማዘመን አልተሳካም'));
    }
  };

  const handleMarkContactAsRead = async (id: string) => {
    try {
      await contactService.markAsRead(id);
      fetchContacts();
      fetchContactStats();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleReplyToContact = async () => {
    if (!selectedContact || !replyText.trim()) return;
    
    try {
      setReplying(true);
      await contactService.replyToMessage(selectedContact._id, replyText);
      setShowReplyModal(false);
      setReplyText('');
      fetchContacts();
      fetchContactStats();
      alert(t('Reply sent successfully!', 'መልስ በተሳካ ሁኔታ ተልኳል!'));
    } catch (error) {
      console.error('Error sending reply:', error);
      alert(t('Failed to send reply', 'መልስ መላክ አልተሳካም'));
    } finally {
      setReplying(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm(t('Are you sure you want to delete this message?', 'ይህን መልእክት መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት?'))) {
      return;
    }
    
    try {
      await contactService.deleteMessage(id);
      fetchContacts();
      fetchContactStats();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert(t('Failed to delete message', 'መልእክት መሰረዝ አልተሳካም'));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      default:
        return <Package className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center transition-colors duration-500">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('Access Denied', 'መዳረሻ ተከልክሏል')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('You do not have permission to access this page', 'ይህንን ገጽ ለማግኘት ፈቃድ የለዎትም')}
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 
                     text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105
                     focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                     dark:focus:ring-offset-gray-900 shadow-lg hover:shadow-xl"
          >
            {t('Go Home', 'ወደ ቤት ይሂዱ')}
          </button>
        </div>
      </div>
    );
  }

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Settings className="h-8 w-8 mr-3 text-indigo-600 dark:text-indigo-400" />
            {t('Admin Dashboard', 'የአስተዳዳሪ ዳሽቦርድ')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'am' 
              ? `እንኳን ደህና መጡ፣ ${user?.fullName?.split(' ')[0] || 'አስተዳዳሪ'}`
              : `Welcome back, ${user?.fullName?.split(' ')[0] || 'Admin'}`
            }
          </p>
        </div>

        {/* Admin Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="flex space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2
                ${activeTab === 'dashboard'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>{t('Dashboard', 'ዳሽቦርድ')}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2
                ${activeTab === 'products'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <Package className="h-5 w-5" />
              <span>{t('Products', 'ምርቶች')}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2
                ${activeTab === 'orders'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <ShoppingBag className="h-5 w-5" />
              <span>{t('Orders', 'ትዕዛዞች')}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2
                ${activeTab === 'categories'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <Tag className="h-5 w-5" />
              <span>{t('Categories', 'ምድቦች')}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2
                ${activeTab === 'customers'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <Users className="h-5 w-5" />
              <span>{t('Customers', 'ደንበኞች')}</span>
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 relative
                ${activeTab === 'contacts'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>{t('Contacts', 'መገኛዎች')}</span>
              {contactStats?.unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {contactStats.unread}
                </span>
              )}
            </button>

            {/* New Payments Tab */}
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 relative
                ${activeTab === 'payments'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <CreditCard className="h-5 w-5" />
              <span>{t('Payments', 'ክፍያዎች')}</span>
              {paymentStats?.pendingPayments > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {paymentStats.pendingPayments}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 
                            border border-gray-100 dark:border-gray-700
                            hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('Total Orders', 'ጠቅላላ ትዕዛዞች')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalOrders.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12.5% {t('vs last month', 'ካለፈው ወር')}
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 
                            border border-gray-100 dark:border-gray-700
                            hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('Total Revenue', 'ጠቅላላ ገቢ')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalRevenue.toLocaleString()} {t('ETB', 'ብር')}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8.2% {t('vs last month', 'ካለፈው ወር')}
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 
                            border border-gray-100 dark:border-gray-700
                            hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('Total Products', 'ጠቅላላ ምርቶች')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalProducts.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {language === 'am' 
                        ? `${45} ንቁ` 
                        : `${45} active`}
                    </p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                    <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 
                            border border-gray-100 dark:border-gray-700
                            hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('Total Customers', 'ጠቅላላ ደንበኞች')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalCustomers.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +5.3% {t('vs last month', 'ካለፈው ወር')}
                    </p>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                    <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden 
                          border border-gray-100 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  {t('Recent Orders', 'የቅርብ ጊዜ ትዕዛዞች')}
                </h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 
                           dark:hover:text-indigo-300 font-medium"
                >
                  {t('View All', 'ሁሉንም ይመልከቱ')} →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('Order Number', 'የትዕዛዝ ቁጥር')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('Customer', 'ደንበኛ')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('Amount', 'መጠን')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('Status', 'ሁኔታ')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('Date', 'ቀን')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {stats.recentOrders.slice(0, 5).map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          #{order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {order.totalAmount.toLocaleString()} {t('ETB', 'ብር')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 
                            border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  {t('Quick Actions', 'ፈጣን እርምጃዎች')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setActiveTab('products');
                      setTimeout(() => setShowProductForm(true), 100);
                    }}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 
                             dark:hover:bg-gray-600 transition-colors text-left group"
                  >
                    <Plus className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('Add Product', 'ምርት ጨምር')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('Create new product', 'አዲስ ምርት ፍጠር')}
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 
                             dark:hover:bg-gray-600 transition-colors text-left group"
                  >
                    <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('View Orders', 'ትዕዛዞችን ተመልከት')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('Manage pending orders', 'በመጠባበቅ ላይ ያሉ ትዕዛዞችን ያስተዳድሩ')}
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 
                             dark:hover:bg-gray-600 transition-colors text-left group"
                  >
                    <Tag className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('Categories', 'ምድቦች')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('Manage categories', 'ምድቦችን ያስተዳድሩ')}
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('contacts')}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 
                             dark:hover:bg-gray-600 transition-colors text-left group relative"
                  >
                    <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('Contacts', 'መገኛዎች')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('View messages', 'መልእክቶችን ተመልከት')}
                    </p>
                    {contactStats?.unread > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {contactStats.unread}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 
                            border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Archive className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  {t('Inventory Status', 'የክምችት ሁኔታ')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{t('Low Stock Items', 'ዝቅተኛ ክምችት ያላቸው')}</span>
                      <span className="font-medium text-yellow-600 dark:text-yellow-400">12</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{t('Out of Stock', 'ከእቃ የጠፋ')}</span>
                      <span className="font-medium text-red-600 dark:text-red-400">3</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{t('In Stock', 'በክምችት ውስጥ')}</span>
                      <span className="font-medium text-green-600 dark:text-green-400">30</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setActiveTab('products')}
                  className="mt-4 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 
                           hover:bg-gray-100 dark:hover:bg-gray-600 
                           text-gray-700 dark:text-gray-300 rounded-xl 
                           transition-colors text-sm font-medium"
                >
                  {t('Manage Inventory', 'ክምችት ያስተዳድሩ')}
                </button>
              </div>
            </div>

            {/* Admin Note */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-2">
                  <AlertCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-400 mb-1">
                    {t('Admin Note', 'የአስተዳዳሪ ማስታወሻ')}
                  </h3>
                  <p className="text-indigo-800 dark:text-indigo-300">
                    {t(
                      'You have full access to manage products, orders, customers, and contact messages. Use the tabs above to navigate between different sections.',
                      'ምርቶችን፣ ትዕዛዞችን፣ ደንበኞችን እና የመገኛ መልእክቶችን ለማስተዳደር ሙሉ መዳረሻ አለዎት። በተለያዩ ክፍሎች መካከል ለመዘዋወር ከላይ ያሉትን ትሮች ይጠቀሙ።'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <AdminProducts 
            onNavigate={onNavigate}
            showForm={showProductForm}
            setShowForm={setShowProductForm}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
          />
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Orders Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <ShoppingBag className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                {t('Order Management', 'የትዕዛዝ አስተዳደር')}
              </h2>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('Search orders...', 'ትዕዛዞችን ፈልግ...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 
                             rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">{t('All Status', 'ሁሉም ሁኔታ')}</option>
                  <option value="pending">{t('Pending', 'በመጠባበቅ ላይ')}</option>
                  <option value="processing">{t('Processing', 'በማቀድ ላይ')}</option>
                  <option value="shipped">{t('Shipped', 'ተልኳል')}</option>
                  <option value="delivered">{t('Delivered', 'ደርሷል')}</option>
                  <option value="cancelled">{t('Cancelled', 'ተሰርዟል')}</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('Order', 'ትዕዛዝ')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('Customer', 'ደንበኛ')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('Amount', 'መጠን')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('Status', 'ሁኔታ')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('Payment', 'ክፍያ')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('Date', 'ቀን')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('Actions', 'እርምጃዎች')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            #{order.orderNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.customerName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.customerEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {order.totalAmount.toLocaleString()} {t('ETB', 'ብር')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getPaymentStatusColor(order.paymentStatus)
                          }`}>
                            {order.paymentStatus || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-1 
                                     text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="pending">{t('Pending', 'በመጠባበቅ ላይ')}</option>
                            <option value="processing">{t('Processing', 'በማቀድ ላይ')}</option>
                            <option value="shipped">{t('Shipped', 'ተልኳል')}</option>
                            <option value="delivered">{t('Delivered', 'ደርሷል')}</option>
                            <option value="cancelled">{t('Cancelled', 'ተሰርዟል')}</option>
                          </select>
                        </td>
                      </tr>
                    ))}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <ShoppingBag className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">
                              {t('No orders found', 'ምንም ትዕዛዞች አልተገኙም')}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <AdminCategories onNavigate={onNavigate} />
        )}

        {activeTab === 'customers' && (
          <AdminCustomers onNavigate={onNavigate} />
        )}

        {activeTab === 'contacts' && (
          <AdminContacts onNavigate={onNavigate} />
        )}

        {/* New Payments Tab Content */}
        {activeTab === 'payments' && (
          <AdminPayments onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
}