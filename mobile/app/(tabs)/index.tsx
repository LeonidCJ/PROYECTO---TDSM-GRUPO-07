import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/src/core/auth/AuthContext";
import { PrimaryButton } from "@/src/shared/components/PrimaryButton";
import { colors } from "@/src/shared/theme/colors";

export default function HomeScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>
          Este es tu panel principal. Aquí verás tus módulos y accesos rápidos.
        </Text>
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
    justifyContent: "center",
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.subtext,
  },
  logout: {
    marginTop: 20,
  },
});
