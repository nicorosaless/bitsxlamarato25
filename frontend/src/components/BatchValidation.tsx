/**
 * BatchValidation - Validates model against the full test set
 */

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    CheckCircle, XCircle, Search, Filter, AlertTriangle,
    BarChart, TrendingUp
} from "lucide-react";
import { calculateRisk } from "@/lib/riskCalculator";
import testSetData from "@/data/test_set.json";
import { FormData } from "./RiskForm";

interface TestCase {
    id: number;
    actualRecurrence: boolean;
    followUpMonths: number;
    data: FormData;
}

const BatchValidation = () => {
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    // Calculate predictions for all cases
    const results = useMemo(() => {
        return (testSetData as TestCase[]).map(c => {
            const risk = calculateRisk(c.data as FormData);
            const predictedRecurrence = risk.percentage > 25; // Threshold for binary classification
            const isCorrect = predictedRecurrence === c.actualRecurrence;

            // True Positive: Pred=True, Actual=True
            // True Negative: Pred=False, Actual=False
            // False Positive: Pred=True, Actual=False
            // False Negative: Pred=False, Actual=True

            let type = "";
            if (isCorrect) {
                type = predictedRecurrence ? "TP" : "TN";
            } else {
                type = predictedRecurrence ? "FP" : "FN";
            }

            return {
                ...c,
                predictedRisk: risk.percentage,
                predictedLevel: risk.riskLevel,
                predictedRecurrence,
                isCorrect,
                type
            };
        });
    }, []);

    // Filter results
    const filteredResults = results.filter(r => {
        if (filter === "correct" && !r.isCorrect) return false;
        if (filter === "incorrect" && r.isCorrect) return false;
        if (filter === "recurrence" && !r.actualRecurrence) return false;

        if (search) {
            const searchLower = search.toLowerCase();
            return (
                r.id.toString().includes(search) ||
                r.type.toLowerCase().includes(searchLower) ||
                r.predictedLevel.includes(searchLower)
            );
        }

        return true;
    });

    // Calculate metrics
    const metrics = useMemo(() => {
        const total = results.length;
        const correct = results.filter(r => r.isCorrect).length;
        const tp = results.filter(r => r.type === "TP").length;
        const tn = results.filter(r => r.type === "TN").length;
        const fp = results.filter(r => r.type === "FP").length;
        const fn = results.filter(r => r.type === "FN").length;

        const accuracy = correct / total;
        const sensitivity = tp / (tp + fn) || 0;
        const specificity = tn / (tn + fp) || 0;
        const precision = tp / (tp + fp) || 0;
        const f1 = 2 * (precision * sensitivity) / (precision + sensitivity) || 0;

        return { total, correct, accuracy, sensitivity, specificity, precision, f1, tp, tn, fp, fn };
    }, [results]);

    return (
        <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Accuracy</div>
                    <div className="text-3xl font-bold text-primary">{(metrics.accuracy * 100).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground mt-1">{metrics.correct}/{metrics.total} casos correctos</div>
                </Card>
                <Card className="p-4">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Sensibilidad</div>
                    <div className="text-3xl font-bold">{(metrics.sensitivity * 100).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground mt-1">Detecta {metrics.tp} de {metrics.tp + metrics.fn} recidivas</div>
                </Card>
                <Card className="p-4">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Especificidad</div>
                    <div className="text-3xl font-bold">{(metrics.specificity * 100).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground mt-1">Descarta {metrics.tn} de {metrics.tn + metrics.fp} casos</div>
                </Card>
                <Card className="p-4">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">F1 Score</div>
                    <div className="text-3xl font-bold">{metrics.f1.toFixed(3)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Balance Precisión-Recall</div>
                </Card>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex gap-2">
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("all")}
                    >
                        Todos
                    </Button>
                    <Button
                        variant={filter === "incorrect" ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => setFilter("incorrect")}
                    >
                        Errores ({results.length - metrics.correct})
                    </Button>
                    <Button
                        variant={filter === "recurrence" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("recurrence")}
                    >
                        Recidivas ({metrics.tp + metrics.fn})
                    </Button>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar ID..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Results Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Outcome Real</TableHead>
                                <TableHead>Predicción</TableHead>
                                <TableHead>Riesgo Calc.</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Seguimiento</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredResults.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className="font-mono text-xs">#{row.id}</TableCell>
                                    <TableCell>
                                        {row.actualRecurrence ? (
                                            <Badge variant="destructive">Recidiva</Badge>
                                        ) : (
                                            <Badge variant="secondary">No Recidiva</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {row.predictedRecurrence ? (
                                            <span className="text-red-600 font-medium">Alto Riesgo</span>
                                        ) : (
                                            <span className="text-green-600 font-medium">Bajo Riesgo</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${row.predictedRisk > 50 ? 'bg-red-500' :
                                                        row.predictedRisk > 25 ? 'bg-orange-500' : 'bg-green-500'
                                                        }`}
                                                    style={{ width: `${row.predictedRisk}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-mono">{row.predictedRisk.toFixed(1)}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            row.type === "TP" || row.type === "TN"
                                                ? "border-green-500 text-green-600"
                                                : "border-red-500 text-red-600"
                                        }>
                                            {row.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground text-xs">
                                        {row.followUpMonths} m
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <div className="text-xs text-muted-foreground text-center">
                * Validado con {metrics.total} pacientes del set de prueba (25% de la cohorte, 39 casos nunca vistos por el modelo).
                Umbral de decisión: &gt;25% de riesgo.
            </div>
        </div>
    );
};

export default BatchValidation;
