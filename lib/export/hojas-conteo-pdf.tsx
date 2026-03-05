import React from "react";
import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
    pdf,
    Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import type { CountSheetConfig, CountSheetRow } from "./hojas-conteo-queries";
import { getModeLabel } from "./hojas-conteo-excel";

// ─────────────────────────────────────────────────────────────────────────────
// Fonts — use built-in Helvetica (no external font fetch needed)
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
    POR_SISTEMA: "#2563EB",
    POR_FAMILIA: "#16A34A",
    POR_ABC: "#7C3AED",
    RETAZOS: "#D97706",
    STOCK_CRITICO: "#DC2626",
    CUSTOM: "#0F766E",
    default: "#334155",
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles — ultra-compact (5mm margins, 7pt body)
// ─────────────────────────────────────────────────────────────────────────────

function makeStyles(accentColor: string) {
    return StyleSheet.create({
        page: {
            paddingTop: 14,
            paddingBottom: 14,
            paddingLeft: 14,
            paddingRight: 14,
            fontSize: 7,
            fontFamily: "Helvetica",
        },
        // ── Page header ──────────────────────────────────────────────────────────
        pageHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderBottomWidth: 2,
            borderBottomColor: accentColor,
            paddingBottom: 4,
            marginBottom: 5,
        },
        pageHeaderLeft: {
            flex: 1,
        },
        pageHeaderTitle: {
            fontSize: 11,
            fontFamily: "Helvetica-Bold",
            color: "#1E293B",
        },
        pageHeaderSubtitle: {
            fontSize: 7,
            color: "#64748B",
            marginTop: 1,
        },
        pageHeaderRight: {
            alignItems: "flex-end",
            fontSize: 6.5,
            color: "#64748B",
        },
        // ── Meta info row ────────────────────────────────────────────────────────
        metaRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 3,
            padding: 3,
            backgroundColor: "#F8FAFC",
            borderRadius: 2,
        },
        metaItem: {
            fontSize: 6.5,
            color: "#475569",
        },
        metaLabel: {
            fontFamily: "Helvetica-Bold",
            color: "#334155",
        },
        signatureRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 5,
        },
        signatureBox: {
            flex: 1,
            marginRight: 8,
            borderBottomWidth: 1,
            borderBottomColor: "#94A3B8",
            paddingBottom: 1,
            fontSize: 6.5,
            color: "#64748B",
        },
        // ── Table ────────────────────────────────────────────────────────────────
        tableHeader: {
            flexDirection: "row",
            backgroundColor: accentColor,
            height: 14,
            alignItems: "center",
        },
        tableHeaderCell: {
            color: "#FFFFFF",
            fontFamily: "Helvetica-Bold",
            fontSize: 6.5,
            paddingHorizontal: 2,
            paddingVertical: 1,
        },
        tableRow: {
            flexDirection: "row",
            borderBottomWidth: 0.3,
            borderBottomColor: "#E2E8F0",
            minHeight: 12,
            alignItems: "center",
        },
        tableRowAlt: {
            backgroundColor: "#F3F3F3",  // very light gray stripe — minimal ink
        },
        tableRowCritical: {
            backgroundColor: "#FFFFFF",  // white — no red ink wasted
        },
        cell: {
            fontSize: 7,
            paddingHorizontal: 2,
            paddingVertical: 1.5,
        },
        cellWriteable: {
            borderBottomWidth: 1.2,
            borderBottomColor: "#94A3B8",
            backgroundColor: "#FFFBEB",
        },
        groupSeparator: {
            backgroundColor: "#F1F5F9",
            padding: 3,
            marginTop: 3,
            marginBottom: 1,
            borderLeftWidth: 2.5,
            borderLeftColor: accentColor,
        },
        groupSeparatorText: {
            fontSize: 7,
            fontFamily: "Helvetica-Bold",
            color: accentColor,
            textTransform: "uppercase",
        },
        // ── Page number ──────────────────────────────────────────────────────────
        footer: {
            position: "absolute",
            bottom: 6,
            left: 14,
            right: 14,
            flexDirection: "row",
            justifyContent: "space-between",
            borderTopWidth: 0.5,
            borderTopColor: "#CBD5E1",
            paddingTop: 2,
            fontSize: 6,
            color: "#94A3B8",
        },
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Column layout definitions
// ─────────────────────────────────────────────────────────────────────────────

type ColLayout = {
    label: string;
    widthPct: string; // CSS % string for flex
    align?: "left" | "right" | "center";
    writeable?: boolean;
};

