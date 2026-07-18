import {
  AdminUser,
  AuditEvent,
  AuditEventType,
  CreateAdminUser,
  Metrics,
  Paginated,
  UserPatch,
} from "./types";

export interface IAdminRepository {
  getMetrics(): Promise<Metrics>;
  listUsers(page?: number, search?: string): Promise<Paginated<AdminUser>>;
  createUser(data: CreateAdminUser): Promise<AdminUser>;
  updateUser(id: string, patch: UserPatch): Promise<AdminUser>;
  listAudit(page?: number, event?: AuditEventType): Promise<Paginated<AuditEvent>>;
}
