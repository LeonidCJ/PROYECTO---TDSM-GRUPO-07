import { classifyReport } from '@/src/features/reports/presentation/useReport';

describe('classifyReport', () => {
  it('devuelve ready cuando el informe tiene pdf_url y status ready', () => {
    const out = classifyReport({ status: 'ready', pdf_url: 'https://x.pdf' } as any);
    expect(out.state).toBe('ready');
    expect(out.errorMsg).toBeNull();
  });

  it('devuelve error cuando el status es error', () => {
    const out = classifyReport({ status: 'error', pdf_url: '' } as any);
    expect(out.state).toBe('error');
    expect(out.errorMsg).toBeTruthy();
  });

  it('devuelve error cuando falta pdf_url aunque status sea ready', () => {
    const out = classifyReport({ status: 'ready', pdf_url: '' } as any);
    expect(out.state).toBe('error');
  });
});
