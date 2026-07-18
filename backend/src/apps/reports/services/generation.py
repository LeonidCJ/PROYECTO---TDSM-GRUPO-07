"""Generate a medical PDF report for a study and store it on Cloudinary."""
from __future__ import annotations

import logging
from io import BytesIO

import cloudinary
import cloudinary.uploader
import requests
from django.conf import settings
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

logger = logging.getLogger(__name__)


class ReportGenerationError(Exception):
    """Raised when the report PDF could not be generated or stored."""


# label -> (clinical name, is_cancer)
_LABEL_NAME = {
    "HGC": "Cáncer de alto grado (High Grade Cancer)",
    "LGC": "Cáncer de bajo grado (Low Grade Cancer)",
    "NTL": "Lesión no tumoral (Non-Tumor Lesion)",
    "NST": "Tejido normal (Normal Surrounding Tissue)",
}
_RISK_NAME = {"high": "Alto", "medium": "Medio", "low": "Bajo"}
_RISK_COLOR = {
    "high": colors.HexColor("#DC2626"),
    "medium": colors.HexColor("#D97706"),
    "low": colors.HexColor("#16A34A"),
}
_GENDER_NAME = {"male": "Masculino", "female": "Femenino", "other": "Otro"}


def build_and_store_report(report) -> None:
    """Generate the PDF, upload it to Cloudinary and update the report in place."""
    try:
        pdf_bytes = _generate_pdf_bytes(report)
        report.pdf_url = _store_pdf(report, pdf_bytes)
        report.status = report.Status.READY
        report.save(update_fields=["pdf_url", "status", "updated_at"])
    except Exception as exc:  # noqa: BLE001 - we want to capture any failure
        logger.exception("Report PDF generation failed for %s: %s", report.id, exc)
        report.status = report.Status.ERROR
        report.save(update_fields=["status", "updated_at"])
        raise ReportGenerationError(str(exc)) from exc


def _latest_inference(study):
    image = (
        study.endoscopic_images.select_related("inference_result")
        .order_by("-uploaded_at")
        .first()
    )
    if image is None:
        return None, None
    inference = getattr(image, "inference_result", None)
    return image, inference


def _store_pdf(report, pdf_bytes: bytes) -> str:
    cfg = settings.CLOUDINARY_STORAGE
    cloudinary.config(
        cloud_name=cfg["CLOUD_NAME"],
        api_key=cfg["API_KEY"],
        api_secret=cfg["API_SECRET"],
        secure=True,
    )
    result = cloudinary.uploader.upload(
        BytesIO(pdf_bytes),
        resource_type="raw",
        folder="reports",
        public_id=str(report.id),
        format="pdf",
        overwrite=True,
    )
    return result["secure_url"]


