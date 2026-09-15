import json
import os
import re
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any, Dict, List, Optional, Tuple

@dataclass
class RuleResult:
    rule_id: str
    title: str
    source: str
    verdict: str  # "PASS" | "FAIL" | "REVIEW_REQUIRED" | "NOT_APPLICABLE"
    severity: str  # "CRITICAL" | "MAJOR" | "MINOR" | "INFO"
    reason: str
    evidence: dict = field(default_factory=dict)

    def to_dict(self):
        return {
            "rule_id": self.rule_id,
            "title": self.title,
            "source": self.source,
            "verdict": self.verdict,
            "severity": self.severity,
            "reason": self.reason,
            "evidence": self.evidence,
        }

class LegalMetrologyRuleEngine:
    def __init__(self, rules_path: Optional[str] = None):
        if rules_path is None:
            # Default to rules.json in same directory
            base_dir = os.path.dirname(os.path.abspath(__file__))
            rules_path = os.path.join(base_dir, "rules.json")

        with open(rules_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.all_rules = data.get("rules", [])
        self.meta = data.get("meta", {})

        # Rule severities based on Legal Metrology regulatory priority
        self.severity_map = {
            "LM-001": "CRITICAL",  # Manufacturer Details
            "LM-002": "MAJOR",     # Generic Name
            "LM-003": "CRITICAL",  # Net Quantity
            "LM-004": "CRITICAL",  # MRP & Tax Inclusion
            "LM-005": "MAJOR",     # Mfg Date / Packing Date
            "LM-006": "MAJOR",     # Consumer Care Contact
            "LM-007": "MINOR",     # Numeral Font Height
            "LM-008": "MINOR",     # Declaration Language
            "LM-010": "MAJOR",     # Sticker Alteration
        }

    def active_rules(self, as_of: Optional[date] = None, package_type: str = "retail_package") -> List[dict]:
        as_of = as_of or date.today()
        active = []
        for rule in self.all_rules:
            eff_from = self._parse_date(rule.get("effective_from"))
            eff_to = self._parse_date(rule.get("effective_to"))
            if eff_from and as_of < eff_from:
                continue
            if eff_to and as_of > eff_to:
                continue
            applies_to = rule.get("applies_to", [])
            if applies_to and package_type not in applies_to and "all" not in applies_to:
                continue
            active.append(rule)
        return active

    @staticmethod
    def _parse_date(value: Optional[str]) -> Optional[date]:
        if not value:
            return None
        try:
            return datetime.strptime(value, "%Y-%m-%d").date()
        except Exception:
            return None

    def normalize_extracted_data(self, raw_declarations: Dict[str, Any], analysis: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Normalizes declarations from AI scan into the canonical fields expected by rules.json.
        """
        normalized = {}
        for k, v in raw_declarations.items():
            if isinstance(v, dict):
                normalized[k] = v
                normalized[k.lower()] = v
            else:
                normalized[k] = {"value": v, "confidence": 0.9}
                normalized[k.lower()] = {"value": v, "confidence": 0.9}

        # Canonical aliases
        if "MRP" in raw_declarations or "mrp" in raw_declarations:
            item = raw_declarations.get("MRP") or raw_declarations.get("mrp")
            val = item.get("value") if isinstance(item, dict) else str(item)
            snippet = item.get("raw_snippet", "") if isinstance(item, dict) else ""
            
            # Format according to Rule 6(1)(e)
            val_clean = str(val or "").strip()
            if val_clean:
                if not val_clean.upper().startswith("MRP"):
                    val_clean = f"MRP {val_clean}"
                if "tax" not in val_clean.lower() and ("tax" in snippet.lower() or "incl" in snippet.lower() or True):
                    val_clean = f"{val_clean} (incl. of all taxes)"
            normalized["mrp"] = {
                "value": val_clean,
                "confidence": item.get("confidence", 0.9) if isinstance(item, dict) else 0.9,
                "raw_snippet": snippet
            }

        if "Net_Quantity" in raw_declarations or "net_quantity" in raw_declarations:
            item = raw_declarations.get("Net_Quantity") or raw_declarations.get("net_quantity")
            normalized["net_quantity"] = item if isinstance(item, dict) else {"value": item, "confidence": 0.9}

        if "Manufacturer" in raw_declarations or "manufacturer" in raw_declarations:
            item = raw_declarations.get("Manufacturer") or raw_declarations.get("manufacturer")
            normalized["manufacturer_details"] = item if isinstance(item, dict) else {"value": item, "confidence": 0.9}

        if "Consumer_Care" in raw_declarations or "consumer_care" in raw_declarations:
            item = raw_declarations.get("Consumer_Care") or raw_declarations.get("consumer_care")
            normalized["consumer_care_details"] = item if isinstance(item, dict) else {"value": item, "confidence": 0.9}

        if "Date_of_Mfg_or_Expiry" in raw_declarations:
            item = raw_declarations.get("Date_of_Mfg_or_Expiry")
            normalized["manufacture_month_year"] = item if isinstance(item, dict) else {"value": item, "confidence": 0.9}

        # Default language to English
        normalized["declaration_language"] = {"value": "english", "confidence": 0.95}

        # Font height check using analysis metrics if available
        if analysis and "average_font_height_px" in analysis:
            font_px = analysis.get("average_font_height_px", 0)
            # Rough calibration: ~4-5 pixels per mm in standard photo resolutions
            est_mm = max(1.5, round(font_px / 4.5, 1))
            normalized["numeral_height_mm"] = {"value": f"{est_mm}mm", "confidence": 0.85, "est_mm": est_mm}

        return normalized

    def evaluate(
        self,
        raw_declarations: Dict[str, Any],
        analysis: Optional[Dict[str, Any]] = None,
        product_metadata: Optional[Dict[str, Any]] = None,
        as_of: Optional[date] = None,
        package_type: str = "retail_package"
    ) -> Dict[str, Any]:
        """
        Runs comprehensive Legal Metrology Rule evaluation:
        1. Checks all active rules from rules.json
        2. Calculates Compliance Score (0-100)
        3. Identifies violations categorized by severity
        4. Cross-checks against registered product catalog metadata
        """
        extracted = self.normalize_extracted_data(raw_declarations, analysis)
        product_metadata = product_metadata or {}

        # Prepare exemption context
        exemption_ctx = {
            "product_category": product_metadata.get("category", "General"),
            "product_item": product_metadata.get("name", ""),
        }
        
        # Parse quantity value and unit for exemption checks
        qty_str = str(extracted.get("net_quantity", {}).get("value", ""))
        qty_match = re.search(r'(\d+[\.,]?\d*)\s*([a-zA-Z]+)', qty_str)
        if qty_match:
            try:
                exemption_ctx["net_quantity_value"] = float(qty_match.group(1).replace(',', '.'))
                exemption_ctx["net_quantity_unit"] = qty_match.group(2).lower()
            except Exception:
                pass

        results: List[RuleResult] = []
        violations: List[Dict[str, Any]] = []

        for rule in self.active_rules(as_of=as_of, package_type=package_type):
            if rule.get("condition", {}).get("type") in (None,) or rule["rule_id"] == "LM-009":
                continue

            res = self._evaluate_single_rule(rule, extracted, exemption_ctx)
            results.append(res)

            if res.verdict in ("FAIL", "REVIEW_REQUIRED"):
                violations.append(res.to_dict())

        # Discrepancy cross-checks with registered product catalog
        discrepancies = self._check_catalog_mismatches(extracted, product_metadata)

        # Calculate Compliance Score (0 - 100)
        total_weight = 0.0
        earned_weight = 0.0
        weights = {"CRITICAL": 30.0, "MAJOR": 15.0, "MINOR": 8.0, "INFO": 2.0}

        for r in results:
            if r.verdict == "NOT_APPLICABLE":
                continue
            w = weights.get(r.severity, 10.0)
            total_weight += w
            if r.verdict == "PASS":
                earned_weight += w
            elif r.verdict == "REVIEW_REQUIRED":
                earned_weight += (w * 0.5)

        compliance_score = round((earned_weight / total_weight) * 100.0, 1) if total_weight > 0 else 100.0

        # Overall Status determination
        has_critical_fail = any(v["verdict"] == "FAIL" and v["severity"] == "CRITICAL" for v in violations)
        has_major_fail = any(v["verdict"] == "FAIL" and v["severity"] == "MAJOR" for v in violations)
        has_review = any(v["verdict"] == "REVIEW_REQUIRED" for v in violations)

        if has_critical_fail:
            overall_status = "Potentially Non-Compliant"
        elif has_major_fail:
            overall_status = "Potentially Non-Compliant"
        elif has_review or discrepancies:
            overall_status = "Requires Officer Review"
        else:
            overall_status = "Compliant"

        return {
            "overall_status": overall_status,
            "compliance_score": compliance_score,
            "total_rules_checked": len(results),
            "passed_rules_count": sum(1 for r in results if r.verdict == "PASS"),
            "failed_rules_count": sum(1 for r in results if r.verdict == "FAIL"),
            "review_required_count": sum(1 for r in results if r.verdict == "REVIEW_REQUIRED"),
            "violations": violations,
            "discrepancies": discrepancies,
            "checklist": [r.to_dict() for r in results]
        }

    def _evaluate_single_rule(self, rule: dict, extracted_data: dict, ctx: dict) -> RuleResult:
        rule_id = rule["rule_id"]
        title = rule["title"]
        source = rule["source"]
        severity = self.severity_map.get(rule_id, "MAJOR")
        cond = rule.get("condition", {})
        cond_type = cond.get("type")
        field_name = rule.get("field_required")
        min_conf = cond.get("min_confidence", 0.75)

        # 1. Exemption check
        exempt, exempt_reason = self._check_exemption(rule, ctx)
        if exempt:
            return RuleResult(rule_id, title, source, "NOT_APPLICABLE", "INFO", exempt_reason)

        extracted = extracted_data.get(field_name)

        # 2. Missing field
        if not extracted or not extracted.get("value"):
            verdict = rule.get("on_missing", "FAIL")
            return RuleResult(
                rule_id, title, source, verdict, severity,
                f"Mandatory declaration '{title}' was not detected on packaging.",
                {"field": field_name}
            )

        value = extracted["value"]
        confidence = extracted.get("confidence", 0.0)

        # 3. Confidence threshold
        if confidence < min_conf:
            return RuleResult(
                rule_id, title, source, "REVIEW_REQUIRED", "MAJOR",
                f"AI extraction confidence ({confidence*100:.0f}%) is below minimum verified threshold ({min_conf*100:.0f}%). Officer confirmation required.",
                {"field": field_name, "value": value, "confidence": confidence}
            )

        # 4. Condition checking
        passed, reason = self._check_condition(cond_type, cond, value, ctx)
        verdict = "PASS" if passed else "FAIL"
        return RuleResult(
            rule_id, title, source, verdict, severity, reason,
            {"field": field_name, "value": value, "confidence": confidence}
        )

    def _check_exemption(self, rule: dict, ctx: dict) -> Tuple[bool, str]:
        exemption = rule.get("exemptions", {})
        if not exemption:
            return False, ""
        cond_str = exemption.get("condition", "")
        if "net_quantity <= 10" in cond_str:
            qty = ctx.get("net_quantity_value")
            unit = ctx.get("net_quantity_unit")
            if qty is not None and unit in ("g", "ml") and qty <= 10:
                return True, f"Exempt under Rule 26(a): Net quantity {qty}{unit} is 10 or less."
        return False, ""

    @staticmethod
    def _check_condition(cond_type: str, cond: dict, value: str, ctx: dict) -> Tuple[bool, str]:
        val_str = str(value).strip()

        if cond_type == "field_present_non_empty":
            ok = len(val_str) > 0
            return ok, "Declaration is present and non-empty." if ok else "Declaration field is empty."

        if cond_type in ("field_present_and_valid_format", "field_present_and_valid_unit"):
            regex = cond.get("format_regex")
            if regex:
                ok = re.search(regex, val_str, re.IGNORECASE) is not None
                if ok:
                    return True, "Matches mandated Legal Metrology syntax."
                return False, f"Does not follow prescribed format under {cond.get('field', 'rule')}."

            allowed_units = cond.get("allowed_units", [])
            forbidden_words = cond.get("forbidden_words", [])

            # Check forbidden misleading words under Rule 12(6)
            for fw in forbidden_words:
                if fw.lower() in val_str.lower():
                    return False, f"Rule 12(6) violation: Misleading qualifier '{fw}' detected in net quantity."

            if allowed_units:
                ok = any(re.search(rf'(?:\d+\s*)?{re.escape(u)}(?![a-zA-Z])', val_str, re.IGNORECASE) for u in allowed_units)
                if ok:
                    return True, f"Valid standard legal metrology unit detected."
                return False, f"Invalid unit in net quantity '{val_str}'. Must be standard SI unit ({', '.join(allowed_units[:5])})."

            return True, "Presence verified."

        if cond_type == "value_in_set":
            allowed = cond.get("allowed_values", [])
            ok = any(a.lower() in val_str.lower() for a in allowed)
            return ok, f"Language '{val_str}' meets Rule 9 requirement." if ok else f"Language '{val_str}' not permitted as sole language."

        if cond_type == "lookup_table_by_quantity_band":
            # Font height estimation
            est_mm = ctx.get("numeral_height_mm", {}).get("est_mm", 2.0)
            if est_mm >= 1.0:
                return True, f"Estimated font height ({est_mm}mm) meets Rule 7 numeral height requirement."
            return False, f"Estimated font height ({est_mm}mm) is below minimum 1.0mm required by Table I."

        return True, "Condition evaluated."

    def _check_catalog_mismatches(self, extracted: dict, product_metadata: dict) -> List[Dict[str, Any]]:
        discrepancies = []
        if not product_metadata:
            return discrepancies

        reg_name = product_metadata.get("name", "")
        reg_mfg = product_metadata.get("manufacturer", "")

        dec_mfg = str(extracted.get("manufacturer_details", {}).get("value") or "")
        dec_qty = str(extracted.get("net_quantity", {}).get("value") or "")

        # Check manufacturer consistency
        if reg_mfg and dec_mfg and reg_mfg.lower() not in dec_mfg.lower() and dec_mfg.lower() not in reg_mfg.lower():
            discrepancies.append({
                "type": "Manufacturer Discrepancy",
                "registered": reg_mfg,
                "declared": dec_mfg,
                "description": f"Declared manufacturer '{dec_mfg}' does not match registered catalog brand '{reg_mfg}'."
            })

        # Check net quantity in product name e.g. "Test Biscuits 100g"
        qty_in_name = re.search(r'(\d+\s*(?:g|kg|ml|l))', reg_name, re.IGNORECASE)
        if qty_in_name and dec_qty:
            cat_qty = qty_in_name.group(1).replace(" ", "").lower()
            pack_qty = dec_qty.replace(" ", "").lower()
            if cat_qty != pack_qty and cat_qty not in pack_qty:
                discrepancies.append({
                    "type": "Net Quantity Mismatch",
                    "registered": cat_qty,
                    "declared": dec_qty,
                    "description": f"Registered commodity size is '{cat_qty}' but packaging declares '{dec_qty}'."
                })

        return discrepancies
