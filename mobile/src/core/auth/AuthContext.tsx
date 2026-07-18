import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    clearTokens,
    clearUserProfile,
    getAccessToken,
    getRefreshToken,
    getUserProfile,
    setUserProfile,
} from "@/src/core/storage/secureStorage";
import * as authRepository from "@/src/features/auth/data/authRepository";
import { UserProfile } from "@/src/features/auth/domain/types";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  setAuthenticated: (value: boolean) => void;
  setUser: (profile: UserProfile | null) => void;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  const hydrate = async () => {
    setIsLoading(true);
    const access = await getAccessToken();
    const refresh = await getRefreshToken();
    const hasTokens = Boolean(access && refresh);
    setAuthenticated(hasTokens);

    if (!hasTokens) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    let profile = await getUserProfile();
    // Refresh from the server when there is no cached profile OR the cached one
    // predates the `role` field (older app versions). Without the role the gate
    // cannot decide the area and would stall on an unmatched route.
    if (access && (!profile || !profile.role)) {
      try {
        profile = await authRepository.getMe(access);
        await setUserProfile(profile);
      } catch {
        // Keep whatever we had (possibly null) if the refresh fails offline.
      }
    }
    setUser(profile);
    setIsLoading(false);
  };

  const logout = async () => {
    await clearTokens();
    await clearUserProfile();
    setAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    hydrate();
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      setAuthenticated,
      setUser,
      hydrate,
      logout,
    }),
    [isAuthenticated, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
