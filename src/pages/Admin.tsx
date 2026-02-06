import { useEffect, useState } from 'react';
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  customer_name: string;
  created_at: string;
}

interface AdminProps {
  onNavigate: (page: string) => void;
}

export function Admin({ onNavigate }: AdminProps) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [ordersResult, productsResult, profilesResult] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('products').select('id'),
        supabase.from('user_profiles').select('id'),
      ]);

      if (ordersResult.data) {
        setStats((prev) => ({
          ...prev,
          totalOrders: ordersResult.data.length,
          totalRevenue: ordersResult.data.reduce((sum, order) => sum + order.total_amount, 0),
        }));
        setRecentOrders(ordersResult.data.slice(0, 10));
      }

      if (productsResult.data) {
        setStats((prev) => ({ ...prev, totalProducts: productsResult.data.length }));
      }

      if (profilesResult.data) {
        setStats((prev) => ({ ...prev, totalCustomers: profilesResult.data.length }));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      await fetchAdminData();
      alert(t('Order status updated successfully', 'የትዕዛዝ ሁኔታ በተሳካ ሁኔታ ተዘምኗል'));
    } catch (error) {
      console.error('Error updating order:', error);
      alert(t('Failed to update order status', 'የትዕዛዝ ሁኔታ ማዘመን አልተሳካም'));
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('Access Denied', 'መዳረሻ ተከልክሏል')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('You do not have permission to access this page', 'ይህንን ገጽ ለማግኘት ፈቃድ የለዎትም')}
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('Go Home', 'ወደ ቤት ይሂዱ')}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('Admin Dashboard', 'የአስተዳዳሪ ዳሽቦርድ')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('Total Orders', 'ጠቅላላ ትዕዛዞች')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('Total Revenue', 'ጠቅላላ ገቢ')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalRevenue.toLocaleString()} {t('ETB', 'ብር')}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('Total Products', 'ጠቅላላ ምርቶች')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('Total Customers', 'ጠቅላላ ደንበኞች')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {t('Recent Orders', 'የቅርብ ጊዜ ትዕዛዞች')}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Order Number', 'የትዕዛዝ ቁጥር')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Customer', 'ደንበኛ')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Amount', 'መጠን')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Status', 'ሁኔታ')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Date', 'ቀን')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Actions', 'እርምጃዎች')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.total_amount.toLocaleString()} {t('ETB', 'ብር')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'shipped'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            {t('Admin Note', 'የአስተዳዳሪ ማስታወሻ')}
          </h3>
          <p className="text-green-800">
            {t(
              'This is a simplified admin dashboard. For full product management features, you can extend this interface to add CRUD operations for products, categories, and more.',
              'ይህ ቀለል ያለ የአስተዳዳሪ ዳሽቦርድ ነው። ለሙሉ የምርት አስተዳደር ባህሪያት፣ ይህንን በይነገጽ ለምርቶች፣ ምድቦች እና ሌሎችም CRUD ክወናዎችን ለመጨመር ማራዘም ይችላሉ።'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
