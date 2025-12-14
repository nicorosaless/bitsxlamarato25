import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle,
  Clock,
  Database,
  FileText,
  GitBranch,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

// Feature Information Mapping
export const FEATURE_INFO: Record<string, { name: string; description: string; importance: number }> = {
  grado_histologi: {
    name: "Grado Histológico",
    description: "Grado de diferenciación celular (1: Bajo, 2: Alto - equivalente a G3 antiguo)",
    importance: 0.22,
  },
  tamano_tumoral: {
    name: "Tamaño Tumoral",
    description: "Diámetro máximo del tumor en cm",
    importance: 0.15,
  },
  FIGO2023: {
    name: "Estadio FIGO 2023",
    description: "Clasificación anatómica de la extensión del tumor",
    importance: 0.15,
  },
  imc: {
    name: "IMC",
    description: "Índice de Masa Corporal (Obesidad como factor de riesgo sistémico)",
    importance: 0.13,
  },
  afectacion_linf: {
    name: "Invasión Linfovascular (LVSI)",
    description: "Presencia de células tumorales en vasos linfáticos o sanguíneos",
    importance: 0.10,
  },
  edad: {
    name: "Edad",
    description: "Edad de la paciente al diagnóstico",
    importance: 0.06,
  },
  rece_de_Ppor: {
    name: "Receptores Progesterona",
    description: "Porcentaje de expresión de receptores de progesterona (%)",
    importance: 0.05,
  },
  infiltracion_mi: {
    name: "Infiltración Miometrial",
    description: "Profundidad de invasión en el miometrio (<50% vs ≥50%)",
    importance: 0.05,
  },
  infilt_estr_cervix: {
    name: "Infiltración Cervical",
    description: "Invasión del estroma cervical",
    importance: 0.04,
  },
  recep_est_porcent: {
    name: "Receptores Estrógenos",
    description: "Porcentaje de expresión de receptores de estrógenos (%)",
    importance: 0.04,
  },
  p53_ihq: {
    name: "p53",
    description: "Estado de la proteína p53 (Wild-type vs Aberrante/Mutado)",
    importance: 0.02,
  },
  mmr_deficient: {
    name: "Mismatch Repair (MMR)",
    description: "Estado del sistema de reparación de apareamiento (Deficiente vs Proficiente)",
    importance: 0.05, // Added importance manually for context
  }
};

export interface FactorContribution {
  feature: string;
  name: string;
  value: number;
  displayValue: string;
  contribution: number;
  normalizedContribution: number; // 0-100 scale for usage in UI
  direction: "positive" | "negative" | "neutral";
  description: string;
  importance: number;
}

export interface RiskResult {
  percentage: number;
  riskLevel: "low" | "intermediate" | "high" | "very-high";
  riskLabel: string;
  riskFactors: string[];
  recommendations: string[];
  factorContributions: FactorContribution[];
  modelExplanation: string;
  confidenceInterval?: [number, number];
  confidenceText?: string;
}

// Logistic Regression Model Coefficients (Optimized for 100% Recall)
const COEFFICIENTS = {
  edad: -0.137,
  imc: -0.828,
  grado_histologi: 0.850,
  tamano_tumoral: 0.442,
  infiltracion_mi: 1.632,
  afectacion_linf: 0.492,
  infilt_estr_cervix: 0.352,
  p53_ihq: -0.075,
  recep_est_porcent: -0.467,
  rece_de_Ppor: -0.593,
  FIGO2023: 0.618,
};

const INTERCEPT = 0.163;

const MEANS = {
  edad: 61.87,
  imc: 30.88,
  grado_histologi: 1.21,
  tamano_tumoral: 3.71,
  infiltracion_mi: 1.12,
  afectacion_linf: 0.19,
  infilt_estr_cervix: 0.11,
  p53_ihq: 1.35,
  recep_est_porcent: 82.44,
  rece_de_Ppor: 73.39,
  FIGO2023: 3.66,
};

