import { useCallback, useEffect, useState } from "react";

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
  hasHematuria: false,
};

export function usePatientForm(patientId?: string) {
  const isEdit = Boolean(patientId);
  const [form, setForm] = useState<FormState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrefilling, setIsPrefilling] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  // Edit mode: load the patient and prefill the form.
  useEffect(() => {
    if (!patientId) return;
    let active = true;
    (async () => {
      setIsPrefilling(true);
      try {
        const p = await patientsRepository.getById(patientId);
        if (!active) return;
        setForm({
          patientCode: p.patient_code,
          fullName: p.full_name,
          age: p.computed_age ?? 0,
          gender: p.gender,
          isSmoker: p.is_smoker,
          hasBladderCancer: p.has_previous_bladder_cancer,
          hasHematuria: p.has_hematuria,
        });
      } catch (e: any) {
        if (active) setError(e?.message ?? "No se pudo cargar el paciente");
      } finally {
        if (active) setIsPrefilling(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [patientId]);

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
      const patient = isEdit
        ? await patientsRepository.update(patientId!, payload)
        : await patientsRepository.create(payload);
      if (!isEdit) setForm(initialState);
      return patient;
    } catch (e: any) {
      setError(e?.message ?? "Error al guardar el paciente");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [form, canSubmit, isEdit, patientId]);

  return { form, update, submit, canSubmit, isLoading, isPrefilling, error, isEdit };
}
