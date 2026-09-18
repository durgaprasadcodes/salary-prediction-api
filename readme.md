# India Salary Prediction (Total CTC)

A regression project predicting total compensation (CTC) for tech/professional roles in India, based on role, location, education, experience, and company attributes.

## Overview

This project trains and compares multiple regression models (Linear Regression, Decision Tree, Random Forest, Gradient Boosting) to predict `total_ctc` from a synthetic Indian salary dataset, then serves the best model through a small FastAPI prediction endpoint.

## Dataset

- **Source:** `india_realistic_salary_dataset.csv` (7,000 rows)
- **Target:** `total_ctc`
- **Features used:**
  - Categorical (one-hot): `job_role`, `city`, `industry`, `company_size`
  - Categorical (ordinal): `education` (BTech < MTech < MBA < PhD), `college_tier` (Tier 3 < Tier 2 < Tier 1)
  - Numerical: `years_experience`, `performance_rating`, `num_skills`

## Data Cleaning Note

105 records (1.5%) showed `total_ctc` substantially exceeding `base_salary + bonus`, likely reflecting equity/stock compensation or other components not captured as separate features in this dataset. These were excluded from training and evaluation as out-of-scope outliers. The model is trained and evaluated only on the remaining 6,895 "standard" compensation records.

## Preprocessing

- Missing values handled via `SimpleImputer` (most-frequent for categorical, median for numeric) inside the pipeline — fitted only on training data to avoid leakage.
- Target transformed with `log1p` to correct for right-skew in the salary distribution; predictions are converted back with `expm1` before evaluation.

## Results (on clean, held-out test data)

| Model              | MAE      | RMSE     | R²    | CV R² (mean) |
|--------------------|----------|----------|-------|--------------|
| Linear Regression  | ₹225,532 | ₹288,669 | 0.876 | 0.873        |
| Gradient Boosting  | ₹246,746 | ₹322,274 | 0.846 | 0.846        |
| Random Forest      | ₹293,140 | ₹388,821 | 0.776 | 0.776        |
| Decision Tree      | ₹457,707 | ₹593,819 | 0.477 | 0.485        |

**Best model: Linear Regression** — the underlying salary relationship (education, experience, role, etc. contributing roughly additively to log-CTC) turned out to be close to linear once outlier rows were removed, so it outperformed the tree-based ensembles.

## Limitations

- Predictions are unreliable for high-equity/outlier compensation packages (~1.5% of real-world cases), since no feature captures stock/equity components.
- `gender` and `age` columns exist in the raw dataset but were deliberately excluded as model inputs to avoid encoding protected-attribute bias into predictions.

## Project Structure
```text

backend/
├── main.py                         # Training script: preprocessing, model comparison, evaluation
├── ml_model.py                          # FastAPI prediction service
├── salary_model.pkl                # Serialized best-performing pipeline
└── india_realistic_salary_dataset.csv

```


## Running

**Train the model:**
```bash
python main.py
```

**Run the API:**
```bash
uvicorn api:app --reload
```

Then visit `http://127.0.0.1:8000/docs` for interactive Swagger UI.

## Tech Stack

Python, pandas, scikit-learn, FastAPI, matplotlib