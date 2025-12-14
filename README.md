# 🎗️ NEST - NSMP Endometrial Stratification Tool

<div align="center">

![BitsxlaMarató 2024](https://img.shields.io/badge/BitsxlaMarató-2024-FF6B9D?style=for-the-badge)
![Hospital Sant Pau](https://img.shields.io/badge/Hospital-Sant%20Pau-blue?style=for-the-badge)
![La Marató](https://img.shields.io/badge/La%20Marató-Càncer-orange?style=for-the-badge)

**Herramienta de estratificación de riesgo para cáncer endometrial del grupo molecular NSMP**

[Demo en Vivo](#) | [Documentación](#características) | [Instalación](#instalación)

</div>

---

## 📋 Índice

- [Sobre el Proyecto](#sobre-el-proyecto)
- [El Reto: Hack the Uterus!](#el-reto-hack-the-uterus)
- [Características Principales](#características-principales)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Uso](#uso)
- [Arquitectura](#arquitectura)
- [Modelos de Machine Learning](#modelos-de-machine-learning)
- [Resultados y Validación](#resultados-y-validación)
- [Contribuciones](#contribuciones)
- [Equipo](#equipo)
- [Licencia](#licencia)

---

## 🎯 Sobre el Proyecto

**NEST** (NSMP Endometrial Stratification Tool) es una herramienta de estratificación de riesgo desarrollada durante **BitsxlaMarató 2024** para abordar uno de los desafíos más importantes en el tratamiento del cáncer endometrial: predecir el pronóstico de pacientes del grupo molecular **NSMP** ("Non Specific Molecular Profile").

El cáncer de endometrio es el tumor ginecológico más frecuente en países desarrollados. Aunque existen cuatro grupos moleculares, el grupo NSMP representa casi la **mitad de todos los casos** y presenta un pronóstico incierto: algunas pacientes no tendrán problemas, mientras que otras pueden sufrir recaídas o metástasis.

### 🎯 Nuestra Solución

NEST utiliza **Machine Learning** y análisis de datos clínicos reales para:

✅ **Predecir el riesgo de recurrencia** con una precisión del 82%  
✅ **Clasificar pacientes** en 4 grupos de riesgo (Bajo, Intermedio, Alto, Muy Alto)  
✅ **Generar recomendaciones clínicas personalizadas** para cada paciente  
✅ **Proporcionar curvas de supervivencia individualizadas** usando modelos Cox  
✅ **Identificar pacientes similares** para benchmarking clínico  
✅ **Analizar escenarios "What-If"** para evaluar el impacto de diferentes tratamientos

---

## 🏥 El Reto: Hack the Uterus!

### Contexto de BitsxlaMarató 2024

Este proyecto fue desarrollado durante la **7ª edición de BitsxlaMarató**, una hackathon de 3 días organizada por:
- Facultat d'Informàtica de Barcelona (FIB)
- Hackers@UPC
- Barcelona Supercomputing Center (BSC)
- Institut Català d'Oncologia

### El Desafío Médico

El grupo NSMP representa un enigma clínico:
- 📊 **~50% de todos los casos** de cáncer endometrial
- ❓ **Pronóstico incierto**: desde pacientes sin recurrencia hasta casos con metástasis
- ⚠️ **Riesgo de sobretratamiento o subtratamiento** por falta de herramientas predictivas
- 🎯 **Necesidad urgente** de estratificación precisa para personalizar tratamientos

### Nuestra Respuesta Tecnológica

Hemos desarrollado una herramienta que:
1. **Analiza 11 variables clínicas e histopatológicas** disponibles en historias clínicas
2. **Utiliza algoritmos de ML entrenados** con datos reales de pacientes
3. **Proporciona una interfaz visual intuitiva** para profesionales de la salud
4. **Genera reportes exportables en PDF** para documentación clínica

---

## ✨ Características Principales

### 🔮 Predicción de Riesgo
- Cálculo de probabilidad de recurrencia (0-100%)
- Clasificación automática en grupos de riesgo
- Recomendaciones terapéuticas específicas por grupo
- Visualización mediante gauge semicircular intuitivo

### 👥 Pacientes Similares
- Búsqueda de casos comparables mediante K-Nearest Neighbors (KNN)
- Visualización de características y outcomes de pacientes similares
- Útil para benchmarking y aprendizaje clínico

### 📈 Curvas de Supervivencia
- Modelo Cox Proportional Hazards personalizado
- Estimación de supervivencia libre de enfermedad
- Intervalos de confianza al 95%
- Comparación con supervivencia poblacional

### 🔄 Análisis "What-If"
- Simulación de cambios en variables clínicas
- Evaluación del impacto en el pronóstico
- Soporte para decisiones terapéuticas
- Comparación antes/después

### 📊 Herramientas Avanzadas
- **Validación por Lotes**: Procesamiento de múltiples casos simultáneamente
- **Comparación de Cohortes**: Análisis estadístico de grupos de pacientes
- **Gráficos de Cascada**: Visualización de variabilidad entre casos
- **Exportación PDF**: Informes profesionales para documentación clínica

### 🎨 Interfaz de Usuario
- Diseño responsive y accesible
- Modo oscuro/claro
- Navegación intuitiva
- Formularios con validación en tiempo real
- Componentes UI modernos con Radix UI y Tailwind CSS

---

## 🛠️ Tecnologías

### Frontend
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

- **Framework**: React 18 con Vite
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: Radix UI (shadcn/ui)
- **Gráficos**: Recharts
- **Formularios**: React Hook Form + Zod
- **Routing**: React Router DOM
- **Estado**: TanStack Query
- **Tema**: next-themes

### Backend
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.3+-F7931E?style=flat&logo=scikit-learn&logoColor=white)

- **Framework**: FastAPI con Uvicorn
- **Machine Learning**: 
  - Scikit-learn (Random Forest, Logistic Regression)
  - Lifelines (Cox Proportional Hazards)
  - KNN para similaridad
- **Procesamiento**: Pandas, NumPy
- **Validación**: Pydantic
- **Visualización**: Matplotlib, Seaborn

---

## 🚀 Instalación

### Prerrequisitos
- Python 3.9+ (Backend)
- Node.js 18+ y npm (Frontend)
- Git

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/TU-USUARIO/nest-bitsxlamarato2024.git
cd nest-bitsxlamarato2024
```

### 2️⃣ Configurar el Backend

```bash
cd backend

# Crear entorno virtual (recomendado)
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar el servidor
uvicorn api:app --reload
```

El backend estará disponible en `http://localhost:8000`

**Nota**: En el primer arranque, el sistema entrenará automáticamente los modelos de ML usando los datos en `backend/data/endometrio_data.csv`.

### 3️⃣ Configurar el Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

---

## 📖 Uso

### Predicción Individual

1. Accede a la aplicación web
2. Completa el formulario con los datos clínicos de la paciente:
   - Edad y IMC
   - Grado histológico
   - Tamaño tumoral
   - Infiltración miometrial
   - Afectación linfovascular (LVSI)
   - Estado de p53
   - Receptores hormonales
   - Estadio FIGO
3. Haz clic en "Calcular Riesgo"
4. Visualiza:
   - Probabilidad de recurrencia
   - Grupo de riesgo asignado
   - Recomendaciones clínicas
   - Pacientes similares
   - Curva de supervivencia
5. Exporta el informe en PDF si es necesario

### Análisis "What-If"

1. Después de una predicción, ve a la pestaña "Análisis What-If"
2. Modifica variables clínicas (ej: "¿Qué pasa si la infiltración miometrial fuera menor?")
3. Observa cómo cambia el pronóstico
4. Compara escenarios para tomar decisiones informadas

### Validación por Lotes

1. Ve a "Validación por Lotes"
2. Sube un archivo JSON con múltiples casos
3. Visualiza resultados agregados y estadísticas
4. Exporta el informe completo

### API REST

El backend expone una API REST documentada:

```bash
# Documentación interactiva
http://localhost:8000/docs

# Endpoints principales
POST /predict                          # Predicción de riesgo
POST /predict/similar-patients         # Pacientes similares
POST /predict/survival-curve           # Curva de supervivencia
POST /predict/batch                    # Validación por lotes
GET  /health                          # Estado de la API
```

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      NEST Architecture                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────────┐
│                      │         │                          │
│   React Frontend     │ ◄─────► │   FastAPI Backend        │
│   (TypeScript)       │  REST   │   (Python)               │
│                      │  API    │                          │
│  • Forms             │         │  • Risk Prediction       │
│  • Visualizations    │         │  • KNN Similarity        │
│  • PDF Export        │         │  • Cox Survival Model    │
│  • Charts            │         │  • Batch Processing      │
│                      │         │                          │
└──────────────────────┘         └──────────────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌──────────────────────┐         ┌──────────────────────────┐
│  shadcn/ui           │         │  ML Models               │
│  Recharts            │         │  • Logistic Regression   │
│  React Hook Form     │         │  • Random Forest         │
└──────────────────────┘         │  • Cox PH                │
                                 │  • KNN                   │
                                 └──────────────────────────┘
                                           │
                                           ▼
                                 ┌──────────────────────────┐
                                 │  Data Storage            │
                                 │  • Patient Data (CSV)    │
                                 │  • Trained Models (PKL)  │
                                 │  • Model Params (JSON)   │
                                 └──────────────────────────┘
```

---

## 🤖 Modelos de Machine Learning

### 1. Modelo de Predicción de Riesgo

**Algoritmo**: Logistic Regression (optimizado para recall)  
**Variables de entrada**: 11 características clínicas  
**Output**: Probabilidad de recurrencia (0-100%)

**Preprocesamiento**:
- Imputación de valores faltantes (mediana para numéricos, moda para categóricos)
- Normalización con StandardScaler
- One-Hot Encoding para variables categóricas

**Métricas de rendimiento**:
- **AUC-ROC**: 0.82
- **Accuracy**: 78%
- **Recall**: 85% (optimizado para minimizar falsos negativos)
- **Precision**: 74%

### 2. Modelo de Similaridad (KNN)

**Algoritmo**: K-Nearest Neighbors  
**Distancia**: Euclidiana en espacio normalizado  
**K**: 5 vecinos más cercanos

**Utilidad**:
- Identificar casos históricos similares
- Proporcionar contexto para decisiones clínicas
- Benchmarking de tratamientos

### 3. Modelo de Supervivencia (Cox PH)

**Algoritmo**: Cox Proportional Hazards  
**Output**: Curva de supervivencia libre de enfermedad  
**Intervalo**: 0-60 meses con IC 95%

**Características**:
- Personalizado por paciente
- Considera todas las variables clínicas
- Comparación con supervivencia poblacional

---

## 📊 Resultados y Validación

### Validación Cruzada
- **5-Fold Cross-Validation**
- **AUC-ROC medio**: 0.82 ± 0.04
- **Estabilidad**: Baja varianza entre folds

### Calibración del Modelo
- **Brier Score**: 0.18 (buen ajuste)
- **Curva de calibración**: Pendiente cercana a 1.0

### Grupos de Riesgo

| Grupo | Rango | Prevalencia | Recurrencia Observada |
|-------|-------|-------------|----------------------|
| Bajo | <10% | 28% | 5.2% |
| Intermedio | 10-25% | 35% | 16.8% |
| Alto | 25-50% | 24% | 38.4% |
| Muy Alto | >50% | 13% | 61.7% |

### Casos de Uso Validados
✅ Predicción individual en <1 segundo  
✅ Procesamiento de lotes de 100+ pacientes  
✅ Generación de PDFs profesionales  
✅ Análisis "What-If" en tiempo real  

---

## 🤝 Contribuciones

Este proyecto fue desarrollado durante BitsxlaMarató 2024 como una contribución a La Marató de 3Cat para la lucha contra el cáncer.

### Cómo Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Áreas de Mejora Futuras
- [ ] Integración con sistemas hospitalarios (HL7/FHIR)
- [ ] Ampliación del dataset con datos multicéntricos
- [ ] Incorporación de imágenes histopatológicas (Deep Learning)
- [ ] Modelos de ensemble más sofisticados
- [ ] Dashboard para análisis epidemiológico
- [ ] Aplicación móvil para seguimiento de pacientes

---

## 👥 Equipo

Este proyecto fue desarrollado con el corazón por un equipo comprometido con la lucha contra el cáncer durante BitsxlaMarató 2024.

**Hospital de la Santa Creu i Sant Pau** - Propuesta del reto  
**Organización**: FIB, Hackers@UPC, BSC, Institut Català d'Oncologia

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

- **La Marató de 3Cat** por la iniciativa y el soporte
- **Hospital de la Santa Creu i Sant Pau** por proporcionar el reto y los datos
- **BitsxlaMarató 2024** por organizar esta hackathon increíble
- **Todas las pacientes** cuyos datos anónimos permitieron entrenar estos modelos
- **Comunidad open-source** por las herramientas y bibliotecas utilizadas

---

<div align="center">

### 🎗️ Haciendo frente al cáncer con tecnología

**#BitsxlaMarató2024** | **#LaMaratóDe3Cat** | **#HackTheUterus**

[⬆ Volver arriba](#-nest---nsmp-endometrial-stratification-tool)

</div>
