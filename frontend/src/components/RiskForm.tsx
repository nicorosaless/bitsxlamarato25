import { useState } from "react";
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
import { Calculator, User, Microscope, Dna, HelpCircle } from "lucide-react";

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
}

const RiskForm = ({ onSubmit, isLoading }: RiskFormProps) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
              <Label htmlFor="edad">Edad (años)</Label>
              <Input
                id="edad"
                type="number"
                min={18}
                max={100}
                value={formData.edad}
                onChange={(e) => updateField("edad", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imc">IMC (kg/m²)</Label>
              <Input
                id="imc"
                type="number"
                min={15}
                max={60}
                step={0.1}
                value={formData.imc}
                onChange={(e) => updateField("imc", parseFloat(e.target.value) || 0)}
              />
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
              <Label htmlFor="tamano">Tamaño Tumoral (cm)</Label>
              <Input
                id="tamano"
                type="number"
                min={0}
                max={20}
                step={0.1}
                value={formData.tamanoTumoral}
                onChange={(e) => updateField("tamanoTumoral", parseFloat(e.target.value) || 0)}
              />
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

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          <Calculator className="w-5 h-5 mr-2" />
          {isLoading ? "Calculando..." : "Calcular Riesgo"}
        </Button>
      </form>
    </TooltipProvider>
  );
};

export default RiskForm;
