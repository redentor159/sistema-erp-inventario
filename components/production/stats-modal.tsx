"use client"

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProjectHistory } from '@/lib/kanban-adapter';

// Constants
const COLUMN_IDS = [
    'column-pedidos-confirmados',
    'column-en-corte',
    'column-en-ensamblaje',
    'column-listo-para-instalar',
    'column-finalizado'
]

const COLUMN_TITLES: Record<string, string> = {
    'column-pedidos-confirmados': 'Pedidos Confirmados',
    'column-en-corte': 'En Corte',
    'column-en-ensamblaje': 'En Ensamblaje',
    'column-listo-para-instalar': 'Listo para Instalar',
    'column-finalizado': 'Finalizado'
}

interface StatisticsDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    history: ProjectHistory[];
}

const StatCard = ({ title, value, description, comparison, invertColors = false }: any) => {
    const getComparisonUI = () => {
        if (!comparison || !isFinite(comparison.value)) return null;
        const isPositive = comparison.value > 0;
        const isNegative = comparison.value < 0;
        let colorClass = 'text-gray-500';
        if (isPositive) colorClass = invertColors ? 'text-red-500' : 'text-green-500';
        if (isNegative) colorClass = invertColors ? 'text-green-500' : 'text-red-500';

        return (
            <span className={`ml-2 text-sm font-semibold ${colorClass}`}>
                {isPositive ? '▲' : isNegative ? '▼' : ''} {Math.abs(comparison.value).toFixed(1)}%
            </span>
        );
    };

    return (
        <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-lg shadow-sm h-full border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
            <div className="flex items-baseline my-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
                {comparison && getComparisonUI()}
            </div>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    );
};

const TopListItem = ({ item, count }: { item: string; count: number }) => (
    <li className="flex justify-between items-center py-2 px-3 border-b border-gray-100 last:border-0 text-sm">
        <span className="font-medium truncate max-w-[200px]" title={item}>{item}</span>
        <Badge variant="secondary" className="bg-gray-100 text-gray-700">{count}</Badge>
    </li>
);

