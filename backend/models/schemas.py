from pydantic import BaseModel
from typing import Optional, List

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ProductCreate(BaseModel):
    name: str
    manufacturer: str
    category: str
    barcode: Optional[str] = None
    standard_net_qty: Optional[str] = None
    standard_mrp: Optional[str] = None

class Product(BaseModel):
    id: str
    name: str
    manufacturer: str
    category: str
    barcode: Optional[str] = None
    standard_net_qty: Optional[str] = None
    standard_mrp: Optional[str] = None
    created_at: Optional[str] = None


class InspectionCreate(BaseModel):
    product_id: str

class DashboardStats(BaseModel):
    total_inspections: int
    compliant_products: int
    non_compliant_products: int
    pending_reviews: int
    total_scans: Optional[int] = None
    compliance_rate: Optional[float] = None
    active_violations: Optional[int] = None
    products_scanned: Optional[int] = None
    trends: Optional[dict] = None
    monthly_trends: Optional[List[dict]] = None
    category_data: Optional[List[dict]] = None
    violation_types: Optional[List[dict]] = None
    recent_scans: Optional[List[dict]] = None

class ComplianceEvaluationRequest(BaseModel):
    declarations: Optional[dict] = None
    officer_remarks: Optional[str] = None
