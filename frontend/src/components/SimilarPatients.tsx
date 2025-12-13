
import { SimilarPatient } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Users, AlertCircle, CheckCircle } from "lucide-react";

interface SimilarPatientsProps {
    patients: SimilarPatient[];
}

const SimilarPatients = ({ patients }: SimilarPatientsProps) => {
    if (!patients || patients.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map((patient, index) => (
                    <Card key={index} className={`p-4 border-l-4 ${patient.recidiva ? "border-l-red-500" : "border-l-green-500"}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Paciente #{index + 1}
                            </span>
                            <span className="text-sm font-semibold text-primary">
                                {(patient.match_score * 100).toFixed(0)}% Similar
                            </span>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Edad:</span>
                                <span>{patient.edad} años</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Estadio:</span>
                                <span>FIGO {patient.estadio}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Grado:</span>
                                <span>Grado {patient.grado}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border">
                            <div className="flex items-center gap-2 mb-1">
                                {patient.recidiva ? (
                                    <>
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        <span className="font-semibold text-red-600">Recidiva</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="font-semibold text-green-600">Libre de enfermedad</span>
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Seguimiento: {patient.tiempo_seguimiento} días
                            </p>
                        </div>
                    </Card>
                ))}
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
                * Basado en las 5 pacientes históricas más cercanas (Algoritmo KNN, Distancia Euclidiana).
            </p>
        </div>
    );
};

export default SimilarPatients;
