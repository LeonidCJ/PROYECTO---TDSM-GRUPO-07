import { useCallback, useState } from "react";

import { patientsRepository } from "../data/patientsRepository";
import { CreatePatientRequest, Gender, Patient } from "../domain/types";

type FormState = {
  patientCode: string;
  fullName: string;
  age: number;
  gender: Gender;
  isSmoker: boolean;
  hasBladderCancer: boolean;
  hasHematuria: boolean;
};

const initialState: FormState = {
  patientCode: "",
  fullName: "",
  age: 0,
  gender: "male",
  isSmoker: false,
  hasBladderCancer: false,
  isImmunosuppressed: false,
};

export function usePatientForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = form.patientCode.trim().length > 0 && form.fullName.trim().length > 0;

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(async (): Promise<Patient | null> => {
    if (!canSubmit) return null;
    setIsLoading(true);
    setError(null);
    try {
      const payload: CreatePatientRequest = {
        patient_code: form.patientCode.trim(),
        full_name: form.fullName.trim(),
        age: form.age > 0 ? form.age : undefined,
        gender: form.gender,
        is_smoker: form.isSmoker,
        has_previous_bladder_cancer: form.hasBladderCancer,
        has_hematuria: form.hasHematuria,
      };
      const patient = await patientsRepository.create(payload);
      setForm(initialState);
      return patient;
    } catch (e: any) {
      setError(e?.message ?? "Error al guardar el paciente");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [form, canSubmit]);

  return { form, update, submit, canSubmit, isLoading, error };
}
