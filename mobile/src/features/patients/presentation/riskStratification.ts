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

const MONTHS: Record<RiskLevel, 3 | 6 | 12> = { high: 3, intermediate: 6, low: 12 };
const META: Record<RiskLevel, { label: string; color: string }> = {
  high: { label: "Riesgo alto", color: colors.error },
  intermediate: { label: "Riesgo intermedio", color: colors.warning },
  low: { label: "Riesgo bajo", color: colors.success },
};

function scoreToLevel(points: number): RiskLevel {
  if (points >= 4) return "high";
  if (points >= 2) return "intermediate";
  return "low";
}

/**
 * Simplified, transparent risk orientation for bladder-cancer follow-up.
 *
 * The estimate combines two dimensions and takes the higher of the two:
 *   - the level implied by the latest AI result (a proxy for grade), and
 *   - a weighted score over the patient's clinical risk factors.
 * This keeps the shown factors consistent with the resulting level.
 *
 * NOTE: this is NOT the formal EAU risk classification (which requires TURBT
 * histopathology: stage, grade, size, multifocality, CIS). It is a heuristic
 * that orients the surveillance interval and must be reviewed by the physician.
 */
export function assessRisk(input: RiskInput): RiskAssessment {
  const reasons: string[] = [];

  // Dimension 1: level implied by the most recent AI classification.
  let aiLevel: RiskLevel;
  switch (input.latestLabel) {
    case "HGC":
      aiLevel = "high";
      reasons.push("Resultado de alto grado (HGC)");
      break;
    case "LGC":
      aiLevel = "intermediate";
      reasons.push("Resultado de bajo grado (LGC)");
      break;
    case "NTL":
    case "NST":
      aiLevel = "low";
      reasons.push("Sin tumor / tejido no sospechoso");
      break;
    default:
      aiLevel = "low";
      reasons.push("Sin análisis previo");
  }

  // Dimension 2: weighted score over clinical risk factors.
  let points = 0;
  if (input.hasPreviousBladderCancer) {
    points += 2;
    reasons.push("Antecedente de cáncer de vejiga");
  }
  if (input.hematuriaType === "macroscopic") {
    points += 2;
    reasons.push("Hematuria macroscópica");
  } else if (input.hematuriaType === "microscopic") {
    points += 1;
    reasons.push("Hematuria microscópica");
  }
  if (input.smokingStatus === "current") {
    points += 1;
    reasons.push("Fumador activo");
  } else if (input.smokingStatus === "former") {
    reasons.push("Exfumador");
  }
  if (input.occupationalExposure) {
    points += 1;
    reasons.push("Exposición ocupacional");
  }
  const factorLevel = scoreToLevel(points);

  // Final level: the higher of the two dimensions.
  const level = ORDER[Math.max(ORDER.indexOf(aiLevel), ORDER.indexOf(factorLevel))];

  return {
    level,
    recommendedMonths: MONTHS[level],
    label: META[level].label,
    color: META[level].color,
    reasons,
  };
}
