import { useCallback, useEffect, useState } from "react";

import { patientsRepository } from "../data/patientsRepository";
import { Patient } from "../domain/types";

type State = {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
};

export function usePatients(archived = false) {
  const [state, setState] = useState<State>({
    patients: [],
    isLoading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const patients = await patientsRepository.list({ archived });
      setState({ patients, isLoading: false, error: null });
    } catch (e: any) {
      setState({ patients: [], isLoading: false, error: e?.message ?? "Error al cargar pacientes" });
    }
  }, [archived]);

  useEffect(() => {
    load();
  }, [load]);

  const restore = useCallback(async (id: string) => {
    await patientsRepository.restore(id);
    setState((s) => ({ ...s, patients: s.patients.filter((p) => p.id !== id) }));
  }, []);

  return { ...state, refresh: load, restore };
}
