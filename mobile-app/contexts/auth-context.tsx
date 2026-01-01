import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StorageService } from '@/services/storage';
import { authApi } from '@/services/api/auth.api';
import { userApi } from '@/services/api/user.api';
import type { UserProfile, Tokens } from '@/types/auth';

interface AuthState {
  user: UserProfile | null;
  tokens: Tokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (user: UserProfile, tokens: Tokens) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  refreshTokens: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!tokens && !!user;

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const storedTokens = await StorageService.getTokens();
      if (!storedTokens?.refresh_token) {
        return false;
      }

      const response = await authApi.refreshToken(storedTokens.refresh_token);
      if (response.success && response.tokens) {
        setTokens(response.tokens);
        await StorageService.setTokens(response.tokens);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await StorageService.clearTokens();
      setUser(null);
      setTokens(null);
      return false;
    }
  }, []);

  const fetchUserProfile = useCallback(async (): Promise<boolean> => {
    try {
      const response = await userApi.getProfile();
      if (response.success && response.user) {
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return false;
    }
  }, []);

  const login = useCallback(async (newUser: UserProfile, newTokens: Tokens) => {
    try {
      setUser(newUser);
      setTokens(newTokens);
      await StorageService.setTokens(newTokens);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await StorageService.clearTokens();
      setUser(null);
      setTokens(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  // Load tokens and validate on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedTokens = await StorageService.getTokens();
        if (storedTokens) {
          setTokens(storedTokens);
          // Attempt to refresh to validate tokens
          const refreshed = await refreshTokens();
          if (refreshed) {
            // Token is valid, now fetch user profile
            await fetchUserProfile();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [refreshTokens, fetchUserProfile]);

  const value: AuthContextValue = {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    refreshTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
