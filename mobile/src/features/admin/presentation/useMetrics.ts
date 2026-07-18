import { useCallback, useState } from "react";

import { adminRepository } from "../data/adminRepository";
import { Metrics } from "../domain/types";

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: "reload" | "refresh") => {
    if (mode === "refresh") setRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      setMetrics(await adminRepository.getMetrics());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las métricas");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const reload = useCallback(() => load("reload"), [load]);
  const refresh = useCallback(() => load("refresh"), [load]);

  return { metrics, isLoading, refreshing, error, reload, refresh };
}
