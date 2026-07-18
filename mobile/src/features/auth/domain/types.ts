export type LoginRequest = {
  email: string;
  password: string;
};

export type Specialty =
  | "urology"
  | "oncology"
  | "pathology"
  | "radiology"
  | "other";

export type RegisterRequest = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  specialty?: Specialty;
  hospital?: string;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type Role = "admin" | "doctor";

export type UserProfile = {
  // Backend uses a UUID primary key, so this is a string, not a number.
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  phone?: string;
  specialty?: Specialty;
  hospital?: string;
};
