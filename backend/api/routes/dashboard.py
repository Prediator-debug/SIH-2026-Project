from fastapi import APIRouter, Depends, Request
from typing import Optional
from core.security import settings
from core.database import db
from models.schemas import DashboardStats, TokenData
import jwt

router = APIRouter()

def get_optional_officer(request: Request) -> TokenData:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email: str = payload.get("sub")
            role: str = payload.get("role")
            return TokenData(email=email, role=role)
        except Exception:
            pass
    return TokenData(email="officer@lmd.gov.in", role="officer")

@router.get("", response_model=DashboardStats)
@router.get("/", response_model=DashboardStats)
def get_dashboard(current_user: TokenData = Depends(get_optional_officer)):
    stats = db.get_dashboard_stats(current_user.email)
    return stats
