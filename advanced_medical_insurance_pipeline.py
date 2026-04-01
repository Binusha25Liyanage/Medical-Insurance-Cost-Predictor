
# ============================================================
# ADVANCED MEDICAL INSURANCE COST PREDICTION PIPELINE
# Coursework-friendly version
# Uses a REAL dataset: insurance.csv
# ============================================================

import warnings
warnings.filterwarnings("ignore")

import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler, FunctionTransformer
from sklearn.feature_selection import SelectKBest, mutual_info_regression
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.compose import TransformedTargetRegressor

# -----------------------------
# 1. LOAD REAL DATASET
# -----------------------------
# Put insurance.csv in the same folder as this script
df = pd.read_csv("insurance.csv")

print("First 5 rows:")
print(df.head())

print("\nDataset shape:", df.shape)
print("\nMissing values:")
print(df.isnull().sum())

# -----------------------------
# 2. SIMPLE FEATURE ENGINEERING
# -----------------------------
# These make the project a bit more advanced than the original notebook
df["bmi_category"] = pd.cut(
    df["bmi"],
    bins=[0, 18.5, 24.9, 29.9, 100],
    labels=["underweight", "normal", "overweight", "obese"]
)
df["is_obese"] = (df["bmi"] >= 30).astype(int)
df["age_bmi_interaction"] = df["age"] * df["bmi"]

# -----------------------------
# 3. TRAIN / TEST SPLIT
# -----------------------------
X = df.drop("charges", axis=1)
y = df["charges"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

numeric_features = X.select_dtypes(include=["int64", "float64"]).columns.tolist()
categorical_features = X.select_dtypes(include=["object", "category"]).columns.tolist()

# -----------------------------
# 4. PREPROCESSING
# -----------------------------
numeric_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(handle_unknown="ignore"))
])

preprocessor = ColumnTransformer(transformers=[
    ("num", numeric_transformer, numeric_features),
    ("cat", categorical_transformer, categorical_features)
])

# -----------------------------
# 5. FEATURE SELECTION
# -----------------------------
# SelectKBest satisfies the coursework feature engineering requirement
feature_selector = SelectKBest(score_func=mutual_info_regression, k="all")

# -----------------------------
# 6. MODELS
# -----------------------------
models = {
    "Linear Regression": TransformedTargetRegressor(
        regressor=Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("selector", feature_selector),
            ("model", LinearRegression())
        ]),
        func=np.log1p,
        inverse_func=np.expm1
    ),

    "KNN": TransformedTargetRegressor(
        regressor=Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("selector", feature_selector),
            ("model", KNeighborsRegressor())
        ]),
        func=np.log1p,
        inverse_func=np.expm1
    ),

    "Random Forest": TransformedTargetRegressor(
        regressor=Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("selector", feature_selector),
            ("model", RandomForestRegressor(random_state=42))
        ]),
        func=np.log1p,
        inverse_func=np.expm1
    ),

    "SVR": TransformedTargetRegressor(
        regressor=Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("selector", feature_selector),
            ("model", SVR())
        ]),
        func=np.log1p,
        inverse_func=np.expm1
    )
}

# -----------------------------
# 7. HYPERPARAMETER TUNING
# -----------------------------
param_grids = {
    "KNN": {
        "regressor__selector__k": [8, 10, "all"],
        "regressor__model__n_neighbors": [3, 5, 7, 9, 11],
        "regressor__model__weights": ["uniform", "distance"],
        "regressor__model__p": [1, 2]
    },
    "Random Forest": {
        "regressor__selector__k": [8, 10, "all"],
        "regressor__model__n_estimators": [100, 200],
        "regressor__model__max_depth": [None, 10, 20],
        "regressor__model__min_samples_split": [2, 5],
        "regressor__model__min_samples_leaf": [1, 2]
    },
    "SVR": {
        "regressor__selector__k": [8, 10, "all"],
        "regressor__model__kernel": ["rbf", "linear"],
        "regressor__model__C": [1, 10, 50],
        "regressor__model__epsilon": [0.1, 0.5, 1.0]
    }
}

best_models = {}
results = []
predictions = {}

