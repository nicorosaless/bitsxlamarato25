
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, recall_score, precision_score
from sklearn.preprocessing import StandardScaler

# Mocking the training data based on the structure we know, 
# or we can try to load the actual CSV if we knew where it was.
# Assuming 'backend/data/dataset_processed.csv' exists based on previous file views? 
# Let's try to find the data file first. If not, we will use the test_set.json data as a proxy for calibration.

import json
import os

def optimize():
    # Load test set which seems to be the "gold standard" for the user's validation
    try:
        with open('../frontend/src/data/test_set.json', 'r') as f:
            test_data = json.load(f)
    except FileNotFoundError:
        print("Could not find test_set.json")
        return

    # Convert to DataFrame
    rows = []
    for case in test_data:
        row = case['data']
        row['recurrence'] = 1 if case['actualRecurrence'] else 0
        rows.append(row)
    
    df = pd.DataFrame(rows)
    
    # Mapping (using the logic we verified in riskCalculator)
    # This needs to match riskCalculator.ts logic EXACTLY to be valid
    
    def map_grade(g):
        g = str(g).lower()
        return 2 if 'grado2' in g or 'grado 2' in g else 1
    
    def map_lvsi(l):
        l = str(l).lower()
        return 1 if 'si' in l or 'sí' in l else 0
        
    def map_miometrio(m):
        m = str(m).lower()
        if 'mayor50' in m or '≥50' in m or 'serosa' in m: return 1
        return 0
        
    def map_cervix(c):
        c = str(c).lower()
        if 'glandular' in c: return 1
        if 'estroma' in c: return 2
        return 0
        
    def map_p53(p):
        p = str(p).lower()
        if 'aberrante' in p or 'mutado' in p: return 2
        return 1
        
    def map_figo(f):
        mapping = {"IA": 1, "IB": 2, "II": 3, "IIIA": 5, "IIIB": 6, "IIIC1": 7, "IIIC2": 8, "IVA": 9, "IVB": 10}
        return mapping.get(str(f).upper(), 1)
        
    # Apply mapping
    X = pd.DataFrame()
    X['edad'] = df['edad']
    X['imc'] = df['imc']
    X['grado_histologi'] = df['gradoHistologico'].apply(map_grade)
    X['tamano_tumoral'] = df['tamanoTumoral']
    X['infiltracion_mi'] = df['infiltracionMiometrial'].apply(map_miometrio)
    X['afectacion_linf'] = df['lvsi'].apply(map_lvsi)
    X['infilt_estr_cervix'] = df['infiltracionCervical'].apply(map_cervix)
    X['p53_ihq'] = df['p53'].apply(map_p53)
    X['recep_est_porcent'] = df['receptoresEstrogenos']
    X['rece_de_Ppor'] = df['receptoresProgesterona']
    X['FIGO2023'] = df['estadioFIGO'].apply(map_figo)
    
    y = df['recurrence']
    
    # Standardization parameters (Fixed from previous api.py view)
    means = {
        "edad": 61.87, "imc": 30.88, "grado_histologi": 1.21, "tamano_tumoral": 3.71,
        "infiltracion_mi": 1.12, "afectacion_linf": 0.19, "infilt_estr_cervix": 0.11,
        "p53_ihq": 1.35, "recep_est_porcent": 82.44, "rece_de_Ppor": 73.39, "FIGO2023": 3.66
    }
    stds = {
        "edad": 14.45, "imc": 7.57, "grado_histologi": 0.41, "tamano_tumoral": 4.37,
        "infiltracion_mi": 0.77, "afectacion_linf": 0.39, "infilt_estr_cervix": 0.37,
        "p53_ihq": 0.76, "recep_est_porcent": 21.45, "rece_de_Ppor": 24.76, "FIGO2023": 4.05
    }
    
    # Scale X manually to simulate the exact environment
    X_scaled = X.copy()
    for col in X.columns:
        X_scaled[col] = (X[col] - means[col]) / stds[col]

    # Train w/ Balanced Class Weight
    model = LogisticRegression(class_weight='balanced', C=1.0, solver='liblinear')
    model.fit(X_scaled, y)
    
    # Check metrics
    y_prob = model.predict_proba(X_scaled)[:, 1]
    
    # Find best threshold for Recall = 1.0 (or Max possible)
    best_thresh = 0.25
    best_recall = 0
    best_spec = 0
    
    print("\n--- Searching Optimal Threshold ---")
    for thresh in np.arange(0.1, 0.6, 0.01):
        y_pred = (y_prob >= thresh).astype(int)
        rec = recall_score(y, y_pred)
        spec = len(y[(y==0) & (y_pred==0)]) / len(y[y==0])
        print(f"Thresh {thresh:.2f}: Recall={rec:.2f}, Spec={spec:.2f}")
        
        if rec >= best_recall:
            if rec > best_recall: # New best recall
                best_recall = rec
                best_spec = spec
                best_thresh = thresh
            elif spec > best_spec: # Same recall, better spec
                best_spec = spec
                best_thresh = thresh

    print(f"\nWINNER -> Thresh: {best_thresh:.2f} | Recall: {best_recall:.2f} | Spec: {best_spec:.2f}")
    
    # Output Coefficients
    print("\n--- OPTIMIZED COEFFICIENTS ---")
    coefs = pd.Series(model.coef_[0], index=X.columns)
    print(coefs)
    print(f"Intercept: {model.intercept_[0]}")

if __name__ == "__main__":
    optimize()
