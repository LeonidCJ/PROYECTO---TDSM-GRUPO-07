import { colors } from "@/src/shared/theme";

export type FollowupStatus = "due" | "soon" | "scheduled" | "none";

function parseDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function daysBetween(target: Date, today: Date): number {
  const a = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.round((a - b) / 86_400_000);
}

/**
 * Classifies a scheduled follow-up (cystoscopy control) relative to today.
 * Pure so it can be unit-tested without rendering.
 *   due       -> today or overdue
 *   soon      -> within the next 14 days
 *   scheduled -> further out
 *   none      -> no date set
 */
export function followupStatus(
  dateStr: string | null | undefined,
  today: Date = new Date(),
): FollowupStatus {
  if (!dateStr) return "none";
  const d = parseDate(dateStr);
  if (!d) return "none";
  const days = daysBetween(d, today);
  if (days <= 0) return "due";
  if (days <= 14) return "soon";
  return "scheduled";
}

export function followupMetaOf(status: FollowupStatus): { label: string; color: string } {
  switch (status) {
    case "due":
      return { label: "Control vencido", color: colors.error };
    case "soon":
      return { label: "Control próximo", color: colors.warning };
    case "scheduled":
      return { label: "Control programado", color: colors.success };
    case "none":
      return { label: "Sin control programado", color: colors.textSub };
  }
}

/** Returns a YYYY-MM-DD string `months` from `from`, for the EAU control presets. */
export function isoDatePlusMonths(months: number, from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth() + months, from.getDate());
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatFollowupDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = parseDate(dateStr);
  if (!d) return "";
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
}
