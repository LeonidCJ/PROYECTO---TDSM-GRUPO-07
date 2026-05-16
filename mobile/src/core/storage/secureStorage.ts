import * as SecureStore from "expo-secure-store";

import type { UserProfile } from "@/src/features/auth/domain/types";

const ACCESS_TOKEN_KEY = "auth.accessToken";
const REFRESH_TOKEN_KEY = "auth.refreshToken";
const USER_PROFILE_KEY = "auth.userProfile";

export async function setTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function setUserProfile(profile: UserProfile) {
  await SecureStore.setItemAsync(USER_PROFILE_KEY, JSON.stringify(profile));
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const raw = await SecureStore.getItemAsync(USER_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export async function clearUserProfile() {
  await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
}
