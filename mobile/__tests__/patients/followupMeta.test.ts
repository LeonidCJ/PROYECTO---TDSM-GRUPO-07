import { followupStatus, isoDatePlusMonths } from '@/src/features/patients/presentation/followupMeta';

// Fixed reference date: 2026-07-18 (month is 0-indexed, 6 = July).
const today = new Date(2026, 6, 18);

describe('followupStatus', () => {
  it('devuelve none cuando no hay fecha', () => {
    expect(followupStatus(null, today)).toBe('none');
    expect(followupStatus(undefined, today)).toBe('none');
  });

  it('due cuando el control es hoy o está vencido', () => {
    expect(followupStatus('2026-07-18', today)).toBe('due');
    expect(followupStatus('2026-07-01', today)).toBe('due');
  });

  it('soon dentro de los próximos 14 días', () => {
    expect(followupStatus('2026-07-25', today)).toBe('soon');
    expect(followupStatus('2026-08-01', today)).toBe('soon'); // exactamente 14 días
  });

  it('scheduled más allá de 14 días', () => {
    expect(followupStatus('2026-09-01', today)).toBe('scheduled');
  });
});

describe('isoDatePlusMonths', () => {
  it('suma meses y devuelve YYYY-MM-DD', () => {
    expect(isoDatePlusMonths(3, today)).toBe('2026-10-18');
    expect(isoDatePlusMonths(6, today)).toBe('2027-01-18');
    expect(isoDatePlusMonths(12, today)).toBe('2027-07-18');
  });
});
