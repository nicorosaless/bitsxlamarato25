
import { FormData } from "@/components/RiskForm";

const API_URL = "http://localhost:8000";

export interface ApiPatientData {
    edad: number;
    imc: number;
    grado_histologi: number;
    tamano_tumoral: number;
    infiltracion_mi: number;
    afectacion_linf: number;
    infilt_estr_cervix: number;
    p53_ihq: number;
    recep_est_porcent: number;
    rece_de_Ppor: number;
    FIGO2023: number;
}

export interface SimilarPatient {
    match_score: number;
    edad: number;
    grado: number;
    estadio: number;
    recidiva: boolean;
    tiempo_seguimiento: number;
    tratamientos: string[];
}

export interface SurvivalCurveData {
    curve: { days: number; prob: number }[];
    projections: {
        "1_year": number;
        "3_year": number;
        "5_year": number;
    };
}

// Mappings from Frontend Strings to Backend Ints
const GRADO_MAP: Record<string, number> = { grado1: 1, grado2: 2 };
const INFILTRACION_MAP: Record<string, number> = { sin: 0, menor50: 1, mayor50: 2, serosa: 3 };
const LVSI_MAP: Record<string, number> = { no: 0, si: 1 };
const CERVIX_MAP: Record<string, number> = { no: 0, glandular: 1, estroma: 2 };
const P53_MAP: Record<string, number> = { normal: 1, aberrante: 2, nodisponible: 3 };
const FIGO_MAP: Record<string, number> = {
    IA: 1, IB: 2, IC: 3, II: 4, IIIA: 5, IIIB: 6, IIIC1: 7, IIIC2: 8, IVA: 9, IVB: 10
};

export const mapFormDataToApi = (data: FormData): ApiPatientData => {
    return {
        edad: data.edad,
        imc: data.imc,
        grado_histologi: GRADO_MAP[data.gradoHistologico] || 1,
        tamano_tumoral: data.tamanoTumoral,
        infiltracion_mi: INFILTRACION_MAP[data.infiltracionMiometrial] || 0, // Backend uses 0 for 'sin'
        afectacion_linf: LVSI_MAP[data.lvsi] || 0,
        infilt_estr_cervix: CERVIX_MAP[data.infiltracionCervical] || 0,
        p53_ihq: P53_MAP[data.p53] || 1,
        recep_est_porcent: data.receptoresEstrogenos,
        rece_de_Ppor: data.receptoresProgesterona,
        FIGO2023: FIGO_MAP[data.estadioFIGO] || 1,
    };
};

export const fetchSimilarPatients = async (data: FormData): Promise<SimilarPatient[]> => {
    const apiData = mapFormDataToApi(data);
    const response = await fetch(`${API_URL}/predict/similar-patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
    });

    if (!response.ok) {
        throw new Error("Error fetching similar patients");
    }

    const result = await response.json();
    return result.similar_patients;
};

export const fetchSurvivalCurve = async (data: FormData): Promise<SurvivalCurveData> => {
    const apiData = mapFormDataToApi(data);
    const response = await fetch(`${API_URL}/predict/survival-curve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
    });

    if (!response.ok) {
        throw new Error("Error fetching survival curve");
    }

    return await response.json();
};
