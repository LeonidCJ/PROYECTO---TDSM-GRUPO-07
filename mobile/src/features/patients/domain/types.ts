export type Gender = "male" | "female";

export type SmokingStatus = "never" | "former" | "current";

export type HematuriaType = "none" | "macroscopic" | "microscopic";

export type Patient = {
  id: string;
  patient_code: string;
  full_name: string;
  computed_age: number | null;
  gender: Gender;
  smoking_status: SmokingStatus;
  has_previous_bladder_cancer: boolean;
  hematuria_type: HematuriaType;
  occupational_exposure: boolean;
  next_followup_date: string | null;
  is_archived: boolean;
  created_at: string;
};

export type CreatePatientRequest = {
  patient_code: string;
  full_name: string;
  age?: number;
  gender: Gender;
  smoking_status: SmokingStatus;
  has_previous_bladder_cancer: boolean;
  hematuria_type: HematuriaType;
  occupational_exposure: boolean;
};

export type UpdatePatientRequest = Partial<
  Omit<CreatePatientRequest, "age"> & { age: number }
> & {
  next_followup_date?: string | null;
};
