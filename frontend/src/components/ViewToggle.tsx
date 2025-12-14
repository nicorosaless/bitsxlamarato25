import { useNavigate, useLocation } from "react-router-dom";
import { Calculator, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

const ViewToggle = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isScientific = location.pathname === "/scientific";

    return (
        <div className="fixed top-6 left-6 z-50 bg-white/80 backdrop-blur-md border border-gray-200 p-1 rounded-full shadow-lg flex items-center gap-1">
            <button
                onClick={() => navigate("/")}
                title="Calculadora"
                className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                    !isScientific
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                )}
            >
                <Calculator className="w-5 h-5" />
            </button>
            <button
                onClick={() => navigate("/scientific")}
                title="Científico"
                className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                    isScientific
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                )}
            >
                <FlaskConical className="w-5 h-5" />
            </button>
        </div>
    );
};

export default ViewToggle;