function getColLayouts(config: CountSheetConfig, isRetazos: boolean): ColLayout[] {
    if (isRetazos) {
        return [
            { label: "#", widthPct: "4%", align: "center" },
            { label: "ID RETAZO", widthPct: "13%" },
            { label: "SKU PADRE / DESCRIPCIÓN", widthPct: "33%" },
            { label: "LONGITUD (mm)", widthPct: "13%", align: "right" },
            { label: "UBICACIÓN SISTEMA", widthPct: "14%" },
            { label: "V° CORRECTO", widthPct: "12%", writeable: true },
            { label: "OBSERVACIONES", widthPct: "11%", writeable: true },
        ];
    }

    const cols: ColLayout[] = [
        { label: "#", widthPct: "4%", align: "center" },
        { label: "SKU", widthPct: "16%" },
        { label: "DESCRIPCIÓN COMPLETA", widthPct: config.conteo_ciego ? "30%" : "21%" },
        { label: "U.M.", widthPct: "5%", align: "center" },
        { label: "ALMACÉN", widthPct: config.conteo_ciego ? "14%" : "12%" },
    ];

    if (!config.conteo_ciego) {
        cols.push({ label: "STOCK SISTEMA", widthPct: "12%", align: "right" });
    }

    cols.push({ label: "CONTEO REAL", widthPct: "18%", writeable: true });
    cols.push({ label: "OBSERVACIONES", widthPct: config.conteo_ciego ? "11%" : "10%", writeable: true });

    return cols;
}

// ─────────────────────────────────────────────────────────────────────────────
// React-PDF Document Component
// ─────────────────────────────────────────────────────────────────────────────

function getCellValue(
    row: CountSheetRow,
    colIndex: number,
    config: CountSheetConfig,
    isRetazos: boolean,
    rowNum: number,
): string {
    if (isRetazos) {
        switch (colIndex) {
            case 0: return String(rowNum);
            case 1: return row.id_retazo ?? "";
            case 2: return row.nombre_completo;
            case 3: return row.longitud_mm != null ? row.longitud_mm.toLocaleString("es-PE") : "";
            case 4: return row.ubicacion ?? "";
            case 5: return ""; // writeable
            case 6: return ""; // writeable
            default: return "";
        }
    }

    const extraStockCol = !config.conteo_ciego;
    switch (colIndex) {
        case 0: return String(rowNum);
        case 1: return row.id_sku;
        case 2: return row.nombre_completo;
        case 3: return row.unidad_medida ?? "";
        case 4: return row.nombre_almacen ?? "";
        case 5:
            if (extraStockCol) return row.stock_actual != null ? row.stock_actual.toLocaleString("es-PE", { maximumFractionDigits: 2 }) : "0";
            return ""; // writeable (conteo)
        case 6:
            if (extraStockCol) return ""; // writeable (conteo)
            return ""; // writeable (obs)
        case 7:
            return ""; // writeable (obs; only exists when stock col is shown)
        default: return "";
    }
}

interface CountSheetDocProps {
    rows: CountSheetRow[];
    config: CountSheetConfig;
    accentColor: string;
}

