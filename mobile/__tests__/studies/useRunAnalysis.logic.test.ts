import {
  classifyAnalysisError,
  classifyUpload,
} from '@/src/features/studies/presentation/useRunAnalysis';

describe('classifyUpload', () => {
  it('devuelve result cuando la imagen trae inference_result', () => {
    const out = classifyUpload({
      id: 'img1',
      inference_result: { primary_label: 'NTL', risk_level: 'low' },
    } as any);
    expect(out.state).toBe('result');
    expect(out.inference?.primary_label).toBe('NTL');
  });

  it('devuelve unavailable cuando no hay inference_result', () => {
    const out = classifyUpload({ id: 'img1', inference_result: null } as any);
    expect(out.state).toBe('unavailable');
    expect(out.inference).toBeNull();
  });
});

describe('classifyAnalysisError', () => {
  it('mapea MODEL_UNAVAILABLE a unavailable (sin error)', () => {
    const out = classifyAnalysisError(new Error('MODEL_UNAVAILABLE'));
    expect(out.state).toBe('unavailable');
    expect(out.errorMsg).toBeNull();
  });

  it('mapea un error genérico a error con su mensaje', () => {
    const out = classifyAnalysisError(new Error('Falla de red'));
    expect(out.state).toBe('error');
    expect(out.errorMsg).toBe('Falla de red');
  });

  it('usa mensaje por defecto si el error no tiene message', () => {
    const out = classifyAnalysisError({});
    expect(out.state).toBe('error');
    expect(out.errorMsg).toBe('Error al procesar la imagen');
  });
});
