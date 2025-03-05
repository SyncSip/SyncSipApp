import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import axiosInstance, { login as apiLogin, clearAuthToken } from '@/api/axios'

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string|null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface JwtPayload {
  sub: string;
  email: string;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      
      if (token) {
        console.log('Found token in storage, decoding...');
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp > currentTime) {
            console.log('Token is valid, userId from token:', decoded.sub);
            
            if (!decoded.sub) {
              console.error('Token does not contain a valid userId (sub field)');
              await handleLogout();
              return;
            }
            
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            setIsAuthenticated(true);
            console.log("USER ID SUB STORAGE", decoded.sub)
            setUserId(decoded.sub);
            
            console.log('Auth state set: isAuthenticated=true, userId=', decoded.sub);
          } else {
            console.log('Token expired, logging out');
            await handleLogout();
          }
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          await handleLogout();
        }
      } else {
        console.log('No token found in storage');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      await handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      const { accessToken } = response;
      
      if (!accessToken) {
        console.error('Login response did not include an accessToken');
        throw new Error('Invalid login response');
      }
      
      try {
        const decoded = jwtDecode<JwtPayload>(accessToken);
    
        if (!decoded.sub) {
          console.error('Token does not contain a valid userId (sub field)');
          throw new Error('Invalid token format');
        }
        
        await SecureStore.setItemAsync('token', accessToken);
        
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        setIsAuthenticated(true);
        setUserId(decoded.sub);
      
        return decoded.sub;
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        throw new Error('Invalid token format');
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      setUserId(null);
      throw error;
    }
  };

  const handleLogout = async () => {
    console.log('Logging out, clearing auth state');
    setIsAuthenticated(false);
    setUserId(null);
    await SecureStore.deleteItemAsync('token');
    await clearAuthToken();
  };

  const value = {
    isAuthenticated,
    userId,
    loading,
    login,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
