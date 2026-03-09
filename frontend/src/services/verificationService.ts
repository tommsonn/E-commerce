import api from './api';

export interface VerificationResponse {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    email: string;
    fullName: string;
    isEmailVerified: boolean;
  };
  waitTime?: number;
}

export interface VerificationStatusResponse {
  success: boolean;
  isVerified: boolean;
  email: string;
  fullName: string;
}

export interface TokenInfoResponse {
  success: boolean;
  token: {
    email: string;
    fullName: string;
    expiresAt: string;
    isValid: boolean;
    expiresInSeconds: number;
    expiresInHours: string;
  };
}

export const verificationService = {
  /**
   * Send verification email to user
   * @param email - User's email address
   */
  async sendVerificationEmail(email: string): Promise<VerificationResponse> {
    try {
      const response = await api.post('/verification/send', { email });
      return response.data;
    } catch (error: any) {
      console.error('Send verification error:', error);
      throw error;
    }
  },

  /**
   * Verify email with token
   * @param token - Verification token from email link
   */
  async verifyEmail(token: string): Promise<VerificationResponse> {
    try {
      const response = await api.get(`/verification/verify/${token}`);
      return response.data;
    } catch (error: any) {
      console.error('Verify email error:', error);
      throw error;
    }
  },

  /**
   * Check if user's email is verified
   * @param email - User's email address
   */
  async checkVerificationStatus(email: string): Promise<VerificationStatusResponse> {
    try {
      const response = await api.post('/verification/status', { email });
      return response.data;
    } catch (error: any) {
      console.error('Check verification error:', error);
      throw error;
    }
  },

  /**
   * Resend verification email (with rate limiting)
   * @param email - User's email address
   */
  async resendVerificationEmail(email: string): Promise<VerificationResponse> {
    try {
      const response = await api.post('/verification/resend', { email });
      return response.data;
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw error;
    }
  },

  /**
   * Get information about a verification token (for debugging)
   * @param token - Verification token
   */
  async getTokenInfo(token: string): Promise<TokenInfoResponse> {
    try {
      const response = await api.get(`/verification/token-info/${token}`);
      return response.data;
    } catch (error: any) {
      console.error('Get token info error:', error);
      throw error;
    }
  },

  /**
   * Format Ethiopian phone number (for future SMS verification)
   * @param phone - Phone number to format
   */
  formatEthiopianPhone(phone: string): string {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Ethiopian numbers: 9xxxxxxxx or 09xxxxxxxx
    if (cleaned.length === 9) {
      return `+251${cleaned}`;
    } else if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return `+251${cleaned.substring(1)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('251')) {
      return `+${cleaned}`;
    }
    
    return phone; // Return as-is if format is unknown
  }
};