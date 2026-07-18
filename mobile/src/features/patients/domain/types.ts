export type Gender = "male" | "female";

export type Patient = {
  id: string;
  patient_code: string;
  full_name: string;
  computed_age: number | null;
  gender: Gender;
  is_smoker: boolean;
  has_previous_bladder_cancer: boolean;
  has_hematuria: boolean;
  next_followup_date: string | null;
  is_archived: boolean;
  created_at: string;
};

export type UpdatePatientRequest = Partial<
  Omit<CreatePatientRequest, "age"> & { age: number }
> & {
  next_followup_date?: string | null;
};

export type CreatePatientRequest = {
  patient_code: string;
  full_name: string;
  age?: number;
  gender: Gender;
  is_smoker: boolean;
  has_previous_bladder_cancer: boolean;
  has_hematuria: boolean;
};
