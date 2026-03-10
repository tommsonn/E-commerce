import axios from 'axios';

// Get API URL from environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-9dhw.onrender.com/api';

console.log('🔧 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/auth
  timeout: 30000, // 30 second timeout
});

// Request interceptor - add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status}`, response.data);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.error('❌ API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Handle specific status codes
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        console.log('🔒 Unauthorized, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      if (error.response.status === 403) {
        console.error('🚫 Forbidden - insufficient permissions');
      }
      
      if (error.response.status === 404) {
        console.error('🔍 API endpoint not found:', error.config?.url);
        console.log('💡 Make sure your API URL is correct. Current:', API_URL);
      }
      
      if (error.response.status === 500) {
        console.error('💥 Server error - check backend logs');
      }
      
    } else if (error.request) {
      // The request was made but no response was received
      console.error('❌ API No Response:', {
        request: error.request,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method
      });
      console.log('💡 Check if backend server is running and CORS is configured correctly');
    } else {
      // Something happened in setting up the request
      console.error('❌ API Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to check API connectivity
export const checkApiConnection = async () => {
  try {
    const response = await api.get('/test');
    console.log('✅ API connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return { success: false, error: error.message };
  }
};

export default api;