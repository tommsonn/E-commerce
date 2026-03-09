import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, Settings, ShoppingBag, Megaphone, Shield, Clock, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { notificationService, Notification } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

interface NotificationBellProps {
  onNavigate: (page: string) => void;
}

export function NotificationBell({ onNavigate }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, showAll]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowAll(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications({ limit: showAll ? 50 : 5 });
      console.log('Fetched notifications:', data);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
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
      setUnreadCount(0);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
    
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    
    // Use type assertion to avoid TypeScript errors
    const notificationType = (notification.type || '') as string;
    const notificationTitle = (notification.title || '').toLowerCase();
    
    // Check if it's a message notification using multiple conditions
    const isMessageNotification = 
      notificationType === 'contact' || 
      notificationType === 'message' ||
      notificationTitle.includes('message') ||
      notificationTitle.includes('reply') ||
      notificationTitle.includes('contact') ||
      (notification.message || '').toLowerCase().includes('message from');
    
    console.log('Is message notification:', isMessageNotification);
    
    if (isMessageNotification) {
      // Check for message ID in various possible locations
      const messageId = notification.data?.contactId || 
                       notification.data?.messageId || 
                       notification.data?.id ||
                       (notification.actionLink && notification.actionLink.includes('/my-messages/') 
                         ? notification.actionLink.split('/my-messages/')[1]?.split('?')[0] 
                         : null);
      
      console.log('Extracted messageId:', messageId);
      
      if (messageId) {
        // Navigate to specific message
        onNavigate(`my-messages/${messageId}`);
      } else if (notification.actionLink) {
        // Use actionLink if available
        console.log('Using actionLink:', notification.actionLink);
        // Remove leading slash if present
        const link = notification.actionLink.startsWith('/') 
          ? notification.actionLink.substring(1) 
          : notification.actionLink;
        onNavigate(link);
      } else {
        // Fallback to messages list
        console.log('No message ID found, navigating to my-messages');
        onNavigate('my-messages');
      }
    } else if (notification.actionLink) {
      // Handle other notification types
      const link = notification.actionLink.startsWith('/') 
        ? notification.actionLink.substring(1) 
        : notification.actionLink;
      onNavigate(link);
    }
    
    setShowDropdown(false);
  };

  const getNotificationIcon = (type: string): JSX.Element => {
    // Use type assertion to handle any type
    const notificationType = (type || '') as string;
    
    switch (notificationType) {
      case 'order':
        return <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'promotion':
        return <Megaphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      case 'security':
        return <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'contact':
      case 'message':
        return <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTypeColor = (type: string): string => {
    // Use type assertion to handle any type
    const notificationType = (type || '') as string;
    
    switch (notificationType) {
      case 'order':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'promotion':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'system':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'security':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'contact':
      case 'message':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      default:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
    }
  };

  const timeAgo = (date: string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('Just now', 'አሁን');
    
    if (diffMins < 60) {
      return language === 'am' 
        ? `${diffMins} ደቂቃ በፊት`
        : `${diffMins} min ago`;
    }
    
    if (diffHours < 24) {
      return language === 'am'
        ? `${diffHours} ሰዓት በፊት`
        : `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    
    if (diffDays < 7) {
      return language === 'am'
        ? `${diffDays} ቀን በፊት`
        : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    
    return past.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-700 dark:text-gray-200 
                 hover:bg-gray-100 dark:hover:bg-gray-800 
                 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label={t('Notifications', 'ማሳወቂያዎች')}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white 
                         text-xs font-bold rounded-full h-5 w-5 
                         flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 
                      rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 
                      z-50 overflow-hidden animate-slideDown">
          
          {/* Header - FIXED: NO GAP between bell icon and text */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 
                        bg-gradient-to-r from-indigo-50 to-indigo-100 
                        dark:from-indigo-900/30 dark:to-indigo-800/30">
            <div className="flex items-center justify-between">
              {/* REMOVED ALL SPACING - bell and text are now directly adjacent */}
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white ml-0">
                  {t('Notifications', 'ማሳወቂያዎች')}
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                    {unreadCount} {t('new', 'አዲስ')}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-1.5 hover:bg-indigo-200 dark:hover:bg-indigo-800 
                             rounded-lg transition-colors group"
                    title={t('Mark all as read', 'ሁሉንም እንደተነበቡ ምልክት ያድርጉ')}
                  >
                    <CheckCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 
                                        group-hover:scale-110 transition-transform" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowAll(!showAll);
                    fetchNotifications();
                  }}
                  className="px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400
                           hover:bg-indigo-200 dark:hover:bg-indigo-800 
                           rounded-lg transition-colors"
                >
                  {showAll ? t('Less', 'ያነሰ') : t('All', 'ሁሉም')}
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 
                              border-indigo-200 border-t-indigo-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-full w-16 h-16 
                              flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {t('No notifications', 'ምንም ማሳወቂያዎች የሉም')}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {t('You\'re all caught up!', 'ሁሉንም አይተዋል!')}
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                // Use type assertion for each notification
                const notificationType = (notification.type || '') as string;
                const notificationTitle = (notification.title || '').toLowerCase();
                
                const isMessageNotification = 
                  notificationType === 'contact' || 
                  notificationType === 'message' ||
                  notificationTitle.includes('message') ||
                  notificationTitle.includes('reply') ||
                  notificationTitle.includes('contact');
                
                return (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 
                              transition-colors cursor-pointer relative group
                              ${!notification.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full 
                                    ${getTypeColor(notification.type)} bg-opacity-20 
                                    flex items-center justify-center`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-indigo-600 rounded-full ml-2 flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {timeAgo(notification.createdAt)}
                          </span>
                          {isMessageNotification && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                              {notification.actionText || t('View Message', 'መልእክቱን ይመልከቱ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-700 
                          bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onNavigate('notifications');
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 
                         hover:text-indigo-700 dark:hover:text-indigo-300 
                         font-medium px-3 py-1.5 rounded-lg
                         hover:bg-indigo-100 dark:hover:bg-indigo-900/20 
                         transition-colors"
              >
                {t('View all', 'ሁሉንም ይመልከቱ')}
              </button>
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 dark:text-red-400 
                         hover:text-red-700 dark:hover:text-red-300 
                         font-medium px-3 py-1.5 rounded-lg
                         hover:bg-red-100 dark:hover:bg-red-900/20 
                         transition-colors"
              >
                {t('Clear all', 'ሁሉንም አጽዳ')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}