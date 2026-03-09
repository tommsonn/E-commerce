import api from './api';
import { Product } from './productService';

export interface CartItem {
  _id: string;
  id?: string; // For backward compatibility
  productId: string | Product;
  quantity: number;
  productSnapshot: {
    name: string;
    nameAm?: string;
    price: number;
    images: string[];
  };
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export const cartService = {
  // Get user cart
  async getCart(): Promise<Cart> {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add item to cart
  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  },

  // Update cart item quantity
  async updateQuantity(itemId: string, quantity: number): Promise<Cart> {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data;
  },

  // Remove item from cart
  async removeFromCart(itemId: string): Promise<Cart> {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },

  // Clear entire cart
  async clearCart(): Promise<{ message: string; items: [] }> {
    const response = await api.delete('/cart');
    return response.data;
  }
};