import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "@/src/shared/theme";
import { adminRepository } from "../data/adminRepository";
import { AdminRole } from "../domain/types";

type Props = {
  mode: "create" | "reset";
  userId?: string;
  email?: string;
};

const ROLES: { value: AdminRole; label: string }[] = [
  { value: "doctor", label: "Médico" },
  { value: "admin", label: "Administrador" },
];

export function AdminUserFormScreen({ mode, userId, email: initialEmail }: Props) {
  const router = useRouter();
  const isReset = mode === "reset";

  const [email, setEmail] = useState(initialEmail ?? "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<AdminRole>("doctor");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordOk = password.trim().length >= 8;
  const canSubmit = isReset
    ? passwordOk
    : email.trim().length > 0 && firstName.trim().length > 0 && lastName.trim().length > 0 && passwordOk;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      if (isReset) {
        if (!userId) throw new Error("Usuario no válido");
        await adminRepository.updateUser(userId, { password: password.trim() });
      } else {
        await adminRepository.createUser({
          email: email.trim(),
          password: password.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role,
        });
      }
      router.back();
    } catch (e: any) {
      setError(e?.message ?? "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Volver">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isReset ? "Restablecer contraseña" : "Nuevo usuario"}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {isReset ? (
            <Text style={styles.resetInfo}>Nueva contraseña para {initialEmail}</Text>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={colors.textDisabled}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Nombres"
                placeholderTextColor={colors.textDisabled}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                placeholder="Apellidos"
                placeholderTextColor={colors.textDisabled}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
              <Text style={styles.label}>Rol</Text>
              <View style={styles.segRow}>
                {ROLES.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.segOption, role === r.value && styles.segOptionActive]}
                    onPress={() => setRole(r.value)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={role === r.value ? { selected: true } : {}}
                  >
                    <Text style={[styles.segLabel, role === r.value && styles.segLabelActive]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Contraseña (mín. 8 caracteres)"
            placeholderTextColor={colors.textDisabled}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.submit, !canSubmit && styles.submitDisabled]}
          onPress={submit}
          disabled={!canSubmit || saving}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={isReset ? "Guardar contraseña" : "Crear usuario"}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitText}>{isReset ? "Guardar contraseña" : "Crear usuario"}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: { padding: 6, width: 34 },
  headerTitle: { ...typography.body, fontWeight: "700", color: colors.text },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  resetInfo: { ...typography.bodySm, color: colors.textSub },
  input: {
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.surfaceMuted,
  },
  label: { ...typography.bodySm, color: colors.text, fontWeight: "600", marginTop: spacing.xs },
  segRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
  },
  segOption: { flex: 1, paddingVertical: 12, alignItems: "center" },
  segOptionActive: { backgroundColor: colors.surface, borderRadius: radius.sm, margin: 3 },
  segLabel: { ...typography.bodySm, color: colors.textSub },
  segLabelActive: { color: colors.text, fontWeight: "700" },
  error: { ...typography.bodySm, color: colors.error, textAlign: "center" },
  submit: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 15,
  },
  submitDisabled: { opacity: 0.45 },
  submitText: { ...typography.body, fontWeight: "700", color: colors.white },
});
