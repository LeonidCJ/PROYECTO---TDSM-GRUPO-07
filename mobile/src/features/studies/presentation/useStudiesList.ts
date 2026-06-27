import { useCallback, useEffect, useState } from 'react';

import { studiesRepository } from '../data/studiesRepository';
import { Study } from '../domain/types';

export function useStudiesList() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studiesRepository.list();
      setStudies(data);
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo cargar el historial');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { studies, isLoading, error, reload: load };
}
