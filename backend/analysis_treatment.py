
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, classification_report
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler

# Load data
df = pd.read_csv('data/endometrio_data.csv')
print(f"Total columns: {len(df.columns)}")

# Filter valid recurrence data
df_model = df[df['recidiva'].isin([0, 1])].copy()
print(f"Valid rows: {len(df_model)}")

# Treatment variables of interest
treatment_vars = [
    'tto_1_quirugico', 'abordajeqx', 'tec_linf_pelv', 'tec_linf_para', # Surgical
    'rdt', 'bqt', 'qt', # Adjuvant (Binary mostly)
    'tto_NA' # Neoadjuvant
]

# Check existing columns
existing_vars = [col for col in treatment_vars if col in df_model.columns]
print(f"Found treatment variables: {existing_vars}")

# EDA of Treatment Variables vs Recurrence
for col in existing_vars:
    print(f"\n--- {col} ---")
    print(df_model[col].value_counts(dropna=False))
    # Crosstab with recurrence
    ct = pd.crosstab(df_model[col], df_model['recidiva'], normalize='index')
    print("Recurrence Rate by Category:")
    print(ct)

# Prepare Base Features (Current Model)
base_features = [
    'edad', 'imc', 'grado_histologi', 'tamano_tumoral', 
    'infiltracion_mi', 'afectacion_linf', 'infilt_estr_cervix', 
    'p53_ihq', 'recep_est_porcent', 'rece_de_Ppor', 'FIGO2023'
]

# MMR imputation (as done previously)
mmr_cols = ['msh2', 'msh6', 'pms2', 'mlh1']
if all(col in df_model.columns for col in mmr_cols):
    df_model['mmr_deficient'] = (df_model[mmr_cols] == 2).any(axis=1).astype(int)
    base_features.append('mmr_deficient')
else:
    print("MMR columns not found")

# Preprocessing for Base Model
X_base = df_model[base_features].copy()
y = df_model['recidiva']

# Impute and Scale Base
imputer = SimpleImputer(strategy='median')
scaler = StandardScaler()

X_base_imp = pd.DataFrame(imputer.fit_transform(X_base), columns=X_base.columns)
X_base_scaled = scaler.fit_transform(X_base_imp)

# Baseline Model Performance
model_base = LogisticRegression(random_state=42, max_iter=1000, class_weight='balanced')
scores_base = cross_val_score(model_base, X_base_scaled, y, cv=5, scoring='roc_auc')
print(f"\nBASE Model CV AUC: {scores_base.mean():.4f} (+/- {scores_base.std()*2:.4f})")

# Testing Adding Treatments
# We need to clean treatment vars first. Many might be NaN meaning "No" or actually missing.
# For simplicity in this test, we will assume NaN in binary treatment cols (rdt, bqt, qt) means 0 (No).
# For categorical (abordajeqx), we might need one-hot encoding or labeling.

def clean_treatment_vars(df):
    d = df.copy()
    # Binary treatments: 1=Yes, 0=No. Check unique values first
    binary_treats = ['rdt', 'bqt', 'qt', 'tto_NA']
    for col in binary_treats:
        if col in d.columns:
            # Assume NaN is 0 if mostly 0s and 1s
            d[col] = d[col].fillna(0).astype(int)
    
    return d

df_treat = clean_treatment_vars(df_model)
treatment_candidates = ['rdt', 'bqt', 'qt'] # Let's focus on adjuvant first
valid_candidates = [c for c in treatment_candidates if c in df_treat.columns]

X_treat = pd.concat([X_base_imp, df_treat[valid_candidates].reset_index(drop=True)], axis=1)
X_treat_scaled = scaler.fit_transform(X_treat)

# Treatments Model Performance
model_treat = LogisticRegression(random_state=42, max_iter=1000, class_weight='balanced')
scores_treat = cross_val_score(model_treat, X_treat_scaled, y, cv=5, scoring='roc_auc')
print(f"TREATMENT Model CV AUC: {scores_treat.mean():.4f} (+/- {scores_treat.std()*2:.4f})")

# Feature Importance of Treatment Model
model_treat.fit(X_treat_scaled, y)
importance = pd.DataFrame({
    'feature': list(X_base.columns) + valid_candidates,
    'coef': model_treat.coef_[0]
}).sort_values(by='coef', ascending=False, key=abs)

print("\nFeature Importance (with treatments):")
print(importance)

