import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors, radius, spacing, typography } from '@/src/shared/theme';

const LABELS: Record<string, string> = {
  index:     'Inicio',
  analysis:  'Análisis',
  history:   'Historial',
  profile:   'Perfil',
  // Admin area
  dashboard: 'Panel',
  users:     'Usuarios',
  audit:     'Accesos',
};

const ICONS: Record<
  string,
  | 'house.fill'
  | 'chart.bar.fill'
  | 'clock.fill'
  | 'person.crop.circle.fill'
  | 'square.grid.2x2.fill'
  | 'person.2.fill'
  | 'lock.shield.fill'
> = {
  index:     'house.fill',
  analysis:  'chart.bar.fill',
  history:   'clock.fill',
  profile:   'person.crop.circle.fill',
  // Admin area
  dashboard: 'square.grid.2x2.fill',
  users:     'person.2.fill',
  audit:     'lock.shield.fill',
};

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(spacing.sm, insets.bottom) }]}>
      <View style={styles.row}>
        {state.routes.map((route, index: number) => {
          const isFocused = state.index === index;
          const label     = LABELS[route.name] ?? route.name;
          const iconName  = ICONS[route.name as keyof typeof ICONS];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={descriptors[route.key]?.options?.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              activeOpacity={0.8}
              style={[styles.item, isFocused && styles.itemActive]}
            >
              <IconSymbol
                size={22}
                name={iconName}
                color={isFocused ? colors.accent : colors.textDisabled}
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    gap: 4,
  },
  itemActive: {
    backgroundColor: colors.accentLight,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textDisabled,
  },
  labelActive: {
    color: colors.accent,
  },
});
