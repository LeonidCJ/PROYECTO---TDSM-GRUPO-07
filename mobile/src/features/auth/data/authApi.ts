import { httpRequest } from '@/src/core/api/httpClient';
import { AuthTokens, LoginRequest, UserProfile } from '@/src/features/auth/domain/types';

export function login(request: LoginRequest) {
  return httpRequest<AuthTokens>('/api/v1/auth/login/', {
    method: 'POST',
    body: request,
  });
}

export function getMe(accessToken: string) {
  return httpRequest<UserProfile>('/api/v1/auth/me/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function logout(refreshToken: string) {
  return httpRequest<void>('/api/v1/auth/logout/', {
    method: 'POST',
    body: { refresh: refreshToken },
  });
}
