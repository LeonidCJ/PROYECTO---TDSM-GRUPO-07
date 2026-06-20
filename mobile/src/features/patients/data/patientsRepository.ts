import { getAccessToken } from "@/src/core/storage/secureStorage";
import { IPatientRepository } from "../domain/IPatientRepository";
import { CreatePatientRequest, Patient } from "../domain/types";
import * as patientsApi from "./patientsApi";

async function getToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error("No autenticado");
  return token;
}

export const patientsRepository: IPatientRepository = {
  async list(): Promise<Patient[]> {
    const token = await getToken();
    return patientsApi.listPatients(token);
  },

  async create(data: CreatePatientRequest): Promise<Patient> {
    const token = await getToken();
    return patientsApi.createPatient(token, data);
  },

  async getById(id: string): Promise<Patient> {
    const token = await getToken();
    return patientsApi.getPatient(token, id);
  },
};
