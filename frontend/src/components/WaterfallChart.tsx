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

    // Calculate cumulative positions for waterfall effect
    let cumulative = baseRisk;
    const bars = sortedContributions.map((factor) => {
        const start = cumulative;
        const change = factor.contribution * 10; // Scale for visibility
        cumulative += change;
        return {
            ...factor,
            start: Math.max(0, Math.min(100, start)),
            end: Math.max(0, Math.min(100, cumulative)),
            change,
        };
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Menor riesgo</span>
                <span className="text-muted-foreground">Mayor riesgo</span>
            </div>

            {/* Base risk */}
            <div className="flex items-center gap-3">
                <div className="w-32 text-xs text-right text-muted-foreground truncate">
                    Riesgo base
                </div>
                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden relative">
                    <div
                        className="absolute h-full bg-gray-400 rounded-full transition-all duration-500"
                        style={{ width: `${baseRisk}%`, left: 0 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {baseRisk.toFixed(0)}%
                    </div>
                </div>
                <div className="w-16 text-xs text-gray-500">base</div>
            </div>

            {/* Factor contributions */}
            {bars.map((bar, index) => (
                <div key={bar.feature} className="flex items-center gap-3" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="w-32 text-xs text-right truncate" title={bar.name}>
                        {bar.name}
                    </div>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden relative">
                        {/* Background track */}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-100 via-gray-100 to-red-100 opacity-30" />

                        {/* Previous cumulative (faded) */}
                        <div
                            className="absolute h-full bg-gray-300/50 transition-all duration-500"
                            style={{
                                width: `${Math.abs(bar.start)}%`,
                                left: 0
                            }}
                        />

                        {/* This factor's contribution */}
                        <div
                            className={`absolute h-full transition-all duration-500 ${bar.change > 0 ? 'bg-red-500' : 'bg-green-500'
                                }`}
                            style={{
                                width: `${Math.abs(bar.change)}%`,
                                left: `${Math.min(bar.start, bar.end)}%`,
                            }}
                        />
                    </div>
                    <div className={`w-16 text-xs font-medium ${bar.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {bar.change > 0 ? '+' : ''}{bar.change.toFixed(1)}%
                    </div>
                </div>
            ))}

            {/* Final risk */}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="w-32 text-xs text-right font-semibold">
                    Riesgo final
                </div>
                <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden relative">
                    <div
                        className={`absolute h-full rounded-full transition-all duration-700 ${finalRisk < 10 ? 'bg-green-500' :
                                finalRisk < 25 ? 'bg-yellow-500' :
                                    finalRisk < 50 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${finalRisk}%`, left: 0 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow">
                        {finalRisk.toFixed(1)}%
                    </div>
                </div>
                <div className="w-16 text-xs font-bold">final</div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mt-4 pt-2 border-t border-border">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span>Reduce riesgo</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span>Aumenta riesgo</span>
                </div>
            </div>
        </div>
    );
};

export default WaterfallChart;
