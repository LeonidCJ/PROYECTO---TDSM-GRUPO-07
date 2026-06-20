import { useCallback, useEffect, useState } from "react";

import { patientsRepository } from "../data/patientsRepository";
import { Patient } from "../domain/types";

type State = {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
};

export function usePatients() {
  const [state, setState] = useState<State>({
    patients: [],
    isLoading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const patients = await patientsRepository.list();
      setState({ patients, isLoading: false, error: null });
    } catch (e: any) {
      setState({ patients: [], isLoading: false, error: e?.message ?? "Error al cargar pacientes" });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}
