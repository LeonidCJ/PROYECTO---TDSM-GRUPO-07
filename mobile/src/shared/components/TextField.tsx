import { ReactNode, useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/shared/theme';

type Props = TextInputProps & {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function TextField({ leftIcon, rightIcon, style, onFocus, onBlur, ...props }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.focused]}>
      {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
      <TextInput
        placeholderTextColor={colors.textDisabled}
        style={[styles.input, style]}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e)  => { setFocused(false); onBlur?.(e); }}
        {...props}
      />
      {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    marginBottom: spacing.md,
  },
  focused: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  iconLeft:  { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
});
