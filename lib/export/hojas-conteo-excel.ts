import ExcelJS from "exceljs";
import { format } from "date-fns";
import type { CountSheetConfig, CountSheetRow } from "./hojas-conteo-queries";

// ─────────────────────────────────────────────────────────────────────────────
// Color palette per mode
// ─────────────────────────────────────────────────────────────────────────────

const MODE_COLORS: Record<string, string> = {
    POR_SISTEMA: "FF2563EB",   // blue
    POR_FAMILIA: "FF16A34A",   // green
    POR_ABC: "FF7C3AED",       // violet
    RETAZOS: "FFD97706",       // amber
    STOCK_CRITICO: "FFDC2626", // red
    CUSTOM: "FF0F766E",        // teal
};

const HEADER_TEXT_COLOR = "FFFFFFFF";

// ─────────────────────────────────────────────────────────────────────────────
// Main export function
// ─────────────────────────────────────────────────────────────────────────────

export async function generateCountSheetExcel(
    rows: CountSheetRow[],
    config: CountSheetConfig,
): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ERP – Hojas de Conteo";
    workbook.created = new Date();

    const headerColor = MODE_COLORS[config.modo] ?? "FF334155";

    if (config.modo === "RETAZOS") {
        addRetazosSheet(workbook, rows, config, headerColor);
    } else {
        addMainCountSheet(workbook, rows, config, headerColor);
        // If there happen to be retazos rows mixed in, they won't be here; skip.
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Standard inventory count sheet
// ─────────────────────────────────────────────────────────────────────────────

function addMainCountSheet(
    workbook: ExcelJS.Workbook,
    rows: CountSheetRow[],
    config: CountSheetConfig,
    headerColor: string,
) {
    const sheet = workbook.addWorksheet("Hoja de Conteo", {
        pageSetup: {
            paperSize: 9, // A4
            orientation: "portrait",
            fitToPage: true,
            fitToWidth: 1,
            margins: {
                left: 0.2,
                right: 0.2,
                top: 0.3,
                bottom: 0.3,
                header: 0.1,
                footer: 0.1,
            },
        },
        headerFooter: {
            oddHeader: `&C&"Arial,Bold"&9${config.titulo}   |   Filtro: ${getModeLabel(config)}   |   Pág &P de &N`,
            oddFooter: `&L&8${config.nombre_operario ? "Operario: " + config.nombre_operario : "Operario: _______________________"}&C&8Fecha: ${format(new Date(), "dd/MM/yyyy HH:mm")}&R&8Confidencial – Uso Interno`,
        },
    });

    // ── Meta rows (header block) ──────────────────────────────────────────────

    // Title row
    const titleRow = sheet.addRow([config.titulo]);
    titleRow.height = 18;
    titleRow.font = { bold: true, size: 12, color: { argb: "FF1E293B" } };
    sheet.mergeCells(`A${titleRow.number}:H${titleRow.number}`);

    // Info row
    const infoRow = sheet.addRow([
        `Filtro: ${getModeLabel(config)}`,
        null,
        null,
        null,
        `Fecha: ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
        null,
        null,
        `Total productos: ${rows.length}`,
    ]);
    infoRow.height = 13;
    infoRow.font = { size: 8, italic: true, color: { argb: "FF64748B" } };
    sheet.mergeCells(`A${infoRow.number}:D${infoRow.number}`);
    sheet.mergeCells(`E${infoRow.number}:G${infoRow.number}`);

    // Operario row
    const opRow = sheet.addRow([
        `Operario: ${config.nombre_operario || "_________________________________"}`,
        null,
        null,
        null,
        `Área/Zona: ${config.area_zona || "_______________________"}`,
        null,
        null,
        `Firma: _____________________`,
    ]);
    opRow.height = 13;
    opRow.font = { size: 8 };
    sheet.mergeCells(`A${opRow.number}:D${opRow.number}`);
    sheet.mergeCells(`E${opRow.number}:G${opRow.number}`);

    // Blank row separator
    sheet.addRow([]);

    // ── Column headers ────────────────────────────────────────────────────────

    const columns = buildColumns(config);
    const headerRow = sheet.addRow(columns.map((c) => c.header));
    headerRow.height = 16;
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 8, color: { argb: HEADER_TEXT_COLOR } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: headerColor },
        };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: false };
        cell.border = {
            bottom: { style: "medium", color: { argb: "FF1E293B" } },
        };
    });

    // Set column widths (in characters)
    columns.forEach((col, i) => {
        sheet.getColumn(i + 1).width = col.width;
    });

    // ── Data rows ─────────────────────────────────────────────────────────────

    let lastGroup: string | null = undefined as any;
    let rowNum = 0;

    for (const row of rows) {
        const groupVal = getGroupValue(row, config.agrupar_por);

        // Group separator row
        if (config.agrupar_por !== null && groupVal !== lastGroup) {
            lastGroup = groupVal;
            const groupLabel = groupVal ?? "Sin Clasificación";
            const sepRow = sheet.addRow([`  ▸  ${groupLabel.toUpperCase()}`]);
            sepRow.height = 12;
            sepRow.font = { bold: true, size: 7.5, color: { argb: headerColor } };
            sheet.mergeCells(`A${sepRow.number}:H${sepRow.number}`);
            const gc = sepRow.getCell(1);
            gc.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF1F5F9" },
            };
            gc.border = {
                top: { style: "thin", color: { argb: "FFE2E8F0" } },
                bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
            };
            rowNum = 0; // reset correlative inside group
        }

        rowNum++;
        const dataRow = buildDataRow(sheet, row, config, rowNum);

        // Alternate row shading
        if (rowNum % 2 === 0) {
            dataRow.eachCell((cell, colNum) => {
                if (!cell.fill || (cell.fill as any).type === "none") {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFF8FAFC" },
                    };
                }
            });
        }

        // Highlight critical
        if (row.estado_abastecimiento === "CRITICO" && config.modo !== "RETAZOS") {
            const skuCell = dataRow.getCell(2);
            skuCell.font = { size: 7, bold: true, color: { argb: "FFDC2626" } };
        }
    }

    // ── Freeze header rows ────────────────────────────────────────────────────
    sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 5 }];
}

// ─────────────────────────────────────────────────────────────────────────────
// Retazos sheet
// ─────────────────────────────────────────────────────────────────────────────

function addRetazosSheet(
    workbook: ExcelJS.Workbook,
    rows: CountSheetRow[],
    config: CountSheetConfig,
    headerColor: string,
) {
    const sheet = workbook.addWorksheet("Conteo de Retazos", {
        pageSetup: {
            paperSize: 9,
            orientation: "portrait",
            fitToPage: true,
            fitToWidth: 1,
            margins: {
                left: 0.2,
                right: 0.2,
                top: 0.3,
                bottom: 0.3,
                header: 0.1,
                footer: 0.1,
            },
        },
    });

    // Title
    const titleRow = sheet.addRow(["HOJA DE CONTEO DE RETAZOS FÍSICOS"]);
    titleRow.height = 18;
    titleRow.font = { bold: true, size: 11, color: { argb: "FF1E293B" } };
    sheet.mergeCells(`A${titleRow.number}:G${titleRow.number}`);

    const infoRow = sheet.addRow([
        `Fecha: ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
        null,
        null,
        null,
        `Total retazos: ${rows.length}`,
        null,
        `Operario: ${config.nombre_operario || "_____________________"}`,
    ]);
    infoRow.height = 12;
    infoRow.font = { size: 8, italic: true };
    sheet.mergeCells(`A${infoRow.number}:D${infoRow.number}`);

    sheet.addRow([]);

    // Headers
    const headers = ["#", "ID Retazo", "SKU Padre / Descripción", "Long. Sistema (mm)", "Ubicación Sistema", "V° Largo Correcto (Sí/No/Dif.)", "Observaciones"];
    const widths = [5, 16, 45, 18, 18, 26, 30];

    const headerRow = sheet.addRow(headers);
    headerRow.height = 16;
    headers.forEach((_, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.font = { bold: true, size: 8, color: { argb: HEADER_TEXT_COLOR } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: headerColor } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = { bottom: { style: "medium", color: { argb: "FF1E293B" } } };
        sheet.getColumn(i + 1).width = widths[i];
    });

    rows.forEach((row, idx) => {
        const dataRow = sheet.addRow([
            idx + 1,
            row.id_retazo ?? "",
            row.nombre_completo,
            row.longitud_mm ?? "",
            row.ubicacion ?? "",
            "",   // V° Correcto — blank for operator to fill
            "",   // Observaciones
        ]);
        dataRow.height = 14;
        dataRow.eachCell((cell, colNum) => {
            cell.font = { size: 8 };
            cell.alignment = { vertical: "middle" };
            cell.border = {
                bottom: { style: "hair", color: { argb: "FFE2E8F0" } },
                left: colNum === 1 ? { style: "thin", color: { argb: "FFE2E8F0" } } : undefined,
                right: colNum === 7 ? { style: "thin", color: { argb: "FFE2E8F0" } } : undefined,
            };
            // Writeable cells: columns 6+7 get a slightly different bg for clarity
            if (colNum >= 6) {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFBEB" } };
            }
        });
        if (idx % 2 === 0) {
            for (let c = 1; c <= 5; c++) {
                dataRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
            }
        }
    });

    sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 4 }];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

