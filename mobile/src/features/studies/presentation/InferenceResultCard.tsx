import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/shared/theme';
import { InferenceResult } from '../domain/types';
import { confidencePct, LABEL_META, riskMetaOf } from './resultMeta';

/** Presentational card that renders a 4-class inference result. */
export function InferenceResultCard({ inference }: { inference: InferenceResult }) {
  const meta = LABEL_META[inference.primary_label];
  const risk = riskMetaOf(inference.risk_level);
  const pct = confidencePct(inference.confidence_breakdown, inference.primary_label);

  return (
    <View style={styles.container}>
      {/* Main result card */}
      <View style={[styles.card, { borderColor: risk.color + '33', backgroundColor: risk.bg }]}>
        <View style={[styles.iconWrap, { backgroundColor: risk.color + '20' }]}>
          <Ionicons
            name={inference.is_malignant ? 'warning-outline' : 'checkmark-circle-outline'}
            size={44}
            color={risk.color}
          />
        </View>
        <Text style={[styles.label, { color: risk.color }]}>{meta.name}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.codeBadge, { borderColor: risk.color + '55' }]}>
            <Text style={[styles.codeBadgeText, { color: risk.color }]}>{inference.primary_label}</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: risk.color + '20' }]}>
            <Text style={[styles.riskBadgeText, { color: risk.color }]}>{risk.label}</Text>
          </View>
        </View>
        <Text style={styles.sublabel}>{meta.full}</Text>
      </View>

      {/* Confidence */}
      <View style={styles.confidenceCard}>
        <Text style={styles.confidenceLabel}>CONFIANZA DEL MODELO</Text>
        <View style={styles.confidenceBar}>
          <View style={[styles.confidenceFill, { width: `${pct}%` as any, backgroundColor: risk.color }]} />
        </View>
        <Text style={[styles.confidencePct, { color: risk.color }]}>{pct}%</Text>
      </View>

      {/* Recommended action */}
      {inference.recommended_action ? (
        <View style={styles.recommendation}>
          <Ionicons name="medkit-outline" size={16} color={colors.accent} />
          <Text style={styles.recommendationText}>{inference.recommended_action}</Text>
        </View>
      ) : null}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textDisabled} />
        <Text style={styles.disclaimerText}>
          Este resultado es una herramienta de apoyo diagnóstico y no reemplaza el juicio clínico del especialista.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  card: {
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    padding: spacing.xl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: { ...typography.title, fontWeight: '800', textAlign: 'center' },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  codeBadge: {
    borderWidth: 1.5,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  codeBadgeText: { ...typography.caption, fontWeight: '800', letterSpacing: 0.5 },
  riskBadge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  riskBadgeText: { ...typography.caption, fontWeight: '700' },
  sublabel: { ...typography.bodySm, color: colors.textSub, textAlign: 'center' },
  confidenceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  confidenceLabel: { ...typography.label, color: colors.textSub },
  confidenceBar: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  confidenceFill: { height: '100%', borderRadius: radius.full },
  confidencePct: { ...typography.title, fontWeight: '800', textAlign: 'right' },
  recommendation: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.accentLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent + '22',
  },
  recommendationText: { ...typography.bodySm, color: colors.text, flex: 1, lineHeight: 19 },
  disclaimer: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disclaimerText: { ...typography.caption, color: colors.textDisabled, flex: 1, lineHeight: 17 },
});
