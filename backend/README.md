# Inventory Management API (Backend)

FastAPI backend for the Inventory table: `product_id`, `product_name`, `quantity`, `is_deleted`.

## Setup

1. **Create and activate virtual env** (from project root):
   ```bash
   .\venv\Scripts\Activate.ps1
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure database** (optional):
   - Copy `.env.example` to `.env`.
   - For **PostgreSQL / Supabase**: set `DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE`.
   - Omit or leave default for **SQLite** (uses `./inventory.db`).

## Run

```bash
uvicorn app.main:app --reload
```

- API: http://127.0.0.1:8000  
- Docs: http://127.0.0.1:8000/docs  

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/inventory/` | Add a product |
| GET | `/api/inventory/` | View all products |
| GET | `/api/inventory/low-stock?threshold=10` | Low-stock warning |
| GET | `/api/inventory/{id}` | Get one product |
| PATCH | `/api/inventory/{id}` | Update product (name/quantity) |
| PATCH | `/api/inventory/{id}/quantity` | Update stock quantity only |
| DELETE | `/api/inventory/{id}` | Soft delete product |

Delete is **soft delete** (`is_deleted = true`). Use `?include_deleted=true` on GET `/api/inventory/` to include deleted items.
