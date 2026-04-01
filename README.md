# Machine Learning Medical Insurance Cost Prediction

Full-stack web application for NIBM HNDSE25.1F/KU Machine Learning CW1.

## Project Structure

- `backend/` Flask API and model inference
- `frontend/` React + Vite dashboard
- `insurance.csv` source dataset

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on: `http://localhost:5000`

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

API requests from frontend are proxied to backend via Vite proxy (`/api` -> `http://localhost:5000`).

## API Endpoints

- `GET /api/health`
- `GET /api/dataset/overview`
- `GET /api/eda`
- `GET /api/feature-importance`
- `GET /api/model-results`
- `POST /api/predict`

## Required Files in Backend

Ensure these files exist in `backend/` before running:

- `insurance.csv`
- `best_insurance_model.pkl`

If `best_insurance_model.pkl` is missing, run:

```bash
python advanced_medical_insurance_pipeline.py
```

Then copy the generated model into `backend/`.
