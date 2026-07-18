import { useCallback, useRef, useState } from "react";

import { adminRepository } from "../data/adminRepository";
import { AdminUser, UserPatch } from "../domain/types";

type Mode = "reload" | "refresh" | "more";
type PatchResult = { ok: true } | { ok: false; error: string };

export function useUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);
  const busyRef = useRef(false);
  const searchRef = useRef("");

  const load = useCallback(async (page: number, mode: Mode) => {
    if (busyRef.current) return;
    busyRef.current = true;
    if (mode === "refresh") setRefreshing(true);
    else if (mode === "reload") setIsLoading(true);
    setError(null);
    try {
      const res = await adminRepository.listUsers(page, searchRef.current || undefined);
      setUsers((prev) => (mode === "more" ? [...prev, ...res.results] : res.results));
      setHasMore(Boolean(res.next));
      pageRef.current = page;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la lista de usuarios");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      busyRef.current = false;
    }
  }, []);

  const reload = useCallback(() => load(1, "reload"), [load]);
  const refresh = useCallback(() => load(1, "refresh"), [load]);
  const loadMore = useCallback(() => {
    if (hasMore && !busyRef.current) load(pageRef.current + 1, "more");
  }, [hasMore, load]);
  const setSearch = useCallback(
    (q: string) => {
      searchRef.current = q;
      load(1, "reload");
    },
    [load],
  );

  const applyPatch = useCallback(async (id: string, patch: UserPatch): Promise<PatchResult> => {
    try {
      const updated = await adminRepository.updateUser(id, patch);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "No se pudo actualizar el usuario" };
    }
  }, []);

  return { users, isLoading, refreshing, error, hasMore, reload, refresh, loadMore, setSearch, applyPatch };
}
