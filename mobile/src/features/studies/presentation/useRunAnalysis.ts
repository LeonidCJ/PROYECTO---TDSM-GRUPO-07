import { useEffect, useRef, useState } from 'react';

import { studiesRepository } from '../data/studiesRepository';
import { EndoscopicImage, ImageSource, InferenceResult } from '../domain/types';

export type AnalysisState = 'analyzing' | 'result' | 'unavailable' | 'error';

type Params = {
  patientId: string;
  imageUri: string;
  source?: ImageSource;
};

/** Decide el estado a partir de la imagen subida. Pura: testeable sin React. */
export function classifyUpload(image: EndoscopicImage): {
  state: AnalysisState;
  inference: InferenceResult | null;
} {
  return image.inference_result
    ? { state: 'result', inference: image.inference_result }
    : { state: 'unavailable', inference: null };
}

/** Mapea un error a estado. MODEL_UNAVAILABLE no es un fallo: es "no disponible". */
export function classifyAnalysisError(e: any): {
  state: AnalysisState;
  errorMsg: string | null;
} {
  if (e?.message === 'MODEL_UNAVAILABLE') {
    return { state: 'unavailable', errorMsg: null };
  }
  return { state: 'error', errorMsg: e?.message ?? 'Error al procesar la imagen' };
}

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

        const outcome = classifyUpload(image);
        setInference(outcome.inference);
        setState(outcome.state);
      } catch (e: any) {
        if (cancelled) return;
        const outcome = classifyAnalysisError(e);
        setErrorMsg(outcome.errorMsg);
        setState(outcome.state);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [patientId, imageUri, source]);

  return { state, inference, studyId, referenceCode, errorMsg };
}
