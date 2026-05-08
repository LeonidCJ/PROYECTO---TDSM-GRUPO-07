import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { clearTokens, getAccessToken, getRefreshToken } from '@/src/core/storage/secureStorage';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthenticated: (value: boolean) => void;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = async () => {
    setIsLoading(true);
    const access = await getAccessToken();
    const refresh = await getRefreshToken();
    setAuthenticated(Boolean(access && refresh));
    setIsLoading(false);
  };

  const logout = async () => {
    await clearTokens();
    setAuthenticated(false);
  };

  useEffect(() => {
    hydrate();
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, setAuthenticated, hydrate, logout }),
    [isAuthenticated, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
