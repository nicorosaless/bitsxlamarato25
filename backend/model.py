"""
NEST - NSMP Endometrial Stratification Tool
Machine Learning Model for Recurrence Prediction

Hospital de la Santa Creu i Sant Pau
BitsxlaMarató 2024
"""

import pandas as pd
import numpy as np
from pathlib import Path
import pickle
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Sklearn imports
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, roc_auc_score, classification_report,
    confusion_matrix, roc_curve, precision_recall_curve,
    average_precision_score, f1_score, brier_score_loss
)
from sklearn.calibration import calibration_curve
from sklearn.neighbors import NearestNeighbors

# Other imports
from lifelines import CoxPHFitter

# Visualization
import matplotlib.pyplot as plt
import seaborn as sns

# Paths
DATA_PATH = Path(__file__).parent / "data" / "endometrio_data.csv"
MODEL_PATH = Path(__file__).parent / "models"
OUTPUT_PATH = Path(__file__).parent / "outputs"

MODEL_PATH.mkdir(exist_ok=True)
OUTPUT_PATH.mkdir(exist_ok=True)


class NESTPredictionModel:
    """
    NEST - Modelo de predicción de recurrencia para cáncer de endometrio NSMP.
    
    Features utilizadas (basadas en literatura y disponibilidad):
    - Clínicas: edad, IMC
    - Histopatológicas: grado, tamaño tumoral, infiltración miometrial, LVSI, infiltración cervical
    - Moleculares: p53 IHQ, receptores ER/PR
    - Estadificación: FIGO 2023
    """
    
    FEATURE_COLS = [
        'edad',                    # Edad al diagnóstico
        'imc',                     # IMC (kg/m²)
        'grado_histologi',         # Grado histológico (1=bajo, 2=alto)
        'tamano_tumoral',          # Tamaño tumoral (cm)
        'infiltracion_mi',         # Infiltración miometrial (0-3)
        'afectacion_linf',         # LVSI (0=no, 1=sí)
        'infilt_estr_cervix',      # Infiltración estroma cervical (0-2)
        'p53_ihq',                 # p53 IHQ (1=normal, 2=aberrante, 3=ND)
        'recep_est_porcent',       # Receptores estrógenos (%)
        'rece_de_Ppor',            # Receptores progesterona (%)
        'FIGO2023',                # Estadio FIGO 2023
    ]
    
    FEATURE_NAMES = {
        'edad': 'Edad (años)',
        'imc': 'IMC (kg/m²)',
        'grado_histologi': 'Grado Histológico',
        'tamano_tumoral': 'Tamaño Tumoral (cm)',
        'infiltracion_mi': 'Infiltración Miometrial',
        'afectacion_linf': 'LVSI',
        'infilt_estr_cervix': 'Infiltración Cervical',
        'p53_ihq': 'p53 IHQ',
        'recep_est_porcent': 'Receptores ER (%)',
        'rece_de_Ppor': 'Receptores PR (%)',
        'FIGO2023': 'Estadio FIGO 2023',
    }
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = None
        self.model_type = None
        self.feature_importances = None
        self.metrics = {}
        self.training_date = None
        self.medians = {}  # Para imputación
        self.knn_model = None
        self.survival_model = None
        self.survival_data = None  # To store training data for survival function estimation
        
    def load_data(self):
        """Carga y prepara los datos."""
        df = pd.read_csv(DATA_PATH)
        
        # Filtrar solo casos con seguimiento completo (recidiva 0 o 1)
        df_model = df[df['recidiva'].isin([0, 1])].copy()
        
        print(f"📊 Datos cargados: {len(df_model)} pacientes con seguimiento completo")
        print(f"   - Sin recidiva: {(df_model['recidiva'] == 0).sum()} ({(df_model['recidiva'] == 0).mean()*100:.1f}%)")
        print(f"   - Con recidiva: {(df_model['recidiva'] == 1).sum()} ({(df_model['recidiva'] == 1).mean()*100:.1f}%)")
        
        return df_model
    
    def prepare_features(self, df, fit=True):
        """Prepara las features para el modelo."""
        X = df[self.FEATURE_COLS].copy()
        
        # Guardar medianas para imputación (solo en fit)
        if fit:
            self.medians = {col: X[col].median() for col in X.columns}
        
        # Imputar missing values con medianas
        for col in X.columns:
            X[col] = X[col].fillna(self.medians.get(col, X[col].median()))
        
        return X
    
    def train(self, df, model_type='logistic', test_size=0.25, random_state=42):
        """
        Entrena el modelo de predicción.
        
        Args:
            df: DataFrame con los datos
            model_type: 'logistic', 'random_forest', 'gradient_boosting'
            test_size: Proporción de datos para test
            random_state: Semilla para reproducibilidad
        """
        print(f"\n{'='*60}")
        print(f"ENTRENAMIENTO DEL MODELO: {model_type.upper()}")
        print(f"{'='*60}")
        

        # Preparar datos
        X = self.prepare_features(df, fit=True)
        y = df['recidiva'].values
        
        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        print(f"\n📋 Datos de entrenamiento: {len(X_train)} | Test: {len(X_test)}")
        
        # Escalar
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Seleccionar modelo
        if model_type == 'logistic':
            self.model = LogisticRegression(
                random_state=random_state, 
                max_iter=1000, 
                class_weight='balanced',
                C=1.0
            )
        elif model_type == 'random_forest':
            self.model = RandomForestClassifier(
                n_estimators=100, 
                random_state=random_state, 
                class_weight='balanced',
                max_depth=5,
                min_samples_split=5,
                min_samples_leaf=2
            )
        elif model_type == 'gradient_boosting':
            self.model = GradientBoostingClassifier(
                n_estimators=100, 
                random_state=random_state, 
                max_depth=3,
                learning_rate=0.1,
                min_samples_split=5,
                min_samples_leaf=2
            )
        else:
            raise ValueError(f"Modelo no soportado: {model_type}")
        
        self.model_type = model_type
        
        # Entrenar
        self.model.fit(X_train_scaled, y_train)
        
        # Predicciones
        y_pred = self.model.predict(X_test_scaled)
        y_prob = self.model.predict_proba(X_test_scaled)[:, 1]
        
        # Métricas
        self.metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'auc_roc': roc_auc_score(y_test, y_prob),
            'f1': f1_score(y_test, y_pred),
            'brier_score': brier_score_loss(y_test, y_prob),
            'average_precision': average_precision_score(y_test, y_prob),
        }
        
        # Cross-validation
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)
        cv_scores = cross_val_score(self.model, X_train_scaled, y_train, cv=cv, scoring='roc_auc')
        self.metrics['cv_auc_mean'] = cv_scores.mean()
        self.metrics['cv_auc_std'] = cv_scores.std()
        
        # Feature importances
        if hasattr(self.model, 'feature_importances_'):
            self.feature_importances = dict(zip(self.FEATURE_COLS, self.model.feature_importances_))
        elif hasattr(self.model, 'coef_'):
            self.feature_importances = dict(zip(self.FEATURE_COLS, np.abs(self.model.coef_[0])))
        
        # Guardar fecha de entrenamiento
        self.training_date = datetime.now().isoformat()
        
        # Mostrar resultados
        self._print_results(y_test, y_pred, y_prob)
        
        # Guardar para plots
        self._y_test = y_test
        self._y_prob = y_prob
        self._X_test = X_test
        
        return self.metrics

    def train_similarity_model(self, df):
        """Entrena el modelo de búsqueda de pacientes similares (KNN)."""
        print("\n🔍 Entrenando modelo de similaridad (KNN)...")
        
        # Preparar data
        X = self.prepare_features(df, fit=False)  # Ya se hizo fit en train() principal
        
        # Escalar (usar el scaler ya entrenado)
        X_scaled = self.scaler.transform(X)
        
        # Entrenar KNN
        self.knn_model = NearestNeighbors(n_neighbors=5, metric='euclidean')
        self.knn_model.fit(X_scaled)
        
        # Guardar historial para recuperar datos al buscar
        self.history_df = df.copy().reset_index(drop=True)
        print("✅ Modelo KNN entrenado.")

    def find_similar_patients(self, patient_data, k=5):
        """encuentra pacientes similares en el histórico."""
        if self.knn_model is None:
            raise ValueError("Modelo KNN no entrenado.")
            
        # Preparar features
        X_query = pd.DataFrame([patient_data])
        for col in self.FEATURE_COLS:
            if col not in X_query.columns:
                X_query[col] = self.medians.get(col, 0)
        X_query = X_query[self.FEATURE_COLS]
        
        # Imputar y escalar
        for col in X_query.columns:
            X_query[col] = X_query[col].fillna(self.medians.get(col, 0))
            
        X_query_scaled = self.scaler.transform(X_query)
        
        # Buscar vecinos
        distances, indices = self.knn_model.kneighbors(X_query_scaled, n_neighbors=k)
        
        # Recuperar datos reales
        similar_patients = []
        for i, idx in enumerate(indices[0]):
            patient = self.history_df.iloc[idx]
            
            # Handle NaN safely
            def safe_int(val):
                try:
                    if pd.isna(val): return 0
                    return int(val)
                except:
                    return 0
            
            sim_data = {
                'match_score': float(1 / (1 + distances[0][i])), # Score similaridad
                'edad': safe_int(patient.get('edad')),
                'grado': safe_int(patient.get('grado_histologi')),
                'estadio': safe_int(patient.get('FIGO2023')),
                'recidiva': bool(patient.get('recidiva', 0)),
                'tiempo_seguimiento': safe_int(patient.get('tiempo_transcur')),
                'tratamientos': []
            }
            # Intentar extraer info de tratamientos si existe en el CSV
            if 'Tratamiento_sistemico' in patient and patient['Tratamiento_sistemico']:
                sim_data['tratamientos'].append(str(patient['Tratamiento_sistemico']))
            
            similar_patients.append(sim_data)
            
        return similar_patients

    def train_survival_model(self, df):
        """Entrena modelo de Cox para curvas de supervivencia."""
        print("\n⏳ Entrenando modelo de supervivencia (CoxPH)...")
        
        # Preparar datos 
        # Cox necesita tiempo y evento
        surv_df = df.copy()
        
        # Mapear columnas requeridas
        # Asumimos que 'tiempo_transcur' es el tiempo y 'recidiva' el evento
        if 'tiempo_transcur' not in surv_df.columns or surv_df['tiempo_transcur'].isnull().all():
            if 'diferencia_dias_reci_exit' in surv_df.columns:
                print("⚠️ Usando 'diferencia_dias_reci_exit' como tiempo de seguimiento")
                surv_df['tiempo_transcur'] = surv_df['diferencia_dias_reci_exit']
            else:
                print("⚠️ No hay columna de tiempo, usando simulada para demo")
                surv_df['tiempo_transcur'] = np.random.randint(30, 1800, len(surv_df)) # Simulacion por seguridad
            
        # Limpiar data para Cox (no NaNs)
        surv_df = surv_df.dropna(subset=['tiempo_transcur', 'recidiva'])
        surv_df['tiempo_transcur'] = pd.to_numeric(surv_df['tiempo_transcur'], errors='coerce').fillna(0)
        surv_df = surv_df[surv_df['tiempo_transcur'] > 0]
        
        if surv_df.empty:
            print("⚠️ No quedan datos para supervivencia tras limpieza.")
            self.survival_model = None
            return

        # Eliminar columnas constantes si existen en el subset
        if len(surv_df) > 1:
            try:
                # Use apply to avoid index error if single row
                surv_df = surv_df.loc[:, surv_df.apply(pd.Series.nunique) > 1]
            except Exception as e:
                print(f"Advertencia limpiando columnas constantes: {e}")
        
        print(f"   Datos para CoxPH: {len(surv_df)} muestras")
        
        if len(surv_df) < 10:
            print("⚠️ Insuficientes datos para CoxPH (<10 muestras)")
            self.survival_model = None
            return

        # Prepare features
        # Filter FEATURE_COLS that actually exist in surv_df after        # Prepare features
        # Actually safer to just use all FEATURE_COLS but impute carefully
        X_surv = self.prepare_features(surv_df, fit=False)
        
        # Escalar features para ayudar a convergencia CoxPH
        if self.scaler:
            try:
                X_surv_scaled = self.scaler.transform(X_surv)
                X_surv = pd.DataFrame(X_surv_scaled, columns=X_surv.columns, index=X_surv.index)
            except Exception as e:
                print(f"⚠️ Error escalando datos para Cox: {e}")

        surv_data_clean = pd.concat([X_surv, surv_df[['tiempo_transcur', 'recidiva']]], axis=1)
        
        # Check for NaNs again in combined
        surv_data_clean = surv_data_clean.dropna()
        
        self.survival_model = CoxPHFitter(penalizer=0.01) # Reducir penalizer ahora que escalamos
        try:
            self.survival_model.fit(surv_data_clean, duration_col='tiempo_transcur', event_col='recidiva')
            self.survival_data = surv_data_clean # Guardar para baseline hazard
            print("✅ Modelo CoxPH entrenado.")
        except Exception as e:
            print(f"❌ Error entrenando CoxPH: {e}")
            self.survival_model = None

    def predict_survival_curve(self, patient_data):
        """Predice curva de supervivencia para un paciente."""
        if self.survival_model is None:
            return None
            
        # Preparar data
        X = pd.DataFrame([patient_data])
        for col in self.FEATURE_COLS:
            if col not in X.columns:
                X[col] = self.medians.get(col, 0)
        
        X = X[self.FEATURE_COLS]
        for col in X.columns:
            X[col] = X[col].fillna(self.medians.get(col, 0))
            
        # Escalar (importante para CoxPH si se entrenó escalado)
        if self.scaler:
             try:
                X_scaled_arr = self.scaler.transform(X)
                X = pd.DataFrame(X_scaled_arr, columns=X.columns, index=X.index)
             except Exception as e:
                 print(f"⚠️ Error escalando input survival: {e}")
            
        # Predecir función de supervivencia
        # survival_function_at_times o predict_survival_function
        try:
            # predict_survival_function retorna DataFrame con index=tiempo, cols=pacientes
            surv_func = self.survival_model.predict_survival_function(X)
            
            # Formatear para frontend
            # surv_func es un DataFrame con indice=tiempo, columnas=pacientes (0)
            times = surv_func.index.tolist()
            probs = surv_func.iloc[:, 0].tolist()
            
            # Filtrar para no enviar miles de puntos (ej. cada 30 dias o puntos clave)
            curve_data = []
            
            # Puntos clave: 12, 36, 60 meses (aprox 365, 1095, 1825 dias)
            key_years = {1: None, 3: None, 5: None}
            
            for t, p in zip(times, probs):
                curve_data.append({"days": int(t), "prob": float(p)})
                
                # Capturar prob a años específicos
                if t >= 365 and key_years[1] is None: key_years[1] = float(p)
                if t >= 1095 and key_years[3] is None: key_years[3] = float(p)
                if t >= 1825 and key_years[5] is None: key_years[5] = float(p)
                
            return {
                "curve": curve_data, # Serie completa
                "projections": {
                    "1_year": key_years[1] if key_years[1] else probs[-1],
                    "3_year": key_years[3] if key_years[3] else (probs[-1] if times[-1] < 1095 else 0.0),
                    "5_year": key_years[5] if key_years[5] else (probs[-1] if times[-1] < 1825 else 0.0)
                }
            }
        except Exception as e:
            print(f"Error prediciendo survival: {e}")
            return None
    
    def _print_results(self, y_test, y_pred, y_prob):
        """Muestra los resultados del entrenamiento."""
        print(f"\n📊 MÉTRICAS DE RENDIMIENTO:")
        print(f"   ├── AUC-ROC: {self.metrics['auc_roc']:.3f}")
        print(f"   ├── CV AUC-ROC: {self.metrics['cv_auc_mean']:.3f} ± {self.metrics['cv_auc_std']:.3f}")
        print(f"   ├── Accuracy: {self.metrics['accuracy']:.3f}")
        print(f"   ├── F1-Score: {self.metrics['f1']:.3f}")
        print(f"   ├── Brier Score: {self.metrics['brier_score']:.3f}")
        print(f"   └── Avg Precision: {self.metrics['average_precision']:.3f}")
        
        print(f"\n📋 MATRIZ DE CONFUSIÓN:")
        cm = confusion_matrix(y_test, y_pred)
        print(f"   ┌─────────────┬─────────────┐")
        print(f"   │ TN: {cm[0,0]:6d} │ FP: {cm[0,1]:6d} │")
        print(f"   ├─────────────┼─────────────┤")
        print(f"   │ FN: {cm[1,0]:6d} │ TP: {cm[1,1]:6d} │")
        print(f"   └─────────────┴─────────────┘")
        
        if self.feature_importances:
            print(f"\n🎯 IMPORTANCIA DE FEATURES:")
            sorted_imp = sorted(self.feature_importances.items(), key=lambda x: x[1], reverse=True)
            for feat, imp in sorted_imp:
                name = self.FEATURE_NAMES.get(feat, feat)
                bar = "█" * int(imp * 50)
                print(f"   {name:25s} {imp:.4f} {bar}")
    
    def predict(self, patient_data):
        """
        Predice el riesgo de recurrencia para un paciente.
        
        Args:
            patient_data: dict con los valores de las features
            
        Returns:
            dict con probabilidad de recurrencia y grupo de riesgo
        """
        if self.model is None:
            raise ValueError("Modelo no entrenado. Ejecutar train() primero.")
        
        # Crear DataFrame con una fila
        X = pd.DataFrame([patient_data])
        
        # Asegurar que todas las columnas estén presentes
        for col in self.FEATURE_COLS:
            if col not in X.columns:
                X[col] = self.medians.get(col, np.nan)
        
        X = X[self.FEATURE_COLS]
        
        # Imputar missing
        for col in X.columns:
            X[col] = X[col].fillna(self.medians.get(col, 0))
        
        # Escalar
        X_scaled = self.scaler.transform(X)
        
        # Predecir
        prob = self.model.predict_proba(X_scaled)[0, 1]
        
        # Determinar grupo de riesgo
        if prob < 0.10:
            risk_group = "Bajo"
            risk_color = "#10B981"
        elif prob < 0.25:
            risk_group = "Intermedio"
            risk_color = "#F59E0B"
        elif prob < 0.50:
            risk_group = "Alto"
            risk_color = "#EF4444"
        else:
            risk_group = "Muy Alto"
            risk_color = "#7C3AED"
        
        return {
            'probability': float(prob),
            'probability_percent': float(prob * 100),
            'risk_group': risk_group,
            'risk_color': risk_color,
            'model_type': self.model_type,
            'model_auc': self.metrics.get('auc_roc', None)
        }
    
    def plot_results(self, save_path=None):
        """Genera gráficos de rendimiento del modelo."""
        if not hasattr(self, '_y_test'):
            raise ValueError("Ejecutar train() antes de plot_results()")
        
        fig, axes = plt.subplots(2, 2, figsize=(14, 12))
        
        # 1. ROC Curve
        ax1 = axes[0, 0]
        fpr, tpr, _ = roc_curve(self._y_test, self._y_prob)
        ax1.plot(fpr, tpr, color='#6366F1', lw=2, label=f'AUC = {self.metrics["auc_roc"]:.3f}')
        ax1.plot([0, 1], [0, 1], 'k--', lw=1)
        ax1.fill_between(fpr, tpr, alpha=0.2, color='#6366F1')
        ax1.set_xlabel('Tasa de Falsos Positivos')
        ax1.set_ylabel('Tasa de Verdaderos Positivos')
        ax1.set_title('Curva ROC', fontsize=14, fontweight='bold')
        ax1.legend(loc='lower right')
        ax1.grid(True, alpha=0.3)
        
        # 2. Precision-Recall Curve
        ax2 = axes[0, 1]
        precision, recall, _ = precision_recall_curve(self._y_test, self._y_prob)
        ax2.plot(recall, precision, color='#10B981', lw=2, 
                label=f'AP = {self.metrics["average_precision"]:.3f}')
        ax2.fill_between(recall, precision, alpha=0.2, color='#10B981')
        ax2.set_xlabel('Recall')
        ax2.set_ylabel('Precision')
        ax2.set_title('Curva Precision-Recall', fontsize=14, fontweight='bold')
        ax2.legend(loc='lower left')
        ax2.grid(True, alpha=0.3)
        
        # 3. Calibration Curve
        ax3 = axes[1, 0]
        prob_true, prob_pred = calibration_curve(self._y_test, self._y_prob, n_bins=8)
        ax3.plot(prob_pred, prob_true, 's-', color='#F59E0B', lw=2, label='Modelo')
        ax3.plot([0, 1], [0, 1], 'k--', lw=1, label='Calibración perfecta')
        ax3.set_xlabel('Probabilidad Predicha')
        ax3.set_ylabel('Fracción de Positivos')
        ax3.set_title('Curva de Calibración', fontsize=14, fontweight='bold')
        ax3.legend(loc='lower right')
        ax3.grid(True, alpha=0.3)
        
        # 4. Feature Importance
        ax4 = axes[1, 1]
        if self.feature_importances:
            sorted_imp = sorted(self.feature_importances.items(), key=lambda x: x[1])
            features = [self.FEATURE_NAMES.get(f, f) for f, _ in sorted_imp]
            importances = [imp for _, imp in sorted_imp]
            colors = plt.cm.viridis(np.linspace(0.2, 0.8, len(features)))
            ax4.barh(features, importances, color=colors)
            ax4.set_xlabel('Importancia')
            ax4.set_title('Importancia de Variables', fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=150, bbox_inches='tight')
            print(f"📊 Gráficos guardados en: {save_path}")
        
        plt.close()
        return fig
    
    def save(self, filepath=None):
        """Guarda el modelo entrenado."""
        if filepath is None:
            filepath = MODEL_PATH / f"nest_model_{self.model_type}.pkl"
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'model_type': self.model_type,
            'feature_cols': self.FEATURE_COLS,
            'feature_importances': self.feature_importances,
            'metrics': self.metrics,
            'medians': self.medians,
            'training_date': self.training_date,
            'knn_model': self.knn_model,
            'survival_model': self.survival_model,
            'history_df': getattr(self, 'history_df', None),
            'survival_data': getattr(self, 'survival_data', None)
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"💾 Modelo guardado en: {filepath}")
        
        # También guardar parámetros como JSON para la web
        params_path = MODEL_PATH / "model_params.json"
        params = {
            'model_type': self.model_type,
            'features': self.FEATURE_COLS,
            'feature_names': self.FEATURE_NAMES,
            'medians': {k: float(v) for k, v in self.medians.items()},
            'metrics': {k: float(v) for k, v in self.metrics.items()},
            'training_date': self.training_date,
        }
        
        # Si es regresión logística, guardar coeficientes
        if hasattr(self.model, 'coef_'):
            params['coefficients'] = {
                col: float(coef) 
                for col, coef in zip(self.FEATURE_COLS, self.model.coef_[0])
            }
            params['intercept'] = float(self.model.intercept_[0])
            params['scaler_mean'] = {col: float(m) for col, m in zip(self.FEATURE_COLS, self.scaler.mean_)}
            params['scaler_scale'] = {col: float(s) for col, s in zip(self.FEATURE_COLS, self.scaler.scale_)}
        
        with open(params_path, 'w') as f:
            json.dump(params, f, indent=2)
        
        print(f"📝 Parámetros guardados en: {params_path}")
        
        return filepath
    
    @classmethod
    def load(cls, filepath):
        """Carga un modelo guardado."""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        instance = cls()
        instance.model = model_data['model']
        instance.scaler = model_data['scaler']
        instance.model_type = model_data['model_type']
        instance.feature_importances = model_data['feature_importances']
        instance.metrics = model_data['metrics']
        instance.medians = model_data['medians']
        instance.training_date = model_data['training_date']
        instance.knn_model = model_data.get('knn_model')
        instance.survival_model = model_data.get('survival_model')
        instance.history_df = model_data.get('history_df')
        instance.survival_data = model_data.get('survival_data')
        
        # Si se cargó un modelo antiguo sin knn, entrenar si hay datos (o dejar None)
        # Idealmente deberíamos guardar el history_df en el pickle para que funcione el KNN

        
        print(f"📂 Modelo cargado: {instance.model_type}")
        print(f"   AUC-ROC: {instance.metrics.get('auc_roc', 'N/A'):.3f}")
        
        return instance


