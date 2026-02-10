# Inventory Management — Frontend

Single-page app with a black theme. Connects to the FastAPI backend.

## Setup

1. Install dependencies (requires Node.js):

   ```bash
   cd frontend
   npm install
   ```

2. Start the backend (from project root):

   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

3. Start the frontend:

   ```bash
   cd frontend
   npm run dev
   ```

4. Open **http://localhost:5173**. The app proxies `/api` to the backend at `http://127.0.0.1:8000`.

## Features

- **Black theme** — Dark background, light text, green accent
- **Low-stock warning** — Section at the top when any product is at or below threshold
- **Add product** — Form with name and quantity
- **View all products** — Table with ID, name, quantity
- **Update quantity** — Click quantity in the table to edit and save
- **Delete** — Soft delete via "Delete" button (with confirmation)

## Build

```bash
npm run build
```

Output is in `dist/`. For production, serve `dist/` and point API requests to your backend (e.g. configure proxy or set `VITE_API_URL` if you add it).