def _generate_pdf_bytes(report) -> bytes:
    study = report.study
    patient = study.patient
    doctor = report.generated_by
    image, inference = _latest_inference(study)

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        title=f"Informe {report.reference_code}",
    )

    base = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=base["Title"], fontSize=16, spaceAfter=2)
    sub = ParagraphStyle("sub", parent=base["Normal"], fontSize=9,
                         textColor=colors.HexColor("#6B7280"), alignment=TA_CENTER)
    section = ParagraphStyle("section", parent=base["Heading2"], fontSize=11,
                             textColor=colors.HexColor("#111827"), spaceBefore=10, spaceAfter=4)
    normal = base["Normal"]
    small = ParagraphStyle("small", parent=base["Normal"], fontSize=8,
                           textColor=colors.HexColor("#6B7280"))

    story = []

    # Header
    story.append(Paragraph(report.institution_name or "Informe médico", h1))
    story.append(Paragraph("Informe de análisis asistido por IA — Tejido vesical", sub))
    story.append(Spacer(1, 4 * mm))
    story.append(_meta_table([
        ("Código de informe", report.reference_code),
        ("Estudio", study.reference_code),
        ("Fecha", timezone.localtime(report.generated_at).strftime("%d/%m/%Y %H:%M")),
    ]))

    # Patient
    story.append(Paragraph("Datos del paciente", section))
    story.append(_kv_table([
        ("Nombre", patient.full_name),
        ("Código", patient.patient_code),
        ("Edad", f"{patient.age} años" if patient.birth_date else "—"),
        ("Sexo", _GENDER_NAME.get(patient.gender, patient.gender or "—")),
        ("Tabaquismo", patient.get_smoking_status_display()),
        ("Cáncer vesical previo", "Sí" if patient.has_previous_bladder_cancer else "No"),
        ("Hematuria", patient.get_hematuria_type_display()),
        ("Exposición ocupacional", "Sí" if patient.occupational_exposure else "No"),
    ]))

    # Result
    story.append(Paragraph("Resultado del análisis", section))
    if inference is not None:
        confidence = inference.confidence_breakdown.get(inference.primary_label, 0)
        risk_color = _RISK_COLOR.get(inference.risk_level, colors.black)
        result_style = ParagraphStyle("result", parent=normal, fontSize=13,
                                       textColor=risk_color, spaceAfter=4)
        story.append(Paragraph(
            f"<b>{_LABEL_NAME.get(inference.primary_label, inference.primary_label)}</b>",
            result_style,
        ))
        story.append(_kv_table([
            ("Clasificación", inference.primary_label),
            ("Nivel de riesgo", _RISK_NAME.get(inference.risk_level, inference.risk_level)),
            ("Indicio de malignidad", "Sí" if inference.is_malignant else "No"),
            ("Confianza del modelo", f"{round(confidence * 100)}%"),
            ("Modelo", f"{inference.model_name} v{inference.model_version}"),
        ]))
        if inference.recommended_action:
            story.append(Spacer(1, 2 * mm))
            story.append(Paragraph(f"<b>Recomendación:</b> {inference.recommended_action}", normal))
    else:
        story.append(Paragraph("Este estudio aún no cuenta con un resultado de análisis.", normal))

    # Image
    if report.include_images and image is not None and image.image:
        img_flowable = _fetch_image_flowable(image.image.url)
        if img_flowable is not None:
            story.append(Paragraph("Imagen endoscópica", section))
            story.append(img_flowable)

    # Physician + signature
    story.append(Paragraph("Médico responsable", section))
    story.append(_kv_table([
        ("Nombre", f"{doctor.first_name} {doctor.last_name}".strip() or doctor.email),
        ("Especialidad", doctor.get_specialty_display() if doctor.specialty else "—"),
        ("Institución", report.institution_name or "—"),
    ]))
    if report.physician_signature:
        story.append(Spacer(1, 14 * mm))
        story.append(Paragraph("_______________________________", normal))
        story.append(Paragraph("Firma del médico", small))

    # Disclaimer
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph(
        "Este informe es una herramienta de apoyo diagnóstico generada con "
        "inteligencia artificial y no reemplaza el juicio clínico del especialista.",
        small,
    ))

    doc.build(story)
    return buffer.getvalue()


def _meta_table(rows):
    data = [[Paragraph(f"<b>{k}</b>", _cell_style()), Paragraph(str(v), _cell_style())] for k, v in rows]
    t = Table(data, colWidths=[45 * mm, None])
    t.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    return t


def _kv_table(rows):
    data = [[Paragraph(f"<b>{k}</b>", _cell_style()), Paragraph(str(v), _cell_style())] for k, v in rows]
    t = Table(data, colWidths=[55 * mm, None])
    t.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LINEBELOW", (0, 0), (-1, -1), 0.25, colors.HexColor("#E5E7EB")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def _cell_style():
    return ParagraphStyle("cell", fontSize=9, leading=12)


def _fetch_image_flowable(url: str):
    try:
        resp = requests.get(url, timeout=20)
        resp.raise_for_status()
        img = Image(BytesIO(resp.content))
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not embed report image: %s", exc)
        return None
    # Scale to a max width keeping aspect ratio.
    max_w = 90 * mm
    if img.imageWidth and img.imageHeight:
        ratio = img.imageHeight / img.imageWidth
        img.drawWidth = max_w
        img.drawHeight = max_w * ratio
    return img