for name, model in models.items():
    print(f"\nTraining {name} ...")

    if name in param_grids:
        search = GridSearchCV(
            estimator=model,
            param_grid=param_grids[name],
            cv=5,
            scoring="r2",
            n_jobs=-1
        )
        search.fit(X_train, y_train)
        best_model = search.best_estimator_
        print("Best parameters:", search.best_params_)
        print("Best CV R²:", round(search.best_score_, 4))
    else:
        model.fit(X_train, y_train)
        best_model = model

    best_models[name] = best_model

    y_pred = best_model.predict(X_test)
    predictions[name] = y_pred

    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    cv_r2 = cross_val_score(best_model, X_train, y_train, cv=5, scoring="r2").mean()

    results.append({
        "Model": name,
        "RMSE": rmse,
        "MAE": mae,
        "R2": r2,
        "CV_R2": cv_r2
    })

# -----------------------------
# 8. MODEL COMPARISON
# -----------------------------
results_df = pd.DataFrame(results).sort_values(by="R2", ascending=False)
print("\nModel Comparison:")
print(results_df)

best_model_name = results_df.iloc[0]["Model"]
best_model = best_models[best_model_name]
print(f"\nBest model: {best_model_name}")

# -----------------------------
# 9. VISUALIZATION
# -----------------------------
plt.figure(figsize=(8, 5))
plt.bar(results_df["Model"], results_df["R2"])
plt.title("Model Comparison by R²")
plt.ylabel("R² Score")
plt.xticks(rotation=15)
plt.tight_layout()
plt.savefig("model_r2_comparison.png", dpi=150)
plt.close()

plt.figure(figsize=(6, 6))
best_pred = predictions[best_model_name]
plt.scatter(y_test, best_pred, alpha=0.6)
line_min = min(y_test.min(), best_pred.min())
line_max = max(y_test.max(), best_pred.max())
plt.plot([line_min, line_max], [line_min, line_max], "r--")
plt.xlabel("Actual Charges")
plt.ylabel("Predicted Charges")
plt.title(f"Actual vs Predicted - {best_model_name}")
plt.tight_layout()
plt.savefig("best_model_actual_vs_predicted.png", dpi=150)
plt.close()

# -----------------------------
# 10. IMPORTANT FEATURES
# -----------------------------
if best_model_name == "Random Forest":
    fitted_pipeline = best_model.regressor_
    feature_names = fitted_pipeline.named_steps["preprocessor"].get_feature_names_out()
    importances = fitted_pipeline.named_steps["model"].feature_importances_

    feature_importance_df = pd.DataFrame({
        "Feature": feature_names,
        "Importance": importances
    }).sort_values(by="Importance", ascending=False)

    print("\nTop 10 Important Features:")
    print(feature_importance_df.head(10))

    plt.figure(figsize=(8, 5))
    top10 = feature_importance_df.head(10).sort_values(by="Importance")
    plt.barh(top10["Feature"], top10["Importance"])
    plt.title("Top 10 Important Features - Random Forest")
    plt.tight_layout()
    plt.savefig("feature_importance.png", dpi=150)
    plt.close()

# -----------------------------
# 11. SAVE MODEL
# -----------------------------
joblib.dump(best_model, "best_insurance_model.pkl")
print("\nSaved best model as best_insurance_model.pkl")

# -----------------------------
# 12. SIMPLE DEPLOYMENT FUNCTION
# -----------------------------
def predict_insurance_cost(age, sex, bmi, children, smoker, region):
    new_data = pd.DataFrame([{
        "age": age,
        "sex": sex,
        "bmi": bmi,
        "children": children,
        "smoker": smoker,
        "region": region
    }])

    new_data["bmi_category"] = pd.cut(
        new_data["bmi"],
        bins=[0, 18.5, 24.9, 29.9, 100],
        labels=["underweight", "normal", "overweight", "obese"]
    )
    new_data["is_obese"] = (new_data["bmi"] >= 30).astype(int)
    new_data["age_bmi_interaction"] = new_data["age"] * new_data["bmi"]

    prediction = best_model.predict(new_data)[0]
    return round(prediction, 2)

# Example prediction
example = predict_insurance_cost(
    age=35,
    sex="female",
    bmi=28.5,
    children=2,
    smoker="no",
    region="southeast"
)

print("\nExample predicted insurance charge:", example)
