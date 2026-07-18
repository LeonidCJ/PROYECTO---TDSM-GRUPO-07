import { CreatePatientRequest, Patient, UpdatePatientRequest } from "./types";

export interface IPatientRepository {
  list(search?: string): Promise<Patient[]>;
  create(data: CreatePatientRequest): Promise<Patient>;
  getById(id: string): Promise<Patient>;
  update(id: string, data: UpdatePatientRequest): Promise<Patient>;
  archive(id: string): Promise<void>;
}
