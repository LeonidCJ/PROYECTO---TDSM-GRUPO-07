import { ReactNode } from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

import { colors } from "@/src/shared/theme/colors";

type Props = TextInputProps & {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function TextField({ leftIcon, rightIcon, style, ...props }: Props) {
  return (
    <View style={styles.container}>
      {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
      <TextInput
        placeholderTextColor={colors.subtext}
        style={[styles.input, style]}
        {...props}
      />
      {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
});
