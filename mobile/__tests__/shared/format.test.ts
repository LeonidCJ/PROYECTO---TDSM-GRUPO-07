import { formatDate, formatDateTime } from '@/src/shared/utils/format';

describe('formatDate', () => {
  it('formatea una fecha ISO como dd/mm/aaaa', () => {
    expect(formatDate('2026-06-27T14:30:00')).toBe('27/06/2026');
  });

  it('rellena con cero el día y el mes', () => {
    expect(formatDate('2026-01-05T00:00:00')).toBe('05/01/2026');
  });

  it('devuelve — cuando la fecha es inválida', () => {
    expect(formatDate('no-es-fecha')).toBe('—');
  });

  it('devuelve — cuando no hay fecha', () => {
    expect(formatDate(undefined)).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('incluye la hora en formato dd/mm/aaaa · HH:mm', () => {
    expect(formatDateTime('2026-06-27T09:05:00')).toBe('27/06/2026 · 09:05');
  });

  it('devuelve — cuando la fecha es inválida', () => {
    expect(formatDateTime('xxx')).toBe('—');
  });
});