function CountSheetDoc({ rows, config, accentColor }: CountSheetDocProps) {
    const styles = makeStyles(accentColor);
    const isRetazos = config.modo === "RETAZOS";
    const cols = getColLayouts(config, isRetazos);
    const modeLabel = getModeLabel(config);
    const printDate = format(new Date(), "dd/MM/yyyy HH:mm");

    // Group rows if needed
    type GroupedSection = { label: string | null; rows: CountSheetRow[] };
    const sections: GroupedSection[] = [];

    if (config.agrupar_por !== null && !isRetazos) {
        let currentGroup: string | null = undefined as any;
        let currentRows: CountSheetRow[] = [];
        for (const row of rows) {
            const g = config.agrupar_por === "familia" ? row.nombre_familia : row.sistema_nombre;
            if (g !== currentGroup) {
                if (currentRows.length > 0) sections.push({ label: currentGroup, rows: currentRows });
                currentGroup = g ?? null;
                currentRows = [row];
            } else {
                currentRows.push(row);
            }
        }
        if (currentRows.length > 0) sections.push({ label: currentGroup, rows: currentRows });
    } else {
        sections.push({ label: null, rows });
    }

    return (
        <Document
            title={config.titulo}
            author="ERP – Sistema Inventario"
            subject={`Hoja de Conteo – ${modeLabel}`}
            creator="ERP Yahiro"
        >
            <Page size="A4" orientation="portrait" style={styles.page} wrap>
                {/* ── Repeated page header (fixed) ── */}
                <View style={styles.pageHeader} fixed>
                    <View style={styles.pageHeaderLeft}>
                        <Text style={styles.pageHeaderTitle}>{config.titulo}</Text>
                        <Text style={styles.pageHeaderSubtitle}>
                            Filtro: {modeLabel}{"  |  "}
                            {config.conteo_ciego ? "⬛ CONTEO CIEGO (sin stock)" : "Muestra Stock Sistema"}
                        </Text>
                    </View>
                    <View style={styles.pageHeaderRight}>
                        <Text>Fecha: {printDate}</Text>
                        <Text render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Página ${pageNumber} / ${totalPages}`} />
                    </View>
                </View>

                {/* ── Meta info (first page only) ── */}
                <View style={styles.metaRow} fixed={false}>
                    <Text style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Operario: </Text>
                        {config.nombre_operario || "_________________________________"}
                    </Text>
                    <Text style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Área/Zona: </Text>
                        {config.area_zona || "___________________"}
                    </Text>
                    <Text style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Total: </Text>
                        {rows.length} productos
                    </Text>
                </View>

                <View style={styles.signatureRow} fixed={false}>
                    <Text style={styles.signatureBox}>Firma Operario: </Text>
                    <Text style={styles.signatureBox}>Revisado por: </Text>
                    <Text style={[styles.signatureBox, { marginRight: 0 }]}>Jefe de Almacén: </Text>
                </View>

                {/* ── Table header (repeated on each page) ── */}
                <View style={styles.tableHeader} fixed>
                    {cols.map((col, i) => (
                        <Text
                            key={i}
                            style={[
                                styles.tableHeaderCell,
                                {
                                    width: col.widthPct,
                                    textAlign: col.align ?? "left",
                                },
                            ]}
                        >
                            {col.label}
                        </Text>
                    ))}
                </View>

                {/* ── Data rows ── */}
                {(() => {
                    let globalRowNum = 0;
                    const elements: React.ReactElement[] = [];

                    for (const section of sections) {
                        if (section.label !== null) {
                            elements.push(
                                <View key={`sep-${section.label}`} style={styles.groupSeparator}>
                                    <Text style={styles.groupSeparatorText}>
                                        ▸  {section.label?.toUpperCase() ?? "SIN CLASIFICACIÓN"}
                                        {"   "}({section.rows.length} productos)
                                    </Text>
                                </View>,
                            );
                        }

                        section.rows.forEach((row, idx) => {
                            globalRowNum++;
                            const localNum = section.label !== null ? idx + 1 : globalRowNum;
                            const isCritical = row.estado_abastecimiento === "CRITICO" && !isRetazos;
                            const isAlt = idx % 2 !== 0;

                            elements.push(
                                <View
                                    key={`row-${row.id_sku}-${row.id_retazo ?? idx}`}
                                    style={[
                                        styles.tableRow,
                                        isAlt ? styles.tableRowAlt : {},
                                    ]}
                                    wrap={false}
                                >
                                    {cols.map((col, ci) => {
                                        const val = getCellValue(row, ci, config, isRetazos, localNum);
                                        return (
                                            <Text
                                                key={ci}
                                                style={[
                                                    styles.cell,
                                                    col.writeable ? styles.cellWriteable : {},
                                                    {
                                                        width: col.widthPct,
                                                        textAlign: col.align ?? "left",
                                                        color: isCritical && ci === 1 ? "#DC2626" : "#1E293B",
                                                    },
                                                ]}
                                            >
                                                {val}
                                            </Text>
                                        );
                                    })}
                                </View>,
                            );
                        });
                    }

                    return elements;
                })()}

                {/* ── Footer ── */}
                <View style={styles.footer} fixed>
                    <Text>Documento confidencial – Solo uso interno</Text>
                    <Text>{config.titulo} | {printDate}</Text>
                    <Text render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Pág. ${pageNumber}/${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export function
// ─────────────────────────────────────────────────────────────────────────────

export async function generateCountSheetPDF(
    rows: CountSheetRow[],
    config: CountSheetConfig,
): Promise<Blob> {
    const accentColor =
        COLORS[config.modo as keyof typeof COLORS] ?? COLORS.default;

    const doc = (
        <CountSheetDoc rows={rows} config={config} accentColor={accentColor} />
    );

    const blob = await pdf(doc).toBlob();
    return blob;
}
