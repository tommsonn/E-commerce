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
  repliedBy?: string;
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
    const response = await api.post('/contact', data);
    return response.data;
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
      const response = await api.get('/contact', { params });
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

  // Get single contact message (admin)
  async getContactMessage(id: string): Promise<ContactMessage> {
    const response = await api.get(`/contact/${id}`);
    return response.data;
  },

  // Mark as read (admin)
  async markAsRead(id: string): Promise<ContactMessage> {
    const response = await api.put(`/contact/${id}/read`);
    return response.data;
  },

  // Reply to message (admin)
  async replyToMessage(id: string, reply: string): Promise<ContactMessage> {
    const response = await api.post(`/contact/${id}/reply`, { reply });
    return response.data;
  },

  // Delete message (admin)
  async deleteMessage(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/contact/${id}`);
    return response.data;
  },
// Get current user's messages (for customers)
async getMyMessages(): Promise<{ messages: ContactMessage[] }> {
  try {
    const response = await api.get('/contact/my-messages');
    return { messages: response.data.messages || [] };
  } catch (error) {
    console.error('Error fetching my messages:', error);
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