import { useEffect, useState } from "react";

interface RiskGaugeProps {
  percentage: number;
  riskLevel: "low" | "intermediate" | "high" | "very-high";
  confidenceInterval?: [number, number];
}

const RiskGauge = ({ percentage, riskLevel, confidenceInterval }: RiskGaugeProps) => {
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

  // CI Arc Calculation
  const getCiPath = () => {
    if (!confidenceInterval) return "";
    const [low, high] = confidenceInterval;

    // Convert percentage to radians (0% = PI, 100% = 0)
    const startAngle = Math.PI - (low / 100) * Math.PI;
    const endAngle = Math.PI - (high / 100) * Math.PI;

    // Calculate start and end points
    const x1 = 100 + radius * Math.cos(startAngle);
    const y1 = 100 - radius * Math.sin(startAngle);
    const x2 = 100 + radius * Math.cos(endAngle);
    const y2 = 100 - radius * Math.sin(endAngle);

    // SVG Path for arc
    // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
    // sweep-flag = 1 because we go clockwise from left (PI) to right (0) in SVG coords? 
    // Wait, PI is left. 0 is right. We draw from low (left-ish) to high (right-ish).
    // So angles decrease. cos(PI)=-1.
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  };

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

        {/* Confidence Interval Shadow */}
        {confidenceInterval && (
          <path
            d={getCiPath()}
            fill="none"
            stroke="currentColor"
            className={`${getRiskColor().replace('stroke-', 'text-')} opacity-20`}
            strokeWidth="24"
            strokeLinecap="butt"
          />
        )}

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
      <div className="absolute inset-x-0 bottom-8 flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold tabular-nums tracking-tight ${getRiskTextColor()}`}>
          {Math.round(animatedPercentage)}%
        </span>
      </div>
      {/* Label outside the relative container to avoid overlap */}
      <span className="text-sm font-medium text-muted-foreground mt-2">
        Probabilidad de recurrencia
      </span>
    </div>
  );
};

export default RiskGauge;