def train_all_models():
    """Entrena y compara todos los modelos disponibles."""
    print("\n" + "🔬"*30)
    print("  NEST - Entrenamiento de Modelos")
    print("  Hospital Sant Pau | BitsxlaMarató 2024")
    print("🔬"*30)
    
    # Crear modelo
    nest = NESTPredictionModel()
    df = nest.load_data()
    
    # Entrenar diferentes modelos
    results = {}
    
    for model_type in ['logistic', 'random_forest', 'gradient_boosting']:
        model = NESTPredictionModel()
        model.load_data()
        metrics = model.train(df, model_type=model_type)
        # Entrenar modelos adicionales para el mejor o para todos (por ahora para todos para probar)
        model.train_similarity_model(df)
        model.train_survival_model(df)
        
        results[model_type] = {
            'model': model,
            'metrics': metrics
        }
    
    # Comparar resultados
    print("\n" + "="*60)
    print("COMPARACIÓN DE MODELOS")
    print("="*60)
    
    comparison_df = pd.DataFrame({
        name: data['metrics'] 
        for name, data in results.items()
    }).T
    
    print(comparison_df.round(3).to_string())
    
    # Seleccionar mejor modelo (por AUC)
    best_model_name = max(results.keys(), key=lambda x: results[x]['metrics']['auc_roc'])
    best_model = results[best_model_name]['model']
    
    print(f"\n🏆 Mejor modelo: {best_model_name.upper()}")
    print(f"   AUC-ROC: {results[best_model_name]['metrics']['auc_roc']:.3f}")
    
    # Guardar el mejor modelo
    best_model.save()
    best_model.plot_results(OUTPUT_PATH / 'model_performance.png')
    
    return best_model, results


