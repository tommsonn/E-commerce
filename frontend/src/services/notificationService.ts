import api from './api';

export interface Notification {
  _id: string;
  userId: string;
  type: 'order' | 'promotion' | 'system' | 'security' | 'reminder' | 'contact';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
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
  total: number;
  pages: number;
  page: number;
  unreadCount: number;
}

export const notificationService = {
  // Get notifications with pagination and filters
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    type?: string;
  }): Promise<NotificationsResponse> {
    try {
      console.log('📡 Fetching notifications with params:', params);
      const response = await api.get('/notifications', { params });
      console.log('📨 Notifications response:', response.data);
      
      return {
        notifications: response.data.notifications || [],
        total: response.data.total || 0,
        pages: response.data.pages || 1,
        page: response.data.page || 1,
        unreadCount: response.data.unreadCount || 0
      };
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return {
        notifications: [],
        total: 0,
        pages: 1,
        page: 1,
        unreadCount: 0
      };
    }
  },

  // Get unread count only
  async getUnreadCount(): Promise<number> {
    try {
      console.log('📡 Fetching unread count');
      const response = await api.get('/notifications/unread-count');
      console.log('📨 Unread count response:', response.data);
      return response.data.count || 0;
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      return 0;
    }
  },

  // Mark single notification as read
  async markAsRead(id: string): Promise<Notification> {
    try {
      console.log('📡 Marking notification as read:', id);
      const response = await api.put(`/notifications/${id}/read`);
      console.log('✅ Notification marked as read');
      return response.data;
    } catch (error) {
      console.error('❌ Error marking as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ message: string }> {
    try {
      console.log('📡 Marking all notifications as read');
      const response = await api.put('/notifications/read-all');
      console.log('✅ All notifications marked as read');
      return response.data;
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      throw error;
    }
  },

  // Delete single notification
  async deleteNotification(id: string): Promise<{ message: string }> {
    try {
      console.log('📡 Deleting notification:', id);
      const response = await api.delete(`/notifications/${id}`);
      console.log('✅ Notification deleted');
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  },

  // Clear all notifications
  async clearAllNotifications(): Promise<{ message: string }> {
    try {
      console.log('📡 Clearing all notifications');
      const response = await api.delete('/notifications/clear-all');
      console.log('✅ All notifications cleared');
      return response.data;
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
      throw error;
    }
  },

  // Get notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      console.log('📡 Fetching notification preferences');
      const response = await api.get('/notifications/preferences');
      console.log('📨 Preferences response:', response.data);
      
      // Return with defaults if data is missing
      return {
        email: response.data.email ?? true,
        push: response.data.push ?? true,
        orderUpdates: response.data.orderUpdates ?? true,
        promotions: response.data.promotions ?? true
      };
    } catch (error) {
      console.error('❌ Error fetching preferences:', error);
      // Return default preferences on error
      return {
        email: true,
        push: true,
        orderUpdates: true,
        promotions: true
      };
    }
  },

  // Update notification preferences
  async updatePreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    try {
      console.log('📡 Updating notification preferences:', preferences);
      const response = await api.put('/notifications/preferences', preferences);
      console.log('✅ Preferences updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
      throw error;
    }
  }
};
