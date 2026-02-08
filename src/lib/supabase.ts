import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          name_am: string | null;
          slug: string;
          description: string | null;
          image_url: string | null;
          display_order: number;
          created_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          name_am: string | null;
          slug: string;
          description: string | null;
          description_am: string | null;
          price: number;
          compare_at_price: number | null;
          images: string[];
          stock_quantity: number;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          order_number: string;
          status: string;
          total_amount: number;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_address: any;
          payment_method: string;
          payment_status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          address: any;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
