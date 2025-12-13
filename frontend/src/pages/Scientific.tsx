/**
 * Scientific Analysis Page - Shows research basis and model validation
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart3, GitBranch, FileText, TrendingUp,
    PieChart, Activity, Database, BookOpen, CheckCircle
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BatchValidation from "@/components/BatchValidation";
import { MODEL_INFO } from "@/lib/riskCalculator";

const ScientificAnalysis = () => {
    const graphs = [
        {
            id: "roc",
            title: "Curva ROC",
            description: "Receiver Operating Characteristic curve mostrando la capacidad discriminativa del modelo. AUC = 0.938 indica excelente rendimiento.",
            image: "/scientific/roc_curve.png",
            icon: TrendingUp,
            metrics: ["AUC: 0.938", "Sensibilidad: 85%", "Especificidad: 89%"]
        },
        {
            id: "importance",
            title: "Importancia de Variables",
            description: "Contribución relativa de cada variable al modelo predictivo. El grado histológico y los receptores de progesterona son los más importantes.",
            image: "/scientific/feature_importance.png",
            icon: BarChart3,
            metrics: ["11 variables", "Normalizado", "Coeficientes absolutos"]
        },
        {
            id: "calibration",
            title: "Curva de Calibración",
            description: "Validación de que las probabilidades predichas corresponden a las frecuencias observadas. Línea diagonal = calibración perfecta.",
            image: "/scientific/calibration.png",
            icon: Activity,
            metrics: ["5 bins", "Brier score: 0.12", "Buena calibración"]
        },
        {
            id: "correlation",
            title: "Matriz de Correlación",
            description: "Correlaciones entre variables clínicas y moleculares. Ayuda a identificar multicolinealidad y relaciones entre predictores.",
            image: "/scientific/correlation.png",
            icon: GitBranch,
            metrics: ["10 variables", "Pearson correlation", "Triangular inferior"]
        },
        {
            id: "risk_factors",
            title: "Factores de Riesgo",
            description: "Distribución de recurrencia según principales factores clínicos: LVSI, grado histológico, infiltración miometrial y estadio FIGO.",
            image: "/scientific/risk_factors.png",
            icon: PieChart,
            metrics: ["4 factores", "Distribución bivariada", "Chi-square p<0.001"]
        },
        {
            id: "distributions",
            title: "Distribuciones",
            description: "Distribución de variables continuas (edad, IMC, tamaño tumoral, tiempo de seguimiento) según estado de recurrencia.",
            image: "/scientific/distributions.png",
            icon: BarChart3,
            metrics: ["4 variables", "KDE overlay", "Mann-Whitney test"]
        },
        {
            id: "cohort",
            title: "Cohorte NSMP",
            description: "Distribución de outcomes en la cohorte de entrenamiento: 154 pacientes NSMP del Hospital Sant Pau.",
            image: "/scientific/cohort_pie.png",
            icon: Database,
            metrics: ["n=154", "18.8% recurrencia", "Mediana seguimiento: 33 meses"]
        }
    ];

    const references = [
        {
            title: "ESGO-ESTRO-ESP Guidelines 2025",
            authors: "Concin N, et al.",
            journal: "Int J Gynecol Cancer",
            description: "Guías europeas actualizadas para el manejo de carcinoma endometrial, incluyendo la nueva estadificación FIGO 2023.",
            link: "#"
        },
        {
            title: "Early Endometrial Cancer Recurrence Risk Prediction Model",
            authors: "Hao Y, et al.",
            journal: "Am J Cancer Res 2025",
            description: "Modelo nomogram Cox-regression para predicción de recurrencia en estadios tempranos. C-index: 0.748.",
            link: "#"
        },
        {
            title: "ESGO-ESTRO-ESP Endometrial Cancer 2021",
            authors: "Concin N, et al.",
            journal: "Int J Gynecol Cancer 2021",
            description: "Guías previas con definición de grupos de riesgo molecular incluyendo NSMP.",
            link: "#"
        },
        {
            title: "Oncoguía Cáncer de Endometrio 2023",
            authors: "Instituto Català d'Oncologia",
            journal: "ICO Guidelines",
            description: "Guía clínica catalana para el manejo del cáncer de endometrio.",
            link: "#"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Page Header */}
                    <div className="text-center mb-8">
                        <Badge className="mb-4" variant="outline">
                            <BookOpen className="w-4 h-4 mr-1" />
                            Base Científica
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                            Análisis Científico del Modelo
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Visualizaciones y métricas de validación del modelo NEST v2.0.
                            Basado en datos de {MODEL_INFO.cohortSize} pacientes NSMP del Hospital Sant Pau.
                        </p>
                    </div>

                    {/* Model Summary Card */}
                    <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                        <div className="grid sm:grid-cols-4 gap-6 text-center">
                            <div>
                                <div className="text-3xl font-bold text-primary">{MODEL_INFO.auc}</div>
                                <div className="text-sm text-muted-foreground">AUC-ROC</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary">{MODEL_INFO.cohortSize}</div>
                                <div className="text-sm text-muted-foreground">Pacientes</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary">12</div>
                                <div className="text-sm text-muted-foreground">Variables</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary">{(MODEL_INFO.recurrenceRate * 100).toFixed(0)}%</div>
                                <div className="text-sm text-muted-foreground">Tasa Recurrencia</div>
                            </div>
                        </div>
                    </Card>

                    {/* Tabs */}
                    <Tabs defaultValue="validation" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="validation">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Validación Sets
                            </TabsTrigger>
                            <TabsTrigger value="visualizations">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Visualizaciones
                            </TabsTrigger>
                            <TabsTrigger value="references">
                                <FileText className="w-4 h-4 mr-2" />
                                Referencias
                            </TabsTrigger>
                        </TabsList>

                        {/* Validation Tab */}
                        <TabsContent value="validation">
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground mb-4">
                                    Validación automática del modelo contra el **Test Set (25% de la cohorte)**.
                                    Estos 39 pacientes no fueron utilizados durante el entrenamiento del modelo.
                                </div>
                                <BatchValidation />
                            </div>
                        </TabsContent>

                        {/* Visualizations Tab */}
                        <TabsContent value="visualizations">
                            <div className="grid md:grid-cols-2 gap-6">
                                {graphs.map((graph) => (
                                    <Card key={graph.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="aspect-[4/3] bg-[#1a1a2e] flex items-center justify-center">
                                            <img
                                                src={graph.image}
                                                alt={graph.title}
                                                className="w-full h-full object-contain"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <graph.icon className="w-5 h-5 text-primary" />
                                                <h3 className="font-semibold">{graph.title}</h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {graph.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {graph.metrics.map((metric, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        {metric}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* References Tab */}
                        <TabsContent value="references">
                            <div className="space-y-4">
                                {references.map((ref, index) => (
                                    <Card key={index} className="p-5 hover:shadow-lg transition-shadow">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground mb-1">
                                                    {ref.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {ref.authors} • <span className="italic">{ref.journal}</span>
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {ref.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}

                                {/* Methodology Card */}
                                <Card className="p-5 bg-accent/30 border-primary/20">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary" />
                                        Metodología del Modelo
                                    </h3>
                                    <div className="text-sm text-muted-foreground space-y-2">
                                        <p><strong>Tipo:</strong> Regresión Logística con regularización L2</p>
                                        <p><strong>Validación:</strong> Hold-out 75/25 con estratificación + Cross-validation 5-fold</p>
                                        <p><strong>Preprocesamiento:</strong> Imputación por mediana, estandarización Z-score</p>
                                        <p><strong>Balance de clases:</strong> Ponderación inversa a frecuencia</p>
                                        <p><strong>Variables:</strong> Clínicas (edad, IMC), histopatológicas (grado, LVSI, infiltración), moleculares (p53, MMR, receptores hormonales)</p>
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ScientificAnalysis;
