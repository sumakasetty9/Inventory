Inventory
=========

A simple inventory management application with a backend API and a separate frontend client.

## Folder structure

- **backend/**: Backend application (API, database, models, business logic)
  - **app/**
    - **api/**: API endpoints
      - **routes/**: Route handlers (e.g. `inventory.py`)
    - **crud/**: Database CRUD helpers
    - **models/**: ORM models
    - **schemas/**: Pydantic schemas / request-response models
    - **main.py**: Application entrypoint
- **frontend/**: Frontend application (UI)

## Quick start

- **Backend**: See `backend/README.md` and install packages from `backend/requirements.txt`.
- **Frontend**: Open `frontend/` and follow the usual JS/TS app workflow (`npm install`, `npm run dev`, etc.).