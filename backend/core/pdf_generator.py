"""
PDF Report Generator for Legal Metrology Compliance Certificates.
Generates official Government of India styled inspection reports in PDF format.
Uses reportlab for high-fidelity, print-ready A4 PDF output.
"""

import io
import base64
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image as RLImage, HRFlowable, KeepTogether
)
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics import renderPDF


# --- Color Palette ---
PRIMARY_DARK = HexColor("#0F172A")
PRIMARY_BLUE = HexColor("#1E3A8A")
ACCENT_INDIGO = HexColor("#4F46E5")
SUCCESS_GREEN = HexColor("#10B981")
DANGER_RED = HexColor("#EF4444")
WARNING_AMBER = HexColor("#F59E0B")
GRAY_100 = HexColor("#F1F5F9")
GRAY_200 = HexColor("#E2E8F0")
GRAY_500 = HexColor("#64748B")
GRAY_700 = HexColor("#334155")
GRAY_900 = HexColor("#0F172A")


def _build_styles():
    """Create custom paragraph styles for the PDF."""
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name='GovHeader',
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=PRIMARY_DARK,
        alignment=TA_CENTER,
        spaceAfter=2 * mm,
        leading=18,
    ))
    styles.add(ParagraphStyle(
        name='GovSubHeader',
        fontName='Helvetica',
        fontSize=9,
        textColor=GRAY_500,
        alignment=TA_CENTER,
        spaceAfter=1 * mm,
        leading=12,
    ))
    styles.add(ParagraphStyle(
        name='ReportTitle',
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=PRIMARY_BLUE,
        alignment=TA_CENTER,
        spaceAfter=3 * mm,
        leading=16,
    ))
    styles.add(ParagraphStyle(
        name='SectionHead',
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=PRIMARY_BLUE,
        spaceBefore=6 * mm,
        spaceAfter=3 * mm,
        leading=14,
        borderWidth=0,
        borderColor=PRIMARY_BLUE,
        borderPadding=(0, 0, 2, 0),
    ))
    styles.add(ParagraphStyle(
        name='BodyText2',
        fontName='Helvetica',
        fontSize=9,
        textColor=GRAY_700,
        leading=13,
        spaceAfter=2 * mm,
    ))
    styles.add(ParagraphStyle(
        name='SmallMono',
        fontName='Courier',
        fontSize=7,
        textColor=GRAY_500,
        leading=10,
    ))
    styles.add(ParagraphStyle(
        name='TableCell',
        fontName='Helvetica',
        fontSize=8,
        textColor=GRAY_900,
        leading=11,
    ))
    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8,
        textColor=white,
        leading=11,
    ))

    return styles


def _make_qr_code(data: str, size: float = 30 * mm) -> Drawing:
    """Generate a QR code drawing for embedding in the PDF."""
    qr = QrCodeWidget(data)
    qr.barWidth = size
    qr.barHeight = size
    d = Drawing(size, size)
    d.add(qr)
    return d


