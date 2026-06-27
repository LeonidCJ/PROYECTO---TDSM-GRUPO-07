import { useCallback, useEffect, useRef, useState } from 'react';

import { reportsRepository } from '../data/reportsRepository';
import { Report } from '../domain/types';

export type ReportState = 'generating' | 'ready' | 'error';

/**
 * Generates (or fetches the existing) report for a study. The backend create
 * endpoint is idempotent, so re-entering this screen returns the same report.
 */
export function useReport(studyId: string) {
  const [state, setState]     = useState<ReportState>('generating');
  const [report, setReport]   = useState<Report | null>(null);
  const [errorMsg, setError]  = useState<string | null>(null);
  const startedRef = useRef(false);

  const generate = useCallback(async () => {
    setState('generating');
    setError(null);
    try {
      const result = await reportsRepository.create({ study: studyId });
      if (result.status === 'error' || !result.pdf_url) {
        setReport(result);
        setError('No se pudo generar el PDF del informe');
        setState('error');
        return;
      }
      setReport(result);
      setState('ready');
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo generar el informe');
      setState('error');
    }
  }, [studyId]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (!studyId) {
      setError('Falta el estudio para generar el informe');
      setState('error');
      return;
    }
    generate();
  }, [studyId, generate]);

  return { state, report, errorMsg, retry: generate };
}
