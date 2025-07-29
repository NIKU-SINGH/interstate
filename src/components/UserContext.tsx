import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import { getUserById } from '../utils/api';
import { getSolBalance } from '~/utils/functions';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  publicKey: string;
  bearerToken: string;
}

interface UserContextType {
  user: UserInfo | null;
  loading: boolean;
  solBalance: number;
  refreshUser: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  setUser: (user: UserInfo | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [solBalance, setSolBalance] = useState(0);

  const refreshBalance = async () => {
    if (user?.publicKey) {
      const response = await fetch(`/api/get-sol-bal?address=${encodeURIComponent(user.publicKey)}`);
      const data = await response.json();
      setSolBalance(data.data.balance);
    }
  };

  const refreshUser = async () => {
    const token = Cookies.get('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { user: fetchedUser } = await getUserById(token);
      if (fetchedUser) {
        setUser({ bearerToken: token, ...fetchedUser });
      } else {
        setUser(null);
        Cookies.remove('token');
      }
    } catch (_) {
      setUser(null);
      Cookies.remove('token');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    setSolBalance(0);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      refreshBalance();
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, loading, solBalance, refreshUser, refreshBalance, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
} 