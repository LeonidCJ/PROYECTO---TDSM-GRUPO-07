import { computeAnalytics } from '@/src/features/studies/presentation/analytics';

const study = (over: any = {}) => ({
  id: Math.random().toString(),
  status: 'completed',
  inference_result: null,
  ...over,
});

describe('computeAnalytics', () => {
  it('devuelve ceros para una lista vacía', () => {
    const s = computeAnalytics([]);
    expect(s.total).toBe(0);
    expect(s.malignantPct).toBe(0);
    expect(s.byClass).toEqual({ HGC: 0, LGC: 0, NTL: 0, NST: 0 });
  });

  it('cuenta por clase y calcula el porcentaje de malignos', () => {
    const studies = [
      study({ inference_result: { primary_label: 'HGC', is_malignant: true } }),
      study({ inference_result: { primary_label: 'LGC', is_malignant: true } }),
      study({ inference_result: { primary_label: 'NTL', is_malignant: false } }),
      study({ inference_result: { primary_label: 'NST', is_malignant: false } }),
    ] as any;

    const s = computeAnalytics(studies);
    expect(s.total).toBe(4);
    expect(s.analyzed).toBe(4);
    expect(s.byClass).toEqual({ HGC: 1, LGC: 1, NTL: 1, NST: 1 });
    expect(s.malignant).toBe(2);
    expect(s.malignantPct).toBe(50);
  });

  it('separa los estudios en progreso como pendientes', () => {
    const studies = [
      study({ status: 'completed', inference_result: { primary_label: 'NST', is_malignant: false } }),
      study({ status: 'in_progress', id: 'p1' }),
      study({ status: 'in_progress', id: 'p2' }),
    ] as any;

    const s = computeAnalytics(studies);
    expect(s.completed).toBe(1);
    expect(s.pending).toBe(2);
    expect(s.pendingStudies).toHaveLength(2);
  });

  it('no cuenta como analizado un estudio sin resultado', () => {
    const s = computeAnalytics([study({ inference_result: null })] as any);
    expect(s.analyzed).toBe(0);
    expect(s.malignantPct).toBe(0);
  });
});
