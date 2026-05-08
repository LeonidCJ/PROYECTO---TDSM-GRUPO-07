import * as authApi from '@/src/features/auth/data/authApi';
import { LoginRequest } from '@/src/features/auth/domain/types';
import { clearTokens, setTokens } from '@/src/core/storage/secureStorage';

export async function login(request: LoginRequest) {
  const tokens = await authApi.login(request);
  await setTokens(tokens.access, tokens.refresh);
  return tokens;
}

export async function logout(refreshToken: string) {
  await authApi.logout(refreshToken);
  await clearTokens();
}
