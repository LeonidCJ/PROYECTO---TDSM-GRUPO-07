import type { Role } from "@/src/features/auth/domain/types";

export type RouteTarget = "/(auth)/login" | "/(tabs)" | "/(admin)";

/**
 * Pure routing decision for the AuthGate. Kept as a standalone function so it
 * can be unit-tested without rendering (renderHook is unreliable under the
 * current jest-expo / React 19 setup).
 *
 * `role` is null when the user is authenticated but the profile has not loaded
 * yet; in that case no redirect is issued (the gate shows a loader instead).
 * Returns the path to redirect to, or null to stay put.
 */
export function resolveRedirect(params: {
  isAuthenticated: boolean;
  role: Role | null;
  segment: string | undefined;
}): RouteTarget | null {
  const { isAuthenticated, role, segment } = params;

  if (!isAuthenticated) {
    return segment === "(auth)" ? null : "/(auth)/login";
  }

  // Authenticated but role unknown: wait, do not guess (avoids sending an
  // admin into the clinical area or vice versa).
  if (role === null) return null;

  const home: RouteTarget = role === "admin" ? "/(admin)" : "/(tabs)";

  // Just logged in (still in the auth group): go to the role's home.
  if (segment === "(auth)") return home;

  // Enforce area isolation between roles.
  if (role === "admin" && segment === "(tabs)") return "/(admin)";
  if (role === "doctor" && segment === "(admin)") return "/(tabs)";

  return null;
}
