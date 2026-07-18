import { httpRequest } from "@/src/core/api/httpClient";
import { CreatePatientRequest, Patient, UpdatePatientRequest } from "../domain/types";

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function listPatients(token: string, search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return httpRequest<Patient[]>(`/api/v1/patients/${query}`, {
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

export function updatePatient(token: string, id: string, data: UpdatePatientRequest) {
  return httpRequest<Patient>(`/api/v1/patients/${id}/`, {
    method: "PATCH",
    body: data,
    headers: authHeader(token),
  });
}

/** Soft-delete on the backend (archives the clinical record). */
export function archivePatient(token: string, id: string) {
  return httpRequest<void>(`/api/v1/patients/${id}/`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}
