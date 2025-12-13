/**
 * PatientExamples - Real patient cases from Sant Pau cohort for model validation
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    UserCheck, UserX, User, ChevronRight, CheckCircle, XCircle, Clock
} from "lucide-react";
import { FormData } from "./RiskForm";
import { calculateRisk } from "@/lib/riskCalculator";

interface PatientExample {
    id: string;
    name: string;
    description: string;
    expectedRecurrence: boolean;
    followUpMonths: number;
    data: FormData;
}

// Real patient data from Sant Pau cohort (anonymized)
const PATIENT_EXAMPLES: PatientExample[] = [
    {
        id: "low_risk",
        name: "Caso 1: Bajo Riesgo",
        description: "Mujer 68 años, Grado 1, FIGO IA, sin LVSI. Seguimiento 63 meses sin recidiva.",
        expectedRecurrence: false,
        followUpMonths: 63,
        data: {
            edad: 68,
            imc: 31.1,
            gradoHistologico: "grado1",
            tamanoTumoral: 5.0,
            infiltracionMiometrial: "menor50",
            lvsi: "no",
            infiltracionCervical: "no",
            estadioFIGO: "IA",
            p53: "normal",
            mmrStatus: "proficient",
            receptoresEstrogenos: 90,
            receptoresProgesterona: 90,
        }
    },
    {
        id: "high_risk",
        name: "Caso 2: Alto Riesgo",
        description: "Mujer 79 años, Grado 2, FIGO III, LVSI+, infiltración serosa. Recidiva a 39 meses.",
        expectedRecurrence: true,
        followUpMonths: 39,
        data: {
            edad: 79,
            imc: 25.4,
            gradoHistologico: "grado2",
            tamanoTumoral: 3.0,
            infiltracionMiometrial: "serosa",
            lvsi: "si",
            infiltracionCervical: "no",
            estadioFIGO: "IIIA",
            p53: "normal",
            mmrStatus: "proficient",
            receptoresEstrogenos: 50,
            receptoresProgesterona: 50,
        }
    },
    {
        id: "intermediate",
        name: "Caso 3: Intermedio",
        description: "Mujer 68 años, Grado 2, infiltración cervical estromal. Seguimiento 21 meses sin recidiva.",
        expectedRecurrence: false,
        followUpMonths: 21,
        data: {
            edad: 68,
            imc: 39.4,
            gradoHistologico: "grado2",
            tamanoTumoral: 2.5,
            infiltracionMiometrial: "menor50",
            lvsi: "no",
            infiltracionCervical: "estroma",
            estadioFIGO: "II",
            p53: "normal",
            mmrStatus: "proficient",
            receptoresEstrogenos: 80,
            receptoresProgesterona: 10,
        }
    }
];

interface PatientExamplesProps {
    onSelectPatient: (data: FormData) => void;
}

const PatientExamples = ({ onSelectPatient }: PatientExamplesProps) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showPredictions, setShowPredictions] = useState(false);

    const handleSelect = (patient: PatientExample) => {
        setSelectedId(patient.id);
        onSelectPatient(patient.data);
    };

    const predictions = PATIENT_EXAMPLES.map(patient => {
        const result = calculateRisk(patient.data);
        return {
            ...patient,
            predictedRisk: result.percentage,
            predictedLevel: result.riskLevel,
            isCorrect: patient.expectedRecurrence ? result.percentage > 25 : result.percentage < 25
        };
    });

    return (
        <Card className="p-4 bg-muted/30 border-border">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Casos Ejemplo (Pacientes Reales)
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPredictions(!showPredictions)}
                >
                    {showPredictions ? "Ocultar predicciones" : "Ver predicciones"}
                </Button>
            </div>

            <div className="grid gap-3">
                {predictions.map((patient) => (
                    <div
                        key={patient.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedId === patient.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-accent/50'
                            }`}
                        onClick={() => handleSelect(patient)}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {patient.expectedRecurrence ? (
                                        <UserX className="w-4 h-4 text-red-500" />
                                    ) : (
                                        <UserCheck className="w-4 h-4 text-green-500" />
                                    )}
                                    <span className="font-medium text-sm">{patient.name}</span>
                                    <Badge variant={patient.expectedRecurrence ? "destructive" : "secondary"} className="text-xs">
                                        {patient.expectedRecurrence ? "Recidiva" : "Sin recidiva"}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{patient.description}</p>

                                {showPredictions && (
                                    <div className="mt-2 flex items-center gap-3 text-xs">
                                        <span className={`font-medium ${patient.predictedLevel === 'low' ? 'text-green-600' :
                                                patient.predictedLevel === 'intermediate' ? 'text-yellow-600' :
                                                    'text-red-600'
                                            }`}>
                                            Predicción: {patient.predictedRisk.toFixed(1)}%
                                        </span>
                                        {patient.isCorrect ? (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="w-3 h-3" /> Correcto
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-600">
                                                <XCircle className="w-3 h-3" /> Revisar
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        {patient.followUpMonths} meses
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showPredictions && (
                <div className="mt-4 p-3 bg-accent/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                        <strong>Validación:</strong> El modelo predice correctamente{' '}
                        {predictions.filter(p => p.isCorrect).length} de {predictions.length} casos.
                        Los casos se consideran "correctos" si riesgo alto (&gt;25%) coincide con recidiva real.
                    </p>
                </div>
            )}
        </Card>
    );
};

export default PatientExamples;
