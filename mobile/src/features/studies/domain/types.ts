export type StudyStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type InferenceLabel = 'cancer' | 'normal';

export type InferenceResult = {
  has_cancer: boolean;
  confidence: number;
  label: InferenceLabel;
};

export type Study = {
  id: string;
  patient: string;
  patient_name?: string;
  reference_code: string;
  status: StudyStatus;
  study_date: string;
  notes?: string;
  inference_result?: InferenceResult;
};

export type CreateStudyRequest = {
  patient: string;
  notes?: string;
};

export type UploadImageResponse = {
  study_id: string;
  image_id: string;
  inference_result?: InferenceResult;
};
