import { useEffect, useState } from 'react';

import { studiesRepository } from '../data/studiesRepository';
import { Study } from '../domain/types';

export function useStudy(studyId: string) {
  const [study, setStudy]     = useState<Study | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!studyId) {
        setError('Falta el estudio');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await studiesRepository.getById(studyId);
        if (!cancelled) setStudy(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'No se pudo cargar el estudio');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [studyId]);

  return { study, isLoading, error };
}
