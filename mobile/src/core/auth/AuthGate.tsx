import { useRouter, useSegments } from 'expo-router';
import { ReactNode, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/src/core/auth/AuthContext';
import { resolveRedirect } from '@/src/core/auth/routing';
import { colors } from '@/src/shared/theme/colors';

export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // While authenticated we need the role to decide the area, so wait for the
  // profile to load before routing.
  const waitingForProfile = isAuthenticated && !user;

  useEffect(() => {
    if (isLoading || waitingForProfile) return;

    const target = resolveRedirect({
      isAuthenticated,
      role: user?.role ?? null,
      segment: segments[0],
    });

    if (target) {
      // Cast: Expo Router's typed-routes map is generated on `expo start` and
      // does not yet include the (admin) group, like other routes in this app.
      router.replace(target as any);
    }
  }, [isAuthenticated, isLoading, waitingForProfile, user, router, segments]);

  if (isLoading || waitingForProfile) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
