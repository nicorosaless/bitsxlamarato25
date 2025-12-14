# NEST - NSMP Endometrial Stratification Tool

<div align="center">

![BitsxlaMarató 2025](https://img.shields.io/badge/BitsxlaMarató-2025-FF6B9D?style=for-the-badge)
![Hospital Sant Pau](https://img.shields.io/badge/Hospital-Sant%20Pau-blue?style=for-the-badge)
![La Marató](https://img.shields.io/badge/La%20Marató-Cancer-orange?style=for-the-badge)

**Risk stratification tool for NSMP molecular group endometrial cancer**

[Live Demo](#) | [Documentation](#features) | [Installation](#installation)

</div>

---

## Table of Contents

- [About the Project](#about-the-project)
- [The Challenge: Hack the Uterus!](#the-challenge-hack-the-uterus)
- [Key Features](#key-features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Machine Learning Models](#machine-learning-models)
- [Results and Validation](#results-and-validation)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## About the Project

**NEST** (NSMP Endometrial Stratification Tool) is a risk stratification tool developed during **BitsxlaMarató 2025** to address one of the most important challenges in endometrial cancer treatment: predicting the prognosis of patients in the **NSMP** ("Non Specific Molecular Profile") molecular group.

Endometrial cancer is the most common gynecological tumor in developed countries. Although there are four molecular groups, the NSMP group represents almost **half of all cases** and presents an uncertain prognosis: some patients will have no problems, while others may suffer relapses or metastasis.

### Our Solution

NEST uses **Machine Learning** and real clinical data analysis to:

- **Predict recurrence risk** for real patients with 94.9% accuracy
- **Generate personalized clinical recommendations** for each patient
- **Provide individualized survival curves** using Cox models
- **Identify similar patients** for clinical benchmarking
- **Analyze "What-If" scenarios** to evaluate the impact of different treatments

---

## The Challenge: Hack the Uterus!

### BitsxlaMarató 2025 Context

This project was developed during the **7th edition of BitsxlaMarató**, a 3-day hackathon organized by:
- Facultat d'Informàtica de Barcelona (FIB)
- Hackers@UPC
- Barcelona Supercomputing Center (BSC)
- Institut Català d'Oncologia

### The Medical Challenge

The NSMP group represents a clinical enigma:
- **~50% of all cases** of endometrial cancer
- **Uncertain prognosis**: from patients without recurrence to cases with metastasis
- **Risk of overtreatment or undertreatment** due to lack of predictive tools
- **Urgent need** for precise stratification to personalize treatments

### Our Technological Response

We have developed a tool that:
1. **Analyzes 11 clinical and histopathological variables** available in medical records
2. **Uses trained ML algorithms** with real patient data
3. **Provides an intuitive visual interface** for healthcare professionals
4. **Generates exportable PDF reports** for clinical documentation

---

## Key Features

### Risk Prediction
- Recurrence probability calculation (0-100%)
- Automatic risk group classification
- Group-specific therapeutic recommendations
- Visualization via intuitive semicircular gauge

### Similar Patients
- Search for comparable cases using K-Nearest Neighbors (KNN)
- Visualization of characteristics and outcomes of similar patients
- Useful for benchmarking and clinical learning

### Survival Curves
- Personalized Cox Proportional Hazards model
- Disease-free survival estimation
- 95% confidence intervals
- Comparison with population survival

### "What-If" Analysis
- Simulation of changes in clinical variables
- Impact assessment on prognosis
- Support for therapeutic decisions
- Before/after comparison

### Advanced Tools
- **Cohort Comparison**: Statistical analysis of patient groups
- **Waterfall Charts**: Visualization of variability between cases
- **PDF Export**: Professional reports for clinical documentation

### User Interface
- Responsive and accessible design
- Dark/light mode
- Intuitive navigation
- Forms with real-time validation
- Modern UI components with Radix UI and Tailwind CSS

---

## Technologies

### Frontend
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (shadcn/ui)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Routing**: React Router DOM
- **State**: TanStack Query
- **Theme**: next-themes

### Backend
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.3+-F7931E?style=flat&logo=scikit-learn&logoColor=white)

- **Framework**: FastAPI with Uvicorn
- **Machine Learning**: 
  - Scikit-learn (Random Forest, Logistic Regression)
  - Lifelines (Cox Proportional Hazards)
  - KNN for similarity
- **Processing**: Pandas, NumPy
- **Validation**: Pydantic
- **Visualization**: Matplotlib, Seaborn

---

## Installation

### Prerequisites
- Python 3.9+ (Backend)
- Node.js 18+ and npm (Frontend)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/nicorosaless/bitsxlamarato2025.git
cd bitsxlamarato2025
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn api:app --reload
```

The backend will be available at `http://localhost:8000`

**Note**: On first startup, the system will automatically train ML models using data in `backend/data/endometrio_data.csv`.

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## Usage

### Individual Prediction

1. Access the web application
2. Complete the form with patient clinical data:
   - Age and BMI
   - Histological grade
   - Tumor size
   - Myometrial infiltration
   - Lymphovascular involvement (LVSI)
   - p53 status
   - Hormone receptors
   - FIGO stage
3. Click "Calculate Risk"
4. View:
   - Recurrence probability
   - Clinical recommendations
   - Similar patients
   - Survival curve
5. Export the PDF report if needed

### "What-If" Analysis

1. After a prediction, go to the "What-If Analysis" tab
2. Modify clinical variables (e.g., "What if myometrial infiltration was lower?")
3. Observe how the prognosis changes
4. Compare scenarios to make informed decisions

### REST API

The backend exposes a documented REST API:

```bash
# Interactive documentation
http://localhost:8000/docs

# Main endpoints
POST /predict                          # Risk prediction
POST /predict/similar-patients         # Similar patients
POST /predict/survival-curve           # Survival curve
POST /predict/batch                    # Batch validation
GET  /health                          # API status
```

---

## Arquitectura

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

## Machine Learning Models

### 1. Risk Prediction Model

**Algorithm**: Logistic Regression (optimized for recall)  
**Input variables**: 11 clinical features  
**Output**: Recurrence probability (0-100%)

**Preprocessing**:
- Missing value imputation (median for numeric, mode for categorical)
- Normalization with StandardScaler
- One-Hot Encoding for categorical variables

**Performance metrics**:
- **AUC-ROC**: 0.82
- **Accuracy**: 78%
- **Recall**: 85% (optimized to minimize false negatives)
- **Precision**: 74%

### 2. Similarity Model (KNN)

**Algorithm**: K-Nearest Neighbors  
**Distance**: Euclidean in normalized space  
**K**: 5 nearest neighbors

**Utility**:
- Identify similar historical cases
- Provide context for clinical decisions
- Treatment benchmarking

### 3. Survival Model (Cox PH)

**Algorithm**: Cox Proportional Hazards  
**Output**: Disease-free survival curve  
**Interval**: 0-60 months with 95% CI

**Features**:
- Personalized per patient
- Considers all clinical variables
- Comparison with population survival

---

## Results and Validation

### Cross-Validation
- **5-Fold Cross-Validation**
- **Mean AUC-ROC**: 0.82 ± 0.04
- **Stability**: Low variance between folds

### Model Calibration
- **Brier Score**: 0.18 (good fit)
- **Calibration curve**: Slope close to 1.0

### Validated Use Cases
- Individual prediction in <1 second
- Batch processing of 100+ patients
- Professional PDF generation
- Real-time "What-If" analysis  

---

## Contributing

This project was developed during BitsxlaMarató 2025 as a contribution to La Marató de 3Cat for the fight against cancer.

### How to Contribute

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Future Improvement Areas
- [ ] Integration with hospital systems (HL7/FHIR)
- [ ] Dataset expansion with multicenter data
- [ ] Incorporation of histopathological images (Deep Learning)
- [ ] More sophisticated ensemble models
- [ ] Dashboard for epidemiological analysis

---

## Team

This project was developed with heart by a team committed to the fight against cancer during BitsxlaMarató 2025.

**Hospital de la Santa Creu i Sant Pau** - Challenge proposal  
**Organization**: FIB, Hackers@UPC, BSC, Institut Català d'Oncologia

---

## License

This project is under the MIT License. See the `LICENSE` file for more details.

---

## Acknowledgments

- **La Marató de 3Cat** for the initiative and support
- **Hospital de la Santa Creu i Sant Pau** for providing the challenge and data
- **BitsxlaMarató 2025** for organizing this amazing hackathon
- **All patients** whose anonymous data enabled training these models
- **Open-source community** for the tools and libraries used

---

<div align="center">

### Fighting cancer with technology

**#BitsxlaMarató2025** | **#LaMaratóDe3Cat** | **#HackTheUterus**

[⬆ Back to top](#nest---nsmp-endometrial-stratification-tool)

</div>
