/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, []);

  const signup = async (name, email, phone, password, confirmPassword) => {
    try {
      setError(null);
      const response = await apiClient.post('/auth/signup', {
        name,
        email,
        phone,
        password,
        confirmPassword,
      });

      const { user: userData, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setUser(userData);
      setIsAuthenticated(true);

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Signup failed';
      setError(errorMessage);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { user: userData, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setUser(userData);
      setIsAuthenticated(true);

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Request failed';
      setError(errorMessage);
      throw err;
    }
  };

  const resetPassword = async (token, password, confirmPassword) => {
    try {
      setError(null);
      const response = await apiClient.post('/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Reset failed';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated,
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthProvider;