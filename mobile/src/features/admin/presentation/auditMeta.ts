import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/src/shared/theme";
import { AuditEventType } from "../domain/types";

type IoniconName = keyof typeof Ionicons.glyphMap;

export type AuditMeta = {
  label: string;
  color: string;
  icon: IoniconName;
};

export function auditMetaOf(event: AuditEventType): AuditMeta {
  switch (event) {
    case "login_ok":
      return { label: "Ingreso", color: colors.success, icon: "log-in-outline" };
    case "login_failed":
      return { label: "Fallido", color: colors.error, icon: "alert-circle-outline" };
    case "logout":
      return { label: "Salida", color: colors.textSub, icon: "log-out-outline" };
  }
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
