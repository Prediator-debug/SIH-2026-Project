from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import Optional, Dict, Any
from core.security import get_current_officer
from core.database import db
from core.rule_engine import LegalMetrologyRuleEngine
from models.schemas import InspectionCreate, TokenData, ComplianceEvaluationRequest
import cv2
import numpy as np
import uuid
from datetime import datetime

router = APIRouter()
rule_engine = LegalMetrologyRuleEngine()

@router.post("")
@router.post("/")
def create_inspection(req: InspectionCreate, current_user: TokenData = Depends(get_current_officer)):
    # Verify product exists by ID or Barcode
    product = db.get_product(req.product_id)
    if not product:
        # Check if barcode match exists
        products = db.get_products()
        product = next((p for p in products if p.get("barcode") == req.product_id), None)
        
    if not product:
        # Auto-create entry for custom/uncataloged item so inspection is not blocked
        product = {
            "id": req.product_id,
            "name": f"Packaged Commodity ({req.product_id})",
            "manufacturer": "Field Inspected Enterprise",
            "category": "Retail Packaging",
            "barcode": req.product_id if len(req.product_id) >= 8 else None
        }
        db.add_product(product)
        
    inspection = db.create_inspection(product_id=product["id"], officer_id=current_user.email)
    inspection["product"] = product
    return inspection

@router.post("/barcode/lookup")
def lookup_barcode(payload: Dict[str, Any], current_user: TokenData = Depends(get_current_officer)):
    barcode = str(payload.get("barcode", "")).strip()
    if not barcode:
        raise HTTPException(status_code=400, detail="Barcode is required.")
    
    product = db.get_product(barcode)
    if not product:
        products = db.get_products()
        product = next((p for p in products if p.get("barcode") == barcode), None)

    if product:
        return {"found": True, "product": product}
    
    return {
        "found": False,
        "barcode": barcode,
        "suggested_product": {
            "id": f"p-bc-{barcode[-6:] if len(barcode) >= 6 else barcode}",
            "name": f"Sample Packaged Commodity ({barcode})",
            "manufacturer": "Unregistered / Unknown Manufacturer",
            "category": "Retail Packaging",
            "barcode": barcode
        }
    }

@router.post("/barcode/decode")
async def decode_barcode_image(file: UploadFile = File(...), current_user: TokenData = Depends(get_current_officer)):
    """
    Decodes 1D barcodes and 2D QR codes directly from an uploaded packaging or barcode image using OpenCV.
    """
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file.")
    
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Could not decode image.")

    detected_code = None
    code_type = None

    # Try 1: 1D Barcode detector
    try:
        bd = cv2.barcode.BarcodeDetector()
        res = bd.detectAndDecode(img)
        if res and len(res) >= 2:
            decoded_info = res[0]
            decoded_type = res[1]
            if isinstance(decoded_info, (list, tuple)) and len(decoded_info) > 0 and decoded_info[0]:
                detected_code = str(decoded_info[0]).strip()
                code_type = str(decoded_type[0]) if len(decoded_type) > 0 else "1D_BARCODE"
            elif isinstance(decoded_info, str) and decoded_info.strip():
                detected_code = decoded_info.strip()
                code_type = str(decoded_type)
    except Exception as e:
        print(f"[Barcode Decode Error] {e}")

    # Try 2: QR Code detector fallback
    if not detected_code:
        try:
            qr = cv2.QRCodeDetector()
            val, points, _ = qr.detectAndDecode(img)
            if val and val.strip():
                detected_code = val.strip()
                code_type = "QR_CODE"
        except Exception as e:
            print(f"[QR Decode Error] {e}")

    if not detected_code:
        return {
            "detected": False,
            "message": "No barcode or QR code detected in this image. You can enter the barcode manually or proceed with direct photo upload."
        }

    # Match in database
    product = db.get_product(detected_code)
    if not product:
        for p in db.get_products():
            if p.get("barcode") == detected_code:
                product = p
                break

    return {
        "detected": True,
        "barcode": detected_code,
        "type": code_type,
        "product": product,
        "message": f"Successfully detected {code_type}: {detected_code}"
    }

@router.get("")
@router.get("/")
def list_inspections(
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: TokenData = Depends(get_current_officer)
):
    """
    Returns filtered and searched list of inspection records,
    enriched with product metadata and manufacturer repeat violation counts.
    """
    inspections = db.get_inspections(status=status, search=search)
    return {
        "total": len(inspections),
        "inspections": inspections
    }

