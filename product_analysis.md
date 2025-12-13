# Análisis del Producto: NEST (NSMP Endometrial Stratification Tool)

Este documento detalla la arquitectura funcional de la aplicación, dividiendo claramente entre la herramienta clínica operativa y la base científica demostrativa, analizando el estado actual y proponiendo mejoras para el producto final.

---

## 1. La Calculadora Clínica (Herramienta para el Profesional)

Esta sección es el **producto core** que utilizarán los oncólogos y ginecólogos. Su foco es la **usabilidad, la explicabilidad y el apoyo a la decisión**.

### 🏗️ Qué hay implementado:
1.  **Motor de Predicción (Backend):**
    *   Modelo de **Regresión Logística Regularizada (Ridge)**.
    *   Predice probabilidad exacta (0-100%) y grupo de riesgo (Bajo/Interm/Alto/Muy Alto).
    *   Genera recomendaciones clínicas basadas en guías ESGO/ESTRO.
2.  **Explicabilidad Avanzada (XAI):**
    *   **Lenguaje Natural:** El backend genera un párrafo explicando *por qué* ese resultado (ej. "Riesgo elevado principalmente por LVSI y Grado 2").
    *   **Factores de Riesgo:** Lista explícita de variables que contribuyen negativamente.
    *   **Waterfall Chart:** Gráfico que muestra cuánto suma o resta cada variable al riesgo base.
    *   **Análisis What-If:** Módulo interactivo para simular escenarios (ej. "¿Bajaría el riesgo si el tumor fuera menor de 2cm?").
3.  **Herramientas de Apoyo (NEST+):**
    *   **Curvas de Supervivencia $S(t)$:** Modelo Cox Proportional Hazards que predice la probabilidad de *no recidiva* a 1, 3 y 5 años personalizada para la paciente.
    *   **Pacientes Similares (KNN):** Algoritmo que busca en la base de datos histórica los casos más parecidos clínica y molecularmente.
    *   **Comparación Cohorte:** Contextualiza a la paciente respecto al promedio del hospital.

---

## 2. El Módulo Científico (Herramienta para la Demo/Jurado)

Esta sección es nuestra **"sala de trofeos" técnica**. Su objetivo es demostrar el rigor científico, el proceso de ingeniería y validar por qué nuestro modelo es confiable.

### 🧪 Qué hay implementado:
1.  **Metodología "Del Dato al Modelo":**
    *   **Ingeniería de Datos:**
        *   Dataset: 154 pacientes NSMP (Hospital Sant Pau).
        *   **Imputación:** Estrategia híbrida (Mediana para numéricas, Moda para categóricas) para no perder ni un solo paciente (n=154 es pequeño, cada dato cuenta).
        *   **Feature Engineering:**
            *   Creación de `mmr_deficient` (combinando 4 proteínas).
            *   Normalización Z-score `(x - mean) / std` para todas las variables continuas.
        *   **Control de Sesgos:** Exclusión explícita de variables de tratamiento (Radioterapia/Quimioterapia) para evitar *Confounding by indication* (evitar que el modelo aprenda que "Recibir quimio = Morir", cuando es al revés: se da quimio a los graves).
2.  **Validación Rigurosa:**
    *   **Comparativa de Modelos:**
        *   *Random Forest:* Mayor AUC (0.97) pero "Caja Negra" y tendencia al overfitting.
        *   *Regresión Logística L2:* AUC excelente (0.93), calibración perfecta e interpretabilidad total. **Modelo Elegido.**
    *   **Métricas:** AUC-ROC, Sensibilidad/Especificidad, Brier Score (Calibración).
3.  **Visualizaciones Estáticas:**
    *   Curvas ROC y de Calibración.
    *   Matrices de Confusión y Correlación.
    *   Importancia de Variables (Feature Importance).

---

## 3. Análisis de Gaps y Estrategia de Mejora ("El Producto Perfecto")

Para ganar la hackathon, debemos pulir las fricciones entre la potencia técnica y la experiencia de usuario.

### 🔴 Gaps Identificados (Lo que falla o falta)

#### A. En la Calculadora (Backend/Frontend)
1.  **Discrepancia Modelo vs API:**
    *   *Problema:* El script de entrenamiento (`model.py`) actualmente dice que el **Random Forest** es el mejor (AUC 0.97), pero la API (`api.py`) tiene hardcodeados los coeficientes de la **Regresión Logística**.
    *   *Riesgo:* Si un juez pregunta "¿Por qué no usas el modelo de 0.97?", la respuesta "por explicabilidad" es válida pero debemos ser consistentes.
2.  **Velocidad de Respuesta:**
    *   El entrenamiento ocurre "on startup" si no hay `.pkl`. Esto puede ralentizar el primer arranque en la demo.

#### B. En la Parte Científica
1.  **Estática vs Dinámica:**
    *   Los gráficos en `/scientific` son imágenes estáticas (`.png`). No se pueden hacer zoom ni interactuar.
2.  **Historia Incompleta:**
    *   Falta enfatizar más el valor de los datos *moleculares* (p53, receptores) vs los clínicos tradicionales. Es el *selling point* del proyecto ("NSMP no es un cajón de sastre, hay biología detrás").

### 🟢 Soluciones Propuestas

1.  **Consolidar la Decisión del Modelo (Hybrid Approach):**
    *   Mantener la **Regresión Logística** para el *Score de Riesgo* y la *Explicabilidad* (Waterfall, What-if).
    *   Usar el **Random Forest** (si es superior) *solo* para la búsqueda de **Pacientes Similares** (KNN usa features, RF selecciona features importantes).
    *   *Acción:* Asegurar que `api.py` y `Scientific.tsx` cuenten la misma historia: "Elegimos Logística por seguridad clínica, aunque RF tenía un margen métrico superior despreciable".

2.  **Mejorar la UX de "Validación":**
    *   En la pestaña "Validación Batch" de la calculadora, añadir un botón para "Re-entrenar con mis propios datos" (simulado o real). Eso volaría la cabeza al jurado (MLOps en el navegador).

3.  **Reforzar la Narrativa Molecular en Scientific:**
    *   Añadir un bloque específico en la metodología sobre cómo el perfil molecular (p53/ER/PR) cambia el pronóstico en pacientes que clínicamente parecen iguales.

4.  **Polish Visual:**
    *   Asegurar que los colores de riesgo (Verde/Naranja/Rojo/Morado) sean consistentes en TODA la app (gráficos, badges, textos).