type ColDef = { header: string; width: number; key: keyof CountSheetRow | "num" | "conteo" | "obs" };

function buildColumns(config: CountSheetConfig): ColDef[] {
    const cols: ColDef[] = [
        { header: "#", width: 5, key: "num" },
        { header: "SKU", width: 22, key: "id_sku" },
        { header: "DESCRIPCIÓN COMPLETA", width: 42, key: "nombre_completo" },
        { header: "U.M.", width: 7, key: "unidad_medida" },
        { header: "ALMACÉN", width: 12, key: "nombre_almacen" as keyof CountSheetRow },
    ];

    if (!config.conteo_ciego) {
        cols.push({ header: "STOCK SISTEMA", width: 14, key: "stock_actual" });
    }

    cols.push({ header: "CONTEO FÍSICO REAL", width: 20, key: "conteo" });
    cols.push({ header: "OBSERVACIONES / DIFERENCIAS", width: 30, key: "obs" });

    return cols;
}

function buildDataRow(
    sheet: ExcelJS.Worksheet,
    row: CountSheetRow,
    config: CountSheetConfig,
    rowNum: number,
): ExcelJS.Row {
    const values: any[] = [
        rowNum,
        row.id_sku,
        row.nombre_completo,
        row.unidad_medida ?? "",
        row.nombre_almacen ?? "",
    ];

    if (!config.conteo_ciego) {
        values.push(row.stock_actual);
    }

    values.push(""); // conteo físico
    values.push(""); // observaciones

    const dataRow = sheet.addRow(values);
    dataRow.height = 14; // ~5mm row height

    const colCount = values.length;
    dataRow.eachCell((cell, colNum) => {
        cell.font = { size: 7.5 };
        cell.alignment = { vertical: "middle", wrapText: false };
        cell.border = {
            bottom: { style: "hair", color: { argb: "FFE2E8F0" } },
        };

        // Stock column — right align + number format
        if (!config.conteo_ciego && colNum === 6) {
            cell.alignment = { ...cell.alignment, horizontal: "right" };
            cell.numFmt = '#,##0.00_ ;[Red]-#,##0.00_ ;"-"';
        }

        // Conteo físico  & Observaciones columns — writeable style
        const writeStart = config.conteo_ciego ? 6 : 7;
        if (colNum >= writeStart) {
            cell.border = {
                bottom: { style: "medium", color: { argb: "FF94A3B8" } },
                left: colNum === writeStart
                    ? { style: "thin", color: { argb: "FFE2E8F0" } }
                    : undefined,
            };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFFFBEB" },
            };
        }
    });

    return dataRow;
}

function getGroupValue(
    row: CountSheetRow,
    agrupar_por: CountSheetConfig["agrupar_por"],
): string | null {
    if (agrupar_por === "familia") return row.nombre_familia;
    if (agrupar_por === "sistema") return row.sistema_nombre;
    return null;
}

export function getModeLabel(config: CountSheetConfig): string {
    switch (config.modo) {
        case "POR_SISTEMA": return `Sistema: ${config.id_sistema ?? "—"}`;
        case "POR_FAMILIA":
            if (config.todas_familias) return "Todas las Familias";
            return `Familia: ${config.id_familia ?? "—"}`;
        case "POR_ABC": return `Clase ABC: ${(config.clasificacion_abc ?? []).join(", ")} (${config.dias_analisis ?? 90}d)`;
        case "RETAZOS": return "Retazos Disponibles";
        case "STOCK_CRITICO": return "Stock Crítico / Negativo";
        case "CUSTOM": return "Filtros Personalizados";
        default: return "—";
    }
}
