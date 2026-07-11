import { useCallback, useEffect, useState } from 'react';

import { reportsRepository } from '../data/reportsRepository';
import { Report } from '../domain/types';

export function useReportsList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsRepository.list();
      setReports(data);
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo cargar los informes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { reports, isLoading, error, reload: load };
}
