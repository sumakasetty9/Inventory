"""
Application configuration. Replace placeholder values with your actual keys/credentials.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    # PostgreSQL (Supabase): postgresql://user:password@host:port/dbname
    # SQLite (local dev):   sqlite:///./inventory.db
    DATABASE_URL: str = "sqlite:///./inventory.db"

    # Optional: low-stock threshold (products with quantity <= this trigger a warning)
    LOW_STOCK_THRESHOLD: int = 10


settings = Settings()
