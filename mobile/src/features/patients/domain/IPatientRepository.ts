import { CreatePatientRequest, Patient } from "./types";

export interface IPatientRepository {
  list(): Promise<Patient[]>;
  create(data: CreatePatientRequest): Promise<Patient>;
  getById(id: string): Promise<Patient>;
}
