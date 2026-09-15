from datetime import timedelta
from fastapi import APIRouter, HTTPException, status
from core.config import settings
from core.security import create_access_token
from core.database import db
from models.schemas import LoginRequest, Token

router = APIRouter()

@router.post("/login", response_model=Token)
def login(req: LoginRequest):
    user = db.get_user_by_email(req.email)
    if not user or user["password"] != req.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"]}
