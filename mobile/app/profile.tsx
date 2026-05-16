import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/src/core/auth/AuthContext";
import { PrimaryButton } from "@/src/shared/components/PrimaryButton";
import { colors } from "@/src/shared/theme/colors";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const firstName = user?.first_name?.trim() ?? "";
  const lastName = user?.last_name?.trim() ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.subtitle}>Gestiona tu cuenta</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{fullName || "—"}</Text>

        <Text style={styles.label}>Correo</Text>
        <Text style={styles.value}>{user?.email ?? "—"}</Text>

        <PrimaryButton
          title="Cerrar sesión"
          onPress={logout}
          style={styles.logout}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.subtext,
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: colors.text,
  },
  logout: {
    marginTop: 20,
  },
});
