import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, radius, spacing, typography } from "@/src/shared/theme";

/** A labelled 2–3 option segmented control, reused across the patient forms. */
export function SegmentedField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((o) => (
          <TouchableOpacity
            key={o.value}
            style={[styles.option, value === o.value && styles.optionActive]}
            onPress={() => onChange(o.value)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={value === o.value ? { selected: true } : {}}
            accessibilityLabel={`${label}: ${o.label}`}
          >
            <Text
              style={[styles.optionLabel, value === o.value && styles.optionLabelActive]}
              numberOfLines={1}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { ...typography.bodySm, color: colors.text, fontWeight: "600" },
  row: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
  },
  option: { flex: 1, paddingVertical: 12, alignItems: "center", paddingHorizontal: spacing.xs },
  optionActive: { backgroundColor: colors.surface, borderRadius: radius.sm, margin: 3 },
  optionLabel: { ...typography.bodySm, color: colors.textSub },
  optionLabelActive: { color: colors.text, fontWeight: "700" },
});
