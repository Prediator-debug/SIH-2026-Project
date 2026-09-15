from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from core.security import get_current_officer
from core.database import db
from models.schemas import TokenData

router = APIRouter()

def calculate_manufacturer_risk(manufacturer_name: str) -> Dict[str, Any]:
    """
    Computes statutory risk index as per SIH 2026.pdf Section 7.2 & Section 17:
    Factors:
    - Total inspections conducted
    - Non-compliant inspections
    - Severity of past violations (Critical=10, Major=5, Minor=2)
    - Repeat violation multiplier
    """
    all_inspections = db.get_inspections()
    mfg_clean = manufacturer_name.lower().strip()
    
    mfg_inspections = []
    for insp in all_inspections:
        mfg_val = str(insp.get("declarations", {}).get("Manufacturer", {}).get("value", "") or "")
        if not mfg_val:
            # fallback to product manufacturer
            prod_id = insp.get("productId")
            prod = next((p for p in db.get_products() if p["id"] == prod_id), {})
            mfg_val = prod.get("manufacturer", "")
        if mfg_clean in mfg_val.lower() or mfg_val.lower() in mfg_clean:
            mfg_inspections.append(insp)

    total_inspections = len(mfg_inspections)
    violations_list = []
    non_compliant_count = 0

    for insp in mfg_inspections:
        status = insp.get("status", "")
        if "Non-Compliant" in status:
            non_compliant_count += 1
        eval_res = insp.get("compliance_result", {})
        for v in eval_res.get("violations", []):
            violations_list.append(v)

    # Calculate severity score
    severity_score = 0
    for v in violations_list:
        sev = v.get("severity", "MINOR")
        if sev == "CRITICAL":
            severity_score += 10
        elif sev == "MAJOR":
            severity_score += 5
        else:
            severity_score += 2

    # Repeat offender multiplier
    repeat_count = max(0, non_compliant_count - 1)
    repeat_multiplier = 1.0 + (repeat_count * 0.4)

    raw_risk = (severity_score + (non_compliant_count * 8)) * repeat_multiplier
    normalized_risk = min(100, int(raw_risk))

    if normalized_risk >= 75:
        risk_level = "CRITICAL"
        color = "#EF4444"
        action = "Immediate Surprise Enforcement Audit & Raid Recommended"
    elif normalized_risk >= 45:
        risk_level = "HIGH"
        color = "#F97316"
        action = "High Priority Field Sample Inspection Scheduled"
    elif normalized_risk >= 20:
        risk_level = "MEDIUM"
        color = "#F59E0B"
        action = "Routine Surveillance Audit Required"
    else:
        risk_level = "LOW"
        color = "#10B981"
        action = "Good Regulatory Compliance Record"

    # Escalated penalty under Section 36
    if non_compliant_count == 0:
        penalty_tier = "Nil (Compliant)"
        fine_amount = "₹0"
    elif non_compliant_count == 1:
        penalty_tier = "First Offence (Sec 36(1))"
        fine_amount = "Up to ₹25,000"
    elif non_compliant_count == 2:
        penalty_tier = "Second Offence (Sec 36(2))"
        fine_amount = "Up to ₹50,000"
    else:
        penalty_tier = f"Habitual / Repeat Offender ({non_compliant_count}x)"
        fine_amount = "Up to ₹1,00,000 and/or Imprisonment up to 1 Year"

    return {
        "manufacturer": manufacturer_name,
        "risk_score": normalized_risk,
        "risk_level": risk_level,
        "color": color,
        "recommended_action": action,
        "total_inspections": total_inspections,
        "non_compliant_inspections": non_compliant_count,
        "total_violations_recorded": len(violations_list),
        "repeat_violation_count": repeat_count,
        "penalty_tier": penalty_tier,
        "estimated_fine": fine_amount
    }

@router.get("/risk_matrix")
def get_risk_matrix(current_user: TokenData = Depends(get_current_officer)):
    """
    Returns risk scoring profiles for all active manufacturers in catalog.
    """
    products = db.get_products()
    manufacturers = sorted(list(set(p.get("manufacturer") for p in products if p.get("manufacturer"))))
    
    profiles = [calculate_manufacturer_risk(mfg) for mfg in manufacturers]
    profiles.sort(key=lambda x: x["risk_score"], reverse=True)

    critical_count = sum(1 for p in profiles if p["risk_level"] == "CRITICAL")
    high_count = sum(1 for p in profiles if p["risk_level"] == "HIGH")
    medium_count = sum(1 for p in profiles if p["risk_level"] == "MEDIUM")
    low_count = sum(1 for p in profiles if p["risk_level"] == "LOW")

    return {
        "total_manufacturers": len(profiles),
        "risk_distribution": {
            "critical": critical_count,
            "high": high_count,
            "medium": medium_count,
            "low": low_count
        },
        "profiles": profiles
    }

@router.get("/priority_targets")
def get_priority_targets(current_user: TokenData = Depends(get_current_officer)):
    """
    Returns prioritized list of high-risk manufacturers for enforcement officers.
    """
    matrix = get_risk_matrix(current_user)
    targets = [p for p in matrix["profiles"] if p["risk_level"] in ("CRITICAL", "HIGH")]
    return {
        "count": len(targets),
        "targets": targets
    }

@router.get("/category_distribution")
def get_category_distribution(current_user: TokenData = Depends(get_current_officer)):
    """
    Returns violation and risk statistics across commodity categories dynamically from inspections.
    """
    inspections = db.get_inspections()
    cat_stats = {}

    for insp in inspections:
        p = db.get_product(insp.get("productId"))
        cat = (p.get("category") if p else None) or "General Packaged Goods"
        if cat not in cat_stats:
            cat_stats[cat] = {"total": 0, "violations": 0}
        cat_stats[cat]["total"] += 1
        if "Non-Compliant" in str(insp.get("status", "")):
            cat_stats[cat]["violations"] += 1

    categories = []
    for cat, data in cat_stats.items():
        total = data["total"]
        violations = data["violations"]
        comp_rate = round(((total - violations) / max(1, total)) * 100, 1)
        risk = "HIGH" if comp_rate < 50 else ("MEDIUM" if comp_rate < 80 else "LOW")
        categories.append({
            "name": cat,
            "total_sampled": total,
            "violations": violations,
            "compliance_rate": f"{comp_rate}%",
            "risk": risk
        })

    return {
        "categories": categories
    }
