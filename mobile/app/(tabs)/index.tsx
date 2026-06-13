import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/src/core/auth/AuthContext";
import { colors } from "@/src/shared/theme/colors";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = user?.first_name?.trim() ?? "";
  const lastName = user?.last_name?.trim() ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const displayName = fullName ? `Dr. ${fullName}` : "Dr. Rivera";
  const initials =
    [firstName, lastName]
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .toUpperCase() || "DR";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString("es-PE", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logoBadge}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoImage}
            />
          </View>
          <Text style={styles.brandText}>CystoAI</Text>
        </View>

        <TouchableOpacity
          style={styles.profileChip}
          activeOpacity={0.85}
          onPress={() => router.push("/profile" as any)}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.headerDivider} />

      <Text style={styles.greeting}>{`${greeting}, ${displayName}`}</Text>
      <Text style={styles.date}>{dateLabel}</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Análisis de hoy</Text>
        <Text style={styles.summaryValue}>3</Text>
      </View>

      <View style={styles.primaryCard}>
        <View style={styles.primaryIconWrap}>
          <Ionicons name="camera-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.primaryContent}>
          <Text style={styles.primaryTitle}>Nuevo análisis de cistoscopía</Text>
          <Text style={styles.primaryText}>
            Captura o sube una imagen endoscópica para clasificación con IA.
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.primaryAction}
            onPress={() => router.push("/patient-form?mode=analysis" as any)}
          >
            <Text style={styles.primaryActionText}>Iniciar análisis</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.gridCard}
          activeOpacity={0.8}
          onPress={() => router.push("/patients" as any)}
        >
          <View style={styles.gridIconWrap}>
            <Ionicons name="list-outline" size={22} color={colors.text} />
          </View>
          <Text style={styles.gridLabel}>Mis pacientes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
          <View style={styles.gridIconWrap}>
            <Ionicons
              name="document-text-outline"
              size={22}
              color={colors.text}
            />
          </View>
          <Text style={styles.gridLabel}>Generar informe</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerNote}>
        Herramienta de apoyo — no reemplaza el criterio del especialista
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}4D`,
  },
  logoImage: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  brandText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  profileChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  profileName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  headerDivider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: -20,
    marginBottom: 16,
    marginTop: -4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderStyle: "solid",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  summaryTitle: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
  },
  primaryCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  primaryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryContent: {
    flex: 1,
  },
  primaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  primaryText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.subtext,
    marginBottom: 10,
  },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  gridIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  footerNote: {
    textAlign: "center",
    fontSize: 12,
    color: colors.outline,
    marginTop: "auto",
    paddingBottom: 8,
  },
});
