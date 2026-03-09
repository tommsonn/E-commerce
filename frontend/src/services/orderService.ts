import api from './api';

export interface Order {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'failed';
  paymentMethod: string;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  paymentDetails?: any;
}

export const orderService = {
  async createOrder(data: any): Promise<Order> {
    const response = await api.post('/orders', data);
    return response.data;
  },

  async getUserOrders(): Promise<Order[]> {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Check if order needs payment
  needsPayment(order: Order): boolean {
    return order.paymentStatus === 'pending' && 
           ['telebirr', 'chapa', 'bank_transfer'].includes(order.paymentMethod);
  },

  // Get payment status display text
  getPaymentStatusText(status: string): { en: string; am: string } {
    const map: Record<string, { en: string; am: string }> = {
      pending: { en: 'Pending Payment', am: 'ክፍያ በመጠባበቅ ላይ' },
      partial: { en: 'Partially Paid', am: 'በከፊል ተከፍሏል' },
      paid: { en: 'Paid', am: 'ተከፍሏል' },
      failed: { en: 'Payment Failed', am: 'ክፍያ አልተሳካም' }
    };
    return map[status] || { en: status, am: status };
  },

  // Get payment action button text
  getPaymentActionText(method: string): { en: string; am: string } {
    const map: Record<string, { en: string; am: string }> = {
      telebirr: { en: 'Pay with Telebirr', am: 'በቴሌብር ይክፈሉ' },
      chapa: { en: 'Pay with Chapa', am: 'በቻፓ ይክፈሉ' },
      bank_transfer: { en: 'View Bank Details', am: 'የባንክ መረጃ ይመልከቱ' }
    };
    return map[method] || { en: 'Make Payment', am: 'ክፍያ ይክፈሉ' };
  }
};