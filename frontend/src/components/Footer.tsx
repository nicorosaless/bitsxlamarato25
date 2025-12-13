import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 NEST - Herramienta de estratificación de riesgo
          </p>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>Desarrollado con</span>
            <Heart className="w-4 h-4 text-risk-high fill-risk-high" />
            <span>por</span>
            <span className="font-semibold text-foreground">Porks in Bits</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
