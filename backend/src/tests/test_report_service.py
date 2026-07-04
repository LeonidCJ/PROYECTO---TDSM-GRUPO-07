"""Unit test for the report generation service (PU-09)."""
import pytest

import apps.reports.services.generation as gen
from apps.reports.models import Report


@pytest.mark.django_db
def test_build_and_store_report_sets_ready(study_with_inference, monkeypatch):
    # No subimos a Cloudinary real: mockeamos el almacenamiento del PDF.
    monkeypatch.setattr(gen, "_store_pdf", lambda report, pdf: "https://res.cloudinary.com/reports/x.pdf")

    report = Report.objects.create(
        study=study_with_inference,
        generated_by=study_with_inference.doctor,
        reference_code=f"INF-{study_with_inference.reference_code}",
        institution_name="Hospital Central",
        include_images=False,  # evita descargar la imagen para embeberla
    )

    gen.build_and_store_report(report)

    report.refresh_from_db()
    assert report.status == Report.Status.READY
    assert report.pdf_url.endswith(".pdf")


@pytest.mark.django_db
def test_build_and_store_report_marks_error_on_failure(study_with_inference, monkeypatch):
    # Si la generación del PDF lanza, el informe queda en estado error.
    def boom(report):
        raise RuntimeError("fallo al construir el PDF")

    monkeypatch.setattr(gen, "_generate_pdf_bytes", boom)

    report = Report.objects.create(
        study=study_with_inference,
        generated_by=study_with_inference.doctor,
        reference_code=f"INF-{study_with_inference.reference_code}",
        institution_name="Hospital Central",
        include_images=False,
    )

    with pytest.raises(gen.ReportGenerationError):
        gen.build_and_store_report(report)

    report.refresh_from_db()
    assert report.status == Report.Status.ERROR
