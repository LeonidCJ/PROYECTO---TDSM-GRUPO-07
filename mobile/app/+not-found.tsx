import { Redirect } from 'expo-router';

import { useAuth } from '@/src/core/auth/AuthContext';

/**
 * Catches any unmatched path (including the root "/" on cold start) and sends
 * the user to the right place based on auth state and role. Without this, a
 * cold launch that lands on "/" shows the default "Unmatched Route" screen.
 */
export default function NotFoundRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // AuthGate already renders a spinner while loading / waiting for the profile.
  if (isLoading || (isAuthenticated && !user)) return null;

  if (!isAuthenticated) {
    return <Redirect href={'/(auth)/login' as any} />;
  }

  const home = user?.role === 'admin' ? '/(admin)/dashboard' : '/(tabs)';
  return <Redirect href={home as any} />;
}
