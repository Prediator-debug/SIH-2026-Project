# Database for Legal Metrology Inspection Platform
import uuid
from datetime import datetime, timedelta

# In-memory repository storage for rapid verification and audit persistence
users_db = [
    {"id": "officer1", "email": "officer@lmd.gov.in", "password": "password123", "role": "officer", "name": "Inspector Rajesh Sharma"}
]

products_db = [
    {
        "id": "CMD-001",
        "name": "Parle-G Original Gluco Biscuits 800g",
        "manufacturer": "Parle Products Pvt. Ltd., Vile Parle East, Mumbai, MH - 400057",
        "category": "Food & Beverage",
        "barcode": "8901719101051",
        "standard_net_qty": "800g",
        "standard_mrp": "₹85.00",
        "created_at": "2026-09-01T10:00:00"
    },
    {
        "id": "CMD-002",
        "name": "Amul Pasteurised Salted Butter 500g",
        "manufacturer": "Gujarat Cooperative Milk Marketing Federation Ltd., Anand - 388001",
        "category": "Dairy Products",
        "barcode": "8901262010054",
        "standard_net_qty": "500g",
        "standard_mrp": "₹275.00",
        "created_at": "2026-09-02T11:30:00"
    },
    {
        "id": "CMD-003",
        "name": "Tata Salt Vacuum Evaporated Iodised 1kg",
        "manufacturer": "Tata Consumer Products Limited, 1 Bishop Lefroy Road, Kolkata",
        "category": "Staples & Flour",
        "barcode": "8901030000000",
        "standard_net_qty": "1kg",
        "standard_mrp": "₹28.00",
        "created_at": "2026-09-03T09:15:00"
    },
    {
        "id": "CMD-004",
        "name": "Aashirvaad Superior MP Shuddh Chakki Atta 5kg",
        "manufacturer": "ITC Limited, 37 J.L. Nehru Road, Kolkata - 700071",
        "category": "Staples & Flour",
        "barcode": "8901030383707",
        "standard_net_qty": "5kg",
        "standard_mrp": "₹245.00",
        "created_at": "2026-09-04T14:20:00"
    },
    {
        "id": "CMD-005",
        "name": "Fortune Sunlite Refined Sunflower Oil 1L",
        "manufacturer": "Adani Wilmar Limited, Fortune House, Near Navrangpura, Ahmedabad",
        "category": "Food & Beverage",
        "barcode": "8906007280145",
        "standard_net_qty": "1L",
        "standard_mrp": "₹155.00",
        "created_at": "2026-09-05T16:00:00"
    },
    {
        "id": "CMD-006",
        "name": "Maggi 2-Minute Masala Instant Noodles 280g",
        "manufacturer": "Nestle India Limited, 100/101 World Trade Centre, Barakhamba Lane, New Delhi",
        "category": "Food & Beverage",
        "barcode": "8901058852358",
        "standard_net_qty": "280g",
        "standard_mrp": "₹56.00",
        "created_at": "2026-09-06T12:00:00"
    }
]

inspections_db = []

reports_db = []

