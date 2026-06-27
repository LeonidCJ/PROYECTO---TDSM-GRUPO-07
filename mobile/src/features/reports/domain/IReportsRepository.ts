import { CreateReportRequest, Report } from './types';

export interface IReportsRepository {
  create(data: CreateReportRequest): Promise<Report>;
  getById(id: string): Promise<Report>;
  list(): Promise<Report[]>;
}
