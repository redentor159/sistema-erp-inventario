"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import {
    ClipboardList,
    FileText,
    FileSpreadsheet,
    ChevronDown,
    ChevronUp,
    Package,
    Layers,
    BarChart3,
    Scissors,
    AlertTriangle,
    SlidersHorizontal,
    RefreshCw,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle2,
} from "lucide-react";

import {
    fetchMasterData,
    fetchCountSheetData,
    fetchCountEstimate,
    type CountSheetConfig,
    type MasterData,
} from "@/lib/export/hojas-conteo-queries";
import { generateCountSheetExcel } from "@/lib/export/hojas-conteo-excel";
import { generateCountSheetPDF } from "@/lib/export/hojas-conteo-pdf";

// ─────────────────────────────────────────────────────────────────────────────
// Preset card definitions
// ─────────────────────────────────────────────────────────────────────────────

const PRESETS = [
    {
        id: "POR_SISTEMA" as const,
        label: "Por Sistema / Serie",
        desc: "Todos los perfiles y accesorios de una serie (Nova, S20, Tigre…)",
        icon: Package,
        color: "blue",
        accent: "#2563EB",
        borderCls: "border-blue-200 hover:border-blue-400",
        activeBg: "bg-blue-50",
        activeBorder: "border-blue-500",
        badgeCls: "bg-blue-100 text-blue-800",
    },
    {
        id: "POR_FAMILIA" as const,
        label: "Por Familia",
        desc: "Solo una categoría: Vidrios, Accesorios, Perfiles…",
        icon: Layers,
        color: "green",
        accent: "#16A34A",
        borderCls: "border-green-200 hover:border-green-400",
        activeBg: "bg-green-50",
        activeBorder: "border-green-500",
        badgeCls: "bg-green-100 text-green-800",
    },
    {
        id: "POR_ABC" as const,
        label: "Por Rotación (ABC)",
        desc: "Conteo cíclico: Clase A (mensual), B (bimestral), C (trimestral)",
        icon: BarChart3,
        color: "violet",
        accent: "#7C3AED",
        borderCls: "border-violet-200 hover:border-violet-400",
        activeBg: "bg-violet-50",
        activeBorder: "border-violet-500",
        badgeCls: "bg-violet-100 text-violet-800",
    },
    {
        id: "RETAZOS" as const,
        label: "Retazos Físicos",
        desc: "Verifica longitud (mm) y ubicación de retazos disponibles",
        icon: Scissors,
        color: "amber",
        accent: "#D97706",
        borderCls: "border-amber-200 hover:border-amber-400",
        activeBg: "bg-amber-50",
        activeBorder: "border-amber-500",
        badgeCls: "bg-amber-100 text-amber-800",
    },
    {
        id: "STOCK_CRITICO" as const,
        label: "Stock Crítico / Negativo",
        desc: "Productos con stock ≤ 0 o por debajo del mínimo",
        icon: AlertTriangle,
        color: "red",
        accent: "#DC2626",
        borderCls: "border-red-200 hover:border-red-400",
        activeBg: "bg-red-50",
        activeBorder: "border-red-500",
        badgeCls: "bg-red-100 text-red-800",
    },
    {
        id: "CUSTOM" as const,
        label: "Filtros Personalizados",
        desc: "Combinación libre de Marca, Material, Acabado, Stock y Clase ABC",
        icon: SlidersHorizontal,
        color: "teal",
        accent: "#0F766E",
        borderCls: "border-teal-200 hover:border-teal-400",
        activeBg: "bg-teal-50",
        activeBorder: "border-teal-500",
        badgeCls: "bg-teal-100 text-teal-800",
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Default config
// ─────────────────────────────────────────────────────────────────────────────

const defaultConfig: CountSheetConfig = {
    modo: "POR_SISTEMA",
    conteo_ciego: true,
    id_sistema: "",
    id_familia: null,
    todas_familias: false,
    incluir_sin_familia: false,
    clasificacion_abc: ["A"],
    dias_analisis: 90,
    incluir_negativos: true,
    incluir_bajo_minimo: true,
    marcas: [],
    materiales: [],
    acabados: [],
    sistemas: [],
    familias: [],
    stock_min: null,
    stock_max: null,
    abc_custom: ["A"],
    orden: "familia",
    agrupar_por: "familia",
    titulo: "Hoja de Conteo Físico de Inventario",
    nombre_operario: "",
    area_zona: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable components
// ─────────────────────────────────────────────────────────────────────────────

function SectionAccordion({
    title,
    children,
    defaultOpen = true,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border-b border-slate-100 transition-colors text-left"
            >
                <span className="text-sm font-semibold text-slate-700">{title}</span>
                {open ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
            </button>
            {open && (
                <div className="px-4 py-4 space-y-3 bg-white">{children}</div>
            )}
        </div>
    );
}

function ToggleChip({
    label,
    active,
    onClick,
    colorCls,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    colorCls: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${active ? `${colorCls} border-transparent shadow-sm` : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                }`}
        >
            {label}
        </button>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            {children}
        </label>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function HojasConteoPage() {
    const [config, setConfig] = useState<CountSheetConfig>(defaultConfig);
    const [masterData, setMasterData] = useState<MasterData | null>(null);
    const [loadingMaster, setLoadingMaster] = useState(true);
    const [estimateCount, setEstimateCount] = useState<number | null>(null);
    const [loadingEstimate, setLoadingEstimate] = useState(false);
    const [loadingAction, setLoadingAction] = useState<"pdf" | "xlsx" | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const patch = (partial: Partial<CountSheetConfig>) =>
        setConfig((c) => ({ ...c, ...partial }));

    // Load master data for dropdowns
    useEffect(() => {
        setLoadingMaster(true);
        fetchMasterData()
            .then((d) => setMasterData(d))
            .catch(console.error)
            .finally(() => setLoadingMaster(false));
    }, []);

    // Refresh estimate when config changes (debounced)
    useEffect(() => {
        setEstimateCount(null);
        setLoadingEstimate(true);
        const t = setTimeout(() => {
            fetchCountEstimate(config)
                .then((n) => setEstimateCount(n))
                .catch(() => setEstimateCount(null))
                .finally(() => setLoadingEstimate(false));
        }, 500);
        return () => clearTimeout(t);
    }, [config.modo, config.id_sistema, config.id_familia, config.todas_familias, config.clasificacion_abc, config.incluir_negativos, config.incluir_bajo_minimo, config.marcas, config.materiales, config.acabados, config.sistemas, config.stock_min, config.stock_max]);

    const activePreset = PRESETS.find((p) => p.id === config.modo)!;
    const estimatedPages =
        estimateCount != null ? Math.ceil(estimateCount / 55) : null;

    const handleGenerate = async (format: "pdf" | "xlsx") => {
        setLoadingAction(format);
        setSuccessMsg(null);
        try {
            const rows = await fetchCountSheetData(config);
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const modeSuffix = config.modo.replace("POR_", "").slice(0, 8);
            const filename = `HC_${modeSuffix}_${dateStr}`;

            if (format === "xlsx") {
                const blob = await generateCountSheetExcel(rows, config);
                saveAs(blob, `${filename}.xlsx`);
                setSuccessMsg(`Excel descargado: ${rows.length} productos`);
            } else {
                const blob = await generateCountSheetPDF(rows, config);
                saveAs(blob, `${filename}.pdf`);
                setSuccessMsg(`PDF descargado: ${rows.length} productos`);
            }
        } catch (err: any) {
            alert(`Error al generar ${format.toUpperCase()}: ${err.message ?? "Desconocido"}`);
        } finally {
            setLoadingAction(null);
            setTimeout(() => setSuccessMsg(null), 5000);
        }
    };

    const toggleAbcClass = (cls: string) => {
        const current = config.clasificacion_abc ?? [];
        const next = current.includes(cls)
            ? current.filter((c) => c !== cls)
            : [...current, cls];
        patch({ clasificacion_abc: next.length > 0 ? next : [cls] });
    };

    return (
        <div className="space-y-6 p-6">
            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ClipboardList className="h-6 w-6 text-slate-600" />
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            Hojas de Conteo Físico
                        </h2>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Genera hojas de conteo ultra-compactas en PDF y Excel para el operario de almacén.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{format(new Date(), "dd/MM/yyyy HH:mm")}</span>
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

                {/* ══ Left: Quick Presets + Summary ══════════════════════════════════ */}
                <div className="space-y-4">
                    <div className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
                        <div className="pb-3 border-b border-slate-100 px-4 pt-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                🚀 Modos Rápidos
                            </h3>
                        </div>
                        <div className="pt-4 px-4 pb-4">
                            <div className="space-y-2">
                                {PRESETS.map((preset) => {
                                    const isActive = config.modo === preset.id;
                                    const Icon = preset.icon;
                                    return (
                                        <div key={preset.id}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    patch({
                                                        modo: preset.id,
                                                        agrupar_por: preset.id === "RETAZOS" ? null : config.agrupar_por,
                                                    });
                                                }}
                                                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${isActive
                                                    ? `${preset.activeBg} ${preset.activeBorder}`
                                                    : `bg-white ${preset.borderCls}`
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon
                                                        className="h-4 w-4 flex-shrink-0"
                                                        style={{ color: isActive ? preset.accent : "#94A3B8" }}
                                                    />
                                                    <span
                                                        className="text-xs font-semibold"
                                                        style={{ color: isActive ? preset.accent : "#334155" }}
                                                    >
                                                        {preset.label}
                                                    </span>
                                                    {isActive && (
                                                        <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium ${preset.badgeCls}`}>
                                                            Activo
                                                        </span>
                                                    )}
                                                </div>
                                                {isActive && (
                                                    <p className="text-xs text-slate-500 mt-1 ml-6">
                                                        {preset.desc}
                                                    </p>
                                                )}
                                            </button>

                                            {/* Inline sub-options per preset */}
                                            {isActive && (
                                                <div className="bg-slate-50 border border-slate-200 border-t-0 rounded-b-lg px-3 py-2 space-y-2">
                                                    {preset.id === "POR_SISTEMA" && (
                                                        <div>
                                                            <FieldLabel>Serie / Sistema</FieldLabel>
                                                            <select
                                                                className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:ring-1 focus:ring-blue-500"
                                                                value={config.id_sistema ?? ""}
                                                                onChange={(e) => patch({ id_sistema: e.target.value })}
                                                            >
                                                                <option value="">— Seleccione una serie —</option>
                                                                {(masterData?.sistemas ?? []).map((s) => (
                                                                    <option key={s.id_sistema} value={s.id_sistema}>
                                                                        {s.nombre_comercial}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                    {preset.id === "POR_FAMILIA" && (
                                                        <>
                                                            <div className="flex items-center gap-3">
                                                                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="h-3 w-3"
                                                                        checked={!!config.todas_familias}
                                                                        onChange={(e) => patch({ todas_familias: e.target.checked })}
                                                                    />
                                                                    Todas las familias
                                                                </label>
                                                                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="h-3 w-3"
                                                                        checked={!!config.incluir_sin_familia}
                                                                        onChange={(e) => patch({ incluir_sin_familia: e.target.checked })}
                                                                    />
                                                                    Incluir sin familia
                                                                </label>
                                                            </div>
                                                            {!config.todas_familias && (
                                                                <div>
                                                                    <FieldLabel>Familia específica</FieldLabel>
                                                                    <select
                                                                        className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:ring-1 focus:ring-green-500"
                                                                        value={config.id_familia ?? ""}
                                                                        onChange={(e) => patch({ id_familia: e.target.value || null })}
                                                                    >
                                                                        <option value="">— Seleccione familia —</option>
                                                                        {(masterData?.familias ?? []).map((f) => (
                                                                            <option key={f.id_familia} value={f.id_familia}>
                                                                                {f.nombre_familia}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    {preset.id === "POR_ABC" && (
                                                        <>
                                                            <div>
                                                                <FieldLabel>Clase(s) ABC</FieldLabel>
                                                                <div className="flex gap-2">
                                                                    {["A", "B", "C"].map((cls) => (
                                                                        <ToggleChip
                                                                            key={cls}
                                                                            label={`Clase ${cls}`}
                                                                            active={(config.clasificacion_abc ?? []).includes(cls)}
                                                                            onClick={() => toggleAbcClass(cls)}
                                                                            colorCls={
                                                                                cls === "A" ? "bg-violet-600 text-white" :
                                                                                    cls === "B" ? "bg-violet-400 text-white" :
                                                                                        "bg-violet-200 text-violet-800"
                                                                            }
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <FieldLabel>Período de análisis</FieldLabel>
                                                                <select
                                                                    className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:ring-1 focus:ring-violet-500"
                                                                    value={config.dias_analisis ?? 90}
                                                                    onChange={(e) => patch({ dias_analisis: Number(e.target.value) })}
                                                                >
                                                                    {[30, 60, 90, 180, 365].map((d) => (
                                                                        <option key={d} value={d}>Últimos {d} días</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </>
                                                    )}

                                                    {preset.id === "STOCK_CRITICO" && (
                                                        <div className="space-y-2">
                                                            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    className="h-3 w-3"
                                                                    checked={!!config.incluir_negativos}
                                                                    onChange={(e) => patch({ incluir_negativos: e.target.checked })}
                                                                />
                                                                Incluir stock negativo
                                                            </label>
                                                            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    className="h-3 w-3"
                                                                    checked={!!config.incluir_bajo_minimo}
                                                                    onChange={(e) => patch({ incluir_bajo_minimo: e.target.checked })}
                                                                />
                                                                Incluir bajo mínimo
                                                            </label>
                                                        </div>
                                                    )}

                                                    {preset.id === "RETAZOS" && (
                                                        <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 border border-amber-100">
                                                            💡 Lista todos los retazos con estado <strong>DISPONIBLE</strong> para verificar longitud y ubicación.
                                                        </p>
                                                    )}

                                                    {preset.id === "CUSTOM" && (
                                                        <p className="text-xs text-teal-700 bg-teal-50 rounded px-2 py-1 border border-teal-100">
                                                            ⚙️ Configure los filtros avanzados en el panel derecho (sección B).
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
                        <div className="pb-3 border-b border-slate-100 px-4 pt-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                📊 Resumen del Conteo
                            </h3>
                        </div>
                        <div className="space-y-2 px-4 pt-4">
                            <SummaryRow label="Modo activo" value={activePreset.label} />
                            <SummaryRow
                                label="Productos estimados"
                                value={
                                    loadingEstimate ? (
                                        <span className="flex items-center gap-1 text-slate-400">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Calculando…
                                        </span>
                                    ) : estimateCount != null ? (
                                        <span className="font-bold" style={{ color: activePreset.accent }}>
                                            {estimateCount.toLocaleString()}
                                        </span>
                                    ) : (
                                        "—"
                                    )
                                }
                            />
                            <SummaryRow
                                label="Páginas estimadas (PDF)"
                                value={
                                    estimatedPages != null ? (
                                        <span className="font-medium text-slate-700">~{estimatedPages}</span>
                                    ) : "—"
                                }
                            />
                            <SummaryRow
                                label="Conteo ciego"
                                value={
                                    config.conteo_ciego ? (
                                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                                            <EyeOff className="h-3 w-3" /> Activado
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-slate-500">
                                            <Eye className="h-3 w-3" /> Desactivado
                                        </span>
                                    )
                                }
                            />
                        </div>

                        {successMsg && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-2 py-2">
                                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                                {successMsg}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="mt-4 space-y-2 pb-4">
                            <button
                                type="button"
                                disabled={!!loadingAction}
                                onClick={() => handleGenerate("pdf")}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 bg-slate-700 hover:bg-slate-800"
                            >
                                {loadingAction === "pdf" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <FileText className="h-4 w-4" />
                                )}
                                {loadingAction === "pdf" ? "Generando PDF…" : "Generar PDF"}
                            </button>
                            <button
                                type="button"
                                disabled={!!loadingAction}
                                onClick={() => handleGenerate("xlsx")}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 border-slate-300 text-slate-700 hover:border-slate-400 bg-white transition-all disabled:opacity-60"
                            >
                                {loadingAction === "xlsx" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <FileSpreadsheet className="h-4 w-4" />
                                )}
                                {loadingAction === "xlsx" ? "Generando Excel…" : "Generar Excel"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══ Right: Advanced Configuration ══════════════════════════════════ */}
                <div className="space-y-4">

                    {/* Section A: Opciones Generales */}
                    <SectionAccordion title="A.  Opciones Generales del Documento" defaultOpen>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                                <FieldLabel>Título del documento</FieldLabel>
                                <input
                                    type="text"
                                    className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-400 bg-white"
                                    value={config.titulo}
                                    onChange={(e) => patch({ titulo: e.target.value })}
                                    placeholder="Hoja de Conteo Físico de Inventario"
                                />
                            </div>
                            <div>
                                <FieldLabel>Nombre del Operario</FieldLabel>
                                <input
                                    type="text"
                                    className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-400 bg-white"
                                    value={config.nombre_operario}
                                    onChange={(e) => patch({ nombre_operario: e.target.value })}
                                    placeholder="(dejar en blanco para espacio vacío)"
                                />
                            </div>
                            <div>
                                <FieldLabel>Área / Zona del almacén</FieldLabel>
                                <input
                                    type="text"
                                    className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-400 bg-white"
                                    value={config.area_zona}
                                    onChange={(e) => patch({ area_zona: e.target.value })}
                                    placeholder="Ej: Almacén Principal – Pasillo 3"
                                />
                            </div>
                        </div>

                        {/* Conteo Ciego Toggle */}
                        <div className="flex items-start justify-between gap-4 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                                <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                    {config.conteo_ciego ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
                                    Modo Conteo Ciego
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {config.conteo_ciego
                                        ? "✅ Activo — La columna «Stock Sistema» está OCULTA. El operario cuenta sin sesgo."
                                        : "ℹ️ Desactivado — Se mostrará la columna «Stock Sistema» en el documento."}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => patch({ conteo_ciego: !config.conteo_ciego })}
                                className={`relative flex-shrink-0 h-6 w-11 rounded-full transition-colors focus:outline-none ${config.conteo_ciego ? "bg-slate-700" : "bg-slate-200"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${config.conteo_ciego ? "translate-x-5" : "translate-x-0.5"
                                        }`}
                                />
                            </button>
                        </div>
                    </SectionAccordion>

                    {/* Section B: Filtros Avanzados (CUSTOM only) */}
                    <SectionAccordion
                        title="B.  Filtros Avanzados (Modo Personalizado)"
                        defaultOpen={config.modo === "CUSTOM"}
                    >
                        {config.modo !== "CUSTOM" && (
                            <p className="text-xs text-slate-400 italic py-2">
                                Estos filtros se aplican cuando el modo activo es <strong>«Filtros Personalizados»</strong>. Selecciónalo en el panel izquierdo para habilitarlos.
                            </p>
                        )}

                        <div className={config.modo !== "CUSTOM" ? "opacity-30 pointer-events-none" : ""}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <MultiSelectFilter
                                    label="Marca(s)"
                                    options={(masterData?.marcas ?? []).map((m) => ({ value: m.id_marca, label: m.nombre_marca }))}
                                    selected={config.marcas ?? []}
                                    onChange={(v) => patch({ marcas: v })}
                                    placeholder="Todas las marcas"
                                />
                                <MultiSelectFilter
                                    label="Material(es)"
                                    options={(masterData?.materiales ?? []).map((m) => ({ value: m.id_material, label: m.nombre_material }))}
                                    selected={config.materiales ?? []}
                                    onChange={(v) => patch({ materiales: v })}
                                    placeholder="Todos los materiales"
                                />
                                <MultiSelectFilter
                                    label="Acabado(s)"
                                    options={(masterData?.acabados ?? []).map((a) => ({ value: a.id_acabado, label: a.nombre_acabado }))}
                                    selected={config.acabados ?? []}
                                    onChange={(v) => patch({ acabados: v })}
                                    placeholder="Todos los acabados"
                                />
                                <MultiSelectFilter
                                    label="Sistema(s) / Serie(s)"
                                    options={(masterData?.sistemas ?? []).map((s) => ({ value: s.id_sistema, label: s.nombre_comercial }))}
                                    selected={config.sistemas ?? []}
                                    onChange={(v) => patch({ sistemas: v })}
                                    placeholder="Todos los sistemas"
                                />
                                <MultiSelectFilter
                                    label="Familia(s)"
                                    options={(masterData?.familias ?? []).map((f) => ({ value: f.nombre_familia, label: f.nombre_familia }))}
                                    selected={config.familias ?? []}
                                    onChange={(v) => patch({ familias: v })}
                                    placeholder="Todas las familias"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <div>
                                    <FieldLabel>Stock mínimo (≥)</FieldLabel>
                                    <input
                                        type="number"
                                        className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 bg-white"
                                        placeholder="Sin límite"
                                        value={config.stock_min ?? ""}
                                        onChange={(e) => patch({ stock_min: e.target.value ? Number(e.target.value) : null })}
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Stock máximo (≤)</FieldLabel>
                                    <input
                                        type="number"
                                        className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 bg-white"
                                        placeholder="Sin límite"
                                        value={config.stock_max ?? ""}
                                        onChange={(e) => patch({ stock_max: e.target.value ? Number(e.target.value) : null })}
                                    />
                                </div>
                            </div>

                            <div className="mt-3">
                                <FieldLabel>Filtrar también por clase ABC</FieldLabel>
                                <div className="flex gap-2 mt-1">
                                    {["A", "B", "C"].map((cls) => (
                                        <ToggleChip
                                            key={cls}
                                            label={`Clase ${cls}`}
                                            active={(config.abc_custom ?? []).includes(cls)}
                                            onClick={() => {
                                                const cur = config.abc_custom ?? [];
                                                patch({
                                                    abc_custom: cur.includes(cls)
                                                        ? cur.filter((c) => c !== cls)
                                                        : [...cur, cls],
                                                });
                                            }}
                                            colorCls="bg-teal-600 text-white"
                                        />
                                    ))}
                                    <ToggleChip
                                        label="Sin filtro ABC"
                                        active={(config.abc_custom ?? []).length === 0}
                                        onClick={() => patch({ abc_custom: [] })}
                                        colorCls="bg-slate-600 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </SectionAccordion>

                    {/* Section C: Ordenamiento */}
                    <SectionAccordion title="C.  Ordenamiento y Agrupación" defaultOpen={false}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <FieldLabel>Ordenar por</FieldLabel>
                                <div className="space-y-1.5">
                                    {(["nombre", "familia", "sistema"] as const).map((opt) => (
                                        <label key={opt} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="orden"
                                                checked={config.orden === opt}
                                                onChange={() => patch({ orden: opt })}
                                                className="h-3.5 w-3.5"
                                            />
                                            {opt === "nombre" ? "Nombre alfabético" : opt === "familia" ? "Por Familia" : "Por Sistema"}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <FieldLabel>Agrupar productos en el PDF</FieldLabel>
                                <div className="space-y-1.5">
                                    {([null, "familia", "sistema"] as const).map((opt) => (
                                        <label key={String(opt)} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="agrupar"
                                                checked={config.agrupar_por === opt}
                                                onChange={() => patch({ agrupar_por: opt })}
                                                className="h-3.5 w-3.5"
                                            />
                                            {opt === null ? "Sin agrupación" : opt === "familia" ? "Por Familia" : "Por Sistema"}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SectionAccordion>

                    {/* Section D: Formato */}
                    <SectionAccordion title="D.  Ayuda y Referencia" defaultOpen={false}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <p className="font-semibold text-blue-800 mb-1">📄 Formato del PDF</p>
                                <ul className="space-y-0.5">
                                    <li>• Tamaño: A4 Portrait</li>
                                    <li>• Márgenes: 5mm (ultra-compacto)</li>
                                    <li>• Fuente: 7pt Helvetica</li>
                                    <li>• ~55–65 productos por página</li>
                                    <li>• Encabezado repetido en cada página</li>
                                    <li>• Pie de página con Nro. de página</li>
                                </ul>
                            </div>
                            <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                                <p className="font-semibold text-green-800 mb-1">📊 Formato del Excel</p>
                                <ul className="space-y-0.5">
                                    <li>• Columnas editables en amarillo</li>
                                    <li>• Filas alternas coloreadas</li>
                                    <li>• Separadores de grupo como filas</li>
                                    <li>• Stock crítico en rojo</li>
                                    <li>• Compatible con impresión A4</li>
                                    <li>• Encabezado repetido al imprimir</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 sm:col-span-2">
                                <p className="font-semibold text-slate-700 mb-1">🔒 Conteo Ciego</p>
                                <p>
                                    Cuando está <strong>ACTIVADO</strong>, la columna "Stock Sistema" desaparece del documento. El operario debe contar sin saber cuánto el sistema dice que hay — esto elimina el sesgo de confirmación y produce conteos más confiables. <strong>Recomendado para conteos de auditoría.</strong>
                                </p>
                            </div>
                        </div>
                    </SectionAccordion>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SummaryRow helper
// ─────────────────────────────────────────────────────────────────────────────

function SummaryRow({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-800">{value}</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MultiSelectFilter — checkbox dropdown
// ─────────────────────────────────────────────────────────────────────────────

function MultiSelectFilter({
    label,
    options,
    selected,
    onChange,
    placeholder,
}: {
    label: string;
    options: Array<{ value: string; label: string }>;
    selected: string[];
    onChange: (v: string[]) => void;
    placeholder: string;
}) {
    const [open, setOpen] = useState(false);

    const toggle = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter((s) => s !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const displayLabel =
        selected.length === 0
            ? placeholder
            : selected.length === 1
                ? (options.find((o) => o.value === selected[0])?.label ?? selected[0])
                : `${selected.length} seleccionados`;

    return (
        <div className="relative">
            <FieldLabel>{label}</FieldLabel>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white hover:border-slate-400 transition-colors"
            >
                <span className={selected.length === 0 ? "text-slate-400" : "text-slate-700"}>
                    {displayLabel}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400 flex-shrink-0" />
            </button>
            {open && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-44 overflow-y-auto">
                    <div className="p-1">
                        <button
                            type="button"
                            className="w-full text-left text-xs px-2 py-1 rounded text-slate-500 hover:bg-slate-50"
                            onClick={() => { onChange([]); setOpen(false); }}
                        >
                            ✕ Limpiar selección
                        </button>
                    </div>
                    {options.map((opt) => (
                        <label
                            key={opt.value}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-xs text-slate-700"
                        >
                            <input
                                type="checkbox"
                                className="h-3 w-3"
                                checked={selected.includes(opt.value)}
                                onChange={() => toggle(opt.value)}
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
