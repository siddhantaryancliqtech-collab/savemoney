import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  sendOTP: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (token) {
          try {
            // Verify token with backend
            const response = await authApi.getCurrentUser();
            setUser(response.user);
          } catch (error) {
            localStorage.removeItem('auth_token');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      const response = await authApi.login({ email: email.toLowerCase().trim(), password });
      
      // Store token
      localStorage.setItem('auth_token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refresh_token', response.refreshToken);
      }
      
      setUser(response.user);
      toast.success('Welcome back!');
      
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: any) => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!data.name || !data.email || !data.password) {
        throw new Error('All fields are required');
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }
      
      if (data.name.length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      
      if (data.phone && !/^\+?[\d\s-()]{10,}$/.test(data.phone)) {
        throw new Error('Please enter a valid phone number');
      }
      
      const response = await authApi.signup({
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim(),
        password: data.password,
      });
      
      // Store token
      localStorage.setItem('auth_token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refresh_token', response.refreshToken);
      }
      
      setUser(response.user);
      
      // Send welcome email with OTP
      try {
        await sendOTP(data.email, data.name);
      } catch (emailError) {
        console.warn('Failed to send welcome email:', emailError);
        // Don't throw error here as account is already created
      }
      
      toast.success('Account created successfully! Please check your email for verification.');
      
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // This would integrate with Google OAuth via backend
      throw new Error('Google login will be implemented with backend integration');
      
    } catch (error: any) {
      toast.error(error.message || 'Google login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFacebook = async () => {
    try {
      setIsLoading(true);
      
      // This would integrate with Facebook OAuth via backend
      throw new Error('Facebook login will be implemented with backend integration');
      
    } catch (error: any) {
      toast.error(error.message || 'Facebook login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      setIsLoading(true);
      
      // Validate OTP format
      if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        throw new Error('Please enter a valid 6-digit OTP');
      }
      
      if (!email) {
        throw new Error('Email is required for OTP verification');
      }
      
      const response = await authApi.verifyOTP({ phone: email, otp });
      setUser(response.user);
      
      toast.success('Email verified successfully!');
      
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (email: string, name?: string) => {
    try {
      setIsLoading(true);
      
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // This would call backend API to send OTP
      console.log('Sending OTP to:', email);
      
      toast.success('OTP sent to your email address');
      
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast.error(error.message || 'Failed to send OTP');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      await authApi.forgotPassword(email);
      
      toast.success('If an account with this email exists, you will receive a password reset link.');
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to send password reset email');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setIsLoading(true);
      
      try {
        await authApi.logout();
      } catch (error) {
        console.error('Logout API error:', error);
        // Continue with logout even if API fails
      }
      
      // Clear all auth-related data
      localStorage.clear();
      sessionStorage.clear();
      
      // Reset user state
      setUser(null);
      
      toast.success('Logged out successfully');
      
      // Redirect to home page
      window.location.href = '/';
      
    } catch (error: any) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    loginWithGoogle,
    loginWithFacebook,
    verifyOTP,
    sendOTP,
    resetPassword,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};