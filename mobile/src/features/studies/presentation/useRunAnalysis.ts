import { useEffect, useRef, useState } from 'react';

import { studiesRepository } from '../data/studiesRepository';
import { ImageSource, InferenceResult } from '../domain/types';

export type AnalysisState = 'analyzing' | 'result' | 'unavailable' | 'error';

type Params = {
  patientId: string;
  imageUri: string;
  source?: ImageSource;
};

/**
 * Owns the full analysis process for the result screen:
 * create study -> upload image (backend runs inference synchronously) ->
 * resolve to a result, an "unavailable" state, or an error.
 */
export function useRunAnalysis({ patientId, imageUri, source }: Params) {
  const [state, setState]           = useState<AnalysisState>('analyzing');
  const [inference, setInference]   = useState<InferenceResult | null>(null);
  const [studyId, setStudyId]       = useState<string | null>(null);
  const [referenceCode, setRefCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!patientId || !imageUri) {
      setErrorMsg('Faltan datos para realizar el análisis');
      setState('error');
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        const study = await studiesRepository.create({ patient: patientId });
        if (cancelled) return;
        setStudyId(study.id);
        setRefCode(study.reference_code);

        const image = await studiesRepository.uploadImage(study.id, imageUri, source);
        if (cancelled) return;

        if (image.inference_result) {
          setInference(image.inference_result);
          setState('result');
        } else {
          // Image saved but the inference service could not produce a result.
          setState('unavailable');
        }
      } catch (e: any) {
        if (cancelled) return;
        if (e?.message === 'MODEL_UNAVAILABLE') {
          setState('unavailable');
        } else {
          setErrorMsg(e?.message ?? 'Error al procesar la imagen');
          setState('error');
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [patientId, imageUri, source]);

  return { state, inference, studyId, referenceCode, errorMsg };
}
