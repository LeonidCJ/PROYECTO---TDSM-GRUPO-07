import { colors } from '@/src/shared/theme';
import { PrimaryLabel, RiskLevel } from '../domain/types';

export const LABEL_META: Record<PrimaryLabel, { name: string; full: string }> = {
  HGC: { name: 'Cáncer de alto grado', full: 'High Grade Cancer' },
  LGC: { name: 'Cáncer de bajo grado', full: 'Low Grade Cancer' },
  NTL: { name: 'Lesión no tumoral', full: 'Non-Tumor Lesion' },
  NST: { name: 'Tejido normal', full: 'Normal Surrounding Tissue' },
};

export const RISK_META: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  high:   { label: 'Riesgo alto',  color: colors.error,   bg: colors.errorLight },
  medium: { label: 'Riesgo medio', color: colors.warning, bg: colors.warningLight },
  low:    { label: 'Riesgo bajo',  color: colors.success, bg: colors.successLight },
};

export function riskMetaOf(risk?: RiskLevel) {
  return (risk && RISK_META[risk]) || RISK_META.low;
}
