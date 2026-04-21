'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { getUserByEmail, createUser, getUsersByRole } from '@/app/actions/users';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('healthstack_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('healthstack_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string): Promise<{ success: boolean; error?: string }> => {
    const res = await getUserByEmail(email);
    const foundUser = res.data;
    
    if (foundUser) {
      setUser(foundUser as unknown as User);
      localStorage.setItem('healthstack_user', JSON.stringify(foundUser));
      return { success: true };
    }
    
    return { success: false, error: 'Invalid email or password' };
  };

  const loginAsRole = async (role: UserRole) => {
    const res = await getUsersByRole(role);
    if (res.success && res.data && res.data.length > 0) {
      const demoUser = res.data[0];
      setUser(demoUser as unknown as User);
      localStorage.setItem('healthstack_user', JSON.stringify(demoUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('healthstack_user');
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    const resExisting = await getUserByEmail(userData.email || '');
    if (resExisting.data) {
      return { success: false, error: 'Email already registered' };
    }

    const newUserPayload = {
      email: userData.email || '',
      name: userData.name || '',
      role: userData.role || 'patient',
      phone: userData.phone,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      address: userData.address,
      bloodType: userData.bloodType,
      allergies: userData.allergies ? JSON.stringify(userData.allergies) : null,
    };

    const res = await createUser(newUserPayload);
    
    if (res.success && res.data) {
      const dbUser = res.data as unknown as User;
      setUser(dbUser);
      localStorage.setItem('healthstack_user', JSON.stringify(dbUser));
      return { success: true };
    }

    return { success: false, error: 'Failed to create account in database' };
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginAsRole, logout, register }}>
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