// Helpers
const calculateDays = (start: string, end: string): number => {
    const startDate = new Date(start + 'T12:00:00Z');
    const endDate = new Date(end + 'T12:00:00Z');
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

const getPercentile = (data: number[], percentile: number): number => {
    if (data.length === 0) return 0;
    const sorted = [...data].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    if (Number.isInteger(index)) {
        return sorted[index];
    }
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    return sorted[lower] + (index - lower) * (sorted[upper] - sorted[lower]);
};

export function StatsModal({ isOpen, onClose, history }: StatisticsDashboardProps) {
    const [filter, setFilter] = useState('all'); // Default to All History to show simulated data

    const periodData = useMemo(() => {
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        let currentPeriodStart: Date, currentPeriodEnd: Date;
        let previousPeriodStart: Date, previousPeriodEnd: Date;
        let hasComparison = true;

        switch (filter) {
            case '7days':
                currentPeriodEnd = new Date(today);
                currentPeriodStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
                previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1 * 24 * 60 * 60 * 1000);
                previousPeriodStart = new Date(previousPeriodEnd.getTime() - 6 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                currentPeriodEnd = new Date(today);
                currentPeriodStart = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
                previousPeriodEnd = new Date(Date.UTC(today.getUTCFullYear() - 1, 11, 31));
                previousPeriodStart = new Date(Date.UTC(today.getUTCFullYear() - 1, 0, 1));
                break;
            case '30days':
                currentPeriodEnd = new Date(today);
                currentPeriodStart = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
                previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1 * 24 * 60 * 60 * 1000);
                previousPeriodStart = new Date(previousPeriodEnd.getTime() - 29 * 24 * 60 * 60 * 1000);
                break;
            case 'all':
            default:
                // For 'all', find the earliest date or default to 5 years ago
                const earliest = history.length > 0
                    ? Math.min(...history.map(p => new Date(p.creationDate).getTime()))
                    : today.getTime() - (365 * 5 * 24 * 60 * 60 * 1000);

                currentPeriodStart = new Date(earliest);
                currentPeriodEnd = new Date(today);
                previousPeriodStart = currentPeriodStart; // No comparison for all time
                previousPeriodEnd = currentPeriodEnd;
                hasComparison = false;
                break;
        }

        const getStatsForPeriod = (start: Date, end: Date) => {
            const periodHistory = history.filter(p => {
                const pDate = new Date(p.creationDate);
                return pDate >= start && pDate <= end;
            });

            const completed = periodHistory.filter(p =>
                (p.status === 'Finalizado' || p.status === 'Archivado') && p.completionDate && p.creationDate
            );

            const projectsWithRework = periodHistory.filter(p => (p.reworkCount || 0) > 0);
            const reworkRate = periodHistory.length > 0 ? (projectsWithRework.length / periodHistory.length) * 100 : 0;

            const totalDeliveryDays = completed.reduce((sum, p) => sum + calculateDays(p.creationDate, p.completionDate!), 0);
            const avgDeliveryTime = completed.length > 0 ? totalDeliveryDays / completed.length : 0;

            return { history: periodHistory, completed, avgDeliveryTime, reworkRate };
        };

        const currentStats = getStatsForPeriod(currentPeriodStart, currentPeriodEnd);
        const previousStats = hasComparison ? getStatsForPeriod(previousPeriodStart, previousPeriodEnd) : null;

        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? Infinity : 0;
            return ((current - previous) / previous) * 100;
        };
        const completedChange = previousStats ? calculateChange(currentStats.completed.length, previousStats.completed.length) : 0;
        const deliveryTimeChange = previousStats ? calculateChange(currentStats.avgDeliveryTime, previousStats.avgDeliveryTime) : 0;
        const reworkRateChange = previousStats ? calculateChange(currentStats.reworkRate, previousStats.reworkRate) : 0;

        const reworkPaths: { [key: string]: number } = {};
        const projectsWithReworkInCurrentPeriod = currentStats.history.filter(p => p.reworkCount && p.reworkCount > 0);
        projectsWithReworkInCurrentPeriod.forEach(project => {
            project.reworkHistory?.forEach((reworkEvent: any) => {
                // Map columns to titles if possible, otherwise use raw
                const fromTitle = COLUMN_TITLES[reworkEvent.from] || reworkEvent.from;
                const toTitle = COLUMN_TITLES[reworkEvent.to] || reworkEvent.to;
                const path = `De: ${fromTitle} → A: ${toTitle}`;
                reworkPaths[path] = (reworkPaths[path] || 0) + 1;
            });
        });
        const topReworkPaths = Object.entries(reworkPaths).sort(([, a], [, b]) => b - a).slice(0, 5);

        const stageDurations: { [stage: string]: number[] } = {};
        COLUMN_IDS.filter(id => id !== 'column-finalizado').forEach(id => { stageDurations[COLUMN_TITLES[id]] = []; });

        currentStats.completed.forEach(project => {
            project.movementHistory?.forEach((move: any) => {
                // move.stage is now a TITLE like "En Corte", not an ID
                const stageTitle = move.stage;
                if (move.exitDate && stageTitle && stageDurations[stageTitle]) {
                    const duration = calculateDays(move.entryDate, move.exitDate);
                    if (duration >= 0 && duration < 90) { stageDurations[stageTitle].push(duration); }
                }
            });
        });
        const avgStageTimes = Object.entries(stageDurations).map(([stage, durations]) => ({
            stage,
            avgTime: parseFloat((durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0).toFixed(1)),
        }));

        const leadTimes = currentStats.completed.map(p => calculateDays(p.creationDate, p.completionDate!));
        const bins = [{ label: '0-7 d', min: 0, max: 7, count: 0 }, { label: '8-14 d', min: 8, max: 14, count: 0 }, { label: '15-21 d', min: 15, max: 21, count: 0 }, { label: '22-30 d', min: 22, max: 30, count: 0 }, { label: '31+ d', min: 31, max: Infinity, count: 0 },];
        leadTimes.forEach(time => {
            const bin = bins.find(b => time >= b.min && time <= b.max);
            if (bin) bin.count++;
        });

        const scatterPlotData = currentStats.completed.map(p => ({
            id: p.id,
            completed: new Date(p.completionDate!),
            leadTime: calculateDays(p.creationDate, p.completionDate!),
        }));

        const percentile50 = getPercentile(leadTimes, 50);
        const percentile85 = getPercentile(leadTimes, 85);

        const getTopItems = (key: 'product' | 'client') => {
            const counts: { [key: string]: number } = {};
            currentStats.history.forEach(p => {
                const val = p[key] as string;
                counts[val] = (counts[val] || 0) + 1;
            });
            return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5);
        };

        return {
            summaryStats: {
                totalCompleted: currentStats.completed.length,
                avgDeliveryTime: currentStats.avgDeliveryTime.toFixed(1),
                reworkRate: currentStats.reworkRate.toFixed(1),
                topProducts: getTopItems('product'),
                topClients: getTopItems('client'),
                comparison: { completedChange, deliveryTimeChange, reworkRateChange }
            },
            reworkAnalysis: { topReworkPaths },
            cycleTime: {
                data: avgStageTimes,
                maxTime: Math.max(...avgStageTimes.map(d => d.avgTime), 1)
            },
            leadTimeDistribution: {
                bins,
                maxCount: Math.max(...bins.map(b => b.count), 1),
                totalCount: leadTimes.length
            },
            scatterPlot: {
                data: scatterPlotData,
                percentile50,
                percentile85,
                domainX: [currentPeriodStart, currentPeriodEnd],
                domainY: [0, Math.max(...leadTimes, percentile85, 10) * 1.1]
            }
        };
    }, [history, filter]);

    // Scatter Plot Component
    const CycleTimeScatterPlot = () => {
        const { data, percentile50, percentile85, domainX, domainY } = periodData.scatterPlot;
        if (data.length === 0) return <p className="text-gray-500 text-center py-4">No hay datos de proyectos finalizados para el gráfico de dispersión.</p>;

        const width = 800, height = 450; // Larger aspect ratio
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const [minX, maxX] = domainX;
        const [minY, maxY] = domainY;

        const xScale = (date: Date) => (date.getTime() - minX.getTime()) / (maxX.getTime() - minX.getTime()) * innerWidth;
        const yScale = (value: number) => innerHeight - (value - minY) / (maxY - minY) * innerHeight;

        const yTicks = Array.from({ length: 10 }, (_, i) => minY + i * (maxY / 9));

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-h-[500px] min-h-[400px]">
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Axes and Grid */}
                    <line x1="0" y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#d1d5db" />
                    <line x1="0" y1="0" x2="0" y2={innerHeight} stroke="#d1d5db" />
                    <text x={innerWidth / 2} y={innerHeight + 35} textAnchor="middle" className="text-xs fill-current text-muted-foreground">Fecha de Finalización</text>
                    <text transform="rotate(-90)" x={-innerHeight / 2} y={-30} textAnchor="middle" className="text-xs fill-current text-muted-foreground">Tiempo de Entrega (días)</text>

                    {yTicks.map(tick => (
                        <g key={`tick-${tick}`} transform={`translate(0, ${yScale(tick)})`}>
                            <line x1={-5} y1="0" x2={innerWidth} y2="0" stroke="#e5e7eb" strokeDasharray="2,2" />
                            <text x={-8} y={4} textAnchor="end" className="text-xs fill-current text-muted-foreground">{Math.round(tick)}</text>
                        </g>
                    ))}

                    {/* Percentile Lines */}
                    <g transform={`translate(0, ${yScale(percentile50)})`}>
                        <line x1={-5} x2={innerWidth} stroke="#f59e0b" strokeDasharray="4,4" />
                        <text x={-8} y={4} textAnchor="end" className="text-xs font-semibold fill-current text-amber-600">
                            {percentile50.toFixed(1)}
                        </text>
                        <text x={innerWidth + 5} y="3" className="text-xs fill-current text-amber-600 font-semibold">p50</text>
                    </g>
                    <g transform={`translate(0, ${yScale(percentile85)})`}>
                        <line x1={-5} x2={innerWidth} stroke="#ef4444" strokeDasharray="4,4" />
                        <text x={-8} y={4} textAnchor="end" className="text-xs font-semibold fill-current text-red-600">
                            {percentile85.toFixed(1)}
                        </text>
                        <text x={innerWidth + 5} y="3" className="text-xs fill-current text-red-600 font-semibold">p85</text>
                    </g>

                    {/* Data Points */}
                    {data.map((d, i) => (
                        <circle key={`${d.id}-${i}`} cx={xScale(d.completed)} cy={yScale(d.leadTime)} r="3.5" className="fill-current text-indigo-500 opacity-70 hover:opacity-100 cursor-pointer">
                            <title>{`${d.id} - ${d.leadTime.toFixed(0)} días`}</title>
                        </circle>
                    ))}
                </g>
            </svg>
        );
    };

    const filters = [{ key: '7days', label: '7 Días' }, { key: '30days', label: '30 Días' }, { key: 'year', label: 'Este Año' }, { key: 'all', label: 'Historial' }];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[95vw] !max-w-[95vw] w-[95vw] !w-[95vw] max-h-[96vh] h-[96vh] flex flex-col p-6 overflow-hidden">
                <DialogHeader className="mb-4 flex-shrink-0">
                    <DialogTitle className="flex justify-between items-center text-2xl font-bold">
                        <span>Inteligencia de Producción</span>
                        <div className="flex gap-2">
                            {filters.map(({ key, label }) => (
                                <Badge
                                    key={key}
                                    variant={filter === key ? "default" : "outline"}
                                    className="cursor-pointer text-sm py-1 px-3"
                                    onClick={() => setFilter(key)}
                                >
                                    {label}
                                </Badge>
                            ))}
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <StatCard
                        title="Proyectos Finalizados"
                        value={periodData.summaryStats.totalCompleted}
                        description="Completados en el período."
                        comparison={{ value: periodData.summaryStats.comparison.completedChange }}
                    />
                    <StatCard
                        title="Tiempo Promedio"
                        value={`${periodData.summaryStats.avgDeliveryTime} d`}
                        description="Lead Time (Ciclo completo)"
                        comparison={{ value: periodData.summaryStats.comparison.deliveryTimeChange }}
                        invertColors={true}
                    />
                    <StatCard
                        title="Tasa de Retrabajo"
                        value={`${periodData.summaryStats.reworkRate}%`}
                        description="Proyectos devueltos"
                        comparison={{ value: periodData.summaryStats.comparison.reworkRateChange }}
                        invertColors={true}
                    />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pr-2">

                    {/* Scatter Plot */}
                    <div className="bg-white dark:bg-card p-6 rounded-lg border shadow-sm mb-6">
                        <h3 className="text-lg font-semibold text-center mb-4 text-gray-700 dark:text-gray-300">Análisis de Dispersión</h3>
                        <div className="w-full flex justify-center">
                            <CycleTimeScatterPlot />
                        </div>
                    </div>

                    {/* Main Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* 1. Cycle Time Analysis (Horizontal Bars) */}
                        <div className="bg-white dark:bg-card p-6 rounded-lg border shadow-sm">
                            <h3 className="text-lg font-semibold mb-6 text-center text-gray-700 dark:text-gray-300">Análisis de Tiempo de Ciclo por Etapa</h3>
                            <div className="space-y-5">
                                {periodData.cycleTime.data.map(d => (
                                    <div key={d.stage} className="grid grid-cols-[140px_1fr] items-center gap-4">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 text-right">{d.stage}</span>
                                        <div className="h-8 bg-gray-100 rounded-full overflow-hidden relative w-full">
                                            <div
                                                className="h-full bg-indigo-500 flex items-center justify-end px-3 transition-all duration-500 ease-out"
                                                style={{ width: `${Math.max((d.avgTime / periodData.cycleTime.maxTime) * 100, 15)}%` }} // Min 15% width for text visibility
                                            >
                                                <span className="text-xs font-bold text-white whitespace-nowrap">{d.avgTime} d</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Lead Time Distribution (Vertical Bars) */}
                        <div className="bg-white dark:bg-card p-6 rounded-lg border shadow-sm">
                            <h3 className="text-lg font-semibold mb-6 text-center text-gray-700 dark:text-gray-300">Distribución de Tiempos de Entrega</h3>
                            <div className="h-64 flex items-end justify-between gap-2 px-4">
                                {periodData.leadTimeDistribution.bins.map((bin, i) => {
                                    const heightPercent = bin.count > 0 ? (bin.count / periodData.leadTimeDistribution.maxCount) * 100 : 0;
                                    return (
                                        <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                                            <span className="text-xs font-bold text-gray-600 mb-2 group-hover:scale-110 transition-transform">{bin.count}</span>
                                            <div className="w-full bg-gray-100 rounded-t-md relative h-full flex items-end overflow-hidden">
                                                <div
                                                    className="w-full bg-emerald-500 hover:bg-emerald-600 transition-all duration-500 ease-out rounded-t-md relative"
                                                    style={{ height: `${Math.max(heightPercent, 2)}%` }} // Min 2% visibility
                                                >
                                                    {/* Tooltip-ish hint */}
                                                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-0 w-full text-center text-[10px] text-white font-bold pb-1 bg-gradient-to-t from-black/20 to-transparent">
                                                        {Math.round(heightPercent)}%
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-500 mt-2 font-medium">{bin.label}</span>
                                            <div className="h-1 w-full bg-emerald-500 rounded-full mt-1"></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Top Lists (3 Columns) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Top Products */}
                        <div className="bg-white dark:bg-card p-6 rounded-lg border shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-500">Top 5 Productos Más Fabricados</h3>
                            <ul className="space-y-1">
                                {periodData.summaryStats.topProducts.map(([product, count]) => (
                                    <TopListItem key={product} item={product} count={count} />
                                ))}
                            </ul>
                        </div>

                        {/* Top Clients */}
                        <div className="bg-white dark:bg-card p-6 rounded-lg border shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-500">Top 5 Clientes (por volumen)</h3>
                            <ul className="space-y-1">
                                {periodData.summaryStats.topClients.map(([client, count]) => (
                                    <TopListItem key={client} item={client} count={count} />
                                ))}
                            </ul>
                        </div>

                        {/* Reworks */}
                        <div className="bg-white dark:bg-card p-6 rounded-lg border shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-500">Puntos de Falla (Retrabajos)</h3>
                            {periodData.reworkAnalysis.topReworkPaths.length > 0 ? (
                                <ul className="space-y-1">
                                    {periodData.reworkAnalysis.topReworkPaths.map(([path, count]) => (
                                        <TopListItem key={path} item={path} count={count} />
                                    ))}
                                </ul>
                            ) : <p className="text-muted-foreground text-center py-4 italic text-sm">Sin retrabajos registrados.</p>}
                        </div>
                    </div>

                </div>

                <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
                    <Button onClick={onClose} size="lg">Cerrar Panel</Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}
