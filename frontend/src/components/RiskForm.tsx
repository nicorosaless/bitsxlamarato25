import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calculator, User, Microscope, Dna, HelpCircle, AlertCircle } from "lucide-react";

export interface FormData {
  edad: number;
  imc: number;
  gradoHistologico: string;
  tamanoTumoral: number;
  infiltracionMiometrial: string;
  lvsi: string;
  infiltracionCervical: string;
  estadioFIGO: string;
  p53: string;
  mmrStatus: string;
  receptoresEstrogenos: number;
  receptoresProgesterona: number;
}

interface RiskFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  data?: FormData | null;
}

const RiskForm = ({ onSubmit, isLoading, data }: RiskFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    edad: 60,
    imc: 28,
    gradoHistologico: "",
    tamanoTumoral: 3,
    infiltracionMiometrial: "",
    lvsi: "",
    infiltracionCervical: "",
    estadioFIGO: "",
    p53: "",
    mmrStatus: "",
    receptoresEstrogenos: 80,
    receptoresProgesterona: 70,
  });

  // Local state for text inputs to handle intermediate invalid states
  const [inputValues, setInputValues] = useState({
    edad: "60",
    imc: "28",
    tamanoTumoral: "3"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form and local inputs when external data provided (e.g. from examples)
  useEffect(() => {
    if (data) {
      setFormData(data);
      setInputValues({
        edad: data.edad.toString(),
        imc: data.imc.toString(),
        tamanoTumoral: data.tamanoTumoral.toString()
      });
      setErrors({});
    }
  }, [data]);

  const validateNumber = (value: string, field: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, [field]: "Este campo es requerido" }));
      return false;
    }

    // Check if it's a valid number format
    if (!/^\d*\.?\d*$/.test(value) || isNaN(parseFloat(value))) {
      setErrors(prev => ({ ...prev, [field]: "Debe ser un número válido" }));
      return false;
    }

    const num = parseFloat(value);

    // Specific range validations
    if (field === "edad" && (num < 18 || num > 100)) {
      setErrors(prev => ({ ...prev, [field]: "La edad debe estar entre 18 y 100" }));
      return false;
    }
    if (field === "imc" && (num < 15 || num > 60)) {
      setErrors(prev => ({ ...prev, [field]: "El IMC debe estar entre 15 y 60" }));
      return false;
    }
    if (field === "tamanoTumoral" && (num < 0 || num > 20)) {
      setErrors(prev => ({ ...prev, [field]: "El tamaño debe estar entre 0 y 20 cm" }));
      return false;
    }

    // Clear error if valid
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
    return true;
  };

  const handleTextChange = (field: "edad" | "imc" | "tamanoTumoral", value: string) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
    const isValid = validateNumber(value, field);
    if (isValid) {
      updateField(field, parseFloat(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all text fields before submit
    const edadValid = validateNumber(inputValues.edad, "edad");
    const imcValid = validateNumber(inputValues.imc, "imc");
    const tamanoValid = validateNumber(inputValues.tamanoTumoral, "tamanoTumoral");

    if (edadValid && imcValid && tamanoValid && Object.keys(errors).length === 0) {
      onSubmit(formData);
    }
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Datos Clínicos */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Datos Clínicos</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="edad" className={errors.edad ? "text-red-500" : ""}>Edad (años)</Label>
              <Input
                id="edad"
                type="text"
                inputMode="numeric"
                value={inputValues.edad}
                onChange={(e) => handleTextChange("edad", e.target.value)}
                className={errors.edad ? "border-red-500 focus-visible:ring-red-500" : ""}
                placeholder="Ej: 60"
              />
              {errors.edad && (
                <div className="flex items-center gap-1 text-xs text-red-500 animate-in slide-in-from-top-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.edad}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="imc" className={errors.imc ? "text-red-500" : ""}>IMC (kg/m²)</Label>
              <Input
                id="imc"
                type="text"
                inputMode="decimal"
                value={inputValues.imc}
                onChange={(e) => handleTextChange("imc", e.target.value)}
                className={errors.imc ? "border-red-500 focus-visible:ring-red-500" : ""}
                placeholder="Ej: 28.5"
              />
              {errors.imc && (
                <div className="flex items-center gap-1 text-xs text-red-500 animate-in slide-in-from-top-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.imc}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Datos Histopatológicos */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Microscope className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Datos Histopatológicos</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Grado Histológico</Label>
              <Select
                value={formData.gradoHistologico}
                onValueChange={(v) => updateField("gradoHistologico", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grado1">Grado 1 (Bajo)</SelectItem>
                  <SelectItem value="grado2">Grado 2 (Alto)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tamano" className={errors.tamanoTumoral ? "text-red-500" : ""}>Tamaño Tumoral (cm)</Label>
              <Input
                id="tamano"
                type="text"
                inputMode="decimal"
                value={inputValues.tamanoTumoral}
                onChange={(e) => handleTextChange("tamanoTumoral", e.target.value)}
                className={errors.tamanoTumoral ? "border-red-500 focus-visible:ring-red-500" : ""}
                placeholder="Ej: 3.5"
              />
              {errors.tamanoTumoral && (
                <div className="flex items-center gap-1 text-xs text-red-500 animate-in slide-in-from-top-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.tamanoTumoral}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Infiltración Miometrial</Label>
              <Select
                value={formData.infiltracionMiometrial}
                onValueChange={(v) => updateField("infiltracionMiometrial", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin">Sin infiltración</SelectItem>
                  <SelectItem value="menor50">&lt;50%</SelectItem>
                  <SelectItem value="mayor50">≥50%</SelectItem>
                  <SelectItem value="serosa">Serosa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>LVSI</Label>
              <Select value={formData.lvsi} onValueChange={(v) => updateField("lvsi", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="si">Sí</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Infiltración Cervical</Label>
              <Select
                value={formData.infiltracionCervical}
                onValueChange={(v) => updateField("infiltracionCervical", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="glandular">Glandular</SelectItem>
                  <SelectItem value="estroma">Estroma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estadio FIGO 2023</Label>
              <Select
                value={formData.estadioFIGO}
                onValueChange={(v) => updateField("estadioFIGO", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estadio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IA">IA</SelectItem>
                  <SelectItem value="IB">IB</SelectItem>
                  <SelectItem value="IC">IC</SelectItem>
                  <SelectItem value="II">II</SelectItem>
                  <SelectItem value="IIIA">IIIA</SelectItem>
                  <SelectItem value="IIIB">IIIB</SelectItem>
                  <SelectItem value="IIIC1">IIIC1</SelectItem>
                  <SelectItem value="IIIC2">IIIC2</SelectItem>
                  <SelectItem value="IVA">IVA</SelectItem>
                  <SelectItem value="IVB">IVB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Datos Moleculares */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Dna className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Datos Moleculares</h3>
          </div>
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>p53 IHQ</Label>
                <Select value={formData.p53} onValueChange={(v) => updateField("p53", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="aberrante">Aberrante</SelectItem>
                    <SelectItem value="nodisponible">No disponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label>Estado MMR</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Mismatch Repair: MLH1, MSH2, MSH6, PMS2. El 22% de pacientes NSMP son dMMR. Importante para opciones de inmunoterapia.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={formData.mmrStatus} onValueChange={(v) => updateField("mmrStatus", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proficient">Proficiente (pMMR)</SelectItem>
                    <SelectItem value="deficient">Deficiente (dMMR)</SelectItem>
                    <SelectItem value="unknown">No disponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Receptores Estrógenos (%)</Label>
                <span className="text-sm font-medium text-primary tabular-nums">
                  {formData.receptoresEstrogenos}%
                </span>
              </div>
              <Slider
                value={[formData.receptoresEstrogenos]}
                onValueChange={([v]) => updateField("receptoresEstrogenos", v)}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Receptores Progesterona (%)</Label>
                <span className="text-sm font-medium text-primary tabular-nums">
                  {formData.receptoresProgesterona}%
                </span>
              </div>
              <Slider
                value={[formData.receptoresProgesterona]}
                onValueChange={([v]) => updateField("receptoresProgesterona", v)}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </section>

        <Button type="submit" size="lg" className="w-full" disabled={isLoading || Object.keys(errors).length > 0}>
          <Calculator className="w-5 h-5 mr-2" />
          {isLoading ? "Calculando..." : "Calcular Riesgo"}
        </Button>
      </form>
    </TooltipProvider>
  );
};

export default RiskForm;
