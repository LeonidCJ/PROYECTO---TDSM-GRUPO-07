import { httpRequest } from "@/src/core/api/httpClient";
import {
  AdminUser,
  AuditEvent,
  AuditEventType,
  CreateAdminUser,
  Metrics,
  Paginated,
  UserPatch,
} from "../domain/types";

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function getMetrics(token: string): Promise<Metrics> {
  return httpRequest<Metrics>("/api/v1/admin/metrics/", {
    headers: authHeaders(token),
  });
}

export function listUsers(
  token: string,
  page = 1,
  search?: string,
): Promise<Paginated<AdminUser>> {
  const query = `?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
  return httpRequest<Paginated<AdminUser>>(`/api/v1/admin/users/${query}`, {
    headers: authHeaders(token),
  });
}

export function createUser(token: string, data: CreateAdminUser): Promise<AdminUser> {
  return httpRequest<AdminUser>("/api/v1/admin/users/", {
    method: "POST",
    body: data,
    headers: authHeaders(token),
  });
}

export function updateUser(
  token: string,
  id: string,
  patch: UserPatch,
): Promise<AdminUser> {
  return httpRequest<AdminUser>(`/api/v1/admin/users/${id}/`, {
    method: "PATCH",
    body: patch,
    headers: authHeaders(token),
  });
}

export function listAudit(
  token: string,
  page = 1,
  event?: AuditEventType,
): Promise<Paginated<AuditEvent>> {
  const query = `?page=${page}${event ? `&event=${event}` : ""}`;
  return httpRequest<Paginated<AuditEvent>>(`/api/v1/admin/audit/${query}`, {
    headers: authHeaders(token),
  });
}
