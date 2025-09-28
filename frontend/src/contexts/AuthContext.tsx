import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient, User } from "../services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const currentUser = await apiClient.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error("Failed to get current user:", error);
          apiClient.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await apiClient.login({ username: email, password }); // FastAPI uses 'username' field for email
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string
  ) => {
    try {
      await apiClient.register({ email, username, password });
      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
