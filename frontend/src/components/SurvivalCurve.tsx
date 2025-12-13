
import { SurvivalCurveData } from "@/lib/api";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { Card } from "@/components/ui/card";

interface SurvivalCurveProps {
    data: SurvivalCurveData;
}

const SurvivalCurve = ({ data }: SurvivalCurveProps) => {
    if (!data || !data.curve) return null;

    // Transform probabilities to percentages for better readability
    const chartData = data.curve.map(point => ({
        days: point.days,
        prob: (point.prob * 100).toFixed(1),
        fullProb: point.prob
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover border border-border p-2 rounded shadow-sm text-sm">
                    <p className="font-semibold">{`Día: ${label}`}</p>
                    <p className="text-primary">{`Prob. Supervivencia: ${payload[0].value}%`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                            dataKey="days"
                            label={{ value: 'Días desde cirugía', position: 'insideBottomRight', offset: -5 }}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            domain={[0, 100]}
                            label={{ value: 'Probabilidad (%)', angle: -90, position: 'insideLeft' }}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine x={365} stroke="#10B981" strokeDasharray="3 3" label="1 año" />
                        <ReferenceLine x={1095} stroke="#F59E0B" strokeDasharray="3 3" label="3 años" />
                        <ReferenceLine x={1825} stroke="#EF4444" strokeDasharray="3 3" label="5 años" />
                        <Line
                            type="monotone"
                            dataKey="prob"
                            stroke="#8884d8"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
                <Card className="p-3 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                    <span className="text-xs text-muted-foreground block">1 Año</span>
                    <span className="text-xl font-bold text-green-700 dark:text-green-400">
                        {(data.projections["1_year"] * 100).toFixed(1)}%
                    </span>
                </Card>
                <Card className="p-3 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                    <span className="text-xs text-muted-foreground block">3 Años</span>
                    <span className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                        {(data.projections["3_year"] * 100).toFixed(1)}%
                    </span>
                </Card>
                <Card className="p-3 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                    <span className="text-xs text-muted-foreground block">5 Años</span>
                    <span className="text-xl font-bold text-red-700 dark:text-red-400">
                        {(data.projections["5_year"] * 100).toFixed(1)}%
                    </span>
                </Card>
            </div>

            <p className="text-xs text-center text-muted-foreground">
                * Estimación personalizada basada en Cox Proportional Hazards (CoxPH).
            </p>
        </div>
    );
};

export default SurvivalCurve;
