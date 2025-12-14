import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import RiskForm, { FormData } from "@/components/RiskForm";
import RiskResults from "@/components/RiskResults";
import PatientExamples from "@/components/PatientExamples";
import { calculateRisk, RiskResult } from "@/lib/riskCalculator";
import { generatePDFReport } from "@/lib/pdfExport";
import { toast } from "sonner";

const Index = () => {
  const [result, setResult] = useState<RiskResult | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const formRef = useRef<{ setFormData: (data: FormData) => void } | null>(null);

  const handleSubmit = async (data: FormData) => {
    // Validate required fields
    if (
      !data.gradoHistologico ||
      !data.infiltracionMiometrial ||
      !data.lvsi ||
      !data.infiltracionCervical ||
      !data.estadioFIGO ||
      !data.p53
    ) {
      toast.error("Por favor, complete todos los campos requeridos");
      return;
    }

    setIsCalculating(true);
    setFormData(data);

    // Simulate calculation delay for UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    const calculatedResult = calculateRisk(data);
    setResult(calculatedResult);
    setIsCalculating(false);

    toast.success("Cálculo completado");
  };

  const handleReset = () => {
    setResult(null);
    setFormData(null);
  };

  const handleExport = () => {
    if (result && formData) {
      generatePDFReport(result, formData);
      toast.success("Informe generado", {
        description: "Se ha abierto una nueva ventana con el informe para imprimir",
      });
    }
  };

  const handleSelectPatient = (data: FormData) => {
    setFormData(data);
    // Trigger calculation automatically
    handleSubmit(data);
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Evaluación de Riesgo de Recurrencia
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Herramienta de estratificación para carcinoma endometrial NSMP basada en
            parámetros clínicos, histopatológicos y moleculares (ESGO 2025).
          </p>
        </div>

        {/* Patient Examples */}
        <div className="mb-6">
          <PatientExamples onSelectPatient={handleSelectPatient} />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <Card className="p-6 bg-card border-border shadow-md">
            <RiskForm onSubmit={handleSubmit} isLoading={isCalculating} data={formData} />
          </Card>

          {/* Results Section */}
          <Card className="p-6 bg-card border-border shadow-md">
            {result ? (
              <RiskResults
                result={result}
                formData={formData ?? undefined}
                onReset={handleReset}
                onExport={handleExport}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Resultados de Evaluación
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Complete el formulario con los datos de la paciente y pulse
                  "Calcular Riesgo" para obtener la estratificación.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
          Esta herramienta es de apoyo a la decisión clínica y no sustituye el juicio médico.
          Los resultados deben interpretarse en el contexto clínico de cada paciente.
          Modelo NEST v2.0 entrenado con datos del Hospital Sant Pau (AUC: 0.938).
        </p>
      </div>
    </div>
  );
};

export default Index;
