import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

# ----------------------------------------------------------------------
# Load dataset
# ----------------------------------------------------------------------
file_path = r"C:\Users\rolex\OneDrive\Desktop\House Price Prediction\backend\india_realistic_salary_dataset.csv"
df = pd.read_csv(file_path)

# ----------------------------------------------------------------------
# Flag and remove rows with unexplained compensation (likely equity/stock
# components not captured as separate columns in this dataset)
# ----------------------------------------------------------------------

df["residual"] = df["total_ctc"] - (df["base_salary"] + df["bonus"])
df["is_clean"] = df["residual"].abs() < 1000

df_clean = df[df["is_clean"]].copy()


# ----------------------------------------------------------------------
# Features / target
# ----------------------------------------------------------------------

features = [
    "job_role", "city", "education", "college_tier", "industry",
    "company_size", "years_experience", "performance_rating", "num_skills"
]
target = "total_ctc"

X, y = df_clean[features], df_clean[target]

# Log-transform the target to handle right-skew
y_log = np.log1p(y)

# ----------------------------------------------------------------------
# Train-test split
# ----------------------------------------------------------------------
X_train, X_test, y_train_log, y_test_log = train_test_split(
    X, y_log, test_size=0.3, random_state=42
)

y_test_real = np.expm1(y_test_log)  # real-₹ scale, for interpretable metrics

# ----------------------------------------------------------------------
# Preprocessing
# ----------------------------------------------------------------------
categorical_onehot = ["job_role", "city", "industry", "company_size"]
categorical_ordinal = ["education", "college_tier"]
numerical_features = ["years_experience", "performance_rating", "num_skills"]

education_order = ["BTech", "MTech", "MBA", "PhD"]
college_tier_order = ["Tier 3", "Tier 2", "Tier 1"]

preprocessor = ColumnTransformer(
    transformers=[
        ("onehot", Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
        ]), categorical_onehot),

        ("ordinal", Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OrdinalEncoder(
                categories=[education_order, college_tier_order],
                handle_unknown="use_encoded_value", unknown_value=-1
            ))
        ]), categorical_ordinal),

        ("numeric", SimpleImputer(strategy="median"), numerical_features)
    ],
    remainder="drop"
)

# ----------------------------------------------------------------------
# Models
# ----------------------------------------------------------------------

model = Pipeline(steps=[
    ("preprocessor",preprocessor),
    ("model",LinearRegression())
])

model.fit(X_train, y_train_log)


import joblib
joblib.dump(model,"salary_model.pkl")