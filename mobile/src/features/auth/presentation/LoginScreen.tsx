import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useLogin } from "@/src/features/auth/presentation/useLogin";
import { PrimaryButton } from "@/src/shared/components/PrimaryButton";
import { TextField } from "@/src/shared/components/TextField";
import { colors } from "@/src/shared/theme/colors";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { submit, isLoading, error } = useLogin();

  const isDisabled = useMemo(() => !email || !password, [email, password]);

  const handleSubmit = () => {
    submit(email.trim(), password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logoImage}
          />
        </View>
        <Text style={styles.title}>CystoAI</Text>
        <Text style={styles.subtitle}>Endoscopic AI Assistant</Text>
      </View>

      <View style={styles.card}>
        <TextField
          placeholder="doctor@hospital.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          leftIcon={
            <Ionicons name="mail-outline" size={18} color={colors.subtext} />
          }
        />

        <TextField
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          leftIcon={
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={colors.subtext}
            />
          }
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={18}
                color={colors.subtext}
              />
            </TouchableOpacity>
          }
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          title="Sign In"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isDisabled}
          style={styles.signIn}
        />

        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}4D`,
  },
  logoImage: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.subtext,
    marginTop: 4,
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
  signIn: {
    marginTop: 8,
  },
  forgot: {
    marginTop: 12,
    alignItems: "center",
  },
  forgotText: {
    color: colors.primaryContainer,
    fontWeight: "600",
  },
  error: {
    color: colors.error,
    marginBottom: 8,
    marginTop: -4,
  },
});
