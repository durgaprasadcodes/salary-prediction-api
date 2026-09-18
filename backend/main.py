from pathlib import Path
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal

app = FastAPI(
    title="India Salary Prediction API",
    description="Predicts total CTC based on role, location, education, and experience.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://salary-predictor-one.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------------------------
# Load the trained pipeline once at startup
# ----------------------------------------------------------------------
MODEL_PATH = Path(__file__).resolve().parent / "salary_model.pkl"

try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    raise RuntimeError(
        f"salary_model.pkl not found at {MODEL_PATH}. Run ml_model.py first to train and save the model."
    )

# ----------------------------------------------------------------------
# Request schema — mirrors the exact features the model was trained on
# ----------------------------------------------------------------------
class SalaryPredictionRequest(BaseModel):
    job_role: str = Field(..., example="Data Scientist")
    city: str = Field(..., example="Bangalore")
    education: Literal["BTech", "MTech", "MBA", "PhD"] = Field(..., example="BTech")
    college_tier: Literal["Tier 1", "Tier 2", "Tier 3"] = Field(..., example="Tier 1")
    industry: str = Field(..., example="FinTech")
    company_size: Literal["Startup", "Mid-size", "MNC"] = Field(..., example="MNC")
    years_experience: float = Field(..., ge=0, le=45, example=4)
    performance_rating: float = Field(..., ge=1, le=5, example=4.2)
    num_skills: int = Field(..., ge=0, example=6)


class SalaryPredictionResponse(BaseModel):
    predicted_total_ctc: float
    currency: str = "INR"
    note: str = (
        "Prediction reflects standard compensation packages. "
        "High-equity or outlier compensation structures are out of scope for this model."
    )


# ----------------------------------------------------------------------
# Prediction endpoint
# ----------------------------------------------------------------------
@app.post("/predict", response_model=SalaryPredictionResponse)
def predict_salary(request: SalaryPredictionRequest):
    try:
        import pandas as pd

        input_df = pd.DataFrame([request.model_dump()])

        pred_log = model.predict(input_df)
        pred_real = np.expm1(pred_log)[0]

        return SalaryPredictionResponse(predicted_total_ctc=round(float(pred_real), 2))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/")
def root():
    return {"message": "India Salary Prediction API is running. Visit /docs for usage."}