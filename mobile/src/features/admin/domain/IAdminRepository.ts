import {
  AdminUser,
  AuditEvent,
  AuditEventType,
  Metrics,
  Paginated,
  UserPatch,
} from "./types";

export interface IAdminRepository {
  getMetrics(): Promise<Metrics>;
  listUsers(page?: number): Promise<Paginated<AdminUser>>;
  updateUser(id: string, patch: UserPatch): Promise<AdminUser>;
  listAudit(page?: number, event?: AuditEventType): Promise<Paginated<AuditEvent>>;
}
