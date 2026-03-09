import api from './api';

export interface Notification {
  _id: string;
  userId: string;
  type: 'order' | 'promotion' | 'system' | 'security' | 'reminder';
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  isArchived: boolean;
  actionLink?: string;
  actionText?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  orderUpdates: boolean;
  promotions: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  page: number;
  pages: number;
  total: number;
}

export const notificationService = {
  // ============== NOTIFICATION APIs ==============
  
  // Get all notifications with pagination and filters
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
  }): Promise<NotificationsResponse> {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get unread count only
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/notifications?limit=1&isRead=false');
      return response.data.unreadCount || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Mark a single notification as read
  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  },

  // Delete a single notification
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    await api.delete('/notifications');
  },

  // ============== PREFERENCE APIs ==============
  
  // Get notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await api.get('/notifications/preferences');
      // Ensure we have default values if some are missing
      const defaultPrefs: NotificationPreferences = {
        email: true,
        push: true,
        orderUpdates: true,
        promotions: true,
      };
      return { ...defaultPrefs, ...response.data };
    } catch (error) {
      console.error('Error fetching preferences:', error);
      // Return default preferences on error
      return {
        email: true,
        push: true,
        orderUpdates: true,
        promotions: true,
      };
    }
  },

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },

  // ============== UTILITY METHODS ==============
  
  // Get icon emoji based on notification type
  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      order: '🛍️',
      promotion: '🎉',
      system: '⚙️',
      security: '🔒',
      reminder: '⏰',
    };
    return icons[type] || '📢';
  },

  // Get background color class based on type
  getNotificationColor(type: string): string {
    const colors: Record<string, string> = {
      order: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      promotion: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      system: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      security: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      reminder: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return colors[type] || 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
  },

  // Format date to time ago
  timeAgo(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return past.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  // Format date with time for detailed view
  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
};