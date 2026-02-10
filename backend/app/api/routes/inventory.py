"""
Inventory API: add product, view all, update quantity, delete (soft), low-stock warning.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud.inventory import inventory_crud
from app.schemas.inventory import (
    InventoryCreate,
    InventoryUpdate,
    InventoryResponse,
    InventoryUpdateQuantity,
    SellQuantity,
)

router = APIRouter()


@router.post("/", response_model=InventoryResponse)
def add_product(data: InventoryCreate, db: Session = Depends(get_db)):
    """Add a new product to inventory."""
    return inventory_crud.add_product(db, data=data)


@router.get("/", response_model=list[InventoryResponse])
def view_all_products(
    include_deleted: bool = False,
    db: Session = Depends(get_db),
):
    """View all products. By default excludes soft-deleted items."""
    return inventory_crud.get_all_products(db, include_deleted=include_deleted)


@router.get("/low-stock", response_model=list[InventoryResponse])
def low_stock_warning(
    threshold: int | None = None,
    db: Session = Depends(get_db),
):
    """List products with quantity at or below threshold (default from config)."""
    return inventory_crud.get_low_stock_products(db, threshold=threshold)


@router.get("/{product_id}", response_model=InventoryResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a single product by ID."""
    product = inventory_crud.get_product(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.patch("/{product_id}", response_model=InventoryResponse)
def update_product(
    product_id: int,
    data: InventoryUpdate,
    db: Session = Depends(get_db),
):
    """Update product name and/or quantity."""
    product = inventory_crud.update_product(db, product_id=product_id, data=data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.patch("/{product_id}/quantity", response_model=InventoryResponse)
def update_stock_quantity(
    product_id: int,
    data: InventoryUpdateQuantity,
    db: Session = Depends(get_db),
):
    """Update stock quantity only."""
    product = inventory_crud.update_stock(
        db, product_id=product_id, data=data
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.patch("/{product_id}/sell", response_model=InventoryResponse)
def sell_product(
    product_id: int,
    data: SellQuantity,
    db: Session = Depends(get_db),
):
    """Sell quantity: reduces stock by the given amount."""
    product = inventory_crud.sell_product(
        db, product_id=product_id, data=data
    )
    if not product:
        product = inventory_crud.get_product(db, product_id=product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {product.quantity}",
        )
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Soft delete a product (sets is_deleted = True)."""
    if not inventory_crud.delete_product(db, product_id=product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    return None