class MockDB:
    @staticmethod
    def get_user_by_email(email: str):
        for user in users_db:
            if user["email"] == email:
                return user
        return None

    @staticmethod
    def get_products():
        return products_db

    @staticmethod
    def get_product(product_id: str):
        for p in products_db:
            if p["id"] == product_id or p.get("barcode") == product_id:
                return p
        return None

    @staticmethod
    def add_product(product: dict):
        for idx, p in enumerate(products_db):
            if p["id"] == product["id"]:
                products_db[idx] = product
                return product
        products_db.insert(0, product)
        return product

    @staticmethod
    def delete_product(product_id: str):
        global products_db
        initial_len = len(products_db)
        products_db = [p for p in products_db if p["id"] != product_id and p.get("barcode") != product_id]
        return len(products_db) < initial_len


    @staticmethod
    def create_inspection(product_id: str, officer_id: str):
        inspection_id = f"INS-{uuid.uuid4().hex[:8].upper()}"
        new_inspection = {
            "id": inspection_id,
            "productId": product_id,
            "officerId": officer_id,
            "date": datetime.utcnow().isoformat(),
            "status": "In Progress",
            "compliance_score": None,
            "images": [],
            "verified_declarations": {},
            "compliance_result": None,
            "evidence": None
        }
        inspections_db.insert(0, new_inspection)
        return new_inspection

    @staticmethod
    def save_inspection(inspection: dict):
        for idx, insp in enumerate(inspections_db):
            if insp["id"] == inspection["id"]:
                inspections_db[idx].update(inspection)
                return inspections_db[idx]
        inspections_db.insert(0, inspection)
        return inspection

    @staticmethod
    def get_inspection(inspection_id: str):
        for insp in inspections_db:
            if insp["id"] == inspection_id:
                # Enrich with product info
                p = MockDB.get_product(insp.get("productId"))
                insp["product"] = p
                return insp
        return None

    @staticmethod
    def update_inspection(inspection_id: str, updates: dict):
        for insp in inspections_db:
            if insp["id"] == inspection_id:
                insp.update(updates)
                p = MockDB.get_product(insp.get("productId"))
                insp["product"] = p
                return insp
        return None

    @staticmethod
    def get_manufacturer_violation_count(manufacturer_name: str):
        if not manufacturer_name:
            return 0
        name_lower = manufacturer_name.lower().strip()
        count = 0
        for insp in inspections_db:
            # Check manufacturer either in product catalog or extracted declarations
            p = MockDB.get_product(insp.get("productId"))
            prod_mfg = (p.get("manufacturer") or "").lower() if p else ""
            decl_mfg = str(insp.get("verified_declarations", {}).get("Manufacturer", {}).get("value", "")).lower()
            
            if (name_lower in prod_mfg or prod_mfg in name_lower or 
                name_lower in decl_mfg or decl_mfg in name_lower):
                if insp.get("status") in ["Potentially Non-Compliant", "Non-Compliant"]:
                    count += 1
        return count

    @staticmethod
    def get_inspections(status: str = None, search: str = None):
        res = list(inspections_db)
        
        # Enrich all records with product metadata and repeat violation stats
        enriched = []
        for insp in res:
            item = dict(insp)
            p = MockDB.get_product(item.get("productId"))
            item["product"] = p
            item["product_name"] = p.get("name") if p else "Unknown Product"
            mfg = p.get("manufacturer") if p else (
                item.get("verified_declarations", {}).get("Manufacturer", {}).get("value") or "Unknown"
            )
            item["manufacturer"] = mfg
            item["repeat_violations_count"] = MockDB.get_manufacturer_violation_count(mfg)
            item["is_repeat_offender"] = item["repeat_violations_count"] >= 2
            enriched.append(item)

        if status and isinstance(status, str) and status.lower() != 'all':
            s_norm = status.lower().strip()
            enriched = [
                i for i in enriched 
                if s_norm in str(i.get("status", "")).lower()
            ]

        if search and isinstance(search, str):
            s = search.lower().strip()
            enriched = [
                i for i in enriched 
                if s in str(i.get("id", "")).lower() 
                or s in str(i.get("productId", "")).lower() 
                or s in str(i.get("product_name", "")).lower() 
                or s in str(i.get("manufacturer", "")).lower()
                or s in str(i.get("status", "")).lower()
            ]

        return enriched

    @staticmethod
    def get_dashboard_stats(officer_id: str = None):
        inspections = list(inspections_db)
        inspections = MockDB.get_inspections()
        total = len(inspections)
        compliant = sum(1 for i in inspections if i.get("status") == "Compliant")
        non_compliant = sum(1 for i in inspections if i.get("status") in ["Potentially Non-Compliant", "Non-Compliant"])
        pending = total - compliant - non_compliant
        
        # Calculate dynamic compliance rate
        compliance_rate = round((compliant / max(1, total)) * 100, 1) if total > 0 else 0.0
        
        # Aggregate violations by Rule ID using statutory Legal Metrology rules
        rule_violation_counts = {
            "Rule 12(6) Net Quantity": 0,
            "Rule 6(1)(e) MRP & Taxes": 0,
            "Rule 6(1)(a) Mfg Address": 0,
            "Rule 6(1)(d) Mfg Date": 0,
            "Rule 6(1)(n) Consumer Care": 0,
            "Rule 7 Numeral Font Height": 0,
        }
        
        for insp in inspections:
            c_res = insp.get("compliance_result") or {}
            for v in c_res.get("violations", []):
                rid = v.get("rule_id")
                if rid == "LM-003":
                    rule_violation_counts["Rule 12(6) Net Quantity"] += 1
                elif rid == "LM-004":
                    rule_violation_counts["Rule 6(1)(e) MRP & Taxes"] += 1
                elif rid == "LM-001":
                    rule_violation_counts["Rule 6(1)(a) Mfg Address"] += 1
                elif rid == "LM-005":
                    rule_violation_counts["Rule 6(1)(d) Mfg Date"] += 1
                elif rid == "LM-006":
                    rule_violation_counts["Rule 6(1)(n) Consumer Care"] += 1
                elif rid == "LM-007":
                    rule_violation_counts["Rule 7 Numeral Font Height"] += 1

        violation_types = [
            {"name": name, "count": count}
            for name, count in rule_violation_counts.items()
            if count > 0
        ]

        # Monthly Trends computed dynamically from inspection records
        monthly_map = {}
        for insp in inspections:
            date_str = str(insp.get("date", ""))[:7]
            if date_str:
                if date_str not in monthly_map:
                    monthly_map[date_str] = {"scans": 0, "compliant": 0}
                monthly_map[date_str]["scans"] += 1
                if insp.get("status") == "Compliant":
                    monthly_map[date_str]["compliant"] += 1

        monthly_trends = [
            {
                "month": m,
                "scans": v["scans"],
                "compliance_rate": round((v["compliant"] / max(1, v["scans"])) * 100, 1)
            }
            for m, v in sorted(monthly_map.items())
        ]

        # Category compliance breakdown computed dynamically
        cat_map = {}
        for insp in inspections:
            p = MockDB.get_product(insp.get("productId"))
            cat = (p.get("category") if p else None) or "General Commodities"
            if cat not in cat_map:
                cat_map[cat] = {"compliant": 0, "non_compliant": 0}
            if insp.get("status") == "Compliant":
                cat_map[cat]["compliant"] += 1
            else:
                cat_map[cat]["non_compliant"] += 1

        category_data = [
            {"category": k, "compliant": v["compliant"], "non_compliant": v["non_compliant"]}
            for k, v in cat_map.items()
        ]

        # Recent scans formatted from inspections_db
        recent_scans = []
        for insp in inspections[:8]:
            p = MockDB.get_product(insp.get("productId"))
            recent_scans.append({
                "id": insp.get("id"),
                "product_name": p.get("name") if p else insp.get("productName", "Packaged Product"),
                "category": p.get("category") if p else "Retail Packaging",
                "scan_date": str(insp.get("date", ""))[:10],
                "overall_status": "compliant" if insp.get("status") == "Compliant" else (
                    "non_compliant" if "Non-Compliant" in insp.get("status", "") else "warning"
                ),
                "compliance_score": insp.get("compliance_score", 0)
            })

        return {
            "total_inspections": total,
            "total_scans": total,
            "compliant_products": compliant,
            "non_compliant_products": non_compliant,
            "pending_reviews": max(0, pending),
            "compliance_rate": compliance_rate if total > 0 else 0.0,
            "active_violations": non_compliant,
            "products_scanned": len(MockDB.get_products()),
            "trends": {
                "total_scans": f"{total}",
                "compliance_rate": f"{compliance_rate}%" if total > 0 else "0%",
                "active_violations": f"{non_compliant}",
                "products_scanned": f"{len(MockDB.get_products())}"
            },
            "monthly_trends": monthly_trends,
            "category_data": category_data,
            "violation_types": violation_types,
            "recent_scans": recent_scans
        }

    @staticmethod
    def clear_all():
        inspections_db.clear()
        reports_db.clear()
        return {"status": "cleared"}

    # ================================================================
    # PDF Report Storage Methods
    # ================================================================
    @staticmethod
    def save_report(report: dict):
        """Save a generated PDF report to the in-memory reports database."""
        # Check for duplicate by report_id
        for idx, r in enumerate(reports_db):
            if r["report_id"] == report["report_id"]:
                reports_db[idx] = report
                return report
        reports_db.insert(0, report)
        return report

    @staticmethod
    def get_report(report_id: str):
        """Retrieve a specific report by report_id."""
        for r in reports_db:
            if r["report_id"] == report_id:
                return r
        return None

    @staticmethod
    def get_reports(search: str = None):
        """List all stored reports with optional search filter."""
        results = list(reports_db)
        if search:
            s = search.lower().strip()
            results = [
                r for r in results
                if s in r.get("report_id", "").lower()
                or s in r.get("inspection_id", "").lower()
                or s in r.get("product_name", "").lower()
                or s in r.get("manufacturer", "").lower()
            ]
        return results

db = MockDB()


