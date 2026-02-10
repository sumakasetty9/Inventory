from fastapi import APIRouter

from app.api.routes import inventory

api_router = APIRouter()

api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
