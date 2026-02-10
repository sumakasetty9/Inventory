"""
CRUD operations for Inventory. Uses soft delete via is_deleted.
"""
from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.schemas.inventory import (
    InventoryCreate,
    InventoryUpdate,
    InventoryUpdateQuantity,
    SellQuantity,
)
from app.config import settings


class InventoryCRUD:
    def add_product(self, db: Session, *, data: InventoryCreate) -> Inventory:
        product = Inventory(
            product_name=data.product_name,
            quantity=data.quantity,
            price=data.price,
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    def get_all_products(
        self, db: Session, *, include_deleted: bool = False
    ) -> list[Inventory]:
        q = db.query(Inventory)
        if not include_deleted:
            q = q.filter(Inventory.is_deleted == False)
        return q.order_by(Inventory.product_id).all()

    def get_product(self, db: Session, *, product_id: int) -> Inventory | None:
        return (
            db.query(Inventory)
            .filter(Inventory.product_id == product_id, Inventory.is_deleted == False)
            .first()
        )

    def update_stock(
        self, db: Session, *, product_id: int, data: InventoryUpdateQuantity
    ) -> Inventory | None:
        product = self.get_product(db, product_id=product_id)
        if not product:
            return None
        product.quantity = data.quantity
        db.commit()
        db.refresh(product)
        return product

    def update_product(
        self, db: Session, *, product_id: int, data: InventoryUpdate
    ) -> Inventory | None:
        product = self.get_product(db, product_id=product_id)
        if not product:
            return None
        if data.product_name is not None:
            product.product_name = data.product_name
        if data.quantity is not None:
            product.quantity = data.quantity
        if data.price is not None:
            product.price = data.price
        db.commit()
        db.refresh(product)
        return product

    def delete_product(self, db: Session, *, product_id: int) -> bool:
        """Soft delete: set is_deleted = True."""
        product = self.get_product(db, product_id=product_id)
        if not product:
            return False
        product.is_deleted = True
        db.commit()
        return True

    def sell_product(
        self, db: Session, *, product_id: int, data: SellQuantity
    ) -> Inventory | None:
        """Reduce stock by sold quantity. Returns None if product not found or insufficient stock."""
        product = self.get_product(db, product_id=product_id)
        if not product:
            return None
        if product.quantity < data.quantity:
            return None  # Caller should raise 400
        product.quantity -= data.quantity
        db.commit()
        db.refresh(product)
        return product

    def get_low_stock_products(
        self, db: Session, *, threshold: int | None = None
    ) -> list[Inventory]:
        limit = threshold if threshold is not None else settings.LOW_STOCK_THRESHOLD
        return (
            db.query(Inventory)
            .filter(
                Inventory.is_deleted == False,
                Inventory.quantity <= limit,
            )
            .order_by(Inventory.quantity.asc())
            .all()
        )


inventory_crud = InventoryCRUD()
