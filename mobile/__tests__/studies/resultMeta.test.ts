import {
  confidencePct,
  LABEL_META,
  riskMetaOf,
  RISK_META,
} from '@/src/features/studies/presentation/resultMeta';

describe('LABEL_META', () => {
  it('tiene las 4 clases clínicas', () => {
    expect(Object.keys(LABEL_META).sort()).toEqual(['HGC', 'LGC', 'NST', 'NTL']);
  });

  it('mapea HGC a cáncer de alto grado', () => {
    expect(LABEL_META.HGC.name).toBe('Cáncer de alto grado');
  });
});

describe('riskMetaOf', () => {
  it('devuelve color de riesgo alto (error) para high', () => {
    expect(riskMetaOf('high')).toBe(RISK_META.high);
    expect(riskMetaOf('high').label).toBe('Riesgo alto');
  });

  it('devuelve riesgo medio para medium', () => {
    expect(riskMetaOf('medium').label).toBe('Riesgo medio');
  });

  it('cae a riesgo bajo cuando el nivel es indefinido', () => {
    expect(riskMetaOf(undefined)).toBe(RISK_META.low);
  });
});

describe('confidencePct', () => {
  it('convierte la confianza de la clase predicha a porcentaje entero', () => {
    expect(confidencePct({ NTL: 0.7246 }, 'NTL')).toBe(72);
  });

  it('redondea correctamente', () => {
    expect(confidencePct({ HGC: 0.9123 }, 'HGC')).toBe(91);
  });

  it('devuelve 0 cuando no hay confianza para la clase', () => {
    expect(confidencePct({ LGC: 0.5 }, 'NST')).toBe(0);
    expect(confidencePct(undefined, 'HGC')).toBe(0);
  });
});
