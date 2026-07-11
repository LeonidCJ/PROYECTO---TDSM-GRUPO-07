import { PrimaryLabel, Study } from '../domain/types';

export type ClassCounts = Record<PrimaryLabel, number>;

export type AnalyticsSummary = {
  total: number;
  completed: number;
  pending: number;
  analyzed: number;
  malignant: number;
  malignantPct: number;
  byClass: ClassCounts;
  pendingStudies: Study[];
};

const EMPTY_CLASSES: ClassCounts = { HGC: 0, LGC: 0, NTL: 0, NST: 0 };

/**
 * Agrega la lista de estudios en las métricas del panel de análisis.
 * Pura: no depende de React ni de la red, por lo que es testeable de forma aislada.
 */
export function computeAnalytics(studies: Study[]): AnalyticsSummary {
  const byClass: ClassCounts = { ...EMPTY_CLASSES };
  let analyzed = 0;
  let malignant = 0;
  let completed = 0;
  let pending = 0;
  const pendingStudies: Study[] = [];

  for (const study of studies) {
    if (study.status === 'completed') completed += 1;
    if (study.status === 'in_progress') {
      pending += 1;
      pendingStudies.push(study);
    }

    const inference = study.inference_result;
    if (inference) {
      analyzed += 1;
      if (inference.primary_label in byClass) {
        byClass[inference.primary_label] += 1;
      }
      if (inference.is_malignant) malignant += 1;
    }
  }

  return {
    total: studies.length,
    completed,
    pending,
    analyzed,
    malignant,
    malignantPct: analyzed ? Math.round((malignant / analyzed) * 100) : 0,
    byClass,
    pendingStudies,
  };
}
