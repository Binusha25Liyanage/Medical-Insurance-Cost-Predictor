from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / 'insurance.csv'
MODEL_PATH = BASE_DIR / 'best_insurance_model.pkl'

MODEL_RESULTS = [
    {"model": "Linear Regression", "rmse": 4517.31, "mae": 3114.62, "r2": 0.792, "cv_r2": 0.781},
    {"model": "KNN", "rmse": 3825.47, "mae": 2678.11, "r2": 0.851, "cv_r2": 0.842},
    {"model": "Random Forest", "rmse": 2601.00, "mae": 1734.29, "r2": 0.956, "cv_r2": 0.948},
    {"model": "SVR", "rmse": 4970.56, "mae": 3569.84, "r2": 0.763, "cv_r2": 0.751},
]

REQUIRED_FIELDS = {
    'age': int,
    'sex': str,
    'bmi': float,
    'children': int,
    'smoker': str,
    'region': str,
}

VALID_VALUES = {
    'sex': {'male', 'female'},
    'smoker': {'yes', 'no'},
    'region': {'southeast', 'southwest', 'northeast', 'northwest'},
}


def load_dataset() -> pd.DataFrame:
    if not DATASET_PATH.exists():
        raise FileNotFoundError('insurance.csv was not found in backend directory.')
    return pd.read_csv(DATASET_PATH)


def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError('best_insurance_model.pkl was not found in backend directory.')
    return joblib.load(MODEL_PATH)


try:
    df = load_dataset()
except Exception:
    df = None

try:
    model = load_model()
except Exception:
    model = None


@app.get('/api/health')
def health():
    return jsonify({'status': 'ok'})


@app.get('/api/dataset/overview')
def dataset_overview():
    if df is None:
        return jsonify({'error': 'Dataset is not available.'}), 500

    describe_df = df.describe(include='all').replace({np.nan: None})
    overview = {
        'total_rows': int(df.shape[0]),
        'total_columns': int(df.shape[1]),
        'column_names': df.columns.tolist(),
        'missing_values': {col: int(val) for col, val in df.isnull().sum().items()},
        'describe': describe_df.to_dict(),
    }
    return jsonify(overview)


@app.get('/api/eda')
def eda():
    if df is None:
        return jsonify({'error': 'Dataset is not available.'}), 500

    numeric_cols = ['age', 'bmi', 'charges']
    basic_stats = {}
    for col in numeric_cols:
        basic_stats[col] = {
            'mean': float(df[col].mean()),
            'median': float(df[col].median()),
            'std': float(df[col].std()),
        }

    smoker_avg = {
        key: float(value)
        for key, value in df.groupby('smoker')['charges'].mean().to_dict().items()
    }

    region_avg = {
        key: float(value)
        for key, value in df.groupby('region')['charges'].mean().to_dict().items()
    }

    corr_matrix = df.select_dtypes(include=['number']).corr().to_dict()
    corr_json = {
        row: {col: float(val) for col, val in cols.items()}
        for row, cols in corr_matrix.items()
    }

    return jsonify(
        {
            'basic_stats': basic_stats,
            'smoker_vs_non_smoker_avg_charges': smoker_avg,
            'charges_by_region': region_avg,
            'correlation_matrix': corr_json,
        }
    )


@app.get('/api/feature-importance')
def feature_importance():
    if model is None:
        return jsonify({'error': 'Model is not available.'}), 500

    try:
        pipeline = model.regressor_
        preprocessor = pipeline.named_steps['preprocessor']
        selector = pipeline.named_steps['selector']
        estimator = pipeline.named_steps['model']

        if estimator.__class__.__name__ != 'RandomForestRegressor':
            return jsonify({'error': 'Loaded model is not Random Forest.'}), 400

        all_features = preprocessor.get_feature_names_out()
        support_mask = selector.get_support()
        selected_features = all_features[support_mask]
        importances = estimator.feature_importances_

        pairs = [
            {'feature': feature, 'importance': float(importance)}
            for feature, importance in zip(selected_features, importances)
        ]
        pairs.sort(key=lambda x: x['importance'], reverse=True)

        return jsonify({'feature_importance': pairs})
    except Exception as exc:
        return jsonify({'error': f'Failed to compute feature importance: {exc}'}), 500


@app.get('/api/model-results')
def model_results():
    return jsonify({'models': MODEL_RESULTS})


def validate_payload(payload: dict):
    for field, field_type in REQUIRED_FIELDS.items():
        if field not in payload:
            return f'Missing required field: {field}'

        value = payload[field]
        if field_type in (int, float):
            try:
                float(value)
            except (TypeError, ValueError):
                return f'Invalid numeric value for {field}'
        elif not isinstance(value, str):
            return f'Invalid value type for {field}'

    age = int(payload['age'])
    bmi = float(payload['bmi'])
    children = int(payload['children'])

    if age <= 0 or age > 100:
        return 'Age must be between 1 and 100.'
    if bmi <= 0 or bmi > 60:
        return 'BMI must be greater than 0 and less than or equal to 60.'
    if children < 0 or children > 10:
        return 'Children must be between 0 and 10.'

    for field in ['sex', 'smoker', 'region']:
        if str(payload[field]).lower() not in VALID_VALUES[field]:
            return f'Invalid value for {field}. Allowed values: {sorted(VALID_VALUES[field])}'

    return None


@app.post('/api/predict')
def predict():
    if model is None:
        return jsonify({'error': 'Model is not available.'}), 500

    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({'error': 'Invalid JSON payload.'}), 400

    validation_error = validate_payload(payload)
    if validation_error:
        return jsonify({'error': validation_error}), 400

    try:
        age = int(payload['age'])
        sex = str(payload['sex']).lower()
        bmi = float(payload['bmi'])
        children = int(payload['children'])
        smoker = str(payload['smoker']).lower()
        region = str(payload['region']).lower()

        new_data = pd.DataFrame(
            [
                {
                    'age': age,
                    'sex': sex,
                    'bmi': bmi,
                    'children': children,
                    'smoker': smoker,
                    'region': region,
                }
            ]
        )

        new_data['bmi_category'] = pd.cut(
            new_data['bmi'],
            bins=[0, 18.5, 24.9, 29.9, 100],
            labels=['underweight', 'normal', 'overweight', 'obese'],
        )
        new_data['is_obese'] = (new_data['bmi'] >= 30).astype(int)
        new_data['age_bmi_interaction'] = new_data['age'] * new_data['bmi']

        prediction = float(model.predict(new_data)[0])

        return jsonify(
            {
                'predicted_charge': round(prediction, 2),
                'currency': 'USD',
                'inputs': {
                    'age': age,
                    'sex': sex,
                    'bmi': bmi,
                    'children': children,
                    'smoker': smoker,
                    'region': region,
                },
            }
        )
    except Exception as exc:
        return jsonify({'error': f'Prediction failed: {exc}'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
