# NEST Backend - Setup Guide

Este backend proporciona la API para el sistema NEST (NSMP Endometrial Stratification Tool).

## Requisitos Previos

- Python 3.9 o superior.
- `pip` (gestor de paquetes de Python).

## Instalación

1.  **Navega al directorio del backend:**
    ```bash
    cd backend
    ```

2.  **Crea un entorno virtual (opcional pero recomendado):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # En Windows: venv\Scripts\activate
    ```

3.  **Instala las dependencias:**
    ```bash
    pip install -r requirements.txt
    ```
    *Nota: Esto instalará FastAPI, Uvicorn, Pandas, Scikit-learn, Lifelines, etc.*

## Ejecución

Para iniciar el servidor de desarrollo:

```bash
uvicorn api:app --reload
```

El servidor se iniciará en `http://localhost:8000`.

### Endpoints Principales

-   `POST /predict`: Predicción de riesgo de recurrencia.
-   `POST /predict/similar-patients`: Búsqueda de pacientes similares (KNN).
-   `POST /predict/survival-curve`: Curva de supervivencia personalizada (CoxPH).
-   `GET /health`: Comprobar estado de la API.

## Notas sobre el Modelo

Al iniciar la API (`startup`), el sistema intentará cargar los modelos entrenados desde `backend/models/`. Si no existen, **entrenará automáticamente** nuevos modelos usando los datos en `backend/data/endometrio_data.csv`.

Esto incluye:
1.  **Modelo de Riesgo (Random Forest/Logistic)**.
2.  **Modelo de Similaridad (KNN)**.
3.  **Modelo de Supervivencia (CoxPH)**.
