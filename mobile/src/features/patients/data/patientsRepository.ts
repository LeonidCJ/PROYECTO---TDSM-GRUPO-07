import { getAccessToken } from "@/src/core/storage/secureStorage";
import { IPatientRepository } from "../domain/IPatientRepository";
import { CreatePatientRequest, Patient, UpdatePatientRequest } from "../domain/types";
import * as patientsApi from "./patientsApi";

async function getToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error("No autenticado");
  return token;
}

export const patientsRepository: IPatientRepository = {
  async list(search?: string): Promise<Patient[]> {
    const token = await getToken();
    return patientsApi.listPatients(token, search);
  },

  async create(data: CreatePatientRequest): Promise<Patient> {
    const token = await getToken();
    return patientsApi.createPatient(token, data);
  },

  async getById(id: string): Promise<Patient> {
    const token = await getToken();
    return patientsApi.getPatient(token, id);
  },

  async update(id: string, data: UpdatePatientRequest): Promise<Patient> {
    const token = await getToken();
    return patientsApi.updatePatient(token, id, data);
  },

  async archive(id: string): Promise<void> {
    const token = await getToken();
    await patientsApi.archivePatient(token, id);
  },
};
