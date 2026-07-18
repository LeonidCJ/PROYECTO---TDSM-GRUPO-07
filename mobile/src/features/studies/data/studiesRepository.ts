import { getAccessToken } from '@/src/core/storage/secureStorage';
import { IStudiesRepository } from '../domain/IStudiesRepository';
import { CreateStudyRequest, EndoscopicImage, ImageSource, Study } from '../domain/types';
import * as studiesApi from './studiesApi';

async function getToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('No autenticado');
  return token;
}

export const studiesRepository: IStudiesRepository = {
  async create(data: CreateStudyRequest): Promise<Study> {
    const token = await getToken();
    return studiesApi.createStudy(token, data);
  },

  async getById(id: string): Promise<Study> {
    const token = await getToken();
    return studiesApi.getStudy(token, id);
  },

  async list(patientId?: string): Promise<Study[]> {
    const token = await getToken();
    return studiesApi.listStudies(token, patientId);
  },

  async updateNotes(id: string, notes: string): Promise<Study> {
    const token = await getToken();
    return studiesApi.updateStudy(token, id, { notes });
  },

  async uploadImage(studyId: string, imageUri: string, source?: ImageSource): Promise<EndoscopicImage> {
    const token = await getToken();
    return studiesApi.uploadImage(token, studyId, imageUri, source);
  },
};
