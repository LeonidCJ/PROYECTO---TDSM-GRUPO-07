import { resolveRedirect } from '@/src/core/auth/routing';

describe('resolveRedirect', () => {
  it('envía a login cuando no está autenticado y fuera del grupo auth', () => {
    expect(resolveRedirect({ isAuthenticated: false, role: null, segment: '(tabs)' })).toBe(
      '/(auth)/login',
    );
  });

  it('no redirige si no está autenticado y ya está en el grupo auth', () => {
    expect(resolveRedirect({ isAuthenticated: false, role: null, segment: '(auth)' })).toBeNull();
  });

  it('no redirige mientras el rol aún no carga', () => {
    expect(resolveRedirect({ isAuthenticated: true, role: null, segment: '(auth)' })).toBeNull();
  });

  it('tras el login manda al doctor a (tabs)', () => {
    expect(resolveRedirect({ isAuthenticated: true, role: 'doctor', segment: '(auth)' })).toBe(
      '/(tabs)',
    );
  });

  it('tras el login manda al admin a (admin)', () => {
    expect(resolveRedirect({ isAuthenticated: true, role: 'admin', segment: '(auth)' })).toBe(
      '/(admin)',
    );
  });

  it('aísla áreas: un doctor en (admin) va a (tabs)', () => {
    expect(resolveRedirect({ isAuthenticated: true, role: 'doctor', segment: '(admin)' })).toBe(
      '/(tabs)',
    );
  });

  it('aísla áreas: un admin en (tabs) va a (admin)', () => {
    expect(resolveRedirect({ isAuthenticated: true, role: 'admin', segment: '(tabs)' })).toBe(
      '/(admin)',
    );
  });

  it('no redirige cuando cada rol ya está en su área', () => {
    expect(resolveRedirect({ isAuthenticated: true, role: 'doctor', segment: '(tabs)' })).toBeNull();
    expect(resolveRedirect({ isAuthenticated: true, role: 'admin', segment: '(admin)' })).toBeNull();
  });
});
