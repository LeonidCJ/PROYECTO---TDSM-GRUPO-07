import { CreateStudyRequest, Study, UploadImageResponse } from '../domain/types';

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
  if (!res.ok) throw new Error('No se pudo crear el estudio');
  return res.json();
}

export async function getStudy(token: string, id: string): Promise<Study> {
  const res = await fetch(`${BASE}/studies/${id}/`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('No se pudo obtener el estudio');
  return res.json();
}

export async function listStudies(token: string): Promise<Study[]> {
  const res = await fetch(`${BASE}/studies/`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('No se pudo obtener los estudios');
  return res.json();
}

export async function uploadImage(
  token: string,
  studyId: string,
  imageUri: string,
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'endoscopy.jpg',
  } as any);

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
    throw new Error(body?.detail ?? 'Error al procesar la imagen');
  }
  return res.json();
}
