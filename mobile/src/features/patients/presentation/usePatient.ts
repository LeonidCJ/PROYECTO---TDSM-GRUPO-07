import { useCallback, useEffect, useState } from "react";

import { studiesRepository } from "@/src/features/studies/data/studiesRepository";
import { Study } from "@/src/features/studies/domain/types";
import { patientsRepository } from "../data/patientsRepository";
import { Patient } from "../domain/types";

export function usePatient(id: string) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [p, s] = await Promise.all([
        patientsRepository.getById(id),
        studiesRepository.list(id),
      ]);
      setPatient(p);
      setStudies(s);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo cargar el paciente");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const setFollowup = useCallback(
    async (date: string | null) => {
      const updated = await patientsRepository.update(id, { next_followup_date: date });
      setPatient(updated);
    },
    [id],
  );

  const archive = useCallback(async () => {
    await patientsRepository.archive(id);
  }, [id]);

  return { patient, studies, isLoading, error, reload: load, setFollowup, archive };
}
