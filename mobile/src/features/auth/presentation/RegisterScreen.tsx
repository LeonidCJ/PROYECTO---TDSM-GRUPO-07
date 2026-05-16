import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useAuth } from "@/src/core/auth/AuthContext";
import * as authRepository from "@/src/features/auth/data/authRepository";
import { Specialty } from "@/src/features/auth/domain/types";
import { PrimaryButton } from "@/src/shared/components/PrimaryButton";
import { TextField } from "@/src/shared/components/TextField";
import { colors } from "@/src/shared/theme/colors";

const SPECIALTIES: Array<{ label: string; value: Specialty }> = [
  { label: "Urología", value: "urology" },
  { label: "Oncología", value: "oncology" },
  { label: "Patología", value: "pathology" },
  { label: "Radiología", value: "radiology" },
  { label: "Otro", value: "other" },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuthenticated, setUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [hospital, setHospital] = useState("");
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [showSpecialty, setShowSpecialty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSpecialtyLabel = useMemo(() => {
    if (!specialty) return "";
    return SPECIALTIES.find((item) => item.value === specialty)?.label ?? "";
  }, [specialty]);

  const isDisabled = useMemo(
    () => !firstName || !lastName || !email || !password || isLoading,
    [firstName, lastName, email, password, isLoading],
  );

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password;

      await authRepository.register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: trimmedEmail,
        password: trimmedPassword,
        phone: phone.trim() || undefined,
        hospital: hospital.trim() || undefined,
        specialty: specialty ?? undefined,
      });

      const profile = await authRepository.login({
        email: trimmedEmail,
        password: trimmedPassword,
      });
      setAuthenticated(true);
      setUser(profile);
      router.replace("/(tabs)" as any);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Register failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Join our medical community</Text>
          <Text style={styles.heroSubtitle}>
            Access advanced AI diagnostics and seamless patient management.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>First Name *</Text>
          <TextField
            placeholder="Enter first name"
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={styles.label}>Last Name *</Text>
          <TextField
            placeholder="Enter last name"
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={styles.label}>Email Address *</Text>
          <TextField
            placeholder="example@hospital.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password *</Text>
          <TextField
            placeholder="Create a strong password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color={colors.subtext}
                />
              </TouchableOpacity>
            }
          />
          <Text style={styles.helper}>Minimum 8 characters</Text>

          <Text style={styles.label}>Phone Number (Optional)</Text>
          <TextField
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Specialty (Optional)</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowSpecialty((prev) => !prev)}
          >
            <View pointerEvents="none">
              <TextField
                placeholder="Select specialty"
                value={selectedSpecialtyLabel}
                editable={false}
                rightIcon={
                  <Ionicons
                    name={showSpecialty ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.subtext}
                  />
                }
              />
            </View>
          </TouchableOpacity>
          {showSpecialty ? (
            <View style={styles.selectMenu}>
              {SPECIALTIES.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={styles.selectOption}
                  onPress={() => {
                    setSpecialty(item.value);
                    setShowSpecialty(false);
                  }}
                >
                  <Text style={styles.selectOptionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <Text style={styles.label}>Hospital (Optional)</Text>
          <TextField
            placeholder="Institution name"
            value={hospital}
            onChangeText={setHospital}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            title="Sign Up"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isDisabled}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login" as any)}
            >
              <Text style={styles.footerLink}>Login</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    marginBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  headerSpacer: {
    width: 36,
  },
  hero: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.subtext,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  helper: {
    fontSize: 12,
    color: colors.subtext,
    marginTop: -4,
    marginBottom: 12,
  },
  error: {
    color: colors.error,
    marginTop: -4,
    marginBottom: 12,
    fontSize: 12,
  },
  selectMenu: {
    marginTop: -4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  selectOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  selectOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  footerRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: colors.subtext,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryContainer,
  },
});
