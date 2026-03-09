import api from './api';

export interface User {
  _id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    region?: string;
  };
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    orderUpdates: boolean;
    promotions: boolean;
  };
  lastLogin?: string;
  token?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  fullName: string;
}

interface AuthResponse {
  _id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  token?: string;
  message?: string;
}

interface VerifyEmailResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  async login(data: LoginData): Promise<User> {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async signup(data: SignupData): Promise<{ message: string }> {
    const response = await api.post('/auth/signup', data);
    // Don't store token - user must verify email first
    return response.data;
  },

async verifyEmail(token: string): Promise<{ success: boolean; message: string; user?: User; token?: string }> {
  try {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  } catch (error: any) {
    console.error('Verify email error:', error);
    
    // If error is 400 but email is actually verified, return success
    if (error.response?.status === 400 && 
        error.response?.data?.message?.includes('already verified')) {
      return { 
        success: true, 
        message: 'Email already verified' 
      };
    }
    
    throw error;
  }
},

  async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to resend verification email'
    };
  }
},

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/auth/profile', data);
    // Update stored user data
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...response.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return response.data;
  },

  async sendVerificationEmail(): Promise<{ message: string }> {
    const response = await api.post('/auth/send-verification');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};