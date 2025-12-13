import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import RiskGauge from "./RiskGauge";
import WaterfallChart from "./WaterfallChart";
import WhatIfAnalysis from "./WhatIfAnalysis";
import CohortComparison from "./CohortComparison";
import {
  RefreshCw, Download, AlertTriangle, CheckCircle, Info, Brain,
  TrendingUp, TrendingDown, Minus, HelpCircle, BarChart3, GitCompare, Users
} from "lucide-react";
import { RiskResult, MODEL_INFO } from "@/lib/riskCalculator";
import { FormData } from "./RiskForm";

interface RiskResultsProps {
  result: RiskResult;
  formData?: FormData;
  onReset: () => void;
  onExport: () => void;
}

const RiskResults = ({ result, formData, onReset, onExport }: RiskResultsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const getRiskBadgeClass = () => {
    switch (result.riskLevel) {
      case "low": return "risk-low";
      case "intermediate": return "risk-intermediate";
      case "high": return "risk-high";
      case "very-high": return "risk-very-high";
    }
  };

  const getRiskIcon = () => {
    switch (result.riskLevel) {
      case "low": return <CheckCircle className="w-4 h-4" />;
      case "intermediate": return <Info className="w-4 h-4" />;
      case "high":
      case "very-high": return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getContributionIcon = (direction: string) => {
    switch (direction) {
      case "positive": return <TrendingUp className="w-3 h-3 text-red-500" />;
      case "negative": return <TrendingDown className="w-3 h-3 text-green-500" />;
      default: return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getContributionColor = (direction: string): string => {
    switch (direction) {
      case "positive": return "bg-red-500";
      case "negative": return "bg-green-500";
      default: return "bg-gray-400";
    }
  };

  // Calculate base risk (18.8% cohort average)
  const baseRisk = 18.8;

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        {/* Gauge Section */}
        <div className="flex flex-col items-center py-4">
          <RiskGauge percentage={result.percentage} riskLevel={result.riskLevel} />
          <Badge className={`mt-4 px-4 py-2 text-sm font-semibold ${getRiskBadgeClass()}`}>
            {getRiskIcon()}
            <span className="ml-2">{result.riskLabel}</span>
          </Badge>
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="text-xs py-2">
              <Brain className="w-3 h-3 mr-1" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="waterfall" className="text-xs py-2">
              <BarChart3 className="w-3 h-3 mr-1" />
              Factores
            </TabsTrigger>
            <TabsTrigger value="whatif" className="text-xs py-2">
              <GitCompare className="w-3 h-3 mr-1" />
              What-If
            </TabsTrigger>
            <TabsTrigger value="cohort" className="text-xs py-2">
              <Users className="w-3 h-3 mr-1" />
              Cohorte
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Model Explanation */}
            <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                Explicación del Modelo
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.modelExplanation}
              </p>
            </Card>

            {/* Risk Factors */}
            <Card className="p-4 bg-card border-border">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Factores de Riesgo
              </h4>
              <ul className="space-y-2">
                {result.riskFactors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Recommendations */}
            <Card className="p-4 bg-accent/30 border-primary/20">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Recomendaciones Clínicas
              </h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-secondary-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          {/* Waterfall Tab */}
          <TabsContent value="waterfall" className="mt-4">
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Contribución de Factores al Riesgo
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Muestra cómo cada factor clínico suma o resta al riesgo base de {baseRisk}% (tasa de recurrencia en la cohorte).</p>
                  </TooltipContent>
                </Tooltip>
              </h4>
              <WaterfallChart
                contributions={result.factorContributions}
                baseRisk={baseRisk}
                finalRisk={result.percentage}
              />
            </Card>
          </TabsContent>

          {/* What-If Tab */}
          <TabsContent value="whatif" className="mt-4">
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-primary" />
                Análisis What-If
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Explore cómo cambiaría el riesgo si algún factor fuera diferente. Útil para decisiones de tratamiento.</p>
                  </TooltipContent>
                </Tooltip>
              </h4>
              {formData ? (
                <WhatIfAnalysis
                  originalFormData={formData}
                  originalRisk={result.percentage}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Datos del formulario no disponibles.</p>
              )}
            </Card>
          </TabsContent>

          {/* Cohort Tab */}
          <TabsContent value="cohort" className="mt-4">
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Comparación con Cohorte
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Compara esta paciente con las {MODEL_INFO.cohortSize} pacientes NSMP de la cohorte de entrenamiento.</p>
                  </TooltipContent>
                </Tooltip>
              </h4>
              <CohortComparison
                riskPercentage={result.percentage}
                riskLevel={result.riskLevel}
              />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Model Info */}
        <Card className="p-3 bg-muted/30 border-muted">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>Modelo: {MODEL_INFO.name}</span>
              <span>AUC: {MODEL_INFO.auc}</span>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-1 text-sm">
                  <p><strong>Modelo:</strong> {MODEL_INFO.type}</p>
                  <p><strong>AUC-ROC:</strong> {MODEL_INFO.auc}</p>
                  <p><strong>Cohorte:</strong> {MODEL_INFO.cohortSize} pacientes</p>
                  <p><strong>Hospital:</strong> {MODEL_INFO.hospital}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onReset} className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Nueva Evaluación
          </Button>
          <Button onClick={onExport} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default RiskResults;
