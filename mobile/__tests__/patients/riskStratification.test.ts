import { assessRisk } from '@/src/features/patients/presentation/riskStratification';

const base = {
  hasPreviousBladderCancer: false,
  smokingStatus: 'never' as const,
  hematuriaType: 'none' as const,
  occupationalExposure: false,
};

describe('assessRisk — dimensión IA', () => {
  it('HGC (alto grado) => riesgo alto, control a 3 meses', () => {
    const r = assessRisk({ ...base, latestLabel: 'HGC' });
    expect(r.level).toBe('high');
    expect(r.recommendedMonths).toBe(3);
  });

  it('LGC (bajo grado) sin factores => intermedio, control a 6 meses', () => {
    const r = assessRisk({ ...base, latestLabel: 'LGC' });
    expect(r.level).toBe('intermediate');
    expect(r.recommendedMonths).toBe(6);
  });

  it('NTL / NST sin factores => bajo, control a 12 meses', () => {
    expect(assessRisk({ ...base, latestLabel: 'NTL' }).level).toBe('low');
    expect(assessRisk({ ...base, latestLabel: 'NST' }).recommendedMonths).toBe(12);
  });

  it('sin resultado y sin factores => bajo', () => {
    const r = assessRisk({ ...base, latestLabel: null });
    expect(r.level).toBe('low');
    expect(r.reasons).toContain('Sin análisis previo');
  });
});

describe('assessRisk — puntaje por factores clínicos', () => {
  it('toma el mayor entre IA y factores', () => {
    // NTL (bajo) pero con cáncer previo (2) + macro (2) = 4 => alto
    const r = assessRisk({
      ...base,
      latestLabel: 'NTL',
      hasPreviousBladderCancer: true,
      hematuriaType: 'macroscopic',
    });
    expect(r.level).toBe('high');
  });

  it('caso Ana: fumadora + hematuria micro + ocupacional (sin análisis) => intermedio', () => {
    const r = assessRisk({
      latestLabel: null,
      hasPreviousBladderCancer: false,
      smokingStatus: 'current',
      hematuriaType: 'microscopic',
      occupationalExposure: true,
    });
    expect(r.level).toBe('intermediate'); // 1 + 1 + 1 = 3 puntos
    expect(r.recommendedMonths).toBe(6);
  });

  it('caso Jorge: cáncer previo + fumador + macro + ocupacional (sin análisis) => alto', () => {
    const r = assessRisk({
      latestLabel: null,
      hasPreviousBladderCancer: true,
      smokingStatus: 'current',
      hematuriaType: 'macroscopic',
      occupationalExposure: true,
    });
    expect(r.level).toBe('high'); // 2 + 2 + 1 + 1 = 6 puntos
    expect(r.recommendedMonths).toBe(3);
  });

  it('exfumador solo no sube el nivel pero se documenta', () => {
    const r = assessRisk({ ...base, latestLabel: null, smokingStatus: 'former' });
    expect(r.level).toBe('low');
    expect(r.reasons).toContain('Exfumador');
  });

  it('lista todos los factores presentes como razones', () => {
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
