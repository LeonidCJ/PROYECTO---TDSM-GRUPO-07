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

export type UserProfile = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  specialty?: Specialty;
  hospital?: string;
};
