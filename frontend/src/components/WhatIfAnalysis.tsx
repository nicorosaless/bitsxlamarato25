/**
 * WhatIfAnalysis - Interactive component to explore how changing factors affects risk
 * Allows clinicians to see "what if" scenarios
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { FormData } from "@/components/RiskForm";
import { calculateRisk } from "@/lib/riskCalculator";

interface WhatIfAnalysisProps {
    originalFormData: FormData;
    originalRisk: number;
}

const WhatIfAnalysis = ({ originalFormData, originalRisk }: WhatIfAnalysisProps) => {
    const [modifiedData, setModifiedData] = useState<FormData>({ ...originalFormData });
    const [newRisk, setNewRisk] = useState(originalRisk);

    useEffect(() => {
        const result = calculateRisk(modifiedData);
        setNewRisk(result.percentage);
    }, [modifiedData]);

    const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setModifiedData((prev) => ({ ...prev, [field]: value }));
    };

    const riskChange = newRisk - originalRisk;
    const getRiskChangeColor = () => {
        if (Math.abs(riskChange) < 1) return "text-gray-500";
        return riskChange > 0 ? "text-red-500" : "text-green-500";
    };

    const getRiskChangeIcon = () => {
        if (Math.abs(riskChange) < 1) return <Minus className="w-5 h-5" />;
        return riskChange > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />;
    };

    return (
        <div className="space-y-6">
            {/* Risk comparison header */}
            <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                    <div className="text-2xl font-bold">{originalRisk.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Riesgo actual</div>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
                <div className="text-center">
                    <div className={`text-2xl font-bold ${newRisk < 10 ? 'text-green-600' :
                            newRisk < 25 ? 'text-yellow-600' :
                                newRisk < 50 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                        {newRisk.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Riesgo nuevo</div>
                </div>
                <div className={`flex items-center gap-1 ${getRiskChangeColor()}`}>
                    {getRiskChangeIcon()}
                    <span className="text-lg font-semibold">
                        {riskChange > 0 ? '+' : ''}{riskChange.toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* Modifiable factors */}
            <div className="grid gap-4">
                {/* Grado Histológico */}
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <Label className="text-sm">Grado Histológico</Label>
                    <Select
                        value={modifiedData.gradoHistologico}
                        onValueChange={(v) => updateField("gradoHistologico", v)}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="grado1">Grado 1 (Bajo)</SelectItem>
                            <SelectItem value="grado2">Grado 2 (Alto)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* LVSI */}
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <Label className="text-sm">LVSI</Label>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">No</span>
                        <Switch
                            checked={modifiedData.lvsi === "si"}
                            onCheckedChange={(checked) => updateField("lvsi", checked ? "si" : "no")}
                        />
                        <span className="text-xs text-muted-foreground">Sí</span>
                    </div>
                </div>

                {/* Estadio FIGO */}
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <Label className="text-sm">Estadio FIGO</Label>
                    <Select
                        value={modifiedData.estadioFIGO}
                        onValueChange={(v) => updateField("estadioFIGO", v)}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="IA">IA</SelectItem>
                            <SelectItem value="IB">IB</SelectItem>
                            <SelectItem value="II">II</SelectItem>
                            <SelectItem value="IIIA">IIIA</SelectItem>
                            <SelectItem value="IIIB">IIIB</SelectItem>
                            <SelectItem value="IVA">IVA</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Infiltración Miometrial */}
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <Label className="text-sm">Infiltración Miometrial</Label>
                    <Select
                        value={modifiedData.infiltracionMiometrial}
                        onValueChange={(v) => updateField("infiltracionMiometrial", v)}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sin">Sin infiltración</SelectItem>
                            <SelectItem value="menor50">&lt;50%</SelectItem>
                            <SelectItem value="mayor50">≥50%</SelectItem>
                            <SelectItem value="serosa">Serosa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* MMR Status */}
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <Label className="text-sm">Estado MMR</Label>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">pMMR</span>
                        <Switch
                            checked={modifiedData.mmrStatus === "deficient"}
                            onCheckedChange={(checked) => updateField("mmrStatus", checked ? "deficient" : "proficient")}
                        />
                        <span className="text-xs text-muted-foreground">dMMR</span>
                    </div>
                </div>

                {/* Tamaño tumoral */}
                <div className="p-3 bg-card rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm">Tamaño Tumoral</Label>
                        <span className="text-sm font-medium">{modifiedData.tamanoTumoral} cm</span>
                    </div>
                    <Slider
                        value={[modifiedData.tamanoTumoral]}
                        onValueChange={([v]) => updateField("tamanoTumoral", v)}
                        min={0}
                        max={15}
                        step={0.5}
                    />
                </div>

                {/* Receptores PR */}
                <div className="p-3 bg-card rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm">Receptores Progesterona</Label>
                        <span className="text-sm font-medium">{modifiedData.receptoresProgesterona}%</span>
                    </div>
                    <Slider
                        value={[modifiedData.receptoresProgesterona]}
                        onValueChange={([v]) => updateField("receptoresProgesterona", v)}
                        min={0}
                        max={100}
                        step={5}
                    />
                </div>
            </div>

            {/* Insight */}
            <Card className="p-4 bg-blue-50 border-blue-200">
                <p className="text-sm text-blue-800">
                    💡 <strong>Insight:</strong> {getInsight(originalRisk, newRisk, modifiedData, originalFormData)}
                </p>
            </Card>
        </div>
    );
};

function getInsight(originalRisk: number, newRisk: number, modified: FormData, original: FormData): string {
    const diff = newRisk - originalRisk;

    if (Math.abs(diff) < 1) {
        return "Los cambios realizados no afectan significativamente el riesgo.";
    }

    const changes: string[] = [];

    if (modified.gradoHistologico !== original.gradoHistologico) {
        changes.push(modified.gradoHistologico === "grado1" ? "reducir el grado" : "aumentar el grado");
    }
    if (modified.lvsi !== original.lvsi) {
        changes.push(modified.lvsi === "no" ? "eliminar LVSI" : "presencia de LVSI");
    }
    if (modified.estadioFIGO !== original.estadioFIGO) {
        changes.push(`cambiar a estadio ${modified.estadioFIGO}`);
    }

    if (diff < 0) {
        return `${changes.join(", ")} reduciría el riesgo en ${Math.abs(diff).toFixed(1)} puntos porcentuales.`;
    } else {
        return `${changes.join(", ")} aumentaría el riesgo en ${diff.toFixed(1)} puntos porcentuales.`;
    }
}

export default WhatIfAnalysis;
