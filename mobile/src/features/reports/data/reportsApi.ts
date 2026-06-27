import { CreateReportRequest, Report } from '../domain/types';

const BASE = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function createReport(token: string, data: CreateReportRequest): Promise<Report> {
  const res = await fetch(`${BASE}/reports/`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = typeof body?.detail === 'string' ? body.detail : null;
    throw new Error(detail ?? 'No se pudo generar el informe');
  }
  return res.json();
}

export async function getReport(token: string, id: string): Promise<Report> {
  const res = await fetch(`${BASE}/reports/${id}/`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('No se pudo obtener el informe');
  return res.json();
}

export async function listReports(token: string): Promise<Report[]> {
  const res = await fetch(`${BASE}/reports/`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('No se pudo obtener los informes');
  return res.json();
}
