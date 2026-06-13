import { httpRequest } from "@/src/core/api/httpClient";
import { CreatePatientRequest, Patient } from "../domain/types";

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function listPatients(token: string) {
  return httpRequest<Patient[]>("/api/v1/patients/", {
    method: "GET",
    headers: authHeader(token),
  });
}

export function createPatient(token: string, data: CreatePatientRequest) {
  return httpRequest<Patient>("/api/v1/patients/", {
    method: "POST",
    body: data,
    headers: authHeader(token),
  });
}

export function getPatient(token: string, id: string) {
  return httpRequest<Patient>(`/api/v1/patients/${id}/`, {
    method: "GET",
    headers: authHeader(token),
  });
}
