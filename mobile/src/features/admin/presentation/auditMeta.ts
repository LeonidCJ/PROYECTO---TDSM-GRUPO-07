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
    case "user_created":
      return { label: "Usuario creado", color: colors.accent, icon: "person-add-outline" };
    case "user_role_changed":
      return { label: "Cambio de rol", color: colors.accent, icon: "swap-horizontal-outline" };
    case "user_activated":
      return { label: "Activación", color: colors.success, icon: "checkmark-circle-outline" };
    case "user_deactivated":
      return { label: "Desactivación", color: colors.warning, icon: "ban-outline" };
    case "password_reset":
      return { label: "Contraseña", color: colors.accent, icon: "key-outline" };
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
