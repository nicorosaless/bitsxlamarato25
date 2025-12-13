import { useEffect, useState } from "react";

interface RiskGaugeProps {
  percentage: number;
  riskLevel: "low" | "intermediate" | "high" | "very-high";
}

const RiskGauge = ({ percentage, riskLevel }: RiskGaugeProps) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Semi-circle gauge calculations
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  const getRiskColor = () => {
    switch (riskLevel) {
      case "low":
        return "stroke-risk-low";
      case "intermediate":
        return "stroke-risk-intermediate";
      case "high":
        return "stroke-risk-high";
      case "very-high":
        return "stroke-risk-very-high";
    }
  };

  const getRiskTextColor = () => {
    switch (riskLevel) {
      case "low":
        return "text-risk-low";
      case "intermediate":
        return "text-risk-intermediate";
      case "high":
        return "text-risk-high";
      case "very-high":
        return "text-risk-very-high";
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120" className="overflow-visible">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="hsl(var(--gauge-track))"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          className={getRiskColor()}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = Math.PI - (tick / 100) * Math.PI;
          const x1 = 100 + 65 * Math.cos(angle);
          const y1 = 100 - 65 * Math.sin(angle);
          const x2 = 100 + 72 * Math.cos(angle);
          const y2 = 100 - 72 * Math.sin(angle);
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={0.4}
            />
          );
        })}
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className={`text-5xl font-bold tabular-nums ${getRiskTextColor()}`}>
          {Math.round(animatedPercentage)}%
        </span>
        <span className="text-sm text-muted-foreground mt-1">Probabilidad de recurrencia</span>
      </div>
    </div>
  );
};

export default RiskGauge;
