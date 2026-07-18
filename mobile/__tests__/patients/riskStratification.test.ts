import { assessRisk } from '@/src/features/patients/presentation/riskStratification';

const base = { hasPreviousBladderCancer: false, isSmoker: false, hasHematuria: false };

describe('assessRisk', () => {
  it('HGC (alto grado) => riesgo alto, control a 3 meses', () => {
    const r = assessRisk({ ...base, latestLabel: 'HGC' });
    expect(r.level).toBe('high');
    expect(r.recommendedMonths).toBe(3);
  });

  it('LGC (bajo grado) => riesgo intermedio, control a 6 meses', () => {
    const r = assessRisk({ ...base, latestLabel: 'LGC' });
    expect(r.level).toBe('intermediate');
    expect(r.recommendedMonths).toBe(6);
  });

  it('NTL / NST => riesgo bajo, control a 12 meses', () => {
    expect(assessRisk({ ...base, latestLabel: 'NTL' }).level).toBe('low');
    expect(assessRisk({ ...base, latestLabel: 'NST' }).recommendedMonths).toBe(12);
  });

  it('sin resultado previo => riesgo bajo por defecto', () => {
    const r = assessRisk({ ...base, latestLabel: null });
    expect(r.level).toBe('low');
    expect(r.reasons).toContain('Sin análisis previo');
  });

  it('el antecedente de cáncer sube un nivel', () => {
    // LGC (intermedio) + antecedente => alto
    expect(assessRisk({ ...base, latestLabel: 'LGC', hasPreviousBladderCancer: true }).level).toBe('high');
    // NTL (bajo) + antecedente => intermedio
    expect(assessRisk({ ...base, latestLabel: 'NTL', hasPreviousBladderCancer: true }).level).toBe('intermediate');
  });

  it('lista los factores como razones', () => {
    const r = assessRisk({ latestLabel: 'HGC', hasPreviousBladderCancer: true, isSmoker: true, hasHematuria: true });
    expect(r.reasons).toEqual(
      expect.arrayContaining([
        'Resultado de alto grado (HGC)',
        'Antecedente de cáncer de vejiga',
        'Fumador',
        'Hematuria',
      ]),
    );
  });
});
