import { Activity, FlaskConical } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const location = useLocation();
  const isScientific = location.pathname === "/scientific";

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">NEST</h1>
              <p className="text-xs text-muted-foreground">NSMP Endometrial Stratification Tool</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Navigation */}
            <nav className="hidden sm:flex items-center gap-2">
              <Link
                to="/"
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${!isScientific
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
              >
                Calculadora
              </Link>
              <Link
                to="/scientific"
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${isScientific
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
              >
                <FlaskConical className="w-4 h-4" />
                Científico
              </Link>
            </nav>

            {/* Badges */}
            <div className="hidden md:flex items-center gap-2">
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-accent text-accent-foreground">
                Hospital Sant Pau
              </span>
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                BitsxlaMarató 2025
              </span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
