/**
 * WaterfallChart - Visual explanation of how each factor contributes to the risk
 * Shows base risk and how each factor adds or subtracts from it
 */

import { FactorContribution } from "@/lib/riskCalculator";

interface WaterfallChartProps {
    contributions: FactorContribution[];
    baseRisk: number;
    finalRisk: number;
}

const WaterfallChart = ({ contributions, baseRisk, finalRisk }: WaterfallChartProps) => {
    // Sort contributions by absolute value for better visualization
    const sortedContributions = [...contributions]
        .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
        .slice(0, 8); // Top 8 factors

    // Find maximum absolute change (percentage) to scale the bars properly
    // We want the largest bar to take up about 45% of the width (leaving space for center)
    const maxChange = Math.max(
        ...sortedContributions.map(c => Math.abs(c.contribution * 10)),
        5 // minimum 5% to avoid division by zero or huge scaling for tiny values
    );

    // Scaling factor: 45% width / maxChange
    const scaleFactor = 45 / maxChange;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-32">
                <span>Reduce riesgo</span>
                <span>Aumenta riesgo</span>
            </div>

            {/* Base risk - Kept as a reference point but styled distinctly */}
            <div className="flex items-center gap-3 opacity-80">
                <div className="w-32 text-xs text-right text-muted-foreground truncate">
                    Riesgo base
                </div>
                <div className="flex-1 h-6 relative flex items-center justify-center">
                    <div className="w-full h-full bg-muted/30 rounded-full overflow-hidden flex items-center justify-center border border-dashed border-gray-200">
                        <span className="text-xs text-muted-foreground font-mono">{baseRisk.toFixed(1)}%</span>
                    </div>
                </div>
                <div className="w-16 text-xs text-gray-500">base</div>
            </div>

            {/* Factor contributions - Diverging Bars */}
            {sortedContributions.map((bar, index) => {
                const change = bar.contribution * 10; // Scale to resemble percentage impact approx
                const width = Math.abs(change) * scaleFactor;
                const isPositive = change > 0;

                return (
                    <div key={bar.feature} className="flex items-center gap-3 group" title={bar.name}>
                        {/* Label */}
                        <div className={`w-32 text-xs text-right truncate transition-colors ${isPositive ? 'group-hover:text-red-600' : 'group-hover:text-green-600'}`}>
                            {bar.name}
                        </div>

                        {/* Bar Container */}
                        <div className="flex-1 h-8 relative">
                            {/* Central Axis */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 z-0"></div>

                            {/* Bar */}
                            <div
                                className={`absolute h-4 top-2 rounded-sm transition-all duration-500 z-10 ${isPositive
                                    ? 'bg-red-500/90 group-hover:bg-red-500 shadow-sm'
                                    : 'bg-green-500/90 group-hover:bg-green-500 shadow-sm'
                                    }`}
                                style={{
                                    width: `${Math.max(width, 1)}%`, // At least 1% width
                                    left: isPositive ? '50%' : `calc(50% - ${Math.max(width, 1)}%)`
                                }}
                            />
                        </div>

                        {/* Value */}
                        <div className={`w-16 text-xs font-bold font-mono ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
                            {isPositive ? '+' : ''}{change.toFixed(1)}%
                        </div>
                    </div>
                );
            })}

            {/* Final risk */}
            <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                <div className="w-32 text-xs text-right font-semibold">
                    Riesgo final
                </div>
                <div className="flex-1 h-8 bg-muted/50 rounded-lg overflow-hidden relative">
                    <div
                        className={`absolute h-full rounded-r transition-all duration-700 ${finalRisk < 10 ? 'bg-green-500' :
                            finalRisk < 25 ? 'bg-yellow-500' :
                                finalRisk < 50 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${Math.min(finalRisk, 100)}%`, left: 0 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow-md">
                        {finalRisk.toFixed(1)}%
                    </div>
                </div>
                <div className="w-16 text-xs font-bold">final</div>
            </div>
        </div>
    );
};

export default WaterfallChart;
