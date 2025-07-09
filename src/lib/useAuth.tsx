"use client"

import React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type User = {
  id: string;
  username: string;
  role: string;
  avatar?: string;
  balance: {
    available: number;
    frozen: number;
  };
  bank?: {
    name: string;
    accountNumber: string;
    accountHolder: string;
  };
  verification?: {
    verified: boolean;
    cccdFront: string;
    cccdBack: string;
  };
  status?: {
    active: boolean;
    betLocked: boolean;
    withdrawLocked: boolean;
  };
  createdAt?: string;
  lastLogin?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function useAuthStandalone(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication status...');
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // This ensures cookies are sent with the request
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('Auth check response status:', res.status);
      
      if (res.ok) {
        const data = await res.json().catch(e => {
          console.error('Error parsing auth response:', e);
          return null;
        });
        
        if (data?.success && data.user) {
          console.log('User authenticated:', data.user.username);
          setUser(data.user);
        } else {
          console.log('No user in auth response:', data);
          setUser(null);
        }
      } else {
        console.log('Auth check failed with status:', res.status);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      console.log('=== Login Attempt Started ===');
      console.log('Username:', username);
      
      // Basic input validation
      if (!username || !password) {
        console.error('Validation failed: Missing username or password');
        return { success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu' };
      }

      // Create full URL to ensure it's correct
      const apiUrl = new URL('/api/login', window.location.origin).toString();
      console.log('Sending login request to:', apiUrl);
      
      const startTime = Date.now();
      let res;
      
      try {
        res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          body: JSON.stringify({ 
            username: username.trim(), 
            password: password 
          }),
          credentials: 'include',
        });
      } catch (fetchError) {
        console.error('Network error during fetch:', fetchError);
        return { 
          success: false, 
          message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.' 
        };
      }
      
      const responseTime = Date.now() - startTime;
      console.log(`Login request completed in ${responseTime}ms with status:`, res.status);
      
      // Check if the response is JSON before trying to parse it
      const contentType = res.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await res.json();
          console.log('Login response data:', data);
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          return { 
            success: false, 
            message: 'Lỗi xử lý phản hồi từ máy chủ' 
          };
        }
      } else {
        const text = await res.text();
        console.error('Non-JSON response received:', text);
        return { 
          success: false, 
          message: 'Phản hồi không hợp lệ từ máy chủ' 
        };
      }
      
      if (res.ok && data?.success) {
        console.log('Login API call successful, verifying authentication...');
        
        // Add a small delay to ensure the cookie is set
        await new Promise(resolve => setTimeout(resolve, 300));
        
        try {
          // Try to get the current user
          console.log('Attempting to fetch current user...');
          const meResponse = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          console.log('Auth/me response status:', meResponse.status);
          
          if (meResponse.ok) {
            const meData = await meResponse.json();
            console.log('Auth/me response data:', meData);
            
            if (meData?.success && meData.user) {
              console.log('Authentication verified, setting user in context');
              setUser(meData.user);
              return { success: true };
            } else {
              console.error('Auth/me response missing user data:', meData);
            }
          } else {
            console.error('Auth/me request failed with status:', meResponse.status);
            const errorText = await meResponse.text().catch(() => 'No error details');
            console.error('Auth/me error response:', errorText);
          }
          
          // If we get here, auth verification failed
          console.error('Auth verification failed after login');
          return { 
            success: false, 
            message: 'Đăng nhập thành công nhưng không thể xác minh trạng thái. Vui lòng làm mới trang.' 
          };
          
        } catch (verifyError) {
          console.error('Error during auth verification:', verifyError);
          return { 
            success: false, 
            message: 'Đăng nhập thành công nhưng có lỗi khi xác minh. Vui lòng thử lại.' 
          };
        }
      } else {
        console.error('Login failed with status:', res.status, 'Response:', data);
        return { 
          success: false, 
          message: data?.message || `Đăng nhập thất bại (Mã lỗi: ${res.status})` 
        };
      }
    } catch (error) {
      console.error('Unexpected error during login:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Lỗi không xác định' 
      };
    } finally {
      console.log('=== Login Attempt Completed ===');
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // This ensures cookies are sent with the request
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    refreshUser,
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthStandalone();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}
