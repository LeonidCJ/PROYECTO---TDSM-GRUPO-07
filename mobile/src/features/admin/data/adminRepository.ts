import { getAccessToken } from "@/src/core/storage/secureStorage";
import { IAdminRepository } from "../domain/IAdminRepository";
import { AuditEventType, UserPatch } from "../domain/types";
import * as adminApi from "./adminApi";

async function getToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error("No autenticado");
  return token;
}

export const adminRepository: IAdminRepository = {
  async getMetrics() {
    return adminApi.getMetrics(await getToken());
  },

  async listUsers(page = 1) {
    return adminApi.listUsers(await getToken(), page);
  },

  async updateUser(id: string, patch: UserPatch) {
    return adminApi.updateUser(await getToken(), id, patch);
  },

  async listAudit(page = 1, event?: AuditEventType) {
    return adminApi.listAudit(await getToken(), page, event);
  },
};
