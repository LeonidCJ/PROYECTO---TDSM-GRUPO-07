import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/src/shared/theme/colors";

const LABELS: Record<string, string> = {
  index: "Home",
  analysis: "Analysis",
  history: "History",
  settings: "Settings",
};

const ICONS: Record<
  string,
  "house.fill" | "chart.bar.fill" | "clock.fill" | "gearshape.fill"
> = {
  index: "house.fill",
  analysis: "chart.bar.fill",
  history: "clock.fill",
  settings: "gearshape.fill",
};

export function BottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(8, insets.bottom) }]}
    >
      <View style={styles.row}>
        {state.routes.map((route, index: number) => {
          const isFocused = state.index === index;
          const label = LABELS[route.name] ?? route.name;
          const iconName = ICONS[route.name as keyof typeof ICONS];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={
                descriptors[route.key]?.options?.tabBarAccessibilityLabel
              }
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.8}
              style={[styles.item, isFocused && styles.itemActive]}
            >
              <IconSymbol
                size={24}
                name={iconName}
                color={isFocused ? colors.primaryContainer : colors.outline}
              />
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  itemActive: {
    backgroundColor: colors.surfaceContainer,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: colors.outline,
  },
  labelActive: {
    color: colors.primaryContainer,
  },
});
