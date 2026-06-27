import { getAccessToken } from '@/src/core/storage/secureStorage';
import { IReportsRepository } from '../domain/IReportsRepository';
import { CreateReportRequest, Report } from '../domain/types';
import * as reportsApi from './reportsApi';

async function getToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('No autenticado');
  return token;
}

export const reportsRepository: IReportsRepository = {
  async create(data: CreateReportRequest): Promise<Report> {
    const token = await getToken();
    return reportsApi.createReport(token, data);
  },

  async getById(id: string): Promise<Report> {
    const token = await getToken();
    return reportsApi.getReport(token, id);
  },

  async list(): Promise<Report[]> {
    const token = await getToken();
    return reportsApi.listReports(token);
  },
};
