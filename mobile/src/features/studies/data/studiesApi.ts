import { CreateStudyRequest, EndoscopicImage, ImageSource, Study } from '../domain/types';

const BASE = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function createStudy(token: string, data: CreateStudyRequest): Promise<Study> {
  const res = await fetch(`${BASE}/studies/`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(body) || 'No se pudo crear el estudio');
  }
  return res.json();
}

export async function getStudy(token: string, id: string): Promise<Study> {
  const res = await fetch(`${BASE}/studies/${id}/`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('No se pudo obtener el estudio');
  return res.json();
}

export async function listStudies(token: string, patientId?: string): Promise<Study[]> {
  const query = patientId ? `?patient=${encodeURIComponent(patientId)}` : '';
  const res = await fetch(`${BASE}/studies/${query}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('No se pudo obtener los estudios');
  return res.json();
}

export async function updateStudy(token: string, id: string, data: { notes?: string }): Promise<Study> {
  const res = await fetch(`${BASE}/studies/${id}/`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('No se pudo actualizar el estudio');
  return res.json();
}

export async function uploadImage(
  token: string,
  studyId: string,
  imageUri: string,
  source?: ImageSource,
): Promise<EndoscopicImage> {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'endoscopy.jpg',
  } as any);
  if (source) formData.append('source', source);

  const res = await fetch(`${BASE}/studies/${studyId}/images/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  });

  if (res.status === 503) {
    throw new Error('MODEL_UNAVAILABLE');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = typeof body?.detail === 'string' ? body.detail : null;
    throw new Error(detail ?? 'Error al procesar la imagen');
  }
  return res.json();
}
