import api from './api';

export interface ContactData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactMessage extends ContactData {
  _id: string;
  isRead: boolean;
  isReplied: boolean;
  repliedAt?: string;
  repliedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  reply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactStats {
  total: number;
  unread: number;
  replied: number;
  today: number;
}

export interface ContactResponse {
  message: string;
  contact: ContactMessage;
}

export const contactService = {
  // Submit contact form (public)
  async submitContact(data: ContactData): Promise<ContactResponse> {
    try {
      console.log('📝 Submitting contact form:', data);
      const response = await api.post('/contact', data);
      console.log('✅ Contact submitted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error submitting contact:', error);
      throw error;
    }
  },

  // Get all contact messages (admin)
  async getContactMessages(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    isReplied?: boolean;
    search?: string;
  }): Promise<{ messages: ContactMessage[]; total: number; pages: number }> {
    try {
      console.log('📡 Fetching contact messages with params:', params);
      const response = await api.get('/contact', { params });
      console.log('✅ Contact messages fetched:', response.data);
      return {
        messages: response.data.messages || [],
        total: response.data.total || 0,
        pages: response.data.pages || 1
      };
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      return { messages: [], total: 0, pages: 1 };
    }
  },

  // Get contact stats (admin)
  async getContactStats(): Promise<ContactStats> {
    try {
      const response = await api.get('/contact/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching contact stats:', error);
      return { total: 0, unread: 0, replied: 0, today: 0 };
    }
  },

  // Get single contact message by ID
  async getMessageById(id: string): Promise<ContactMessage> {
    try {
      console.log('📡 Fetching message by ID:', id);
      const response = await api.get(`/contact/${id}`);
      console.log('✅ Message fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching message by ID:', {
        id,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  },

  // Mark as read
  async markAsRead(id: string): Promise<ContactMessage> {
    try {
      console.log('📡 Marking message as read:', id);
      const response = await api.put(`/contact/${id}/read`);
      console.log('✅ Message marked as read');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error marking as read:', {
        id,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  },

  // Reply to message (admin)
  async replyToMessage(id: string, reply: string): Promise<ContactMessage> {
    try {
      console.log('📡 Replying to message:', id);
      console.log('💬 Reply content:', reply);
      const response = await api.post(`/contact/${id}/reply`, { reply });
      console.log('✅ Reply sent:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error replying to message:', {
        id,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  },

  // Delete message (admin)
  async deleteMessage(id: string): Promise<{ message: string }> {
    try {
      console.log('📡 Deleting message:', id);
      const response = await api.delete(`/contact/${id}`);
      console.log('✅ Message deleted:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting message:', {
        id,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  },

  // Get current user's messages (for customers) OR all messages (for admins)
  async getMyMessages(): Promise<{ messages: ContactMessage[] }> {
    try {
      console.log('📡 Calling API: /contact/my-messages');
      const response = await api.get('/contact/my-messages');
      console.log('📨 API Response:', response.data);
      console.log('📨 Messages count:', response.data.messages?.length);
      return { messages: response.data.messages || [] };
    } catch (error: any) {
      console.error('❌ Error fetching my messages:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      return { messages: [] };
    }
  },

  // Format date helper
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Get status color helper
  getStatusColor(status: 'unread' | 'read' | 'replied'): string {
    switch (status) {
      case 'unread':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'read':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'replied':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }
};
