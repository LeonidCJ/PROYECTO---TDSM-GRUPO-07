import {
    clearTokens,
    clearUserProfile,
    setTokens,
    setUserProfile,
} from "@/src/core/storage/secureStorage";
import * as authApi from "@/src/features/auth/data/authApi";
import { LoginRequest, UserProfile } from "@/src/features/auth/domain/types";

export async function login(request: LoginRequest): Promise<UserProfile> {
  const tokens = await authApi.login(request);
  await setTokens(tokens.access, tokens.refresh);
  const profile = await authApi.getMe(tokens.access);
  await setUserProfile(profile);
  return profile;
}

export async function logout(refreshToken: string) {
  await authApi.logout(refreshToken);
  await clearTokens();
  await clearUserProfile();
}

export async function getMe(accessToken: string): Promise<UserProfile> {
  return authApi.getMe(accessToken);
}
