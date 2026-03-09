import { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ message: string }>;
  signOut: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean }>;
  isAdmin: boolean;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Verify token is still valid
          await authService.getCurrentUser();
        } catch (error) {
          // Token expired or invalid
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userData = await authService.login({ email, password });
      
      if (!userData.isEmailVerified) {
        throw new Error('Please verify your email before logging in');
      }
      
      setUser(userData);
    } catch (error: any) {
      if (error.response?.data?.needsVerification) {
        throw new Error('Please verify your email before logging in');
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await authService.signup({ email, password, fullName });
      return { message: response.message || 'Registration successful! Please check your email to verify your account.' };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      console.log('🔍 Verifying email with token:', token);
      const response = await authService.verifyEmail(token);
      console.log('📨 Verify email response:', response);
      
      if (response.user && response.token) {
        // Clear any existing data first to prevent corruption
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Set new data
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        setUser(response.user);
      }
      
      // Return success even if no user data (email verified but not logged in)
      return { success: true };
    } catch (error: any) {
      console.error('❌ Verify email error:', error);
      
      // Check if error is because email is already verified
      if (error.response?.data?.message?.includes('already verified') || 
          error.message?.includes('already verified')) {
        console.log('✅ Email already verified');
        
        // Try to get user data if token exists
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const userData = await authService.getCurrentUser();
            if (userData) {
              localStorage.setItem('user', JSON.stringify(userData));
              setUser(userData);
            }
          } catch (e) {
            console.error('Could not get user data:', e);
          }
        }
        
        // Return success anyway since email is verified
        return { success: true };
      }
      
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const result = await authService.resendVerification(email);
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend verification email');
    }
  };

  const signOut = () => {
    authService.logout();
    setUser(null);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(prev => prev ? { ...prev, ...updatedUser } : null);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update failed');
    }
  };

  const sendVerificationEmail = async () => {
    try {
      await authService.sendVerificationEmail();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send verification email');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    sendVerificationEmail,
    resendVerification,
    verifyEmail,
    isAdmin: user?.isAdmin || false,
    isEmailVerified: user?.isEmailVerified || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}