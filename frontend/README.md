# Predictive Quantum Jobs Tracker — Frontend (Vite + React)

This is a ready-to-run frontend for your dashboard. It fetches JSON from `/api/backends` (your Jupyter/Flask server).

## Quick start

```bash
# in Anaconda Prompt (or terminal)
cd qjt-frontend
npm install
npm run dev
```

Your Flask API (from the notebook) must be running on `http://127.0.0.1:5000`.
The Vite dev server proxies `/api/*` there automatically (see `vite.config.js`).

## JSON shape expected from /api/backends
```json
[
  { "backend": "ibm_oslo", "pending": 14, "online": true, "predicted_wait_min": 28.0 }
]
```

If the API is down, the UI falls back to a small simulated dataset so your demo never breaks.
