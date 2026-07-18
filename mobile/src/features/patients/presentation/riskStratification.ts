import { colors } from "@/src/shared/theme";
import { PrimaryLabel } from "@/src/features/studies/domain/types";
import { HematuriaType, SmokingStatus } from "../domain/types";

export type RiskLevel = "low" | "intermediate" | "high";

export type RiskAssessment = {
  level: RiskLevel;
  /** Suggested months to the next control, aligned with EAU surveillance intervals. */
  recommendedMonths: 3 | 6 | 12;
  label: string;
  color: string;
  /** Human-readable factors that drove the estimate. */
  reasons: string[];
};

export type RiskInput = {
  latestLabel: PrimaryLabel | null;
  hasPreviousBladderCancer: boolean;
  smokingStatus: SmokingStatus;
  hematuriaType: HematuriaType;
  occupationalExposure: boolean;
};

const ORDER: RiskLevel[] = ["low", "intermediate", "high"];

function bumpUp(level: RiskLevel): RiskLevel {
  const i = ORDER.indexOf(level);
  return ORDER[Math.min(ORDER.length - 1, i + 1)];
}

const MONTHS: Record<RiskLevel, 3 | 6 | 12> = { high: 3, intermediate: 6, low: 12 };
const META: Record<RiskLevel, { label: string; color: string }> = {
  high: { label: "Riesgo alto", color: colors.error },
  intermediate: { label: "Riesgo intermedio", color: colors.warning },
  low: { label: "Riesgo bajo", color: colors.success },
};

/**
 * Simplified, transparent risk orientation for bladder-cancer follow-up.
 *
 * NOTE: this is NOT a formal EAU risk classification (which requires TURBT
 * histopathology: stage, size, multifocality, CIS). It is a heuristic that
 * combines the latest AI result with the patient's clinical risk factors to
 * ORIENT the surveillance interval. It must be reviewed by the physician.
 */
export function assessRisk(input: RiskInput): RiskAssessment {
  const reasons: string[] = [];

  // Base level from the most recent AI classification.
  let level: RiskLevel;
  switch (input.latestLabel) {
    case "HGC":
      level = "high";
      reasons.push("Resultado de alto grado (HGC)");
      break;
    case "LGC":
      level = "intermediate";
      reasons.push("Resultado de bajo grado (LGC)");
      break;
    case "NTL":
    case "NST":
      level = "low";
      reasons.push("Sin tumor / tejido no sospechoso");
      break;
    default:
      level = "low";
      reasons.push("Sin análisis previo");
  }

  // Clinical risk factors.
  if (input.hasPreviousBladderCancer) {
    level = bumpUp(level);
    reasons.push("Antecedente de cáncer de vejiga");
  }
  if (input.smokingStatus === "current") reasons.push("Fumador activo");
  else if (input.smokingStatus === "former") reasons.push("Exfumador");
  if (input.hematuriaType === "macroscopic") reasons.push("Hematuria macroscópica");
  else if (input.hematuriaType === "microscopic") reasons.push("Hematuria microscópica");
  if (input.occupationalExposure) reasons.push("Exposición ocupacional");

  return {
    level,
    recommendedMonths: MONTHS[level],
    label: META[level].label,
    color: META[level].color,
    reasons,
  };
}
