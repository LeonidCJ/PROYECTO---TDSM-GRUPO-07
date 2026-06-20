import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/src/core/auth/AuthContext';
import * as authRepository from '@/src/features/auth/data/authRepository';
import { Specialty } from '@/src/features/auth/domain/types';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { TextField } from '@/src/shared/components/TextField';
import { colors, radius, spacing, typography } from '@/src/shared/theme';

const SPECIALTIES: Array<{ label: string; value: Specialty }> = [
  { label: 'Urología',   value: 'urology' },
  { label: 'Oncología',  value: 'oncology' },
  { label: 'Patología',  value: 'pathology' },
  { label: 'Radiología', value: 'radiology' },
  { label: 'Otro',       value: 'other' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuthenticated, setUser } = useAuth();

  const [firstName,     setFirstName]     = useState('');
  const [lastName,      setLastName]       = useState('');
  const [email,         setEmail]          = useState('');
  const [password,      setPassword]       = useState('');
  const [showPassword,  setShowPassword]   = useState(false);
  const [phone,         setPhone]          = useState('');
  const [hospital,      setHospital]       = useState('');
  const [specialty,     setSpecialty]      = useState<Specialty | null>(null);
  const [showSpecialty, setShowSpecialty]  = useState(false);
  const [isLoading,     setIsLoading]      = useState(false);
  const [error,         setError]          = useState<string | null>(null);

  const selectedLabel = useMemo(
    () => SPECIALTIES.find((s) => s.value === specialty)?.label ?? '',
    [specialty],
  );

  const isDisabled = useMemo(
    () => !firstName || !lastName || !email || !password || isLoading,
    [firstName, lastName, email, password, isLoading],
  );

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const trimEmail = email.trim();
      await authRepository.register({
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        email:      trimEmail,
        password,
        phone:      phone.trim() || undefined,
        hospital:   hospital.trim() || undefined,
        specialty:  specialty ?? undefined,
      });
      const profile = await authRepository.login({ email: trimEmail, password });
      setAuthenticated(true);
      setUser(profile);
      router.replace('/(tabs)' as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ──────────────────────────────────── */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear cuenta</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Únete a la comunidad médica</Text>
          <Text style={styles.heroSub}>
            Diagnósticos avanzados con IA y gestión clínica eficiente.
          </Text>
        </View>

        {/* ── Form ────────────────────────────────────── */}
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Nombre *</Text>
          <TextField
            placeholder="Tu nombre"
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={styles.fieldLabel}>Apellido *</Text>
          <TextField
            placeholder="Tu apellido"
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={styles.fieldLabel}>Correo electrónico *</Text>
          <TextField
            placeholder="correo@hospital.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.fieldLabel}>Contraseña *</Text>
          <TextField
            placeholder="Mínimo 8 caracteres"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
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

          <Text style={styles.fieldLabel}>Teléfono (opcional)</Text>
          <TextField
            placeholder="+51 999 000 000"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.fieldLabel}>Especialidad (opcional)</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setShowSpecialty((p) => !p)}>
            <View pointerEvents="none">
              <TextField
                placeholder="Selecciona tu especialidad"
                value={selectedLabel}
                editable={false}
                rightIcon={
                  <Ionicons
                    name={showSpecialty ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSub}
                  />
                }
              />
            </View>
          </TouchableOpacity>
          {showSpecialty && (
            <View style={styles.dropdown}>
              {SPECIALTIES.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={styles.dropdownItem}
                  onPress={() => { setSpecialty(item.value); setShowSpecialty(false); }}
                >
                  <Text style={styles.dropdownText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.fieldLabel}>Hospital (opcional)</Text>
          <TextField
            placeholder="Nombre de la institución"
            value={hospital}
            onChangeText={setHospital}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            title="Registrarse"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isDisabled}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
              <Text style={styles.loginLink}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.heading,
    color: colors.text,
  },
  headerSpacer: { width: 36 },

  // Hero
  hero: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heroSub: {
    ...typography.bodySm,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Form
  form: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldLabel: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },

  // Dropdown
  dropdown: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  dropdownText: {
    ...typography.body,
    color: colors.text,
  },

  // Footer
  error: {
    ...typography.bodySm,
    color: colors.error,
    marginBottom: spacing.sm,
    marginTop: -spacing.sm,
  },
  loginRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    ...typography.bodySm,
    color: colors.textSub,
  },
  loginLink: {
    ...typography.bodySm,
    color: colors.accent,
    fontWeight: '700',
  },
});
