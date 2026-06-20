import { LoginRequest, RegisterRequest, UserProfile } from "./types";

export interface IAuthRepository {
  login(request: LoginRequest): Promise<UserProfile>;
  register(request: RegisterRequest): Promise<UserProfile>;
  logout(): Promise<void>;
  getMe(): Promise<UserProfile>;
}
