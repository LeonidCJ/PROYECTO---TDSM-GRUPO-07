import { CreateStudyRequest, EndoscopicImage, ImageSource, Study } from './types';

export interface IStudiesRepository {
  create(data: CreateStudyRequest): Promise<Study>;
  getById(id: string): Promise<Study>;
  list(patientId?: string): Promise<Study[]>;
  updateNotes(id: string, notes: string): Promise<Study>;
  uploadImage(studyId: string, imageUri: string, source?: ImageSource): Promise<EndoscopicImage>;
}
