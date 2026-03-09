import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { cartService, Cart, CartItem } from '../services/cartService';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      throw new Error('Please sign in to add items to cart');
    }

    try {
      const updatedCart = await cartService.addToCart(productId, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    try {
      // Find the cart item
      const item = cart?.items.find(
        item => 
          (typeof item.productId === 'object' && item.productId._id === productId) ||
          item.productId === productId
      );
      
      if (!item) {
        throw new Error('Item not found in cart');
      }

      const updatedCart = await cartService.updateQuantity(item._id, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    try {
      // Find the cart item
      const item = cart?.items.find(
        item => 
          (typeof item.productId === 'object' && item.productId._id === productId) ||
          item.productId === productId
      );
      
      if (!item) {
        throw new Error('Item not found in cart');
      }

      const updatedCart = await cartService.removeFromCart(item._id);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      await cartService.clearCart();
      setCart(prev => prev ? { ...prev, items: [], totalItems: 0, totalAmount: 0 } : null);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const items = cart?.items || [];
  const totalItems = cart?.totalItems || 0;
  const totalAmount = cart?.totalAmount || 0;

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refetchCart: fetchCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}