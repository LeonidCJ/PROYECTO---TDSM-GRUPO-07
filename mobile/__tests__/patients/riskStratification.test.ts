import { assessRisk } from '@/src/features/patients/presentation/riskStratification';

const base = {
  hasPreviousBladderCancer: false,
  smokingStatus: 'never' as const,
  hematuriaType: 'none' as const,
  occupationalExposure: false,
};

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
    expect(assessRisk({ ...base, latestLabel: 'LGC', hasPreviousBladderCancer: true }).level).toBe('high');
    expect(assessRisk({ ...base, latestLabel: 'NTL', hasPreviousBladderCancer: true }).level).toBe('intermediate');
  });

  it('distingue fumador activo de exfumador en las razones', () => {
    expect(assessRisk({ ...base, latestLabel: 'NTL', smokingStatus: 'current' }).reasons).toContain('Fumador activo');
    expect(assessRisk({ ...base, latestLabel: 'NTL', smokingStatus: 'former' }).reasons).toContain('Exfumador');
  });

  it('lista todos los factores como razones', () => {
    const r = assessRisk({
      latestLabel: 'HGC',
      hasPreviousBladderCancer: true,
      smokingStatus: 'current',
      hematuriaType: 'macroscopic',
      occupationalExposure: true,
    });
    expect(r.reasons).toEqual(
      expect.arrayContaining([
        'Resultado de alto grado (HGC)',
        'Antecedente de cáncer de vejiga',
        'Fumador activo',
        'Hematuria macroscópica',
        'Exposición ocupacional',
      ]),
    );
  });
});
