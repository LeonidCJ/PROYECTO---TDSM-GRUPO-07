import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/src/core/auth/AuthContext";
import { AuthGate } from "@/src/core/auth/AuthGate";
import { colors } from "@/src/shared/theme/colors";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <AuthProvider>
            <AuthGate>
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </AuthGate>
          </AuthProvider>
        </SafeAreaView>
      </SafeAreaProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = {
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
};
