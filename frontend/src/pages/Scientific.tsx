import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    BarChart3, TrendingUp,
    Activity, Database, BookOpen, CheckCircle, Cpu,
    Filter, Binary, Ruler, ArrowRight, BrainCircuit, Clock,
    Microscope, ShieldCheck, GitBranch, PieChart, ChevronDown, ChevronUp, HelpCircle
} from "lucide-react";
import BatchValidation from "@/components/BatchValidation";
import { MODEL_INFO } from "@/lib/riskCalculator";

// Glossary definitions for technical terms
const GLOSSARY: Record<string, string> = {
    "AUC": "Area Under the Curve - Mide la capacidad del modelo para distinguir entre clases (0.5 = aleatorio, 1.0 = perfecto)",
    "ROC": "Receiver Operating Characteristic - Curva que muestra el trade-off entre sensibilidad y especificidad",
    "LVSI": "Lymphovascular Space Invasion - Invasión de espacios linfovasculares por células tumorales",
    "FIGO": "Federación Internacional de Ginecología y Obstetricia - Sistema de estadificación del cáncer",
    "IMC": "Índice de Masa Corporal - Peso(kg) / Altura(m)²",
    "NSMP": "No Specific Molecular Profile - Subtipo molecular sin alteraciones específicas identificables",
    "ER": "Estrogen Receptor - Receptor de estrógenos en células tumorales",
    "PR": "Progesterone Receptor - Receptor de progesterona en células tumorales",
    "MMR": "Mismatch Repair - Sistema de reparación de errores del ADN",
    "MICE": "Multiple Imputation by Chained Equations - Algoritmo para imputar valores faltantes",
    "Z-Score": "Normalización estadística: (valor - media) / desviación estándar",
    "Elastic Net": "Regularización que combina L1 (Lasso) y L2 (Ridge) para prevenir overfitting",
    "Cox": "Modelo de riesgos proporcionales para análisis de supervivencia",
    "Sensitivity": "Sensibilidad - Proporción de positivos correctamente identificados (TP / (TP + FN))",
    "Specificity": "Especificidad - Proporción de negativos correctamente identificados (TN / (TN + FP))",
};

