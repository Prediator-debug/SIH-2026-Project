from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import base64
import uuid

from core.security import get_current_officer
from core.database import db
from core.rule_engine import LegalMetrologyRuleEngine
from models.schemas import TokenData
from ai.ocr import process_image
from ai.extraction import extract_declarations
from ai.visualization import highlight_image_evidence

router = APIRouter()
rule_engine = LegalMetrologyRuleEngine()

class OfflineInspectionItem(BaseModel):
    client_offline_id: str
    product_id: str
    offline_captured_at: str
    officer_remarks: Optional[str] = ""
    base64_image: Optional[str] = None
    manual_declarations: Optional[Dict[str, Any]] = None

class BatchSyncRequest(BaseModel):
    inspections: List[OfflineInspectionItem]

@router.post("/batch_sync")
async def batch_sync_offline_inspections(
    req: BatchSyncRequest,
    current_user: TokenData = Depends(get_current_officer)
):
    """
    SIH 2026 Section 25: Offline Mode Synchronization Engine.
    Accepts batch inspection drafts captured by officers in areas with no internet,
    runs OCR and Rule Engine, assigns official server IDs & SHA-256 hashes,
    and returns synced records with 'SYNCED' status.
    """
    synced_records = []
    products = db.get_products()

    for item in req.inspections:
        try:
            # 1. Verify or match product
            product = next((p for p in products if p["id"] == item.product_id), None)
            if not product:
                product = {
                    "id": item.product_id,
                    "name": "Field Packaged Commodity",
                    "manufacturer": "Unregistered / Field Sample",
                    "category": "Retail Package"
                }

            # 2. Create server inspection record
            official_record = db.create_inspection(
                product_id=item.product_id,
                officer_id=current_user.email
            )
            inspection_id = official_record["id"]

            declarations = item.manual_declarations or {}
            analysis_metrics = {}
            evidence_data = None

            # 3. Process image if attached
            if item.base64_image:
                try:
                    # Clean data URI prefix if present
                    raw_b64 = item.base64_image
                    if "," in raw_b64:
                        raw_b64 = raw_b64.split(",", 1)[1]
                    img_bytes = base64.b64decode(raw_b64)

                    ocr_lines, metrics = process_image(img_bytes, apply_preprocessing=True)
                    analysis_metrics = metrics
                    extracted_decls = extract_declarations(ocr_lines)
                    
                    # Merge manual declarations with extracted
                    for k, v in extracted_decls.items():
                        if k not in declarations or not declarations[k].get("value"):
                            declarations[k] = v

                    evidence_data = highlight_image_evidence(
                        image_bytes=img_bytes,
                        ocr_lines=ocr_lines,
                        declarations=declarations
                    )
                except Exception as img_err:
                    print(f"[Offline Sync Warning] Image processing error: {img_err}")

            # 4. Run Rule Engine
            evaluation_result = rule_engine.evaluate(
                raw_declarations=declarations,
                analysis=analysis_metrics,
                product_metadata=product
            )

            # 5. Commit to database
            db.update_inspection(inspection_id, {
                "status": evaluation_result["overall_status"],
                "compliance_score": evaluation_result["compliance_score"],
                "compliance_result": evaluation_result,
                "declarations": declarations,
                "analysis": analysis_metrics,
                "evidence": evidence_data,
                "officer_remarks": item.officer_remarks or f"Offline sync from device captured on {item.offline_captured_at}",
                "sync_metadata": {
                    "client_offline_id": item.client_offline_id,
                    "synced_at": datetime.utcnow().isoformat() + "Z",
                    "sync_status": "SYNCED"
                }
            })

            synced_records.append({
                "client_offline_id": item.client_offline_id,
                "server_inspection_id": inspection_id,
                "sync_status": "SYNCED",
                "compliance_status": evaluation_result["overall_status"],
                "compliance_score": evaluation_result["compliance_score"],
                "synced_at": datetime.utcnow().isoformat() + "Z"
            })

        except Exception as e:
            print(f"[Offline Sync Error] Failed to process {item.client_offline_id}: {e}")
            synced_records.append({
                "client_offline_id": item.client_offline_id,
                "sync_status": "SYNC_FAILED",
                "error": str(e)
            })

    return {
        "batch_total": len(req.inspections),
        "synced_count": sum(1 for r in synced_records if r["sync_status"] == "SYNCED"),
        "failed_count": sum(1 for r in synced_records if r["sync_status"] == "SYNC_FAILED"),
        "records": synced_records
    }
