const pad = (n: number) => String(n).padStart(2, '0');

/** Formatea una fecha ISO como dd/mm/aaaa. Devuelve '—' si es inválida. */
export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Formatea una fecha ISO como dd/mm/aaaa · HH:mm. Devuelve '—' si es inválida. */
export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${formatDate(iso)} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
