/**
 * CohortComparison - Shows how patient compares to the training cohort
 * Provides context with percentile ranking and similar patient outcomes
 */

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Clock, Target } from "lucide-react";

interface CohortComparisonProps {
    riskPercentage: number;
    riskLevel: "low" | "intermediate" | "high" | "very-high";
}

// Cohort statistics from the training data
const COHORT_STATS = {
    totalPatients: 154,
    recurrenceRate: 18.8,
    medianFollowUp: 32.6, // months
    riskDistribution: {
        low: { count: 89, recurrence: 3.4 },
        intermediate: { count: 36, recurrence: 16.7 },
        high: { count: 18, recurrence: 44.4 },
        "very-high": { count: 11, recurrence: 72.7 },
    },
    medianTimeToRecurrence: 17.0, // months
    fiveYearRFS: {
        low: 96.6,
        intermediate: 83.3,
        high: 55.6,
        "very-high": 27.3,
    },
};

const CohortComparison = ({ riskPercentage, riskLevel }: CohortComparisonProps) => {
    // Calculate percentile (what % of patients have lower risk)
    const getPercentile = (risk: number): number => {
        // Approximate based on risk distribution
        if (risk < 5) return 25;
        if (risk < 10) return 50;
        if (risk < 15) return 65;
        if (risk < 25) return 80;
        if (risk < 50) return 92;
        return 98;
    };

    const percentile = getPercentile(riskPercentage);
    const groupStats = COHORT_STATS.riskDistribution[riskLevel];
    const fiveYearRFS = COHORT_STATS.fiveYearRFS[riskLevel];

    const getRiskLevelLabel = () => {
        switch (riskLevel) {
            case "low": return "Bajo";
            case "intermediate": return "Intermedio";
            case "high": return "Alto";
            case "very-high": return "Muy Alto";
        }
    };

    const getRiskColor = () => {
        switch (riskLevel) {
            case "low": return "text-green-600 bg-green-100";
            case "intermediate": return "text-yellow-600 bg-yellow-100";
            case "high": return "text-orange-600 bg-orange-100";
            case "very-high": return "text-red-600 bg-red-100";
        }
    };

    return (
        <div className="space-y-4">
            {/* Percentile comparison */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-blue-900">
                            Percentil {percentile}
                        </div>
                        <div className="text-sm text-blue-700">
                            Mayor riesgo que el {percentile}% de la cohorte
                        </div>
                    </div>
                </div>
                <div className="relative pt-1">
                    <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-700"
                            style={{ width: `${percentile}%` }}
                        />
                    </div>
                    <div
                        className="absolute -top-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow transform -translate-x-1/2 transition-all duration-700"
                        style={{ left: `${percentile}%` }}
                    />
                </div>
            </Card>

            {/* Similar patients grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Patients in same group */}
                <Card className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Pacientes similares</span>
                    </div>
                    <div className="text-xl font-bold">{groupStats.count}</div>
                    <div className="text-xs text-muted-foreground">
                        de {COHORT_STATS.totalPatients} en grupo {getRiskLevelLabel()}
                    </div>
                </Card>

                {/* Recurrence in group */}
                <Card className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Recidiva en grupo</span>
                    </div>
                    <div className={`text-xl font-bold ${riskLevel === "low" ? "text-green-600" : riskLevel === "very-high" ? "text-red-600" : ""}`}>
                        {groupStats.recurrence.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                        tasa observada
                    </div>
                </Card>

                {/* 5-year RFS */}
                <Card className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">SLR a 5 años</span>
                    </div>
                    <div className={`text-xl font-bold ${fiveYearRFS > 80 ? "text-green-600" : fiveYearRFS < 50 ? "text-red-600" : "text-yellow-600"}`}>
                        {fiveYearRFS.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                        supervivencia libre
                    </div>
                </Card>

                {/* Median time to recurrence */}
                <Card className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Tiempo recidiva</span>
                    </div>
                    <div className="text-xl font-bold">{COHORT_STATS.medianTimeToRecurrence}</div>
                    <div className="text-xs text-muted-foreground">
                        meses (mediana)
                    </div>
                </Card>
            </div>

            {/* Outcome summary */}
            <Card className={`p-4 ${getRiskColor()}`}>
                <div className="text-sm font-medium">
                    En nuestra cohorte de {COHORT_STATS.totalPatients} pacientes NSMP:
                </div>
                <ul className="text-sm mt-2 space-y-1">
                    <li>• <strong>{groupStats.count} pacientes</strong> clasificados en riesgo {getRiskLevelLabel()}</li>
                    <li>• De estos, <strong>{Math.round(groupStats.count * groupStats.recurrence / 100)}</strong> presentaron recidiva ({groupStats.recurrence.toFixed(1)}%)</li>
                    <li>• Supervivencia libre de recurrencia a 5 años: <strong>{fiveYearRFS.toFixed(0)}%</strong></li>
                </ul>
            </Card>

            {/* Model info footer */}
            <div className="text-xs text-center text-muted-foreground">
                Datos de cohorte: Hospital Sant Pau, n={COHORT_STATS.totalPatients}, seguimiento mediano {COHORT_STATS.medianFollowUp.toFixed(1)} meses
            </div>
        </div>
    );
};

export default CohortComparison;