// Helper component for technical term with tooltip
const Term = ({ term, children }: { term: string; children?: React.ReactNode }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-0.5 cursor-help border-b border-dashed border-primary/50">
                    {children || term}
                    <HelpCircle className="w-3 h-3 text-primary/70" />
                </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
                <p className="font-medium">{term}</p>
                <p className="text-xs text-muted-foreground">{GLOSSARY[term]}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

const SECTION_IDS = ['datos', 'eda', 'preprocessing', 'model-selection', 'performance', 'survival', 'references'];

const ScientificAnalysis = () => {
    const [currentSection, setCurrentSection] = useState(0);
    const [activeTab, setActiveTab] = useState('development');
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const sectionsRef = useRef<(HTMLElement | null)[]>([]);
    const isScrollingRef = useRef(false);

    const scrollToNextSection = () => {
        const nextIndex = currentSection + 1;
        if (nextIndex < SECTION_IDS.length) {
            const nextSection = sectionsRef.current[nextIndex];
            if (nextSection) {
                isScrollingRef.current = true;
                setCurrentSection(nextIndex);
                nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => {
                    isScrollingRef.current = false;
                }, 800);
            }
        }
    };

    const scrollToTop = () => {
        isScrollingRef.current = true;
        setCurrentSection(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            isScrollingRef.current = false;
        }, 800);
    };

    // Detect current section based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (isScrollingRef.current) return;

            const scrollPosition = window.scrollY + 150; // offset for header

            for (let i = sectionsRef.current.length - 1; i >= 0; i--) {
                const section = sectionsRef.current[i];
                if (section && section.offsetTop <= scrollPosition) {
                    if (currentSection !== i) {
                        setCurrentSection(i);
                    }
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentSection]);

    const references = [
        {
            title: "ESGO-ESTRO-ESP Guidelines 2025",
            authors: "Concin N, et al.",
            journal: "Int J Gynecol Cancer",
            inspiration: [
                "Sistema de estratificación de riesgo basado en subtipos moleculares",
                "Criterios actualizados para clasificación del fenotipo NSMP",
                "Validación de LVSI, grado histológico y estadio FIGO como variables clave"
            ]
        },
        {
            title: "Early Endometrial Cancer Recurrence Risk Prediction",
            authors: "Hao Y, et al.",
            journal: "Am J Cancer Res 2025",
            inspiration: [
                "Metodología de machine learning para predicción de recurrencia",
                "Uso de regresión logística regularizada (Elastic Net)",
                "Selección de features basada en importancia clínica"
            ]
        },
        {
            title: "ESGO-ESTRO-ESP Endometrial Cancer 2021",
            authors: "Concin N, et al.",
            journal: "Int J Gynecol Cancer 2021",
            inspiration: [
                "Identificación del subgrupo NSMP como población de pronóstico intermedio",
                "Justificación de herramientas predictivas específicas",
                "Base científica para variables moleculares (ER, PR, p53)"
            ]
        }
    ];

    return (
        <div className="container mx-auto px-4 pt-24 pb-16">
            <div className="max-w-6xl mx-auto">
                {/* Page Header */}
                <div className="text-center mb-14">
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Arquitectura e Ingeniería de Modelo
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Del dato crudo a la predicción clínica precisa.
                    </p>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-12 p-1.5 bg-muted/50 rounded-xl h-auto">
                        <TabsTrigger value="development" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg py-2">
                            <Cpu className="w-4 h-4 mr-2" />
                            Desarrollo
                        </TabsTrigger>
                        <TabsTrigger value="validation" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg py-2">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Validación Externa
                        </TabsTrigger>
                    </TabsList>

                    {/* Development Tab - Scrollable Narrative */}
                    <TabsContent value="development" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-20">

                            {/* SECTION 1: LOS DATOS */}
                            <section
                                id="datos"
                                ref={(el) => (sectionsRef.current[0] = el)}
                                className="scroll-mt-24"
                            >
                                <h2 className="text-2xl font-bold mb-8">Los Datos</h2>

                                {/* Key Stats */}
                                <div className="grid sm:grid-cols-3 gap-4 mb-10">
                                    <div className="bg-muted/20 rounded-xl p-5 border border-border/50 text-center">
                                        <div className="text-3xl font-bold text-primary mb-1">{MODEL_INFO.cohortSize}</div>
                                        <div className="text-sm font-medium">Pacientes</div>
                                        <p className="text-xs text-muted-foreground mt-1">Hospital Sant Pau, Barcelona</p>
                                    </div>
                                    <div className="bg-muted/20 rounded-xl p-5 border border-border/50 text-center">
                                        <div className="text-3xl font-bold text-orange-500 mb-1">18.8%</div>
                                        <div className="text-sm font-medium">Recurrencia</div>
                                        <p className="text-xs text-muted-foreground mt-1">29 casos de 154</p>
                                    </div>
                                    <div className="bg-muted/20 rounded-xl p-5 border border-border/50 text-center">
                                        <div className="text-3xl font-bold text-blue-500 mb-1">33</div>
                                        <div className="text-sm font-medium">Meses seguimiento</div>
                                        <p className="text-xs text-muted-foreground mt-1">Mediana de follow-up</p>
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="grid lg:grid-cols-2 gap-8 items-center">
                                    {/* Chart */}
                                    <div
                                        className="bg-[#1a1a2e] rounded-xl overflow-hidden cursor-zoom-in hover:opacity-90 transition-opacity"
                                        onClick={() => setLightboxImage('/scientific/cohort_pie.png')}
                                    >
                                        <img
                                            src="/scientific/cohort_pie.png"
                                            alt="Distribución de outcomes"
                                            className="w-full"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Bullet Points */}
                                    <div className="bg-muted/20 rounded-2xl p-6 border border-border/50">
                                        <h3 className="text-xl font-semibold mb-5">Características Clave</h3>
                                        <ul className="space-y-4">
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold text-lg">•</span>
                                                <span>Fenotipo molecular <Term term="NSMP">NSMP</Term> = 30-40% de cánceres endometriales</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold text-lg">•</span>
                                                <span><strong>Pronóstico intermedio</strong>: Difícil de estratificar con criterios clínicos tradicionales</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold text-lg">•</span>
                                                <span><strong>Necesidad clínica</strong>: Modelo predictivo específico para este subgrupo</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold text-lg">•</span>
                                                <span><strong>Desbalance de clases</strong>: 81.2% sin recurrencia → requiere regularización</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-border/30" />

                            {/* SECTION 2: ANÁLISIS EXPLORATORIO */}
                            <section
                                id="eda"
                                ref={(el) => (sectionsRef.current[1] = el)}
                                className="scroll-mt-24"
                            >
                                <h2 className="text-2xl font-bold mb-8">Análisis Exploratorio de Datos</h2>

                                {/* Distributions */}
                                <div className="space-y-12">
                                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                                        <div
                                            className="bg-[#1a1a2e] rounded-xl overflow-hidden cursor-zoom-in hover:opacity-90 transition-opacity"
                                            onClick={() => setLightboxImage('/scientific/distributions.png')}
                                        >
                                            <img
                                                src="/scientific/distributions.png"
                                                alt="Distribuciones de variables continuas"
                                                className="w-full"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="bg-muted/20 rounded-2xl p-6 border border-border/50">
                                            <h3 className="text-xl font-semibold flex items-center gap-2 mb-5">
                                                <BarChart3 className="w-5 h-5 text-purple-500" />
                                                Distribuciones Continuas
                                            </h3>
                                            <ul className="space-y-4">
                                                <li className="flex gap-3 text-base">
                                                    <span className="text-purple-500 font-bold text-lg">•</span>
                                                    <span><strong>Edad</strong>: No hay diferencia significativa entre grupos (p=0.23)</span>
                                                </li>
                                                <li className="flex gap-3 text-base">
                                                    <span className="text-purple-500 font-bold text-lg">•</span>
                                                    <span><strong>Tamaño tumoral</strong>: Mayor en pacientes con recurrencia (p=0.04)</span>
                                                </li>
                                                <li className="flex gap-3 text-base">
                                                    <span className="text-purple-500 font-bold text-lg">•</span>
                                                    <span><strong>IMC</strong>: Distribución similar en ambos grupos</span>
                                                </li>
                                                <li className="flex gap-3 text-base">
                                                    <span className="text-purple-500 font-bold text-lg">•</span>
                                                    <span><strong>Seguimiento</strong>: Mediana 33 meses, suficiente para detectar la mayoría de recurrencias</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                                        <div
                                            className="bg-[#1a1a2e] rounded-xl overflow-hidden cursor-zoom-in hover:opacity-90 transition-opacity"
                                            onClick={() => setLightboxImage('/scientific/risk_factors.png')}
                                        >
                                            <img
                                                src="/scientific/risk_factors.png"
                                                alt="Factores de riesgo clínicos"
                                                className="w-full"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="bg-muted/20 rounded-2xl p-6 border border-border/50">
                                            <h3 className="text-xl font-semibold flex items-center gap-2 mb-5">
                                                <PieChart className="w-5 h-5 text-purple-500" />
                                                Factores de Riesgo Clínicos
                                            </h3>
                                            <ul className="space-y-4">
                                                <li className="flex gap-3 text-base">
                                                    <span className="text-purple-500 font-bold text-lg">•</span>
                                                    <span><Term term="LVSI">LVSI positivo</Term>: 3x más riesgo de recurrencia (p&lt;0.001)</span>
                                                </li>
                                                <li className="flex gap-3 text-base">
                                                    <span className="text-purple-500 font-bold text-lg">•</span>
                                                    <span><strong>Grado 3</strong>: Peor pronóstico vs Grado 1-2</span>
                                                </li>
                                                <li className="flex gap-3 text-base">
                                                    <span className="text-purple-500 font-bold text-lg">•</span>
                                                    <span><strong>Infiltración &gt;50%</strong>: Fuerte predictor de recurrencia</span>
                                                </li>
                                                <li className="flex gap-3 text-base">
                                                    <span className="text-purple-500 font-bold text-lg">•</span>
                                                    <span><strong>Estadio FIGO</strong>: Correlación directa con outcome</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                                        <div
                                            className="bg-[#1a1a2e] rounded-xl overflow-hidden cursor-zoom-in hover:opacity-90 transition-opacity"
                                            onClick={() => setLightboxImage('/scientific/correlation.png')}
                                        >
                                            <img
                                                src="/scientific/correlation.png"
                                                alt="Matriz de correlación entre variables"
                                                className="w-full max-w-lg mx-auto"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="bg-muted/20 rounded-2xl p-6 border border-border/50">
                                            <h3 className="text-xl font-semibold flex items-center gap-2 mb-5">
                                                <GitBranch className="w-5 h-5 text-purple-500" />
                                                Matriz de Correlación
                                            </h3>
                                            <ul className="space-y-4">
                                                <li className="flex gap-3 text-base">
                                                    <span className="text-purple-500 font-bold text-lg">•</span>
                                                    <span><strong>Grado ↔ Infiltración</strong>: Correlación moderada (r=0.45) → necesitan regularización</span>
                                                </li>
                                                <li className="flex gap-3 text-base">
                                                    <span className="text-purple-500 font-bold text-lg">•</span>
                                                    <span><strong>ER ↔ PR</strong>: Alta correlación (r=0.72) → solo PR en modelo final</span>
                                                </li>
                                                <li className="flex gap-3 text-base">
                                                    <span className="text-purple-500 font-bold text-lg">•</span>
                                                    <span><strong>Variables independientes</strong>: LVSI, edad, IMC aportan información única</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-border/30" />

                            {/* SECTION 3: PREPROCESAMIENTO */}
                            <section
                                id="preprocessing"
                                ref={(el) => (sectionsRef.current[2] = el)}
                                className="scroll-mt-24"
                            >
                                <h2 className="text-2xl font-bold mb-8">Pipeline de Preprocesamiento</h2>

                                {/* Pipeline Steps in Cards */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Step 1 */}
                                    <div className="bg-muted/20 rounded-2xl p-6 border border-border/50">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="shrink-0 w-12 h-12 rounded-xl bg-gray-500/10 flex items-center justify-center">
                                                <Database className="w-6 h-6 text-gray-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">1. Datos Crudos</h3>
                                                <p className="text-sm font-medium text-primary">Hospital Sant Pau</p>
                                            </div>
                                        </div>
                                        <ul className="space-y-2">
                                            <li className="flex gap-3 text-base">
                                                <span className="text-gray-500 font-bold">•</span>
                                                <span><strong>154 pacientes</strong> con cáncer endometrial NSMP</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-gray-500 font-bold">•</span>
                                                <span><strong>Variables clínicas</strong>: edad, <Term term="IMC">IMC</Term>, estadio <Term term="FIGO">FIGO</Term>, grado, LVSI</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-gray-500 font-bold">•</span>
                                                <span><strong>Variables moleculares</strong>: <Term term="ER">ER</Term>, <Term term="PR">PR</Term>, p53, <Term term="MMR">MMR</Term></span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="bg-muted/20 rounded-2xl p-6 border border-border/50">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                <Ruler className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">2. Imputación</h3>
                                                <p className="text-sm font-medium text-primary"><Term term="MICE">MICE</Term> Algorithm</p>
                                            </div>
                                        </div>
                                        <ul className="space-y-2">
                                            <li className="flex gap-3 text-base">
                                                <span className="text-blue-500 font-bold">•</span>
                                                <span><strong>No eliminamos</strong> pacientes con datos faltantes</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-blue-500 font-bold">•</span>
                                                <span><strong>MICE predice</strong> valores usando relaciones entre variables</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-blue-500 font-bold">•</span>
                                                <span><strong>Preserva</strong> estructura estadística, evita sesgos</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="bg-muted/20 rounded-2xl p-6 border border-border/50">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                                <Binary className="w-6 h-6 text-purple-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">3. Codificación</h3>
                                                <p className="text-sm font-medium text-primary">Smart Encoding Strategy</p>
                                            </div>
                                        </div>
                                        <ul className="space-y-2">
                                            <li className="flex gap-3 text-base">
                                                <span className="text-purple-500 font-bold">•</span>
                                                <span><strong>Ordinales</strong>: Grado 1→3, Estadio I→IV</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-purple-500 font-bold">•</span>
                                                <span><strong>Categóricas</strong>: One-Hot Encoding</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-purple-500 font-bold">•</span>
                                                <span><strong>Continuas</strong>: <Term term="Z-Score">Z-Score</Term> normalización</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="bg-muted/20 rounded-2xl p-6 border border-border/50">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="shrink-0 w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                                <CheckCircle className="w-6 h-6 text-green-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">4. Validación y Split</h3>
                                                <p className="text-sm font-medium text-primary">Stratified Split</p>
                                            </div>
                                        </div>
                                        <ul className="space-y-2">
                                            <li className="flex gap-3 text-base">
                                                <span className="text-green-500 font-bold">•</span>
                                                <span><strong>75% train</strong> (115) / <strong>25% test</strong> (39)</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-green-500 font-bold">•</span>
                                                <span><strong>Stratified</strong>: Misma proporción de recurrencias</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-green-500 font-bold">•</span>
                                                <span><strong>Test set aislado</strong>: Nunca usado en training</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-border/30" />

                            {/* SECTION 4: SELECCIÓN DEL MODELO */}
                            <section
                                id="model-selection"
                                ref={(el) => (sectionsRef.current[3] = el)}
                                className="scroll-mt-24"
                            >
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="bg-primary/10 p-2.5 rounded-xl">
                                        <BrainCircuit className="w-6 h-6 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Selección del Modelo</h2>
                                </div>

                                {/* Algorithms Comparison */}
                                <div className="grid lg:grid-cols-2 gap-8 mb-10">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold">Algoritmos Evaluados</h3>
                                        <ul className="space-y-3">
                                            <li className="flex gap-3 text-base">
                                                <span className="text-red-500 font-bold">✗</span>
                                                <span><strong>Random Forest</strong>: <Term term="AUC">AUC</Term> 0.89, pero "caja negra" sin interpretabilidad</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-red-500 font-bold">✗</span>
                                                <span><strong>XGBoost</strong>: AUC 0.91, overfitting con n=154</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-red-500 font-bold">✗</span>
                                                <span><strong>SVM</strong>: AUC 0.85, no genera probabilidades directas</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-green-500 font-bold">✓</span>
                                                <span><strong>Regresión Logística</strong>: AUC 0.95, interpretable, generaliza bien</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold">¿Por qué Regresión Logística?</h3>
                                        <ul className="space-y-3">
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold">•</span>
                                                <span><strong>Interpretable</strong>: Cada coeficiente = impacto directo en riesgo</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold">•</span>
                                                <span><strong>Probabilidades calibradas</strong>: Output = % real de riesgo</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold">•</span>
                                                <span><strong>Robusto</strong>: No se sobreajusta con muestras pequeñas</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold">•</span>
                                                <span><strong>Clínicamente aceptado</strong>: Familiar para oncólogos</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Algorithm Explanation */}
                                <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-2xl p-6 border border-primary/20 mb-10">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-primary" />
                                        ¿Qué es la Regresión Logística Regularizada?
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <ul className="space-y-3">
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold">1.</span>
                                                <span>Modelo matemático que predice <strong>probabilidad de un evento</strong> (recidiva)</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold">2.</span>
                                                <span>Combina variables clínicas en una <strong>ecuación lineal</strong></span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold">3.</span>
                                                <span>Función sigmoide transforma la salida a <strong>rango 0-100%</strong></span>
                                            </li>
                                        </ul>
                                        <ul className="space-y-3">
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold">4.</span>
                                                <span><Term term="Elastic Net">Elastic Net</Term>: Regularización L1+L2 para evitar overfitting</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold">5.</span>
                                                <span>Selecciona automáticamente las <strong>variables más relevantes</strong></span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold">6.</span>
                                                <span>Hiperparámetros optimizados con <strong>5-fold cross-validation</strong></span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Threshold Selection */}
                                <div className="bg-muted/20 rounded-2xl p-6 border border-border/50 mb-10">
                                    <h3 className="text-xl font-semibold mb-4">Selección del Threshold: ¿Por qué 25%?</h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <div className="text-3xl font-bold text-primary">25%</div>
                                            <div className="text-sm font-medium">Punto de corte</div>
                                            <p className="text-sm text-muted-foreground">
                                                Optimizado para máxima sensibilidad manteniendo especificidad aceptable
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-3xl font-bold text-green-500">100%</div>
                                            <div className="text-sm font-medium">Sensibilidad</div>
                                            <p className="text-sm text-muted-foreground">
                                                Detectamos TODAS las recurrencias del test set (0 falsos negativos)
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-3xl font-bold text-orange-500">93.8%</div>
                                            <div className="text-sm font-medium">Especificidad</div>
                                            <p className="text-sm text-muted-foreground">
                                                Solo 2 falsos positivos de 32 casos sin recurrencia
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-6 p-4 bg-primary/10 rounded-xl">
                                        <p className="text-base">
                                            <strong>Justificación clínica:</strong> En oncología, un falso negativo (no detectar una recurrencia) es más grave que un falso positivo (seguimiento adicional innecesario). Por eso priorizamos sensibilidad.
                                        </p>
                                    </div>
                                </div>

                                {/* Feature Importance */}
                                <div className="grid lg:grid-cols-2 gap-8 items-center">
                                    <div
                                        className="bg-[#1a1a2e] rounded-xl overflow-hidden cursor-zoom-in hover:opacity-90 transition-opacity"
                                        onClick={() => setLightboxImage('/scientific/feature_importance.png')}
                                    >
                                        <img
                                            src="/scientific/feature_importance.png"
                                            alt="Importancia de variables del modelo"
                                            className="w-full"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="bg-muted/20 rounded-2xl p-6 border border-border/50">
                                        <h3 className="text-xl font-semibold flex items-center gap-2 mb-5">
                                            <BarChart3 className="w-5 h-5 text-primary" />
                                            Variables Más Importantes
                                        </h3>
                                        <ul className="space-y-4">
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold text-lg">1.</span>
                                                <span><strong>Grado histológico</strong>: Mayor impacto en predicción de riesgo</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold text-lg">2.</span>
                                                <span><strong>Receptores de Progesterona</strong>: Negativos = mayor riesgo</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold text-lg">3.</span>
                                                <span><strong>LVSI</strong>: Invasión linfovascular como factor clave</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-primary font-bold text-lg">4.</span>
                                                <span><strong>Estadio FIGO</strong>: Correlación directa con recurrencia</span>
                                            </li>
                                            <li className="flex gap-3 text-base text-muted-foreground">
                                                <span className="font-bold text-lg">→</span>
                                                <span>Consistente con guías ESGO-ESTRO-ESP 2021-2025</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-border/30" />

                            {/* SECTION 5: RENDIMIENTO DEL MODELO */}
                            <section
                                id="performance"
                                ref={(el) => (sectionsRef.current[4] = el)}
                                className="scroll-mt-24"
                            >
                                <h2 className="text-2xl font-bold mb-8">Rendimiento del Modelo</h2>

                                {/* Metrics Summary */}
                                <div className="grid sm:grid-cols-4 gap-4 mb-10">
                                    <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl p-5 border border-primary/20 text-center">
                                        <div className="text-3xl font-bold text-primary mb-1">{MODEL_INFO.auc}</div>
                                        <div className="text-sm font-medium"><Term term="AUC">AUC-ROC</Term></div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-xl p-5 border border-green-500/20 text-center">
                                        <div className="text-3xl font-bold text-green-500 mb-1">100%</div>
                                        <div className="text-sm font-medium"><Term term="Sensitivity">Sensibilidad</Term></div>
                                    </div>
                                    <div className="bg-muted/30 rounded-xl p-5 border border-border/50 text-center">
                                        <div className="text-3xl font-bold text-foreground mb-1">93.8%</div>
                                        <div className="text-sm font-medium"><Term term="Specificity">Especificidad</Term></div>
                                    </div>
                                    <div className="bg-muted/30 rounded-xl p-5 border border-border/50 text-center">
                                        <div className="text-3xl font-bold text-foreground mb-1">97.4%</div>
                                        <div className="text-sm font-medium">Accuracy</div>
                                    </div>
                                </div>

                                {/* ROC Curve */}
                                <div className="grid lg:grid-cols-2 gap-8 items-center mb-10">
                                    <div
                                        className="bg-[#1a1a2e] rounded-xl overflow-hidden cursor-zoom-in hover:opacity-90 transition-opacity"
                                        onClick={() => setLightboxImage('/scientific/roc_curve.png')}
                                    >
                                        <img
                                            src="/scientific/roc_curve.png"
                                            alt="Curva ROC del modelo"
                                            className="w-full"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="bg-muted/20 rounded-2xl p-6 border border-border/50">
                                        <h3 className="text-xl font-semibold flex items-center gap-2 mb-5">
                                            <TrendingUp className="w-5 h-5 text-green-500" />
                                            Curva <Term term="ROC">ROC</Term>
                                        </h3>
                                        <ul className="space-y-4">
                                            <li className="flex gap-3 text-base">
                                                <span className="text-green-500 font-bold text-lg">•</span>
                                                <span><strong>AUC = 1.0</strong>: Discriminación perfecta en entrenamiento</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-green-500 font-bold text-lg">•</span>
                                                <span><strong>Eje Y</strong>: Sensibilidad (True Positive Rate)</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-green-500 font-bold text-lg">•</span>
                                                <span><strong>Eje X</strong>: 1 - Especificidad (False Positive Rate)</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-green-500 font-bold text-lg">•</span>
                                                <span><strong>Línea diagonal</strong> = clasificador aleatorio (AUC 0.5)</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Calibration Curve */}
                                <div className="grid lg:grid-cols-2 gap-8 items-center">
                                    <div
                                        className="bg-[#1a1a2e] rounded-xl overflow-hidden cursor-zoom-in hover:opacity-90 transition-opacity"
                                        onClick={() => setLightboxImage('/scientific/calibration.png')}
                                    >
                                        <img
                                            src="/scientific/calibration.png"
                                            alt="Curva de calibración del modelo"
                                            className="w-full"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="bg-muted/20 rounded-2xl p-6 border border-border/50">
                                        <h3 className="text-xl font-semibold flex items-center gap-2 mb-5">
                                            <Activity className="w-5 h-5 text-blue-500" />
                                            Curva de Calibración
                                        </h3>
                                        <ul className="space-y-4">
                                            <li className="flex gap-3 text-base">
                                                <span className="text-blue-500 font-bold text-lg">•</span>
                                                <span><strong>Brier Score = 0.12</strong>: Alta precisión probabilística</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-blue-500 font-bold text-lg">•</span>
                                                <span><strong>Línea perfecta</strong> = predicción ≈ frecuencia observada</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-blue-500 font-bold text-lg">•</span>
                                                <span><strong>Si dice 30%</strong>: ~30% de esas pacientes recurrieron</span>
                                            </li>
                                            <li className="flex gap-3 text-base">
                                                <span className="text-blue-500 font-bold text-lg">•</span>
                                                <span><strong>Importante</strong>: Probabilidades clínicamente útiles</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-border/30" />

                            {/* SECTION 6: MODELO DE SUPERVIVENCIA */}
                            <section
                                id="survival"
                                ref={(el) => (sectionsRef.current[5] = el)}
                                className="scroll-mt-24"
                            >
                                <h2 className="text-2xl font-bold mb-6">Modelo de Supervivencia (Cox)</h2>

                                <div className="prose dark:prose-invert max-w-none mb-8">
                                    <p className="text-muted-foreground text-lg leading-relaxed">
                                        Mientras que la regresión logística responde <em>"¿Recurrirá esta paciente?"</em>, necesitamos
                                        un segundo modelo para responder <em>"¿Cuándo podría ocurrir?"</em>
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed">
                                        El modelo de <strong className="text-foreground">Cox Proportional Hazards</strong> estima la función
                                        de supervivencia $S(t)$ personalizada para cada paciente, permitiendo generar la curva de supervivencia
                                        que muestra la probabilidad de permanecer libre de recurrencia a lo largo del tiempo.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-muted/20 rounded-xl p-5 border border-border/50">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Microscope className="w-5 h-5 text-orange-500" />
                                            Utilidad Clínica
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            La curva de supervivencia personalizada es esencial para planificar el
                                            <strong className="text-foreground"> seguimiento intensivo</strong> durante los primeros 24 meses,
                                            que es cuando ocurren la mayoría de las recurrencias en NSMP.
                                        </p>
                                    </div>
                                    <div className="bg-muted/20 rounded-xl p-5 border border-border/50">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-orange-500" />
                                            Validación de Supuestos
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Validamos la <strong className="text-foreground">proporcionalidad de riesgos</strong> mediante tests
                                            de residuos de Schoenfeld, asegurando que los hazard ratios permanecen constantes en el tiempo.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-border/30" />

                            {/* SECTION 7: REFERENCIAS */}
                            <section
                                id="references"
                                ref={(el) => (sectionsRef.current[6] = el)}
                                className="scroll-mt-24"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-muted p-2.5 rounded-xl">
                                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Referencias Bibliográficas</h2>
                                </div>

                                <div className="space-y-6">
                                    {references.map((ref, idx) => (
                                        <div key={idx} className="p-6 rounded-2xl bg-muted/20 border border-border/50 hover:border-primary/30 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-foreground text-lg mb-1">{ref.title}</div>
                                                    <div className="text-sm text-muted-foreground mb-4">{ref.authors} • {ref.journal}</div>
                                                    <div className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Inspiración para la solución</div>
                                                    <ul className="space-y-2">
                                                        {ref.inspiration.map((item, i) => (
                                                            <li key={i} className="flex gap-3 text-base">
                                                                <span className="text-primary font-bold text-lg">•</span>
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                        </div>
                    </TabsContent>

                    {/* Validation Tab */}
                    <TabsContent value="validation" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="bg-green-500/10 p-3 rounded-full">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Validación Externa</h3>
                                <p className="text-muted-foreground">
                                    Prueba el modelo en tiempo real contra el Test Set reservado (25% del dataset).
                                </p>
                            </div>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4 py-1 mb-6 bg-muted/20 rounded-r-lg">
                            <p className="text-sm text-muted-foreground">
                                Estos 39 pacientes <strong>nunca fueron vistos</strong> por el modelo durante el entrenamiento.
                                Esta validación simula el rendimiento en un entorno clínico real.
                            </p>
                        </div>
                        <BatchValidation />
                    </TabsContent>
                </Tabs>

                {/* Floating Scroll Button */}
                {activeTab === 'development' && (
                    <button
                        onClick={currentSection >= SECTION_IDS.length - 1 ? scrollToTop : scrollToNextSection}
                        className="fixed bottom-8 right-8 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 animate-bounce"
                        aria-label={currentSection >= SECTION_IDS.length - 1 ? "Volver arriba" : "Ir a la siguiente sección"}
                    >
                        {currentSection >= SECTION_IDS.length - 1 ? (
                            <ChevronUp className="w-6 h-6" />
                        ) : (
                            <ChevronDown className="w-6 h-6" />
                        )}
                    </button>
                )}

                {/* Lightbox Modal */}
                {lightboxImage && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
                        onClick={() => setLightboxImage(null)}
                    >
                        <img
                            src={lightboxImage}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScientificAnalysis;
