import { useLocalSearchParams } from "expo-router";

import { AdminUserFormScreen } from "@/src/features/admin/presentation/AdminUserFormScreen";

export default function AdminUserFormRoute() {
  const { mode, userId, email } = useLocalSearchParams<{
    mode?: string;
    userId?: string;
    email?: string;
  }>();
  return (
    <AdminUserFormScreen
      mode={mode === "reset" ? "reset" : "create"}
      userId={userId}
      email={email ? decodeURIComponent(email) : undefined}
    />
  );
}
