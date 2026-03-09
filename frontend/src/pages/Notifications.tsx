import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, ChevronLeft, ChevronRight, Settings, Filter, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { notificationService, Notification } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
}

export function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, filter, typeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      
      if (filter !== 'all') {
        params.isRead = filter === 'read';
      }
      
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      
      const data = await notificationService.getNotifications(params);
      setNotifications(data.notifications);
      setTotalPages(data.pages);
      setTotal(data.total);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setTotal(prev => prev - 1);
      const deleted = notifications.find(n => n._id === id);
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm(t('Clear all notifications?', 'ሁሉንም ማሳወቂያዎች ያጽዱ?'))) return;
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      setTotal(0);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleNotificationAction = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    
    console.log('Notification action clicked:', notification);
    
    // Check if it's a message notification by looking at type or title
    const notificationType = notification.type as string;
    const isMessageNotification = 
      notificationType === 'contact' || 
      notificationType === 'message' ||
      notification.title?.toLowerCase().includes('message') ||
      notification.title?.toLowerCase().includes('contact');
    
    if (isMessageNotification) {
      // Navigate to messages page with message ID if available
      if (notification.data?.messageId) {
        onNavigate(`my-messages/${notification.data.messageId}`);
      } else if (notification.data?.contactId) {
        onNavigate(`my-messages/${notification.data.contactId}`);
      } else {
        onNavigate('my-messages');
      }
    } else if (notification.actionLink) {
      // Handle action link
      if (notification.actionLink.startsWith('/')) {
        onNavigate(notification.actionLink.substring(1));
      } else {
        onNavigate(notification.actionLink);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    const notificationType = type as string;
    switch (notificationType) {
      case 'order': return '🛍️';
      case 'promotion': return '🎉';
      case 'system': return '⚙️';
      case 'security': return '🔒';
      case 'reminder': return '⏰';
      case 'contact': return '💬';
      case 'message': return '💬';
      default: return '📢';
    }
  };

  const getTypeColor = (type: string) => {
    const notificationType = type as string;
    switch (notificationType) {
      case 'order': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'promotion': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'system': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'security': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'reminder': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'contact': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'message': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      default: return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 
                    dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 
                    flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('Sign in to view notifications', 'ማሳወቂያዎችን ለማየት ይግቡ')}
          </h2>
          <button
            onClick={() => onNavigate('login')}
            className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white 
                     rounded-xl transition-all transform hover:scale-105"
          >
            {t('Sign In', 'ግባ')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 
                  dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('Notifications', 'ማሳወቂያዎች')}
              </h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                  {unreadCount} {t('unread', 'ያልተነበቡ')}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center space-x-2 px-4 py-2 
                           bg-indigo-600 hover:bg-indigo-700 text-white 
                           rounded-xl transition-all transform hover:scale-105"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>{t('Mark all as read', 'ሁሉንም እንደተነበቡ ምልክት ያድርጉ')}</span>
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="px-4 py-2 border border-red-300 dark:border-red-800 
                         text-red-600 dark:text-red-400 rounded-xl 
                         hover:bg-red-50 dark:hover:bg-red-900/20 
                         transition-colors"
              >
                {t('Clear all', 'ሁሉንም አጽዳ')}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {t('All', 'ሁሉም')}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${filter === 'unread'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {t('Unread', 'ያልተነበቡ')}
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${filter === 'read'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {t('Read', 'የተነበቡ')}
            </button>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 
                       dark:border-gray-600 rounded-xl text-sm"
            >
              <option value="all">{t('All Types', 'ሁሉም አይነቶች')}</option>
              <option value="order">{t('Orders', 'ትዕዛዞች')}</option>
              <option value="promotion">{t('Promotions', 'ማስተዋወቂያዎች')}</option>
              <option value="system">{t('System', 'ሲስተም')}</option>
              <option value="security">{t('Security', 'ደህንነት')}</option>
              <option value="reminder">{t('Reminders', 'አስታዋሾች')}</option>
              <option value="contact">{t('Messages', 'መልእክቶች')}</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl 
                      border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 
                              border-indigo-200 border-t-indigo-600"></div>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {t('No notifications', 'ምንም ማሳወቂያዎች የሉም')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('You\'re all caught up!', 'ሁሉንም አይተዋል!')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((notification) => {
                const notificationType = notification.type as string;
                const isMessageNotification = 
                  notificationType === 'contact' || 
                  notificationType === 'message' ||
                  notification.title?.toLowerCase().includes('message') ||
                  notification.title?.toLowerCase().includes('contact');
                
                return (
                  <div
                    key={notification._id}
                    className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 
                              transition-colors relative
                              ${!notification.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 text-4xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs 
                                           ${getTypeColor(notification.type)}`}>
                              {notificationType === 'contact' || notificationType === 'message' ? 'Message' : notification.type}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 
                                         rounded-lg transition-colors"
                                title={t('Mark as read', 'እንደተነበበ ምልክት ያድርጉ')}
                              >
                                <CheckCheck className="h-4 w-4 text-indigo-600" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification._id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 
                                       rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                          {notification.message}
                        </p>
                        {notification.data && Object.keys(notification.data).length > 0 && (
                          <div className="mt-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                            <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                              {JSON.stringify(notification.data, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {/* Action Button */}
                        <div className="mt-4">
                          {isMessageNotification ? (
                            <button
                              onClick={() => {
                                if (notification.data?.messageId) {
                                  onNavigate(`my-messages/${notification.data.messageId}`);
                                } else if (notification.data?.contactId) {
                                  onNavigate(`my-messages/${notification.data.contactId}`);
                                } else {
                                  onNavigate('my-messages');
                                }
                                if (!notification.isRead) {
                                  handleMarkAsRead(notification._id);
                                }
                              }}
                              className="inline-flex items-center space-x-2 px-4 py-2 
                                       bg-indigo-600 hover:bg-indigo-700 text-white 
                                       rounded-lg transition-all transform hover:scale-105 
                                       text-sm font-medium"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>
                                {notification.actionText || t('View and Reply', 'ተመልከት እና መልስ ስጥ')}
                              </span>
                            </button>
                          ) : notification.actionLink ? (
                            <button
                              onClick={() => {
                                if (notification.actionLink?.startsWith('/')) {
                                  onNavigate(notification.actionLink.substring(1));
                                } else {
                                  onNavigate(notification.actionLink || '#');
                                }
                                if (!notification.isRead) {
                                  handleMarkAsRead(notification._id);
                                }
                              }}
                              className="inline-flex items-center space-x-1 text-indigo-600 
                                       dark:text-indigo-400 hover:text-indigo-700 
                                       dark:hover:text-indigo-300 font-medium"
                            >
                              <span>{notification.actionText || t('View', 'ተመልከት')}</span>
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                        
                        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <span className="absolute left-0 top-1/2 transform -translate-y-1/2 
                                     w-1 h-12 bg-indigo-500 rounded-r-full"></span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 
                          flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 disabled:opacity-50 
                         disabled:cursor-not-allowed hover:bg-gray-50 
                         dark:hover:bg-gray-700"
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
                className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 disabled:opacity-50 
                         disabled:cursor-not-allowed hover:bg-gray-50 
                         dark:hover:bg-gray-700"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}