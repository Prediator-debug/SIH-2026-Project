import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from core.security import get_current_officer
from core.database import db
from models.schemas import Product, ProductCreate, TokenData

router = APIRouter()

@router.get("", response_model=List[Product])
@router.get("/", response_model=List[Product])
def get_products(current_user: TokenData = Depends(get_current_officer)):
    """Fetch all statutory registered packaged commodities"""
    return db.get_products()

@router.get("/{product_id}", response_model=Product)
def get_product(product_id: str, current_user: TokenData = Depends(get_current_officer)):
    """Fetch a specific commodity by ID or barcode"""
    product = db.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Commodity '{product_id}' not found")
    return product

@router.post("", response_model=Product, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, current_user: TokenData = Depends(get_current_officer)):
    """Register a new packaged commodity for statutory verification"""
    if not product_in.name or not product_in.name.strip():
        raise HTTPException(status_code=400, detail="Commodity name is required")
    if not product_in.manufacturer or not product_in.manufacturer.strip():
        raise HTTPException(status_code=400, detail="Manufacturer/Packer name is required")

    new_id = f"CMD-{uuid.uuid4().hex[:6].upper()}"
    barcode_val = product_in.barcode.strip() if product_in.barcode and product_in.barcode.strip() else f"890{uuid.uuid4().int % 10000000000:010d}"

    product_dict = {
        "id": new_id,
        "name": product_in.name.strip(),
        "manufacturer": product_in.manufacturer.strip(),
        "category": product_in.category or "Food & Beverage",
        "barcode": barcode_val,
        "standard_net_qty": product_in.standard_net_qty.strip() if product_in.standard_net_qty else "N/A",
        "standard_mrp": product_in.standard_mrp.strip() if product_in.standard_mrp else "N/A",
        "created_at": datetime.utcnow().isoformat()
    }
    
    created = db.add_product(product_dict)
    return created

@router.delete("/{product_id}")
def delete_product(product_id: str, current_user: TokenData = Depends(get_current_officer)):
    """Deregister / Remove a commodity from the repository"""
    success = db.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Commodity '{product_id}' not found")
    return {"message": "Commodity deregistered successfully", "id": product_id}
