import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useLogin } from '@/src/features/auth/presentation/useLogin';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { TextField } from '@/src/shared/components/TextField';
import { colors, radius, spacing, typography } from '@/src/shared/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { submit, isLoading, error }    = useLogin();

  const isDisabled = useMemo(() => !email || !password, [email, password]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      {/* ── Brand ─────────────────────────────────────── */}
      <View style={styles.brand}>
        <View style={styles.logoBadge}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoImage}
          />
        </View>
        <Text style={styles.appName}>CystoAI</Text>
        <Text style={styles.tagline}>Asistente de IA endoscópica</Text>
      </View>

      {/* ── Form card ─────────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Iniciar sesión</Text>

        <TextField
          placeholder="Correo electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          showSoftInputOnFocus
          value={email}
          onChangeText={setEmail}
          leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textSub} />}
        />

        <TextField
          placeholder="Contraseña"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          leftIcon={
            <Ionicons name="lock-closed-outline" size={18} color={colors.textSub} />
          }
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={colors.textSub}
              />
            </TouchableOpacity>
          }
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          title="Iniciar sesión"
          onPress={() => submit(email.trim(), password)}
          loading={isLoading}
          disabled={isDisabled}
          style={styles.submitBtn}
        />

        <TouchableOpacity style={styles.forgotRow}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
            <Text style={styles.registerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },

  // Brand
  brand: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoImage: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
  appName: {
    ...typography.display,
    color: colors.primary,
  },
  tagline: {
    ...typography.bodySm,
    color: colors.textSub,
    marginTop: spacing.xs,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Actions
  submitBtn: {
    marginTop: spacing.xs,
  },
  forgotRow: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  forgotText: {
    ...typography.bodySm,
    color: colors.accent,
    fontWeight: '600',
  },
  registerRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerText: {
    ...typography.bodySm,
    color: colors.textSub,
  },
  registerLink: {
    ...typography.bodySm,
    color: colors.accent,
    fontWeight: '700',
  },
  error: {
    ...typography.bodySm,
    color: colors.error,
    marginBottom: spacing.sm,
    marginTop: -spacing.sm,
  },
});
