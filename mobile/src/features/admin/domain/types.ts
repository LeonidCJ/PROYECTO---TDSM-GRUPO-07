export type AdminRole = "admin" | "doctor";

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type AdminUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: AdminRole;
  specialty?: string;
  hospital?: string;
  phone?: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
};

export type AuditEventType = "login_ok" | "login_failed" | "logout";

export type AuditEvent = {
  id: string;
  event: AuditEventType;
  email: string;
  user: string | null;
  user_email: string | null;
  ip_address: string | null;
  user_agent: string;
  created_at: string;
};

export type Metrics = {
  users: {
    total: number;
    active: number;
    by_role: Record<string, number>;
  };
  patients: {
    total: number;
    active: number;
    archived: number;
  };
  studies: {
    total: number;
    by_status: Record<string, number>;
  };
  reports: number;
  recent_logins: AuditEvent[];
};

export type UserPatch = Partial<Pick<AdminUser, "role" | "is_active">>;
