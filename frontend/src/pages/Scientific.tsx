/**
 * Scientific Analysis Page - Shows research basis and model validation
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart3, GitBranch, FileText, TrendingUp,
    PieChart, Activity, Database, BookOpen, CheckCircle, Cpu
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
                        <TabsList className="grid w-full grid-cols-4 mb-6">
                            <TabsTrigger value="validation">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Validación Sets
                            </TabsTrigger>
                            <TabsTrigger value="visualizations">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Visualizaciones
                            </TabsTrigger>
                            <TabsTrigger value="development">
                                <Cpu className="w-4 h-4 mr-2" />
                                Desarrollo
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

                        {/* Model Development Tab */}
                        <TabsContent value="development">
                            <div className="space-y-6">
                                {/* Methodology Detail Card */}
                                <Card className="p-6 bg-card border-border">
                                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <Activity className="w-6 h-6 text-primary" />
                                        Metodología: Del Dato a la Predicción Neural
                                    </h3>

                                    <div className="grid gap-8">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3 text-lg">
                                                    <Database className="w-5 h-5 text-blue-500" />
                                                    1. Tratamiento de Datos
                                                </h4>
                                                <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm leading-relaxed">
                                                    <li><strong>Dataset:</strong> 154 pacientes NSMP del Hospital Sant Pau.</li>
                                                    <li><strong>Limpieza:</strong> Imputación inteligente (mediana/moda) para maximizar n.</li>
                                                    <li><strong>Ingeniería:</strong> Normalización Z-score y creación de variables compuestas (Mismatch Repair status).</li>
                                                    <li><strong>Bias Check:</strong> Exclusión de variables de tratamiento para evitar sesgo de indicación.</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3 text-lg">
                                                    <GitBranch className="w-5 h-5 text-green-500" />
                                                    2. Comparativa de Modelos
                                                </h4>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Se entrenaron y validaron 3 arquitecturas diferentes para encontrar el equilibrio perfecto entre precisión e interpretabilidad:
                                                </p>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-2 bg-muted/40 rounded border border-border/50">
                                                        <span className="text-sm font-medium">Logistic Regression (L2)</span>
                                                        <Badge className="bg-green-500/15 text-green-600 hover:bg-green-500/25 border-green-500/20">Seleccionado</Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between p-2 bg-muted/40 rounded border border-border/50 opacity-70">
                                                        <span className="text-sm">Random Forest</span>
                                                        <Badge variant="outline" className="text-muted-foreground">Descartado (Overfitting)</Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between p-2 bg-muted/40 rounded border border-border/50 opacity-70">
                                                        <span className="text-sm">Gradient Boosting</span>
                                                        <Badge variant="outline" className="text-muted-foreground">Descartado (Caja Negra)</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-border/50 pt-6">
                                            <h4 className="flex items-center gap-2 font-semibold text-foreground mb-4 text-lg">
                                                <TrendingUp className="w-5 h-5 text-purple-500" />
                                                3. Arquitectura del Sistema Final
                                            </h4>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <Card className="p-4 bg-background/50 border-primary/10 hover:border-primary/30 transition-colors">
                                                    <div className="font-semibold text-primary mb-1">Predicción de Riesgo</div>
                                                    <div className="text-xs text-muted-foreground italic mb-2">Regresión Logística Regularizada</div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Proporciona la probabilidad base de recurrencia. Calibrada para minimizar falsos negativos en pacientes de alto riesgo.
                                                    </p>
                                                </Card>
                                                <Card className="p-4 bg-background/50 border-primary/10 hover:border-primary/30 transition-colors">
                                                    <div className="font-semibold text-primary mb-1">Análisis de Supervivencia</div>
                                                    <div className="text-xs text-muted-foreground italic mb-2">Cox Proportional Hazards</div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Genera curvas temporales personalizadas $S(t)$, estimando la probabilidad de supervivencia libre de enfermedad meses a meses.
                                                    </p>
                                                </Card>
                                                <Card className="p-4 bg-background/50 border-primary/10 hover:border-primary/30 transition-colors">
                                                    <div className="font-semibold text-primary mb-1">Búsqueda de Similares</div>
                                                    <div className="text-xs text-muted-foreground italic mb-2">KNN (K-Nearest Neighbors)</div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Encuentra "gemelas clínicas" en el histórico mediante distancia euclidiana en el espacio vectorial de features.
                                                    </p>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
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
                                                <a
                                                    href={ref.link}
                                                    className="inline-flex items-center text-xs text-primary hover:underline mt-2"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Ver publicación
                                                </a>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
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
