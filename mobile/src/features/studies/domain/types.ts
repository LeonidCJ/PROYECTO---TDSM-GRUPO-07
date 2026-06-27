export type StudyStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/** Las 4 categorías clínicas que devuelve el modelo. */
export type PrimaryLabel = 'HGC' | 'LGC' | 'NTL' | 'NST';

export type RiskLevel = 'high' | 'medium' | 'low';

export type InferenceResult = {
  id: string;
  model_name: string;
  model_version: string;
  primary_label: PrimaryLabel;
  risk_level: RiskLevel;
  is_malignant: boolean;
  /** Confianza por clase, p. ej. { "HGC": 0.91 }. */
  confidence_breakdown: Record<string, number>;
  analyzed_parameters: Record<string, unknown>;
  cellular_density?: string;
  nuclear_atypia?: string;
  mitotic_rate?: string;
  findings_overview?: string;
  recommended_action?: string;
  mask_url?: string;
  processing_time_ms: number;
  created_at: string;
};

export type ImageSource = 'camera' | 'gallery';

export type EndoscopicImage = {
  id: string;
  image_url: string | null;
  original_filename?: string;
  source?: ImageSource;
  uploaded_at: string;
  inference_result: InferenceResult | null;
};

export type Study = {
  id: string;
  patient: string;
  patient_name?: string;
  reference_code: string;
  status: StudyStatus;
  study_date: string;
  notes?: string;
  endoscopic_images?: EndoscopicImage[];
  inference_result?: InferenceResult | null;
};

export type CreateStudyRequest = {
  patient: string;
  notes?: string;
};
