import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, radius, typography } from '@/src/shared/theme';

type Variant = 'primary' | 'outline' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  style?: ViewStyle;
};

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  style,
}: Props) {
  const isDisabled = disabled || loading;

  const buttonVariantStyle =
    variant === 'primary' ? styles.primary
    : variant === 'outline' ? styles.outline
    : styles.danger;

  const labelVariantStyle =
    variant === 'primary' ? styles.primaryLabel
    : variant === 'outline' ? styles.outlineLabel
    : styles.dangerLabel;

  const loaderColor =
    variant === 'primary' ? colors.white
    : variant === 'outline' ? colors.accent
    : colors.error;

  return (
    <TouchableOpacity
      style={[styles.base, buttonVariantStyle, isDisabled && styles.disabled, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} />
      ) : (
        <Text style={[styles.label, labelVariantStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  danger: {
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    ...typography.body,
    fontWeight: '700',
  },
  primaryLabel: { color: colors.white },
  outlineLabel: { color: colors.accent },
  dangerLabel:  { color: colors.error },
});
