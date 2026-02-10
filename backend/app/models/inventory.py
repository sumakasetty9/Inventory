"""
SQLAlchemy model for the Inventory table.
Matches schema: product_id (PK), product_name, quantity, price, is_deleted.
"""
from sqlalchemy import Column, Integer, String, BigInteger, Boolean, Numeric

from app.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    product_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_name = Column(String(255), nullable=False)
    quantity = Column(BigInteger, nullable=False, default=0)
    price = Column(Numeric(10, 2), nullable=False, default=0)
    is_deleted = Column(Boolean, nullable=False, default=False)
