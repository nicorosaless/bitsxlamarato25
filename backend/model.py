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
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, roc_auc_score, classification_report, 
    confusion_matrix, roc_curve, precision_recall_curve,
    average_precision_score, f1_score, brier_score_loss
)
from sklearn.calibration import calibration_curve

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
