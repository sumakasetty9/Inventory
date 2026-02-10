"""
Pydantic schemas for Inventory API.
"""
from pydantic import BaseModel, Field, field_validator


class InventoryBase(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=255)
    quantity: int = Field(..., ge=0, description="Stock quantity")
    price: float = Field(0, ge=0, description="Unit price")


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    product_name: str | None = Field(None, min_length=1, max_length=255)
    quantity: int | None = Field(None, ge=0)
    price: float | None = Field(None, ge=0)


class InventoryUpdateQuantity(BaseModel):
    quantity: int = Field(..., ge=0, description="New stock quantity")


class SellQuantity(BaseModel):
    quantity: int = Field(..., gt=0, description="Quantity to sell (reduces stock)")


class InventoryResponse(InventoryBase):
    product_id: int
    is_deleted: bool = False

    model_config = {"from_attributes": True}

    @field_validator("price", mode="before")
    @classmethod
    def price_none_to_zero(cls, v):
        if v is None:
            return 0
        return v
