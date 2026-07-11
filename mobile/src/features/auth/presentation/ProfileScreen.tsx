import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


import { useAuth } from '@/src/core/auth/AuthContext';
import { colors, radius, spacing, typography } from '@/src/shared/theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();


  const firstName = user?.first_name?.trim() ?? '';
  const lastName  = user?.last_name?.trim()  ?? '';
  const fullName  = [firstName, lastName].filter(Boolean).join(' ');
  const initials  = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || '?';

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerBtn} />
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar card ─────────────────────────────── */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{initials}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBadge}>
            <Ionicons name="pencil" size={12} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.name}>{fullName || '—'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Médico</Text>
          </View>
        </View>

        {/* ── Cuenta y seguridad ──────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-outline" size={14} color={colors.accent} />
            <Text style={styles.cardLabel}>CUENTA Y SEGURIDAD</Text>
          </View>

          <View style={styles.emailBlock}>
            <View style={styles.emailLabelRow}>
              <Text style={styles.fieldLabel}>CORREO ELECTRÓNICO</Text>
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={9} color={colors.textSub} />
                <Text style={styles.lockedText}>No editable</Text>
              </View>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldValue}>{user?.email ?? '—'}</Text>
              <Ionicons name="mail-outline" size={16} color={colors.textDisabled} />
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} activeOpacity={0.6}>
            <View style={styles.actionLeft}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.accent} />
              <Text style={styles.actionText}>Cambiar contraseña</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
          </TouchableOpacity>
        </View>

        {/* ── Cerrar sesión ───────────────────────────── */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={logout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: { padding: 6 },
  headerTitle: {
    ...typography.heading,
    color: colors.text,
  },

  // Scroll
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },

  // Avatar card
  avatarCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: colors.accentLight,
    padding: 3,
    marginBottom: spacing.md,
  },
  avatar: {
    flex: 1,
    borderRadius: radius.full,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.display,
    fontWeight: '700',
    color: colors.accent,
  },
  editBadge: {
    position: 'absolute',
    top: spacing.xl + 96 - 14,
    right: '50%',
    marginRight: -48,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.surface,
  },
  name: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  roleBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  roleText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.accent,
  },

  // Info card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardLabel: {
    ...typography.label,
    color: colors.textSub,
  },

  emailBlock: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  emailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textSub,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  lockedText: {
    fontSize: 9,
    color: colors.textSub,
    fontWeight: '600',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldValue: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionText: {
    ...typography.body,
    color: colors.text,
  },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: radius.lg,
    paddingVertical: 15,
    backgroundColor: colors.surface,
  },
  signOutText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.error,
  },

  footer: {
    ...typography.caption,
    color: colors.textDisabled,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: spacing.md,
  },
});
