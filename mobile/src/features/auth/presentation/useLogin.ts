import { useCallback, useState } from "react";

import { useAuth } from "@/src/core/auth/AuthContext";
import * as authRepository from "@/src/features/auth/data/authRepository";

export function useLogin() {
  const { setAuthenticated, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await authRepository.login({ email, password });
      setAuthenticated(true);
      setUser(profile);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { submit, isLoading, error };
}
