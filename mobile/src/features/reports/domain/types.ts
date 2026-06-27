import { PrimaryLabel, RiskLevel } from '../../studies/domain/types';

export type ReportStatus = 'generating' | 'ready' | 'error';

export type ReportResultSummary = {
  primary_label?: PrimaryLabel;
  risk_level?: RiskLevel;
  is_malignant?: boolean;
  confidence?: number | null;
  recommended_action?: string;
  image_url?: string | null;
};

export type Report = {
  id: string;
  study: string;
  study_reference: string;
  patient_name: string;
  reference_code: string;
  institution_name: string;
  department?: string;
  include_images: boolean;
  send_to_ehr: boolean;
  physician_signature: boolean;
  pdf_url: string;
  status: ReportStatus;
  result_summary: ReportResultSummary | null;
  generated_at: string;
  updated_at: string;
};

export type CreateReportRequest = {
  study: string;
  institution_name?: string;
  include_images?: boolean;
  physician_signature?: boolean;
};
