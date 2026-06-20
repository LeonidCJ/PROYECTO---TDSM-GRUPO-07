import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/src/core/auth/AuthContext';
import { colors, radius, spacing, typography } from '@/src/shared/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const firstName = user?.first_name?.trim() ?? '';
  const lastName  = user?.last_name?.trim()  ?? '';
  const fullName  = [firstName, lastName].filter(Boolean).join(' ');
  const displayName = fullName ? `Dr. ${fullName}` : 'Dr.';
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'DR';

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    [],
  );

  return (
    <View style={styles.container}>
      {/* ── Navbar ─────────────────────────────────────────── */}
      <View style={styles.navbar}>
        <View style={styles.brand}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.brandLogo}
          />
          <Text style={styles.brandName}>CystoAI</Text>
        </View>

        <TouchableOpacity
          style={styles.profileChip}
          activeOpacity={0.85}
          onPress={() => router.push('/profile' as any)}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileLabel}>{displayName}</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.textSub} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ───────────────────────────────────────────── */}
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroGreeting}>{greeting}</Text>
            <Text style={styles.heroName}>{displayName}</Text>
            <Text style={styles.heroDate}>{dateLabel}</Text>
          </View>

          <TouchableOpacity
            style={styles.heroBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/patient-select' as any)}
          >
            <Ionicons name="camera-outline" size={16} color={colors.white} />
            <Text style={styles.heroBtnText}>Iniciar análisis</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* ── Acciones rápidas ───────────────────────────────── */}
        <Text style={styles.sectionLabel}>ACCIONES RÁPIDAS</Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.gridCard}
            activeOpacity={0.8}
            onPress={() => router.push('/patients' as any)}
          >
            <View style={styles.gridIcon}>
              <Ionicons name="people-outline" size={22} color={colors.accent} />
            </View>
            <Text style={styles.gridTitle}>Mis pacientes</Text>
            <Text style={styles.gridSub}>Gestionar registros</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <View style={styles.gridIcon}>
              <Ionicons name="document-text-outline" size={22} color={colors.accent} />
            </View>
            <Text style={styles.gridTitle}>Informes</Text>
            <Text style={styles.gridSub}>Generar y exportar</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandLogo: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  brandName: {
    ...typography.heading,
    fontWeight: '800',
    color: colors.primary,
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.accent,
  },
  profileLabel: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.text,
  },

  // Scroll
  scroll: { flex: 1 },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Hero
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  heroText: { gap: 4 },
  heroGreeting: {
    ...typography.bodySm,
    color: 'rgba(255,255,255,0.55)',
  },
  heroName: {
    ...typography.display,
    color: colors.white,
  },
  heroDate: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'capitalize',
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  heroBtnText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.white,
  },

  // Section
  sectionLabel: {
    ...typography.label,
    color: colors.textSub,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  gridCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  gridIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  gridTitle: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.text,
  },
  gridSub: {
    ...typography.caption,
    color: colors.textSub,
  },

  disclaimer: {
    ...typography.caption,
    color: colors.textDisabled,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