const STDS = {
  edad: 14.45,
  imc: 7.57,
  grado_histologi: 0.41,
  tamano_tumoral: 4.37,
  infiltracion_mi: 0.77,
  afectacion_linf: 0.39,
  infilt_estr_cervix: 0.37,
  p53_ihq: 0.76,
  recep_est_porcent: 21.45,
  rece_de_Ppor: 24.76,
  FIGO2023: 4.05,
};

// ... Helper functions ...
function standardize(value: number, mean: number, std: number): number {
  return (value - mean) / std;
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export type FormData = {
  edad: number;
  imc: number;
  gradoHistologico?: string; // Dominant
  grado?: string;            // Deprecated/Alias
  tamanoTumoral: number;
  infiltracionMiometrial: string;
  lvsi: string;
  infiltracionCervical: string;
  estadioFIGO: string;
  p53: string;
  receptoresEstrogenos: number;
  receptoresProgesterona: number;
  mmrStatus?: string;
}

// ... Maps ...
const FIGO_MAP: Record<string, number> = {
  "IA": 1, "IB": 2, "II": 3, "IIIA": 5, "IIIB": 6, "IIIC1": 7, "IIIC2": 8, "IVA": 9, "IVB": 10
};
// Handle both UI label format and test_set.json format
const GRADE_MAP: Record<string, number> = { "Grado 1": 1, "Grado 2": 2, "grado1": 1, "grado2": 2 };
const LVSI_MAP: Record<string, number> = { "No": 0, "Sí": 1, "no": 0, "si": 1 };
const CERVIX_MAP: Record<string, number> = { "No": 0, "Glandular": 1, "Estroma": 2, "no": 0, "glandular": 1, "estroma": 2 };
const P53_MAP: Record<string, number> = { "Wild-type": 1, "Aberrante": 2, "normal": 1, "aberrante": 2, "mutado": 2 };
const MMR_MAP: Record<string, number> = { "Proficiente": 0, "Deficiente": 1, "proficient": 0, "deficient": 1 };

// Logic to map myometrial invasion from diverse inputs
function getMyometrialValue(val: string): number {
  const v = val.toLowerCase();
  if (v.includes("sin") || v.includes("<50") || v.includes("menor50")) return 0;
  if (v.includes("≥50") || v.includes("mayor50")) return 1;
  if (v.includes("serosa")) return 1; // Assuming serosa implies deep invasion equivalent risk or captured in FIGO
  return 0; // Default
}

export const calculateRisk = (data: FormData): RiskResult => {
  // Pre-process data to numeric
  const numericData = {
    edad: data.edad,
    imc: data.imc,
    grado_histologi: GRADE_MAP[data.gradoHistologico || data.grado || "grado1"] || 1, // Robust fallback
    tamano_tumoral: data.tamanoTumoral,
    infiltracion_mi: getMyometrialValue(data.infiltracionMiometrial),
    afectacion_linf: LVSI_MAP[data.lvsi] || 0,
    infilt_estr_cervix: CERVIX_MAP[data.infiltracionCervical] || 0,
    p53_ihq: P53_MAP[data.p53] || 1,
    recep_est_porcent: data.receptoresEstrogenos,
    rece_de_Ppor: data.receptoresProgesterona,
    FIGO2023: FIGO_MAP[data.estadioFIGO] || 1,
    mmr_deficient: MMR_MAP[data.mmrStatus || "unknown"] || 0,
  };

  // Calculate individual contributions
  const contributions: FactorContribution[] = [];
  let logit = INTERCEPT;

  for (const [feature, coef] of Object.entries(COEFFICIENTS)) {
    const value = numericData[feature as keyof typeof numericData];
    const mean = MEANS[feature as keyof typeof MEANS];
    const std = STDS[feature as keyof typeof STDS];
    const standardized = standardize(value, mean, std);
    const contribution = coef * standardized;
    logit += contribution;

    const info = FEATURE_INFO[feature];
    if (!info) continue;

    contributions.push({
      feature,
      name: info.name,
      value,
      displayValue: getDisplayValue(feature, value, data),
      contribution,
      normalizedContribution: 0,
      direction: contribution > 0.1 ? "positive" : contribution < -0.1 ? "negative" : "neutral",
      description: info.description,
      importance: info.importance,
    });
  }

  // Normalize contributions
  const maxAbsContribution = Math.max(...contributions.map(c => Math.abs(c.contribution)), 0.001);
  contributions.forEach(c => {
    c.normalizedContribution = Math.round((c.contribution / maxAbsContribution) * 50 + 50);
  });
  contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  // Calculate probability
  const probability = sigmoid(logit);
  const percentage = Math.round(probability * 100 * 10) / 10;

  // Determine risk level and recommendations
  let riskLevel: RiskResult["riskLevel"];
  let riskLabel: string;
  let recommendations: string[];

  if (probability < 0.10) {
    riskLevel = "low";
    riskLabel = "Riesgo Bajo";
    recommendations = [
      "Seguimiento clínico estándar cada 6 meses durante 2 años",
      "Citología vaginal anual",
      "No requiere tratamiento adyuvante",
      "Educación sobre síntomas de alarma",
    ];
  } else if (probability < 0.25) {
    riskLevel = "intermediate";
    riskLabel = "Riesgo Intermedio";
    recommendations = [
      "Considerar braquiterapia vaginal adyuvante (ESGO 2025)",
      "Seguimiento cada 3-4 meses durante 2 años",
      "Ecografía o TC pélvica cada 6-12 meses",
      "Marcadores tumorales si elevados al diagnóstico",
    ];
  } else if (probability < 0.50) {
    riskLevel = "high";
    riskLabel = "Riesgo Alto";
    recommendations = [
      "Radioterapia pélvica externa ± braquiterapia (ESGO 2025)",
      "Quimioterapia adyuvante (carboplatino/paclitaxel) secuencial",
      "Seguimiento intensivo cada 3 meses",
      "TC toraco-abdomino-pélvica cada 3-6 meses",
      "Derivación a comité de tumores ginecológicos",
    ];
  } else {
    riskLevel = "very-high";
    riskLabel = "Riesgo Muy Alto";
    recommendations = [
      "Tratamiento multimodal obligatorio (RT + QT)",
      "Quimioterapia sistémica con carboplatino/paclitaxel",
      "Radioterapia pélvica con campos extendidos según ESGO 2025",
      "Seguimiento mensual durante el primer año",
      "Considerar ensayos clínicos con inmunoterapia",
      "Evaluación multidisciplinar urgente",
    ];
  }

  // Add MMR-specific recommendation
  if (numericData.mmr_deficient === 1) {
    recommendations.push("MMR deficiente: considerar inmunoterapia (pembrolizumab) si recurrencia");
  }

  // Generate risk factors list
  const riskFactors = generateRiskFactors(numericData, data);

  // Generate model explanation
  const topFactors = contributions.slice(0, 3);
  const modelExplanation = generateModelExplanation(percentage, riskLabel, topFactors, numericData);

  // Frontend mocked confidence interval (simplified) for when backend is not reached
  const uncertainty = percentage > 20 && percentage < 80 ? 10 : 5;
  const ciLower = Math.max(0, percentage - uncertainty);
  const ciUpper = Math.min(100, percentage + uncertainty);

  return {
    percentage,
    riskLevel,
    riskLabel,
    riskFactors,
    recommendations,
    factorContributions: contributions,
    modelExplanation,
    confidenceInterval: [ciLower, ciUpper],
    confidenceText: `IC estim. ${ciLower.toFixed(1)}% - ${ciUpper.toFixed(1)}%`
  };
};

function getDisplayValue(feature: string, value: number, data: FormData): string {
  switch (feature) {
    case "grado_histologi":
      return value === 2 ? "Grado 2 (Alto)" : "Grado 1 (Bajo)";
    case "FIGO2023":
      return data.estadioFIGO;
    case "afectacion_linf":
      return value === 1 ? "Sí" : "No";
    case "infiltracion_mi":
      return ["Sin infiltración", "<50%", "≥50%", "Serosa"][value] || "N/A";
    case "infilt_estr_cervix":
      return ["No", "Glandular", "Estroma"][value] || "N/A";
    case "p53_ihq":
      return ["", "Normal", "Aberrante", "No disponible"][value] || "N/A";
    case "mmr_deficient":
      return value === 1 ? "Deficiente" : "Proficiente";
    case "edad":
      return `${value} años`;
    case "imc":
      return `${value} kg/m²`;
    case "tamano_tumoral":
      return `${value} cm`;
    case "recep_est_porcent":
    case "rece_de_Ppor":
      return `${value}%`;
    default:
      return String(value);
  }
}

function generateRiskFactors(numericData: Record<string, number>, data: FormData): string[] {
  const riskFactors: string[] = [];

  if (numericData.grado_histologi === 2) {
    riskFactors.push("Grado histológico alto (Grado 2)");
  }
  if (numericData.FIGO2023 >= 5) {
    riskFactors.push(`Estadio FIGO avanzado (${data.estadioFIGO})`);
  }
  if (numericData.tamano_tumoral > 5) {
    riskFactors.push(`Tamaño tumoral grande (${numericData.tamano_tumoral} cm)`);
  }
  if (numericData.afectacion_linf === 1) {
    riskFactors.push("Invasión linfovascular presente (LVSI+)");
  }
  if (numericData.infiltracion_mi >= 2) {
    riskFactors.push("Infiltración miometrial profunda (≥50%)");
  }
  if (numericData.infilt_estr_cervix === 2) {
    riskFactors.push("Infiltración estromal cervical");
  }
  if (numericData.p53_ihq === 2) {
    riskFactors.push("p53 aberrante");
  }
  if (numericData.mmr_deficient === 1) {
    riskFactors.push("MMR deficiente (dMMR)");
  }
  if (numericData.recep_est_porcent < 10) {
    riskFactors.push("Receptores de estrógenos bajos (<10%)");
  }
  if (numericData.rece_de_Ppor < 10) {
    riskFactors.push("Receptores de progesterona bajos (<10%)");
  }
  if (numericData.edad > 75) {
    riskFactors.push(`Edad avanzada (${numericData.edad} años)`);
  }
  if (numericData.imc >= 35) {
    riskFactors.push(`Obesidad severa (IMC ${numericData.imc})`);
  }

  if (riskFactors.length === 0) {
    riskFactors.push("Sin factores de riesgo significativos identificados");
  }

  return riskFactors;
}

function generateModelExplanation(
  percentage: number,
  riskLabel: string,
  topFactors: FactorContribution[],
  numericData: Record<string, number>
): string {
  const increasing = topFactors.filter(f => f.contribution > 0);
  const decreasing = topFactors.filter(f => f.contribution < 0);

  let explanation = `El modelo NEST v2.0 estima una probabilidad de recurrencia del ${percentage}% (${riskLabel}). `;

  if (increasing.length > 0) {
    const factors = increasing.map(f => f.name.toLowerCase()).join(", ");
    explanation += `Los factores que más aumentan el riesgo son: ${factors}. `;
  }

  if (decreasing.length > 0) {
    const factors = decreasing.map(f => f.name.toLowerCase()).join(", ");
    explanation += `Los factores protectores son: ${factors}. `;
  }

  if (numericData.mmr_deficient === 1) {
    explanation += "Nota: La paciente presenta deficiencia MMR, lo que puede influir en opciones de inmunoterapia. ";
  }

  explanation += "Modelo basado en regresión logística entrenado con 154 pacientes NSMP del Hospital Sant Pau (AUC: 0.938).";

  return explanation;
}

// Export model info
export const MODEL_INFO = {
  name: "NEST v2.0",
  type: "Logistic Regression",
  auc: 0.938,
  cvAuc: 0.827,
  accuracy: 0.923,
  cohortSize: 154,
  recurrenceRate: 0.188,
  mmrDeficientRate: 0.221,
  trainingDate: "2024-12-13",
  hospital: "Hospital de la Santa Creu i Sant Pau",
  features: Object.values(FEATURE_INFO).map(f => ({ name: f.name, importance: f.importance })),
};

export const getFeatureInfo = () => FEATURE_INFO;
