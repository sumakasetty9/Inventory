"""
Inventory Management API - FastAPI application.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import api_router
from app.database import engine, Base
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they don't exist (e.g. for SQLite or fresh DB)
    Base.metadata.create_all(bind=engine)
    yield
    # shutdown if needed
    pass


app = FastAPI(
    title="Inventory Management API",
    description="CRUD for inventory: add product, view all, update quantity, delete, low-stock warning.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Inventory Management API", "docs": "/docs"}