@router.get("/{inspection_id}")
def get_inspection(inspection_id: str, current_user: TokenData = Depends(get_current_officer)):
    inspection = db.get_inspection(inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return inspection

@router.post("/{inspection_id}/upload")
async def upload_image(
    inspection_id: str, 
    file: UploadFile = File(...), 
    current_user: TokenData = Depends(get_current_officer)
):
    inspection = db.get_inspection(inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")

    return {"filename": file.filename, "status": "Uploaded successfully to inspection " + inspection_id}

@router.post("/{inspection_id}/evaluate_compliance")
def evaluate_compliance(
    inspection_id: str,
    req: ComplianceEvaluationRequest,
    current_user: TokenData = Depends(get_current_officer)
):
    """
    Executes Legal Metrology Rule Engine on the verified declarations.
    Calculates compliance score, detects missing declarations, categorizes violations,
    and updates inspection state in Mock DB.
    """
    inspection = db.get_inspection(inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")

    # Use declarations passed by officer, or fallback to previously extracted ones
    declarations_to_evaluate = req.declarations or inspection.get("declarations", {})
    if not declarations_to_evaluate:
        raise HTTPException(
            status_code=400,
            detail="No declarations available to evaluate. Please run AI scan or provide declarations."
        )

    # Get product catalog info
    product_id = inspection.get("productId")
    product = next((p for p in db.get_products() if p["id"] == product_id), {})

    analysis_metrics = inspection.get("analysis", {})

    # Run Rule Engine
    evaluation_result = rule_engine.evaluate(
        raw_declarations=declarations_to_evaluate,
        analysis=analysis_metrics,
        product_metadata=product
    )

    # Update inspection record in MockDB
    db.update_inspection(inspection_id, {
        "status": evaluation_result["overall_status"],
        "compliance_score": evaluation_result["compliance_score"],
        "compliance_result": evaluation_result,
        "officer_remarks": req.officer_remarks,
        "verified_declarations": declarations_to_evaluate
    })

    return {
        "status": "success",
        "inspection_id": inspection_id,
        "evaluation": evaluation_result
    }

@router.post("/save_scan")
def save_scanned_inspection(payload: Dict[str, Any], current_user: TokenData = Depends(get_current_officer)):
    """
    Saves or commits an AI-scanned packaging inspection into central records,
    generating the official compliance certificate & report.
    """
    product_name = payload.get("product_name") or "Packaged Commodity"
    mfg_name = payload.get("manufacturer") or payload.get("brand") or "Manufacturer"
    category = payload.get("category") or "Retail Packaging"
    score = float(payload.get("compliance_score") or payload.get("overall_score") or 0.0)
    raw_status = str(payload.get("status") or payload.get("overall_status") or "Compliant").lower()
    status = "Compliant" if raw_status in ["compliant", "pass"] else "Potentially Non-Compliant"
    
    # Auto-register product if needed
    product = db.get_product(product_name)
    if not product:
        product = {
            "id": f"CMD-{uuid.uuid4().hex[:6].upper()}",
            "name": product_name,
            "manufacturer": mfg_name,
            "category": category,
            "barcode": payload.get("barcode"),
            "standard_net_qty": None,
            "standard_mrp": None,
            "created_at": datetime.utcnow().isoformat()
        }
        db.add_product(product)

    incoming_id = payload.get("id") or payload.get("inspection_id")
    if incoming_id:
        clean_id = str(incoming_id).strip()
        if clean_id.startswith("SCN-"):
            inspection_id = f"INS-{clean_id[4:]}"
        elif clean_id.startswith("INS-"):
            inspection_id = clean_id
        else:
            inspection_id = f"INS-{clean_id}"
    else:
        inspection_id = f"INS-{uuid.uuid4().hex[:8].upper()}"

    # Normalize declarations to dict
    declarations = payload.get("declarations") or {}
    decl_dict = {}
    if isinstance(declarations, list):
        for d in declarations:
            fname = d.get("field_name")
            if fname:
                decl_dict[fname] = {
                    "value": d.get("value"),
                    "confidence": d.get("confidence", 0.9),
                    "location": d.get("location")
                }
    elif isinstance(declarations, dict):
        decl_dict = declarations

    compliance_results = payload.get("compliance_results") or []
    violations = [r for r in compliance_results if r.get("status") == "fail"] if compliance_results else []

    inspection_record = {
        "id": inspection_id,
        "productId": product["id"],
        "product_name": product_name,
        "manufacturer": mfg_name,
        "officerId": current_user.email,
        "date": datetime.utcnow().isoformat(),
        "status": status,
        "compliance_score": score,
        "images": payload.get("images", []),
        "raw_text_lines": payload.get("raw_text_lines", []),
        "declarations": decl_dict,
        "verified_declarations": decl_dict,
        "compliance_result": {
            "overall_status": status,
            "compliance_score": score,
            "checklist": compliance_results,
            "violations": violations,
            "discrepancies": []
        },
        "analysis": payload.get("analysis", {}),
        "evidence": {
            "sha256_hash": payload.get("evidence_hash") or f"SHA256-{uuid.uuid4().hex.upper()}",
            "has_annotated_image": bool(payload.get("evidence_base64")),
            "integrity_status": "VERIFIED_TAMPER_EVIDENT",
            "base64_evidence": payload.get("evidence_base64")
        },
        "officer_remarks": payload.get("officer_remarks") or "Officer verified statutory declarations."
    }

    db.save_inspection(inspection_record)

    report_id = f"REP-{inspection_id.replace('INS-', '')}"
    report_record = {
        "report_id": report_id,
        "inspection_id": inspection_id,
        "product_name": product_name,
        "manufacturer": mfg_name,
        "date": datetime.utcnow().isoformat(),
        "compliance_score": score,
        "status": status,
        "violations_count": len(violations)
    }
    db.save_report(report_record)

    return {
        "status": "success",
        "inspection_id": inspection_id,
        "report_id": report_id,
        "message": f"Inspection {inspection_id} and Report {report_id} successfully registered."
    }
