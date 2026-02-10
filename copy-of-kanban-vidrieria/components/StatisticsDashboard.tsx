

import React, { useState, useMemo } from 'react';
// FIX: Import COLUMN_IDS to resolve 'Cannot find name 'COLUMN_IDS'' error.
import { ProjectHistory, COLUMN_IDS } from '../types';
import Modal from './Modal';
import { COLUMN_TITLES } from '../hooks/useKanbanState';

interface StatisticsDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    history: ProjectHistory[];
}

interface StatCardProps {
    title: string;
    value: string | number;
    description: string;
    comparison?: {
        value: number;
        label: string;
    };
    invertColors?: boolean;
}


const StatCard: React.FC<StatCardProps> = ({ title, value, description, comparison, invertColors = false }) => {
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
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm h-full">
            <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
            <div className="flex items-baseline my-2">
                <p className="text-4xl font-bold text-indigo-600">{value}</p>
                {comparison && getComparisonUI()}
            </div>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    );
};

const TopListItem: React.FC<{ item: string; count: number }> = ({ item, count }) => (
     <li className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-md">
        <span className="text-gray-700 font-medium truncate" title={item}>{item}</span>
        <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ml-2">{count}</span>
    </li>
);

// Helper function to calculate days between dates
const calculateDays = (start: string, end: string): number => {
    // Dates are YYYY-MM-DD. Appending T12:00:00Z avoids timezone issues.
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


const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({ isOpen, onClose, history }) => {
    const [filter, setFilter] = useState('30days');

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
             case 'all':
                currentPeriodStart = new Date(Math.min(...history.map(p => new Date(p.creationDate).getTime())));
                currentPeriodEnd = new Date(today);
                previousPeriodStart = currentPeriodStart;
                previousPeriodEnd = currentPeriodEnd;
                hasComparison = false;
                break;
            case '30days':
            default:
                currentPeriodEnd = new Date(today);
                currentPeriodStart = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
                previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1 * 24 * 60 * 60 * 1000);
                previousPeriodStart = new Date(previousPeriodEnd.getTime() - 29 * 24 * 60 * 60 * 1000);
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
        
        // Comparison calculations
        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? Infinity : 0;
            return ((current - previous) / previous) * 100;
        };
        const completedChange = previousStats ? calculateChange(currentStats.completed.length, previousStats.completed.length) : 0;
        const deliveryTimeChange = previousStats ? calculateChange(currentStats.avgDeliveryTime, previousStats.avgDeliveryTime) : 0;
        const reworkRateChange = previousStats ? calculateChange(currentStats.reworkRate, previousStats.reworkRate) : 0;

        // Rework Path Analysis
        const reworkPaths: { [key: string]: number } = {};
        const projectsWithReworkInCurrentPeriod = currentStats.history.filter(p => p.reworkCount && p.reworkCount > 0);
        projectsWithReworkInCurrentPeriod.forEach(project => {
            project.reworkHistory?.forEach(reworkEvent => {
                const path = `De: ${reworkEvent.from} → A: ${reworkEvent.to}`;
                reworkPaths[path] = (reworkPaths[path] || 0) + 1;
            });
        });
        const topReworkPaths = Object.entries(reworkPaths).sort(([, a], [, b]) => b - a).slice(0, 5);


        // Cycle Time
        const stageDurations: { [stage: string]: number[] } = {};
        COLUMN_IDS.filter(id => id !== 'column-finalizado').forEach(id => { stageDurations[COLUMN_TITLES[id]] = []; });

        currentStats.completed.forEach(project => {
            project.movementHistory?.forEach(move => {
                if (move.exitDate && stageDurations[move.stage]) {
                    const duration = calculateDays(move.entryDate, move.exitDate);
                    if (duration >= 0 && duration < 90) { stageDurations[move.stage].push(duration); }
                }
            });
        });
        const avgStageTimes = Object.entries(stageDurations).map(([stage, durations]) => ({
            stage,
            avgTime: parseFloat((durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0).toFixed(1)),
        }));
        
        // Lead Time Distribution
        const leadTimes = currentStats.completed.map(p => calculateDays(p.creationDate, p.completionDate!));
        const bins = [ { label: '0-7 d', min: 0, max: 7, count: 0 }, { label: '8-14 d', min: 8, max: 14, count: 0 }, { label: '15-21 d', min: 15, max: 21, count: 0 }, { label: '22-30 d', min: 22, max: 30, count: 0 }, { label: '31+ d', min: 31, max: Infinity, count: 0 }, ];
        leadTimes.forEach(time => {
            const bin = bins.find(b => time >= b.min && time <= b.max);
            if (bin) bin.count++;
        });

        // Scatter Plot Data
        const scatterPlotData = currentStats.completed.map(p => ({
            id: p.id,
            completed: new Date(p.completionDate!),
            leadTime: calculateDays(p.creationDate, p.completionDate!),
        }));

        const percentile50 = getPercentile(leadTimes, 50);
        const percentile85 = getPercentile(leadTimes, 85);
        
        // Top Items
        const getTopItems = (key: 'product' | 'client') => {
            const counts: { [key: string]: number } = {};
            currentStats.history.forEach(p => { counts[p[key]] = (counts[p[key]] || 0) + 1; });
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
            reworkAnalysis: {
                topReworkPaths
            },
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

    const filters = [ { key: '7days', label: '7 Días' }, { key: '30days', label: '30 Días' }, { key: 'year', label: 'Este Año' }, { key: 'all', label: 'Historial' }];
    
    // Scatter Plot Component
    const CycleTimeScatterPlot = () => {
        const { data, percentile50, percentile85, domainX, domainY } = periodData.scatterPlot;
        if (data.length === 0) return <p className="text-gray-500 text-center py-4">No hay datos de proyectos finalizados para el gráfico de dispersión.</p>;

        const width = 500, height = 300;
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const [minX, maxX] = domainX;
        const [minY, maxY] = domainY;
        
        const xScale = (date: Date) => (date.getTime() - minX.getTime()) / (maxX.getTime() - minX.getTime()) * innerWidth;
        const yScale = (value: number) => innerHeight - (value - minY) / (maxY - minY) * innerHeight;

        const yTicks = Array.from({ length: 6 }, (_, i) => minY + i * (maxY / 5));

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Axes and Grid */}
                    <line x1="0" y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#d1d5db" />
                    <line x1="0" y1="0" x2="0" y2={innerHeight} stroke="#d1d5db" />
                    <text x={innerWidth / 2} y={innerHeight + 35} textAnchor="middle" className="text-xs fill-current text-gray-500">Fecha de Finalización</text>
                    <text transform="rotate(-90)" x={-innerHeight/2} y={-30} textAnchor="middle" className="text-xs fill-current text-gray-500">Tiempo de Entrega (días)</text>
                    
                    {yTicks.map(tick => (
                         <g key={`tick-${tick}`} transform={`translate(0, ${yScale(tick)})`}>
                            <line x1={-5} y1="0" x2={innerWidth} y2="0" stroke="#e5e7eb" strokeDasharray="2,2"/>
                            <text x={-8} y={4} textAnchor="end" className="text-xs fill-current text-gray-500">{Math.round(tick)}</text>
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
                    {data.map(d => (
                        <circle key={d.id} cx={xScale(d.completed)} cy={yScale(d.leadTime)} r="3.5" className="fill-current text-indigo-500 opacity-70 hover:opacity-100 cursor-pointer">
                             <title>{`${d.id} - ${d.leadTime.toFixed(0)} días`}</title>
                        </circle>
                    ))}
                </g>
            </svg>
        );
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-7xl">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Panel de Estadísticas</h2>
                <div id="stats-modal-filters" className="flex items-center gap-2 mt-4 sm:mt-0 p-1 bg-gray-100 rounded-lg border">
                    {filters.map(({ key, label }) => (
                        <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition ${filter === key ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div id="stats-modal-kpis" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard 
                    title="Proyectos Finalizados" 
                    value={periodData.summaryStats.totalCompleted} 
                    description="Completados en el período."
                    comparison={{ value: periodData.summaryStats.comparison.completedChange, label: 'vs período anterior' }}
                />
                <StatCard 
                    title="Tiempo Promedio de Entrega" 
                    value={`${periodData.summaryStats.avgDeliveryTime} días`} 
                    description="Desde creación a finalización."
                    comparison={{ value: periodData.summaryStats.comparison.deliveryTimeChange, label: 'vs período anterior' }}
                    invertColors={true}
                />
                 <StatCard 
                    title="Tasa de Retrabajo" 
                    value={`${periodData.summaryStats.reworkRate}%`} 
                    description="Proyectos que requirieron retrabajo."
                    comparison={{ value: periodData.summaryStats.comparison.reworkRateChange, label: 'vs período anterior' }}
                    invertColors={true}
                />
            </div>

            {/* PHASE 2 CHART */}
             <div id="stats-modal-scatter" className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
                 <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Gráfico de Dispersión de Tiempo de Ciclo</h3>
                 <CycleTimeScatterPlot />
            </div>

            {/* PHASE 1 CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Análisis de Tiempo de Ciclo por Etapa</h3>
                    <div className="bg-gray-50 p-6 rounded-lg shadow-inner h-full flex flex-col justify-around">
                        {periodData.cycleTime.data.length > 0 ? periodData.cycleTime.data.map(d => (
                            <div key={d.stage} className="flex items-center gap-4 my-1">
                                <span className="text-sm font-medium text-gray-600 w-36 text-right truncate" title={d.stage}>{d.stage}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-6">
                                    <div className="bg-indigo-500 h-6 rounded-full flex items-center justify-end pr-2" style={{ width: `${(d.avgTime / periodData.cycleTime.maxTime) * 100}%` }}>
                                        <span className="text-white font-bold text-sm">{d.avgTime} d</span>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-gray-500 text-center py-4">No hay datos suficientes para el análisis de ciclo.</p>}
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Distribución de Tiempos de Entrega</h3>
                     <div className="bg-gray-50 p-6 rounded-lg shadow-inner h-full flex items-center justify-around">
                        {periodData.leadTimeDistribution.totalCount > 0 ? periodData.leadTimeDistribution.bins.map(bin => (
                            <div key={bin.label} className="flex flex-col items-center h-full justify-end text-center">
                                <div className="text-sm font-bold text-gray-700">{bin.count}</div>
                                <div className="w-10 bg-gray-200 rounded-lg mx-2 flex-grow flex items-end">
                                    <div className="bg-green-500 w-full rounded-lg" style={{ height: `${(bin.count / periodData.leadTimeDistribution.maxCount) * 100}%` }}></div>
                                </div>
                                <div className="text-xs font-semibold text-gray-600 mt-2">{bin.label}</div>
                            </div>
                        )) : <p className="text-gray-500 text-center py-4">No hay datos suficientes para la distribución.</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Top 5 Productos Más Fabricados</h3>
                    {periodData.summaryStats.topProducts.length > 0 ? (
                        <ul className="space-y-2">
                           {periodData.summaryStats.topProducts.map(([product, count]) => <TopListItem key={product} item={product} count={count} />)}
                        </ul>
                    ) : <p className="text-gray-500 text-center py-4">No hay datos de productos.</p>}
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Top 5 Clientes (por volumen)</h3>
                    {periodData.summaryStats.topClients.length > 0 ? (
                        <ul className="space-y-2">
                           {periodData.summaryStats.topClients.map(([client, count]) => <TopListItem key={client} item={client} count={count} />)}
                        </ul>
                    ) : <p className="text-gray-500 text-center py-4">No hay datos de clientes.</p>}
                </div>
                 <div id="stats-modal-rework">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Puntos de Falla (Retrabajos)</h3>
                    {periodData.reworkAnalysis.topReworkPaths.length > 0 ? (
                        <ul className="space-y-2">
                           {periodData.reworkAnalysis.topReworkPaths.map(([path, count]) => <TopListItem key={path} item={path} count={count} />)}
                        </ul>
                    ) : <p className="text-gray-500 text-center py-4">¡Felicidades! No hay retrabajos.</p>}
                </div>
            </div>

            <div className="flex justify-end mt-8">
                <button type="button" onClick={onClose} className="py-2 px-5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">Cerrar</button>
            </div>
        </Modal>
    );
};

export default StatisticsDashboard;