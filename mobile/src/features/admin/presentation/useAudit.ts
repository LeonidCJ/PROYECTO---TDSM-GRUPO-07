import { useCallback, useRef, useState } from "react";

import { adminRepository } from "../data/adminRepository";
import { AuditEvent, AuditEventType } from "../domain/types";

type Mode = "reload" | "refresh" | "more";

export function useAudit() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [filter, setFilterState] = useState<AuditEventType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);
  const busyRef = useRef(false);

  // The active filter is passed explicitly to load() so a filter change reads
  // the new value immediately instead of a stale closure.
  const load = useCallback(
    async (page: number, activeFilter: AuditEventType | null, mode: Mode) => {
      if (busyRef.current) return;
      busyRef.current = true;
      if (mode === "refresh") setRefreshing(true);
      else if (mode === "reload") setIsLoading(true);
      setError(null);
      try {
        const res = await adminRepository.listAudit(page, activeFilter ?? undefined);
        setEvents((prev) => (mode === "more" ? [...prev, ...res.results] : res.results));
        setHasMore(Boolean(res.next));
        pageRef.current = page;
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cargar el registro de accesos");
      } finally {
        setIsLoading(false);
        setRefreshing(false);
        busyRef.current = false;
      }
    },
    [],
  );

  const reload = useCallback(() => load(1, filter, "reload"), [load, filter]);
  const refresh = useCallback(() => load(1, filter, "refresh"), [load, filter]);
  const loadMore = useCallback(() => {
    if (hasMore && !busyRef.current) load(pageRef.current + 1, filter, "more");
  }, [hasMore, filter, load]);
  const setFilter = useCallback(
    (next: AuditEventType | null) => {
      setFilterState(next);
      load(1, next, "reload");
    },
    [load],
  );

  return { events, filter, isLoading, refreshing, error, hasMore, reload, refresh, loadMore, setFilter };
}