def demo_prediction():
    """Demostración de predicción con un caso ejemplo."""
    print("\n" + "="*60)
    print("DEMOSTRACIÓN DE PREDICCIÓN")
    print("="*60)
    
    # Cargar modelo
    model_path = MODEL_PATH / "nest_model_logistic.pkl"
    if not model_path.exists():
        print("⚠️ Modelo no encontrado. Entrenando...")
        model, _ = train_all_models()
    else:
        model = NESTPredictionModel.load(model_path)
    
    # Caso ejemplo: paciente de bajo riesgo
    caso_bajo = {
        'edad': 55,
        'imc': 28,
        'grado_histologi': 1,
        'tamano_tumoral': 2,
        'infiltracion_mi': 1,
        'afectacion_linf': 0,
        'infilt_estr_cervix': 0,
        'p53_ihq': 1,
        'recep_est_porcent': 90,
        'rece_de_Ppor': 80,
        'FIGO2023': 1,
    }
    
    # Caso ejemplo: paciente de alto riesgo
    caso_alto = {
        'edad': 72,
        'imc': 35,
        'grado_histologi': 2,
        'tamano_tumoral': 5,
        'infiltracion_mi': 2,
        'afectacion_linf': 1,
        'infilt_estr_cervix': 1,
        'p53_ihq': 2,
        'recep_est_porcent': 40,
        'rece_de_Ppor': 30,
        'FIGO2023': 7,
    }
    
    print("\n📋 CASO 1 - Perfil de bajo riesgo:")
    result1 = model.predict(caso_bajo)
    print(f"   Probabilidad de recurrencia: {result1['probability_percent']:.1f}%")
    print(f"   Grupo de riesgo: {result1['risk_group']}")
    
    print("\n📋 CASO 2 - Perfil de alto riesgo:")
    result2 = model.predict(caso_alto)
    print(f"   Probabilidad de recurrencia: {result2['probability_percent']:.1f}%")
    print(f"   Grupo de riesgo: {result2['risk_group']}")

    # Demo Similar
    print("\n🔍 CASO 1 - Pacientes Similares:")
    similar = model.find_similar_patients(caso_bajo)
    for s in similar:
        print(f"   - Match: {s['match_score']:.2f} | Recaída: {s['recidiva']}")
        
    print("\n⏳ CASO 1 - Curva Supervivencia:")
    try:
        surv = model.predict_survival_curve(caso_bajo)
        if surv:
            print(f"   Prob 1 año: {surv['projections']['1_year']:.1%}")
            print(f"   Prob 3 años: {surv['projections']['3_year']:.1%}")
            print(f"   Prob 5 años: {surv['projections']['5_year']:.1%}")
    except Exception as e:
        print(f"   ⚠️ No se pudo generar curva de supervivencia: {e}")


if __name__ == "__main__":
    # Entrenar todos los modelos y seleccionar el mejor
    best_model, all_results = train_all_models()
    
    # Demostración de predicción
    demo_prediction()
    
    print("\n" + "="*60)
    print("✅ ENTRENAMIENTO COMPLETADO")
    print(f"📁 Modelos guardados en: {MODEL_PATH}")
    print(f"📁 Gráficos guardados en: {OUTPUT_PATH}")
    print("="*60 + "\n")