def generate_compliance_pdf(
    inspection_data: Dict[str, Any],
    scan_result: Dict[str, Any],
    officer_email: str = "officer@lmd.gov.in",
) -> bytes:
    """
    Generate a complete Legal Metrology Compliance Certificate PDF.

    Args:
        inspection_data: Dictionary with inspection metadata (id, date, etc.)
        scan_result: The full scan result with declarations, compliance_results, etc.
        officer_email: Email of the inspecting officer.

    Returns:
        PDF file content as bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        title=f"Legal Metrology Compliance Certificate - {inspection_data.get('id', 'REPORT')}",
        author="Legal Metrology AI Platform - Government of India",
    )

    styles = _build_styles()
    story = []

    # ====================================================================
    # 1. GOVERNMENT HEADER
    # ====================================================================
    story.append(Paragraph("GOVERNMENT OF INDIA", styles['GovHeader']))
    story.append(Paragraph(
        "Ministry of Consumer Affairs, Food & Public Distribution",
        styles['GovSubHeader']
    ))
    story.append(Paragraph(
        "Department of Consumer Affairs (Legal Metrology Division)",
        styles['GovSubHeader']
    ))
    story.append(Spacer(1, 2 * mm))
    story.append(HRFlowable(
        width="100%", thickness=1.5, color=PRIMARY_DARK,
        spaceBefore=1 * mm, spaceAfter=3 * mm
    ))
    story.append(Paragraph(
        "OFFICIAL STATUTORY COMPLIANCE CERTIFICATE",
        styles['ReportTitle']
    ))
    story.append(Paragraph(
        "Issued under Section 15 & 36 of The Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011",
        styles['GovSubHeader']
    ))
    story.append(Spacer(1, 4 * mm))

    # ====================================================================
    # 2. INSPECTION & PRODUCT META INFO (with QR Code)
    # ====================================================================
    inspection_id = inspection_data.get("id", "INS-UNKNOWN")
    report_id = inspection_data.get("report_id", f"REP-{uuid.uuid4().hex[:8].upper()}")
    scan_date = scan_result.get("scan_date", datetime.utcnow().isoformat())
    product_name = scan_result.get("product_name", "Packaged Commodity")
    brand = scan_result.get("brand", "N/A")
    category = scan_result.get("category", "General FMCG")
    overall_score = scan_result.get("overall_score", 0)
    overall_status = scan_result.get("overall_status", "warning")

    officer_name = officer_email.split("@")[0].replace(".", " ").title()

    # QR Code for verification
    clean_id = str(inspection_id).replace("SCN-", "INS-")
    if not clean_id.startswith("INS-"):
        clean_id = f"INS-{clean_id.replace('REP-', '')}"
    verify_url = f"http://localhost:8000/api/inspections/{clean_id}/verify"
    qr_drawing = _make_qr_code(verify_url, size=28 * mm)

    # Build a meta info table
    meta_data = [
        [
            Paragraph(f"<b>Inspection ID:</b> {inspection_id}", styles['BodyText2']),
            Paragraph(f"<b>Report ID:</b> {report_id}", styles['BodyText2']),
        ],
        [
            Paragraph(f"<b>Inspection Date:</b> {str(scan_date)[:19]}", styles['BodyText2']),
            Paragraph(f"<b>Officer:</b> {officer_name}", styles['BodyText2']),
        ],
        [
            Paragraph(f"<b>Commodity:</b> {product_name}", styles['BodyText2']),
            Paragraph(f"<b>Manufacturer:</b> {brand}", styles['BodyText2']),
        ],
        [
            Paragraph(f"<b>Category:</b> {category}", styles['BodyText2']),
            Paragraph(f"<b>Governing Law:</b> LM Act 2009 & PC Rules 2011", styles['BodyText2']),
        ],
    ]

    meta_table = Table(meta_data, colWidths=[85 * mm, 85 * mm])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GRAY_100),
        ('BOX', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('INNERGRID', (0, 0), (-1, -1), 0.3, GRAY_200),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 4 * mm))

    # ====================================================================
    # 3. COMPLIANCE VERDICT BANNER
    # ====================================================================
    status_label = "COMPLIANT" if overall_status == "compliant" else (
        "NON-COMPLIANT" if overall_status == "non_compliant" else "REVIEW ADVISED"
    )
    status_color = SUCCESS_GREEN if overall_status == "compliant" else (
        DANGER_RED if overall_status == "non_compliant" else WARNING_AMBER
    )

    verdict_data = [[
        Paragraph(
            f"<b>COMPLIANCE VERDICT: {status_label} (Score: {overall_score}%)</b>",
            ParagraphStyle(
                'VerdictBanner',
                fontName='Helvetica-Bold',
                fontSize=11,
                textColor=white,
                alignment=TA_CENTER,
                leading=15,
            )
        )
    ]]
    verdict_table = Table(verdict_data, colWidths=[170 * mm])
    verdict_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), status_color),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(verdict_table)
    story.append(Spacer(1, 5 * mm))

    # ====================================================================
    # 4. EXTRACTED DECLARATIONS TABLE
    # ====================================================================
    story.append(Paragraph("1. Statutory Declarations Audit (Rule 6)", styles['SectionHead']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=PRIMARY_BLUE, spaceAfter=3 * mm))

    declarations = scan_result.get("declarations", [])

    # Field name to human label mapping
    field_labels = {
        'product_name': 'Product / Commodity Name',
        'net_quantity': 'Net Quantity & Metric Units',
        'mrp': 'Maximum Retail Price (MRP)',
        'mrp_tax_text': 'Tax Inclusivity Text',
        'manufacturer_name': 'Manufacturer / Packer Name',
        'manufacturer_address': 'Manufacturer Postal Address',
        'manufacture_date': 'Month & Year of Mfg/Packing',
        'consumer_care': 'Consumer Care Contact',
        'country_of_origin': 'Country of Origin',
        'is_food': 'Commodity Category',
        'fssai_number': 'FSSAI License Number',
        'batch_number': 'Batch / Lot Number',
        'unit_sale_price': 'Unit Sale Price (USP)',
    }

    decl_header = [
        Paragraph("<b>Declaration Type</b>", styles['TableHeader']),
        Paragraph("<b>Extracted Value</b>", styles['TableHeader']),
        Paragraph("<b>Status</b>", styles['TableHeader']),
        Paragraph("<b>Confidence</b>", styles['TableHeader']),
    ]
    decl_rows = [decl_header]

    for d in declarations:
        fname = d.get("field_name", "")
        label = field_labels.get(fname, fname.replace("_", " ").title())
        value = d.get("value") or "Not Found"
        found = d.get("found", False)
        conf = d.get("confidence", 0)

        status_text = "✓ Found" if found else "✗ Missing"
        status_color_text = "#10B981" if found else "#EF4444"
        conf_pct = f"{int(conf * 100)}%"

        decl_rows.append([
            Paragraph(label, styles['TableCell']),
            Paragraph(str(value), styles['TableCell']),
            Paragraph(f'<font color="{status_color_text}">{status_text}</font>', styles['TableCell']),
            Paragraph(conf_pct, styles['TableCell']),
        ])

    if len(decl_rows) == 1:
        decl_rows.append([
            Paragraph("No declarations extracted", styles['TableCell']),
            Paragraph("-", styles['TableCell']),
            Paragraph("-", styles['TableCell']),
            Paragraph("-", styles['TableCell']),
        ])

    decl_table = Table(decl_rows, colWidths=[50 * mm, 60 * mm, 28 * mm, 28 * mm])
    decl_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (2, 0), (3, -1), 'CENTER'),
        ('BOX', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('INNERGRID', (0, 0), (-1, -1), 0.3, GRAY_200),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, GRAY_100]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
    ]))
    story.append(decl_table)
    story.append(Spacer(1, 5 * mm))

    # ====================================================================
    # 5. COMPLIANCE RULE EVALUATION RESULTS
    # ====================================================================
    story.append(Paragraph("2. Legal Metrology Rule Evaluation Results", styles['SectionHead']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=PRIMARY_BLUE, spaceAfter=3 * mm))

    compliance_results = scan_result.get("compliance_results", [])

    rule_header = [
        Paragraph("<b>Rule</b>", styles['TableHeader']),
        Paragraph("<b>Description</b>", styles['TableHeader']),
        Paragraph("<b>Status</b>", styles['TableHeader']),
        Paragraph("<b>Severity</b>", styles['TableHeader']),
        Paragraph("<b>Finding</b>", styles['TableHeader']),
    ]
    rule_rows = [rule_header]

    violations_list = []
    for cr in compliance_results:
        rule_ref = cr.get("rule_reference", cr.get("rule_id", ""))
        name = cr.get("name", "")
        status = cr.get("status", "pass")
        severity = cr.get("severity", "minor")
        message = cr.get("message", "")

        if status == "pass":
            status_text = '<font color="#10B981">PASS</font>'
        elif status == "fail":
            status_text = '<font color="#EF4444">FAIL</font>'
            violations_list.append(cr)
        elif status == "not_applicable":
            status_text = '<font color="#64748B">N/A</font>'
        else:
            status_text = '<font color="#F59E0B">WARN</font>'

        sev_color = "#EF4444" if severity == "critical" else ("#F59E0B" if severity == "major" else "#3B82F6")

        rule_rows.append([
            Paragraph(str(rule_ref), styles['TableCell']),
            Paragraph(str(name)[:50], styles['TableCell']),
            Paragraph(status_text, styles['TableCell']),
            Paragraph(f'<font color="{sev_color}">{str(severity).upper()}</font>', styles['TableCell']),
            Paragraph(str(message)[:80], styles['TableCell']),
        ])

    if len(rule_rows) == 1:
        rule_rows.append([
            Paragraph("-", styles['TableCell']),
            Paragraph("No rules evaluated", styles['TableCell']),
            Paragraph("-", styles['TableCell']),
            Paragraph("-", styles['TableCell']),
            Paragraph("-", styles['TableCell']),
        ])

    rule_table = Table(rule_rows, colWidths=[28 * mm, 38 * mm, 22 * mm, 22 * mm, 56 * mm])
    rule_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (2, 0), (3, -1), 'CENTER'),
        ('BOX', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('INNERGRID', (0, 0), (-1, -1), 0.3, GRAY_200),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, GRAY_100]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
    ]))
    story.append(rule_table)
    story.append(Spacer(1, 5 * mm))

    # ====================================================================
    # 6. VIOLATIONS SUMMARY (if any)
    # ====================================================================
    if violations_list:
        story.append(Paragraph("3. Violations & Non-Compliance Notice", styles['SectionHead']))
        story.append(HRFlowable(width="100%", thickness=0.5, color=DANGER_RED, spaceAfter=3 * mm))

        for v in violations_list:
            story.append(Paragraph(
                f"<b>⚠ {v.get('rule_reference', v.get('rule_id', ''))} - {v.get('name', '')}:</b> "
                f"{v.get('message', '')}",
                styles['BodyText2']
            ))
            if v.get("suggestion"):
                story.append(Paragraph(
                    f"<i>Recommendation: {v['suggestion']}</i>",
                    ParagraphStyle('Suggestion', parent=styles['BodyText2'], textColor=GRAY_500, fontSize=8)
                ))
            story.append(Spacer(1, 2 * mm))

    # ====================================================================
    # 7. ENFORCEMENT & PENAL PROVISIONS
    # ====================================================================
    story.append(Paragraph("4. Enforcement & Penal Provisions", styles['SectionHead']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=PRIMARY_BLUE, spaceAfter=3 * mm))

    penal_text = (
        "Section 36 of The Legal Metrology Act, 2009 — "
        "Fine up to ₹25,000 for first offence, ₹50,000 for second, "
        "and up to ₹1,00,000 or imprisonment for subsequent offence."
    )
    story.append(Paragraph(
        f"<b>Applicable Penal Statute:</b> {penal_text}",
        styles['BodyText2']
    ))
    story.append(Spacer(1, 5 * mm))

    # ====================================================================
    # 8. DIGITAL INTEGRITY & QR VERIFICATION
    # ====================================================================
    story.append(Paragraph("5. Digital Integrity & Verification", styles['SectionHead']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=PRIMARY_BLUE, spaceAfter=3 * mm))

    evidence = scan_result.get("evidence") or {}
    sha_hash = evidence.get("sha256_hash", "NOT_AVAILABLE")

    # Create a mini table with QR + hash info
    integrity_data = [[
        qr_drawing,
        Paragraph(
            f"<b>Digital Seal Algorithm:</b> SHA-256<br/>"
            f"<b>Fingerprint:</b> <font face='Courier' size='7'>{sha_hash[:48]}...</font><br/>"
            f"<b>Admissibility:</b> Valid under Indian Evidence Act / BNSS<br/>"
            f"<b>Verification URL:</b> <font face='Courier' size='7'>{verify_url}</font><br/>"
            f"<b>Generated:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
            styles['BodyText2']
        )
    ]]
    integrity_table = Table(integrity_data, colWidths=[35 * mm, 132 * mm])
    integrity_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GRAY_100),
        ('BOX', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(integrity_table)
    story.append(Spacer(1, 12 * mm))

    # ====================================================================
    # 9. OFFICER SIGNATURE BLOCK
    # ====================================================================
    sig_data = [[
        Paragraph(
            "<font size='8' color='#64748B'>Digitally Sealed via AI Legal Metrology Platform</font>",
            styles['BodyText2']
        ),
        Paragraph(
            "<br/><br/>"
            "___________________________<br/>"
            "<b>Legal Metrology Officer</b><br/>"
            "<font size='7' color='#64748B'>Authorized Signature & Seal</font>",
            ParagraphStyle('SigBlock', parent=styles['BodyText2'], alignment=TA_RIGHT)
        ),
    ]]
    sig_table = Table(sig_data, colWidths=[85 * mm, 85 * mm])
    sig_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
        ('LINEABOVE', (0, 0), (-1, 0), 0.5, GRAY_500),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(sig_table)

    # Build PDF
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    return pdf_bytes
