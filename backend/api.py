"""
NEST - FastAPI Backend
API for NSMP Endometrial Cancer Risk Prediction

Hospital de la Santa Creu i Sant Pau
BitsxlaMarató 2024
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import numpy as np
from pathlib import Path
import pickle
import json
from model import NESTPredictionModel

# Global model instance
nest_model = None

app = FastAPI(
    title="NEST API",
    description="NSMP Endometrial Stratification Tool - Risk Prediction API",
    version="1.0.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
MODEL_PATH = Path(__file__).parent / "models"

@app.on_event("startup")
async def load_model():
    global nest_model
    try:
        # Intentar cargar modelo existente
        model_file = MODEL_PATH / "nest_model_logistic.pkl"
        if model_file.exists():
            nest_model = NESTPredictionModel.load(model_file)
            print("✅ Modelo KNN/Survival cargado correctamente")
        else:
            print("⚠️ No se encontró modelo entrenado. Entrenando uno nuevo...")
            # Entrenar de cero si no existe (puede tardar un poco)
            from model import train_all_models
            nest_model, _ = train_all_models()
    except Exception as e:
        print(f"❌ Error cargando modelo: {e}")

# Model coefficients (from trained logistic regression)
COEFFICIENTS = {
    "edad": 0.002487,
    "imc": -0.452144,
    "grado_histologi": 1.385758,
    "tamano_tumoral": -0.107411,
    "infiltracion_mi": 0.202808,
    "afectacion_linf": 0.470714,
    "infilt_estr_cervix": 0.517998,
    "p53_ihq": 0.063002,
    "recep_est_porcent": -0.902802,
    "rece_de_Ppor": 1.371104,
    "FIGO2023": 0.093779,
}

INTERCEPT = -1.027270

MEANS = {
    "edad": 61.87,
    "imc": 30.88,
    "grado_histologi": 1.21,
    "tamano_tumoral": 3.71,
    "infiltracion_mi": 1.12,
    "afectacion_linf": 0.19,
    "infilt_estr_cervix": 0.11,
    "p53_ihq": 1.35,
    "recep_est_porcent": 82.44,
    "rece_de_Ppor": 73.39,
    "FIGO2023": 3.66,
}

STDS = {
    "edad": 14.45,
    "imc": 7.57,
    "grado_histologi": 0.41,
    "tamano_tumoral": 4.37,
    "infiltracion_mi": 0.77,
    "afectacion_linf": 0.39,
    "infilt_estr_cervix": 0.37,
    "p53_ihq": 0.76,
    "recep_est_porcent": 21.45,
    "rece_de_Ppor": 24.76,
    "FIGO2023": 4.05,
}


class PatientData(BaseModel):
    """Input data for risk prediction."""
    edad: int = Field(..., ge=18, le=100, description="Age in years")
    imc: float = Field(..., ge=15, le=60, description="BMI in kg/m²")
    grado_histologi: int = Field(..., ge=1, le=2, description="Histological grade (1=Low, 2=High)")
    tamano_tumoral: float = Field(..., ge=0, le=20, description="Tumor size in cm")
    infiltracion_mi: int = Field(..., ge=0, le=3, description="Myometrial infiltration (0=No, 1=<50%, 2=≥50%, 3=Serosa)")
    afectacion_linf: int = Field(..., ge=0, le=1, description="LVSI (0=No, 1=Yes)")
    infilt_estr_cervix: int = Field(..., ge=0, le=2, description="Cervical infiltration (0=No, 1=Glandular, 2=Stromal)")
    p53_ihq: int = Field(..., ge=1, le=3, description="p53 IHQ (1=Normal, 2=Aberrant, 3=NA)")
    recep_est_porcent: float = Field(..., ge=0, le=100, description="Estrogen receptors %")
    rece_de_Ppor: float = Field(..., ge=0, le=100, description="Progesterone receptors %")
    FIGO2023: int = Field(..., ge=1, le=10, description="FIGO 2023 stage (1=IA to 10=IVB)")


class RiskFactor(BaseModel):
    """Individual risk factor."""
    name: str
    value: str
    impact: str  # "alto", "medio", "bajo"


class PredictionResult(BaseModel):
    """Risk prediction result."""
    probability: float
    probability_percent: float
    risk_group: str
    risk_color: str
    risk_factors: List[str]
    recommendations: List[str]
    model_info: dict


def sigmoid(x: float) -> float:
    """Sigmoid function."""
    return 1 / (1 + np.exp(-x))


def predict_risk(data: PatientData) -> PredictionResult:
    """Predict recurrence risk using logistic regression model."""
    
    # Create feature dict
    features = {
        "edad": data.edad,
        "imc": data.imc,
        "grado_histologi": data.grado_histologi,
        "tamano_tumoral": data.tamano_tumoral,
        "infiltracion_mi": data.infiltracion_mi,
        "afectacion_linf": data.afectacion_linf,
        "infilt_estr_cervix": data.infilt_estr_cervix,
        "p53_ihq": data.p53_ihq,
        "recep_est_porcent": data.recep_est_porcent,
        "rece_de_Ppor": data.rece_de_Ppor,
        "FIGO2023": data.FIGO2023,
    }
    
    # Calculate logit
    logit = INTERCEPT
    for feature, coef in COEFFICIENTS.items():
        standardized = (features[feature] - MEANS[feature]) / STDS[feature]
        logit += coef * standardized
    
    # Calculate probability
    probability = sigmoid(logit)
    probability_percent = round(probability * 100, 1)
    
    # Determine risk group
    if probability < 0.10:
        risk_group = "Bajo"
        risk_color = "#10B981"
        recommendations = [
            "Seguimiento clínico estándar cada 6 meses durante 2 años",
            "Citología vaginal anual",
            "No requiere tratamiento adyuvante",
            "Educación sobre síntomas de alarma",
        ]
    elif probability < 0.25:
        risk_group = "Intermedio"
        risk_color = "#F59E0B"
        recommendations = [
            "Considerar braquiterapia vaginal adyuvante",
            "Seguimiento cada 3-4 meses durante 2 años",
            "Ecografía o TC pélvica cada 6-12 meses",
            "Marcadores tumorales si elevados al diagnóstico",
        ]
    elif probability < 0.50:
        risk_group = "Alto"
        risk_color = "#EF4444"
        recommendations = [
            "Radioterapia pélvica externa ± braquiterapia",
            "Considerar quimioterapia adyuvante (carboplatino/paclitaxel)",
            "Seguimiento intensivo cada 3 meses",
            "TC toraco-abdomino-pélvica cada 3-6 meses",
            "Derivación a comité de tumores ginecológicos",
        ]
    else:
        risk_group = "Muy Alto"
        risk_color = "#7C3AED"
        recommendations = [
            "Tratamiento multimodal obligatorio (RT + QT)",
            "Quimioterapia sistémica con carboplatino/paclitaxel",
            "Radioterapia pélvica con campos extendidos si indicado",
            "Seguimiento mensual durante el primer año",
            "Considerar ensayos clínicos con inmunoterapia",
            "Evaluación multidisciplinar urgente",
        ]
    
    # Identify risk factors
    risk_factors = []
    
    if data.grado_histologi == 2:
        risk_factors.append("Grado histológico alto (Grado 2)")
    
    if data.FIGO2023 >= 5:
        figo_names = {5: "IIIA", 6: "IIIB", 7: "IIIC1", 8: "IIIC2", 9: "IVA", 10: "IVB"}
        risk_factors.append(f"Estadio FIGO avanzado ({figo_names.get(data.FIGO2023, data.FIGO2023)})")
    
    if data.tamano_tumoral > 5:
        risk_factors.append(f"Tamaño tumoral grande ({data.tamano_tumoral} cm)")
    
    if data.imc >= 35:
        risk_factors.append(f"Obesidad severa (IMC {data.imc})")
    
    if data.afectacion_linf == 1:
        risk_factors.append("Invasión linfovascular presente (LVSI+)")
    
    if data.infiltracion_mi >= 2:
        risk_factors.append("Infiltración miometrial profunda (≥50%)")
    
    if data.infilt_estr_cervix == 2:
        risk_factors.append("Infiltración estromal cervical")
    
    if data.p53_ihq == 2:
        risk_factors.append("p53 aberrante")
    
    if data.recep_est_porcent < 10:
        risk_factors.append("Receptores de estrógenos bajos (<10%)")
    
    if data.rece_de_Ppor < 10:
        risk_factors.append("Receptores de progesterona bajos (<10%)")
    
    if data.edad > 75:
        risk_factors.append(f"Edad avanzada ({data.edad} años)")
    
    if not risk_factors:
        risk_factors.append("Sin factores de riesgo significativos identificados")
    
    return PredictionResult(
        probability=float(probability),
        probability_percent=probability_percent,
        risk_group=risk_group,
        risk_color=risk_color,
        risk_factors=risk_factors,
        recommendations=recommendations,
        model_info={
            "name": "NEST v1.0",
            "type": "Logistic Regression",
            "auc_roc": 0.933,
            "accuracy": 0.923,
            "cohort_size": 154,
            "recurrence_rate": 0.188,
        }
    )


@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "name": "NEST API",
        "version": "1.0.0",
        "description": "NSMP Endometrial Stratification Tool",
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "model_info": "/model-info",
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "model": "loaded"}


@app.get("/model-info")
async def model_info():
    """Get model information."""
    return {
        "name": "NEST v1.0",
        "type": "Logistic Regression",
        "auc_roc": 0.933,
        "accuracy": 0.923,
        "f1_score": 0.800,
        "cohort_size": 154,
        "recurrence_rate": 0.188,
        "features": list(COEFFICIENTS.keys()),
        "training_date": "2024-12-13",
        "hospital": "Hospital de la Santa Creu i Sant Pau",
    }


@app.post("/predict", response_model=PredictionResult)
async def predict(patient: PatientData):
    """Predict recurrence risk for a patient."""
    try:
        result = predict_risk(patient)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/batch")
async def predict_batch(patients: List[PatientData]):
    """Predict recurrence risk for multiple patients."""
    try:
        results = [predict_risk(p) for p in patients]
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/similar-patients")
async def get_similar_patients(patient: PatientData):
    """Find similar patients in historical data."""
    if nest_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    try:
        # Convert Pydantic model to dict
        patient_dict = patient.dict()
        similar = nest_model.find_similar_patients(patient_dict)
        return {"similar_patients": similar}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/survival-curve")
async def get_survival_curve(patient: PatientData):
    """Get personalized survival curve."""
    if nest_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    try:
        # Convert Pydantic model to dict
        patient_dict = patient.dict()
        survival = nest_model.predict_survival_curve(patient_dict)
    except Exception as e:
        print(f"Error in prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    if survival is None:
            # Return empty/null response instead of 404/500 to let frontend handle it gracefully
            return None 
            
    return survival


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
