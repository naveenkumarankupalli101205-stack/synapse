import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { initializeMockData, getFromStorage, setToStorage, MOCK_STORAGE_KEYS, mockUsers } from './mockData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: 'student' | 'teacher') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize mock data
    initializeMockData();
    
    // Check for existing session
    const currentUser = getFromStorage(MOCK_STORAGE_KEYS.CURRENT_USER);
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string, role: 'student' | 'teacher') => {
    try {
      // Check if user already exists
      const users = getFromStorage(MOCK_STORAGE_KEYS.USERS) || [];
      const existingUser = users.find((u: User) => u.email === email);
      
      if (existingUser) {
        return { error: { message: 'User with this email already exists' } };
      }

      // Create new user
      const newUser: User = {
        id: `${role}-${Date.now()}`,
        email,
        name,
        role
      };

      // Add to users list
      users.push(newUser);
      setToStorage(MOCK_STORAGE_KEYS.USERS, users);

      // Set as current user
      setUser(newUser);
      setToStorage(MOCK_STORAGE_KEYS.CURRENT_USER, newUser);

      return { error: null };
    } catch (error) {
      return { error: { message: 'Registration failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // For demo purposes, we'll use predefined credentials
      let foundUser: User | null = null;

      if (email === 'teacher@demo.com' && password === 'demo123') {
        foundUser = mockUsers.find(u => u.role === 'teacher') || null;
      } else if (email === 'student@demo.com' && password === 'demo123') {
        foundUser = mockUsers.find(u => u.role === 'student') || null;
      } else {
        // Check if user exists in storage
        const users = getFromStorage(MOCK_STORAGE_KEYS.USERS) || [];
        foundUser = users.find((u: User) => u.email === email) || null;
      }

      if (!foundUser) {
        return { error: { message: 'Invalid email or password' } };
      }

      setUser(foundUser);
      setToStorage(MOCK_STORAGE_KEYS.CURRENT_USER, foundUser);

      return { error: null };
    } catch (error) {
      return { error: { message: 'Login failed' } };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(MOCK_STORAGE_KEYS.CURRENT_USER);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};