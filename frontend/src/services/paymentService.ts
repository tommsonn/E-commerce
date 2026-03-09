import api from './api';

export interface ChapaPaymentRequest {
  amount: number;
  email: string;
  first_name: string;
  last_name?: string;
  tx_ref: string;
  callback_url?: string;
  return_url?: string;
}

export interface Bank {
  id: string;
  name: string;
}

export interface BankInstructions {
  orderId: string;
  reference: string;
  amount: number;
  bank: {
    name: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string;
    branch: string;
  };
  instructions: {
    en: string;
    am: string;
  };
  qrCode: string | null;
  expiryTime: string;
}

export interface TelebirrPaymentRequest {
  amount: number;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  subject?: string;
}

export interface TelebirrPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  outTradeNo?: string;
  message?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  message?: string;
  transactionId?: string;
  amount?: number;
}

export interface ChapaPaymentResponse {
  success: boolean;
  checkout_url?: string;
  tx_ref?: string;
  message?: string;
  data?: any;
}

export const paymentService = {
  // ============== CHAPA METHODS ==============

  /**
   * Initialize Chapa payment
   */
  async initiateChapaPayment(data: ChapaPaymentRequest): Promise<ChapaPaymentResponse> {
    try {
      const response = await api.post('/payment/chapa/initiate', data);
      return response.data;
    } catch (error: any) {
      console.error('Chapa payment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to initiate Chapa payment'
      };
    }
  },

  // ============== TELEBIRR METHODS ==============

  /**
   * Initialize Telebirr payment
   */
  async initiateTelebirrPayment(data: TelebirrPaymentRequest): Promise<TelebirrPaymentResponse> {
    try {
      const response = await api.post('/payment/telebirr/initiate', data);
      return response.data;
    } catch (error: any) {
      console.error('Telebirr payment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to initiate payment'
      };
    }
  },

  /**
   * Check Telebirr payment status
   */
  async checkTelebirrStatus(outTradeNo: string): Promise<PaymentStatusResponse> {
    try {
      const response = await api.get(`/payment/telebirr/status/${outTradeNo}`);
      return response.data;
    } catch (error: any) {
      console.error('Error checking Telebirr status:', error);
      return {
        success: false,
        status: 'FAILED',
        message: error.response?.data?.message || 'Failed to check payment status'
      };
    }
  },

  // ============== BANK TRANSFER METHODS ==============

  /**
   * Get list of available banks
   */
  async getBanks(): Promise<{ success: boolean; banks: Bank[] }> {
    try {
      const response = await api.get('/payment/banks');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching banks:', error);
      return {
        success: false,
        banks: []
      };
    }
  },

  /**
   * Generate bank transfer instructions
   */
  async generateBankInstructions(data: {
    amount: number;
    bankId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    orderId: string;
  }): Promise<{ success: boolean; instructions?: BankInstructions; message?: string }> {
    try {
      const response = await api.post('/payment/bank/instructions', data);
      return response.data;
    } catch (error: any) {
      console.error('Error generating bank instructions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate instructions'
      };
    }
  },

  /**
   * Verify bank transfer
   */
  async verifyBankTransfer(data: {
    orderId: string;
    reference: string;
    amount: number;
    transactionId: string;
  }): Promise<{ success: boolean; verified: boolean; message?: string }> {
    try {
      const response = await api.post('/payment/bank/verify', data);
      return response.data;
    } catch (error: any) {
      console.error('Error verifying bank transfer:', error);
      return {
        success: false,
        verified: false,
        message: error.response?.data?.message || 'Verification failed'
      };
    }
  },

  // ============== UTILITY METHODS ==============

  /**
   * Format amount with currency
   */
  formatAmount(amount: number, language: 'en' | 'am' = 'en'): string {
    return language === 'am' 
      ? `${amount.toLocaleString()} ብር`
      : `${amount.toLocaleString()} ETB`;
  },

  /**
   * Generate order number
   */
  generateOrderNumber(): string {
    return `ORD-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }
};