import { RiskResult, MODEL_INFO } from "./riskCalculator";
import { FormData } from "@/components/RiskForm";

/**
 * Generate printable PDF report for NEST risk assessment
 * Opens a new window with a formatted report that can be printed/saved as PDF
 */
export const generatePDFReport = (result: RiskResult, formData: FormData) => {
    const currentDate = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const riskColor = {
        low: "#10B981",
        intermediate: "#F59E0B",
        high: "#EF4444",
        "very-high": "#7C3AED",
    }[result.riskLevel];

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>NEST - Informe de Riesgo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #3b82f6;
    }
    
    .logo-subtitle {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
    
    .hospital-info {
      text-align: right;
      font-size: 12px;
      color: #6b7280;
    }
    
    .section {
      margin-bottom: 24px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .risk-result {
      text-align: center;
      padding: 30px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      margin-bottom: 24px;
    }
    
    .risk-percentage {
      font-size: 56px;
      font-weight: 700;
      color: ${riskColor};
    }
    
    .risk-label {
      display: inline-block;
      padding: 8px 20px;
      background: ${riskColor};
      color: white;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      margin-top: 12px;
    }
    
    .data-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 24px;
    }
    
    .data-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .data-label {
      color: #6b7280;
      font-size: 13px;
    }
    
    .data-value {
      font-weight: 500;
      font-size: 13px;
    }
    
    .factors-list, .recommendations-list {
      list-style: none;
    }
    
    .factors-list li, .recommendations-list li {
      padding: 8px 0;
      padding-left: 20px;
      position: relative;
      font-size: 13px;
    }
    
    .factors-list li::before {
      content: "";
      position: absolute;
      left: 0;
      top: 14px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ef4444;
    }
    
    .recommendations-list li::before {
      content: "";
      position: absolute;
      left: 0;
      top: 14px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #3b82f6;
    }
    
    .explanation {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      font-size: 13px;
      color: #4b5563;
      border-left: 4px solid #3b82f6;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #9ca3af;
    }
    
    .model-info {
      display: flex;
      gap: 24px;
      margin-bottom: 12px;
    }
    
    .disclaimer {
      background: #fef3c7;
      padding: 12px;
      border-radius: 6px;
      font-size: 11px;
      color: #92400e;
      margin-top: 12px;
    }
    
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">NEST</div>
      <div class="logo-subtitle">NSMP Endometrial Stratification Tool v2.0</div>
    </div>
    <div class="hospital-info">
      <strong>Hospital de la Santa Creu i Sant Pau</strong><br>
      Grup de Recerca en Patologies Ginecològiques<br>
      ${currentDate}
    </div>
  </div>

  <div class="risk-result">
    <div class="risk-percentage">${result.percentage}%</div>
    <div>Probabilidad de Recurrencia</div>
    <div class="risk-label">${result.riskLabel}</div>
  </div>

  <div class="section">
    <div class="section-title">Datos de la Paciente</div>
    <div class="data-grid">
      <div class="data-item">
        <span class="data-label">Edad</span>
        <span class="data-value">${formData.edad} años</span>
      </div>
      <div class="data-item">
        <span class="data-label">IMC</span>
        <span class="data-value">${formData.imc} kg/m²</span>
      </div>
      <div class="data-item">
        <span class="data-label">Grado Histológico</span>
        <span class="data-value">${formData.gradoHistologico === "grado2" ? "Grado 2 (Alto)" : "Grado 1 (Bajo)"}</span>
      </div>
      <div class="data-item">
        <span class="data-label">Tamaño Tumoral</span>
        <span class="data-value">${formData.tamanoTumoral} cm</span>
      </div>
      <div class="data-item">
        <span class="data-label">Infiltración Miometrial</span>
        <span class="data-value">${getInfiltracionLabel(formData.infiltracionMiometrial)}</span>
      </div>
      <div class="data-item">
        <span class="data-label">LVSI</span>
        <span class="data-value">${formData.lvsi === "si" ? "Sí" : "No"}</span>
      </div>
      <div class="data-item">
        <span class="data-label">Infiltración Cervical</span>
        <span class="data-value">${getCervicalLabel(formData.infiltracionCervical)}</span>
      </div>
      <div class="data-item">
        <span class="data-label">Estadio FIGO</span>
        <span class="data-value">${formData.estadioFIGO}</span>
      </div>
      <div class="data-item">
        <span class="data-label">p53 IHQ</span>
        <span class="data-value">${getP53Label(formData.p53)}</span>
      </div>
      <div class="data-item">
        <span class="data-label">Estado MMR</span>
        <span class="data-value">${getMMRLabel(formData.mmrStatus)}</span>
      </div>
      <div class="data-item">
        <span class="data-label">Receptores ER</span>
        <span class="data-value">${formData.receptoresEstrogenos}%</span>
      </div>
      <div class="data-item">
        <span class="data-label">Receptores PR</span>
        <span class="data-value">${formData.receptoresProgesterona}%</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Explicación del Modelo</div>
    <div class="explanation">
      ${result.modelExplanation}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Factores de Riesgo Identificados</div>
    <ul class="factors-list">
      ${result.riskFactors.map(f => `<li>${f}</li>`).join("")}
    </ul>
  </div>

  <div class="section">
    <div class="section-title">Recomendaciones Clínicas</div>
    <ul class="recommendations-list">
      ${result.recommendations.map(r => `<li>${r}</li>`).join("")}
    </ul>
  </div>

  <div class="footer">
    <div class="model-info">
      <span><strong>Modelo:</strong> ${MODEL_INFO.name}</span>
      <span><strong>AUC-ROC:</strong> ${MODEL_INFO.auc}</span>
      <span><strong>Cohorte:</strong> ${MODEL_INFO.cohortSize} pacientes</span>
    </div>
    <div class="disclaimer">
      ⚠️ Este informe es una herramienta de apoyo a la decisión clínica y no sustituye el juicio médico profesional. 
      Los resultados deben interpretarse en el contexto clínico de cada paciente individual.
      Basado en las guías ESGO-ESTRO-ESP 2025.
    </div>
  </div>

  <div class="no-print" style="text-align: center; margin-top: 30px;">
    <button onclick="window.print()" style="
      padding: 12px 32px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
    ">
      Imprimir / Guardar como PDF
    </button>
  </div>
</body>
</html>
  `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    }
};

function getInfiltracionLabel(value: string): string {
    const labels: Record<string, string> = {
        sin: "Sin infiltración",
        menor50: "<50%",
        mayor50: "≥50%",
        serosa: "Serosa",
    };
    return labels[value] || value;
}

function getCervicalLabel(value: string): string {
    const labels: Record<string, string> = {
        no: "No",
        glandular: "Glandular",
        estroma: "Estroma",
    };
    return labels[value] || value;
}

function getP53Label(value: string): string {
    const labels: Record<string, string> = {
        normal: "Normal",
        aberrante: "Aberrante",
        nodisponible: "No disponible",
    };
    return labels[value] || value;
}

function getMMRLabel(value: string): string {
    const labels: Record<string, string> = {
        proficient: "Proficiente (pMMR)",
        deficient: "Deficiente (dMMR)",
        unknown: "No disponible",
    };
    return labels[value] || "No especificado";
}
