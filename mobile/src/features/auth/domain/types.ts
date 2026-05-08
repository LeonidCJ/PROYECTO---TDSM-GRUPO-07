export type LoginRequest = {
  email: string;
  password: string;
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
};
