from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..deps import get_current_user, get_db
from ..models import Product
from ..schemas import ProductCreate, ProductOut, ProductUpdate


router = APIRouter(tags=["products"])
admin_router = APIRouter(prefix="/admin/products", tags=["admin-products"])


@router.get("/products", response_model=list[ProductOut])
def list_products(
    include_hidden: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if not include_hidden:
        query = query.filter(Product.visible.is_(True), Product.enabled.is_(True))
    return query.order_by(Product.created_at.desc()).all()


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return product


@admin_router.post("", response_model=ProductOut, dependencies=[Depends(get_current_user)])
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    exists = db.query(Product).filter(Product.id == payload.id).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El id del producto ya existe")

    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@admin_router.put("/{product_id}", response_model=ProductOut, dependencies=[Depends(get_current_user)])
def update_product(product_id: str, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


@admin_router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_user)])
def delete_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    db.delete(product)
    db.commit()
    return None
