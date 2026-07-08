# Medical Insurance Cost Predictor

Full-stack machine learning application for predicting medical insurance charges using a trained regression model, a Flask API, and a React + Vite dashboard.

## Overview

The project is split into three main parts:

- `advanced_medical_insurance_pipeline.py` trains and evaluates multiple models on `insurance.csv`, then saves the best model as `best_insurance_model.pkl`.
- `backend/` exposes a Flask API for dataset summaries, EDA metrics, model comparison data, feature importance, and live predictions.
- `frontend/` provides the React dashboard for exploring the data and making predictions.

## What The App Does

- Shows dataset overview statistics on the home page.
- Displays exploratory data analysis charts and summary tables.
- Compares multiple regression models by RMSE, MAE, R², and cross-validation R².
- Shows the most important features from the trained Random Forest model.
- Accepts user inputs and returns a predicted annual insurance charge.

## Project Structure

```text
advanced_medical_insurance_pipeline.py   # Training and model export script
insurance.csv                            # Main dataset used by the pipeline
README.md                                # Project guide
backend/
	app.py                                 # Flask API
	insurance.csv                          # Dataset used by the API
	requirements.txt                       # Python dependencies
frontend/
	index.html                             # Vite entry HTML
	package.json                           # Frontend scripts and dependencies
	vite.config.js                         # Dev server proxy configuration
	src/
		api.js                               # Axios client with /api base URL
		App.jsx                              # React routing shell
		index.css                            # Global styling
		main.jsx                             # React entry point
		components/                          # Shared UI components
		pages/                               # Dashboard pages
```

## Frontend Pages

- Home: dataset overview and quick navigation.
- EDA: statistical summaries, smoker vs non-smoker comparison, regional averages, and correlation heatmap.
- Model Comparison: regression metrics table and comparison chart.
- Feature Importance: top predictors and insight cards.
- Predict: form-based insurance charge prediction.

## Backend API

The Flask app is available under the `/api` prefix.

- `GET /api/health` returns service status.
- `GET /api/dataset/overview` returns row count, column list, missing values, and descriptive statistics.
- `GET /api/eda` returns basic stats, smoker averages, regional averages, and correlation data.
- `GET /api/feature-importance` returns ranked feature importances from the Random Forest model.
- `GET /api/model-results` returns the benchmark metrics for the compared models.
- `POST /api/predict` accepts `age`, `sex`, `bmi`, `children`, `smoker`, and `region`, then returns the predicted charge.

## Requirements

- Python 3.10 or newer.
- Node.js 18 or newer.
- npm.

## Setup And Run

Run the backend and frontend in separate terminals.

### 1. Train The Model

If `backend/best_insurance_model.pkl` does not exist, generate it from the root of the repository:

```bash
python advanced_medical_insurance_pipeline.py
```

This script saves `best_insurance_model.pkl` in the current folder. After it finishes, copy that file into `backend/` so the Flask app can load it.

### 2. Start The Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend runs at `http://localhost:5000`.

### 3. Start The Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

The Vite dev server proxies requests from `/api` to `http://localhost:5000`, so the frontend can talk to the backend without extra configuration.

## Prediction Flow

1. The user opens the React app.
2. The frontend calls the Flask API through the `/api` proxy.
3. The backend validates the request payload.
4. The backend engineers the same features used during training.
5. The trained model returns a predicted annual insurance cost in LKR.

## Data And Model Notes

- The dataset is based on `insurance.csv`, which contains age, sex, BMI, children, smoker status, region, and charges.
- The training pipeline performs simple feature engineering with `bmi_category`, `is_obese`, and `age_bmi_interaction`.
- The pipeline compares Linear Regression, KNN, Random Forest, and SVR.
- The backend currently loads a Random Forest-based model for feature importance.

## Troubleshooting

- If the backend returns `Model is not available.`, confirm that `backend/best_insurance_model.pkl` exists.
- If the backend returns `Dataset is not available.`, confirm that `backend/insurance.csv` exists.
- If the frontend cannot reach the API, make sure the Flask server is running on port `5000` and the Vite server is running on port `5173`.
- If you regenerate the model, copy the new `best_insurance_model.pkl` into `backend/` before restarting the API.

## Useful Commands

```bash
# Train and export the model
python advanced_medical_insurance_pipeline.py

# Run the API
cd backend
python app.py

# Run the frontend
cd frontend
npm run dev

# Build the frontend for production
cd frontend
npm run build
```
