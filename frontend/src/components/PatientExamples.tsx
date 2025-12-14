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
            <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm">
                <User className="w-4 h-4 text-primary" />
                Cargar Caso Ejemplo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {predictions.map((patient) => (
                    <div
                        key={patient.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between hover:shadow-md ${selectedId === patient.id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border bg-card hover:border-primary/50'
                            }`}
                        onClick={() => handleSelect(patient)}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm text-foreground">{patient.name}</span>
                            <Badge variant={patient.expectedRecurrence ? "destructive" : "secondary"} className="text-[10px] h-5">
                                {patient.expectedRecurrence ? "Recidiva" : "No Recidiva"}
                            </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">
                            {patient.description}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {patient.followUpMonths}m
                            </span>
                            <span className={`font-mono font-medium ${patient.predictedLevel === 'low' ? 'text-green-600' : 'text-red-500'}`}>
                                Histórico: {patient.predictedRisk.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default PatientExamples;
