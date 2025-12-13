import { FormData } from "@/components/RiskForm";

/**
 * NEST - NSMP Endometrial Stratification Tool v2.0
 * Real Logistic Regression Model trained on Sant Pau Hospital data
 * 
 * Model Performance:
 * - AUC-ROC: 0.938
 * - CV AUC: 0.827 ± 0.063
 * - Cohort: 154 NSMP patients
 * - Recurrence rate: 18.8%
 * 
 * Now includes MMR status (22.1% MMR deficient)
 */

// Model coefficients v2 (with MMR status)
const COEFFICIENTS = {
  edad: 0.019401,
  imc: -0.448946,
  grado_histologi: 1.36483,
  tamano_tumoral: -0.099892,
  infiltracion_mi: 0.245561,
  afectacion_linf: 0.4828,
  infilt_estr_cervix: 0.523317,
  p53_ihq: -0.138595,
  recep_est_porcent: -0.894299,
  rece_de_Ppor: 1.354039,
  FIGO2023: 0.055177,
  mmr_deficient: 0.257856,
};

const INTERCEPT = -1.018616;

// Standardization parameters
const MEANS = {
  edad: 61.8696,
  imc: 30.8834,
  grado_histologi: 1.2087,
  tamano_tumoral: 3.7109,
  infiltracion_mi: 1.1217,
  afectacion_linf: 0.1913,
  infilt_estr_cervix: 0.113,
  p53_ihq: 1.3478,
  recep_est_porcent: 82.4435,
  rece_de_Ppor: 73.3913,
  FIGO2023: 3.6609,
  mmr_deficient: 0.2087,
};

const STDS = {
  edad: 14.4514,
  imc: 7.5748,
  grado_histologi: 0.4064,
  tamano_tumoral: 4.3651,
  infiltracion_mi: 0.7706,
  afectacion_linf: 0.3933,
  infilt_estr_cervix: 0.3675,
  p53_ihq: 0.7581,
  recep_est_porcent: 21.4485,
  rece_de_Ppor: 24.7645,
  FIGO2023: 4.0537,
  mmr_deficient: 0.4064,
};

// Feature names and descriptions
const FEATURE_INFO: Record<string, {
  name: string;
  description: string;
  importance: number;
}> = {
  grado_histologi: {
    name: "Grado Histológico",
    description: "El grado del tumor indica qué tan diferentes son las células tumorales de las normales. Grado 2 (alto) se asocia con mayor agresividad.",
    importance: 0.22,
  },
  afectacion_linf: {
    name: "LVSI",
    description: "Invasión del espacio linfovascular. Indica si las células tumorales han invadido los vasos sanguíneos o linfáticos.",
    importance: 0.15,
  },
  FIGO2023: {
    name: "Estadio FIGO 2023",
    description: "Sistema de estadificación internacional que define la extensión del tumor.",
    importance: 0.14,
  },
  infilt_estr_cervix: {
    name: "Infiltración Cervical",
    description: "Extensión del tumor hacia el cuello uterino. La infiltración estromal es más significativa.",
    importance: 0.12,
  },
  imc: {
    name: "IMC",
    description: "Índice de Masa Corporal. La obesidad influye en factores hormonales del pronóstico.",
    importance: 0.11,
  },
  mmr_deficient: {
    name: "MMR Deficiente",
    description: "Deficiencia en reparación de errores de emparejamiento del ADN (MLH1, MSH2, MSH6, PMS2). El 22% de pacientes NSMP son MMR deficientes.",
    importance: 0.10,
  },
  rece_de_Ppor: {
    name: "Receptores PR",
    description: "Porcentaje de células con receptores de progesterona. Niveles altos indican mejor pronóstico.",
    importance: 0.08,
  },
  recep_est_porcent: {
    name: "Receptores ER",
    description: "Porcentaje de células con receptores de estrógenos.",
    importance: 0.05,
  },
  infiltracion_mi: {
    name: "Infiltración Miometrial",
    description: "Profundidad de invasión en la pared muscular del útero.",
    importance: 0.04,
  },
  tamano_tumoral: {
    name: "Tamaño Tumoral",
    description: "El diámetro máximo del tumor en centímetros.",
    importance: 0.03,
  },
  edad: {
    name: "Edad",
    description: "La edad al diagnóstico.",
    importance: 0.02,
  },
  p53_ihq: {
    name: "p53 IHQ",
    description: "Estado del gen p53 por inmunohistoquímica.",
    importance: 0.01,
  },
};

// Mappings
const GRADO_MAP: Record<string, number> = { grado1: 1, grado2: 2 };
const INFILTRACION_MAP: Record<string, number> = { sin: 0, menor50: 1, mayor50: 2, serosa: 3 };
const LVSI_MAP: Record<string, number> = { no: 0, si: 1 };
const CERVIX_MAP: Record<string, number> = { no: 0, glandular: 1, estroma: 2 };
const P53_MAP: Record<string, number> = { normal: 1, aberrante: 2, nodisponible: 3 };
const MMR_MAP: Record<string, number> = { proficient: 0, deficient: 1, unknown: 0 };
const FIGO_MAP: Record<string, number> = {
  IA: 1, IB: 2, IC: 3, II: 4, IIIA: 5, IIIB: 6, IIIC1: 7, IIIC2: 8, IVA: 9, IVB: 10
};

// Interfaces
export interface FactorContribution {
  feature: string;
  name: string;
  value: number | string;
  displayValue: string;
  contribution: number;
  normalizedContribution: number;
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
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function standardize(value: number, mean: number, std: number): number {
  return (value - mean) / std;
}

export const calculateRisk = (data: FormData): RiskResult => {
  // Convert form data to numeric values
  const numericData = {
    edad: data.edad,
    imc: data.imc,
    grado_histologi: GRADO_MAP[data.gradoHistologico] || 1,
    tamano_tumoral: data.tamanoTumoral,
    infiltracion_mi: INFILTRACION_MAP[data.infiltracionMiometrial] || 1,
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

  return {
    percentage,
    riskLevel,
    riskLabel,
    riskFactors,
    recommendations,
    factorContributions: contributions,
    modelExplanation,
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
