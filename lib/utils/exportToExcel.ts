"use client";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// ============================================================================
// TIPOS DE ENTRADA
// ============================================================================

interface ExportCotizacionData {
    cabecera: any;       // CotizacionDetallada (vw_cotizaciones_totales + mst_clientes)
    detalles: any[];     // CotizacionDetalleEnriquecido[] (vw_cotizaciones_detalladas)
    desglose: any[];     // ReporteDesglose[] (vw_reporte_desglose)
    configEmpresa: any;  // mst_config_general
}

// ============================================================================
// CONSTANTES DE ESTILO
// ============================================================================

const AZUL_CORP: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A5F" },
};

const GRIS_CABECERA: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF1F5F9" },
};

const GRIS_SEPARADOR: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE2E8F0" },
};

const BORDE_FINO: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFCBD5E1" } },
    bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    left: { style: "thin", color: { argb: "FFCBD5E1" } },
    right: { style: "thin", color: { argb: "FFCBD5E1" } },
};

const FUENTE_HEADER: Partial<ExcelJS.Font> = {
    name: "Calibri",
    size: 11,
    bold: true,
    color: { argb: "FFFFFFFF" },
};

const FUENTE_NORMAL: Partial<ExcelJS.Font> = {
    name: "Calibri",
    size: 10,
};

const FUENTE_BOLD: Partial<ExcelJS.Font> = {
    name: "Calibri",
    size: 10,
    bold: true,
};

// ============================================================================
// FUNCIÓN AUXILIAR: aplicar estilos a una fila de encabezado
// ============================================================================

function styleHeaderRow(row: ExcelJS.Row, colCount: number) {
    row.height = 22;
    for (let c = 1; c <= colCount; c++) {
        const cell = row.getCell(c);
        cell.fill = AZUL_CORP;
        cell.font = FUENTE_HEADER;
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = BORDE_FINO;
    }
}

function styleDataRow(row: ExcelJS.Row, colCount: number) {
    for (let c = 1; c <= colCount; c++) {
        const cell = row.getCell(c);
        cell.font = FUENTE_NORMAL;
        cell.border = BORDE_FINO;
        cell.alignment = { vertical: "middle", wrapText: false };
    }
}

// ============================================================================
// HOJA 1: RESUMEN COMERCIAL
// ============================================================================

function buildHojaResumen(
    wb: ExcelJS.Workbook,
    data: ExportCotizacionData
) {
    const ws = wb.addWorksheet("Resumen Comercial", {
        properties: { defaultColWidth: 15 },
    });

    const { cabecera, detalles, configEmpresa } = data;
    const cliente = cabecera.mst_clientes || {};
    const moneda = cabecera.moneda || "PEN";
    const simbolo = moneda === "USD" ? "US$" : "S/";

    // --- CABECERA DE LA EMPRESA ---
    ws.mergeCells("A1:E1");
    const tituloCell = ws.getCell("A1");
    tituloCell.value = configEmpresa?.nombre_empresa || "EMPRESA";
    tituloCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FF1E3A5F" } };

    ws.mergeCells("G1:K1");
    const cotCell = ws.getCell("G1");
    cotCell.value = `COTIZACIÓN`;
    cotCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FF1E3A5F" } };
    cotCell.alignment = { horizontal: "right" };

    // Datos empresa
    const empresaRows = [
        `RUC: ${configEmpresa?.ruc || "-"}`,
        `${configEmpresa?.direccion || ""}`,
        `${configEmpresa?.telefono || ""} | ${configEmpresa?.email || ""}`,
    ];
    empresaRows.forEach((txt, i) => {
        ws.mergeCells(`A${2 + i}:E${2 + i}`);
        const c = ws.getCell(`A${2 + i}`);
        c.value = txt;
        c.font = { name: "Calibri", size: 9, color: { argb: "FF64748B" } };
    });

    // Datos cotización (derecha)
    const cotInfo = [
        ["Nro:", cabecera.id_cotizacion?.substring(0, 13) || "-"],
        ["Fecha:", new Date(cabecera.fecha_emision).toLocaleDateString()],
        ["Estado:", cabecera.estado || "Borrador"],
        ["Moneda:", moneda],
        ["Validez:", `${cabecera.validez_dias || 15} días`],
    ];
    cotInfo.forEach(([label, val], i) => {
        const labelCell = ws.getCell(`J${2 + i}`);
        labelCell.value = label;
        labelCell.font = { name: "Calibri", size: 9, bold: true, color: { argb: "FF475569" } };
        labelCell.alignment = { horizontal: "right" };
        const valCell = ws.getCell(`K${2 + i}`);
        valCell.value = val;
        valCell.font = { name: "Calibri", size: 9, color: { argb: "FF1E293B" } };
    });

    // --- DATOS DEL CLIENTE ---
    const clienteRow = 7;
    ws.mergeCells(`A${clienteRow}:E${clienteRow}`);
    const clCell = ws.getCell(`A${clienteRow}`);
    clCell.value = `CLIENTE: ${cliente.nombre_completo || "-"}`;
    clCell.font = { name: "Calibri", size: 11, bold: true };

    ws.mergeCells(`G${clienteRow}:K${clienteRow}`);
    const rucClCell = ws.getCell(`G${clienteRow}`);
    rucClCell.value = `RUC/DNI: ${cliente.ruc_dni || "-"}  |  Proyecto: ${cabecera.nombre_proyecto || "-"}`;
    rucClCell.font = { name: "Calibri", size: 9, color: { argb: "FF475569" } };
    rucClCell.alignment = { horizontal: "right" };

    // --- TABLA DE ÍTEMS ---
    const headerRow = clienteRow + 2; // Fila 9
    const headers = [
        "#", "Etiqueta", "Modelo", "Ubicación", "Vidrio", "Acabado",
        "Ancho (mm)", "Alto (mm)", "Cant", `P. Unit (${simbolo})`, `Subtotal (${simbolo})`,
    ];

    const colWidths = [5, 14, 14, 16, 18, 10, 11, 11, 6, 14, 16];
    colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

    const hRow = ws.getRow(headerRow);
    headers.forEach((h, i) => { hRow.getCell(i + 1).value = h; });
    styleHeaderRow(hRow, headers.length);

    // Freeze panes debajo de la cabecera de tabla
    ws.views = [{ state: "frozen", ySplit: headerRow, xSplit: 0 }];

    // AutoFilter
    ws.autoFilter = {
        from: { row: headerRow, column: 1 },
        to: { row: headerRow + (detalles?.length || 0), column: headers.length },
    };

    // Datos
    detalles?.forEach((item: any, idx: number) => {
        const r = ws.getRow(headerRow + 1 + idx);
        const precioUnit = (item._vc_precio_unit_oferta_calc || 0) / (item.cantidad || 1);
        r.getCell(1).value = idx + 1;
        r.getCell(2).value = item.etiqueta_item || "";
        r.getCell(3).value = item.id_modelo || "";
        r.getCell(4).value = item.ubicacion || "";
        r.getCell(5).value = item.tipo_vidrio || "";
        r.getCell(6).value = item.color_perfiles || "";
        r.getCell(7).value = item.ancho_mm || 0;
        r.getCell(8).value = item.alto_mm || 0;
        r.getCell(9).value = item.cantidad || 0;
        r.getCell(10).value = precioUnit;
        r.getCell(10).numFmt = `#,##0.00`;
        r.getCell(11).value = { formula: `I${headerRow + 1 + idx}*J${headerRow + 1 + idx}` };
        r.getCell(11).numFmt = `#,##0.00`;
        styleDataRow(r, headers.length);
        r.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
        r.getCell(9).alignment = { horizontal: "center", vertical: "middle" };
    });

    // --- TOTALES ---
    const lastDataRow = headerRow + (detalles?.length || 0);
    const totalesStart = lastDataRow + 2;

    const subtotalVal = cabecera._vc_subtotal_venta || 0;
    const igvVal = cabecera._vc_monto_igv || 0;
    const totalVal = cabecera._vc_precio_final_cliente || 0;

    const totales = [
        ["Subtotal:", subtotalVal],
        ["IGV (18%):", igvVal],
        ["TOTAL:", totalVal],
    ];

    totales.forEach(([label, val], i) => {
        const r = ws.getRow(totalesStart + i);
        ws.mergeCells(`I${totalesStart + i}:J${totalesStart + i}`);
        r.getCell(9).value = label;
        r.getCell(9).font = FUENTE_BOLD;
        r.getCell(9).alignment = { horizontal: "right", vertical: "middle" };
        r.getCell(11).value = val;
        r.getCell(11).numFmt = `#,##0.00`;
        r.getCell(11).font = i === 2
            ? { name: "Calibri", size: 13, bold: true, color: { argb: "FF1E3A5F" } }
            : FUENTE_BOLD;
        r.getCell(11).border = BORDE_FINO;
    });
}

// ============================================================================
// HOJA 2: AUDITORÍA DESPIECE (CON FÓRMULAS NATIVAS)
// Lógica de costos (de fn_generar_despiece_ingenieria):
//   Perfiles:    costo = cantidad × (medida_mm / 1000) × (costo_barra / 6)
//   Accesorios:  costo = cantidad × costo_unitario
//   Vidrio:      costo = area_m2 × costo_m2
//   Mano de Obra: costo = area_m2 × costo_mo_m2 (de config cotización)
//
// Para que la FÓRMULA sea universal (=Medida × Cantidad × CostoUnit):
//   Perfiles:    Medida = mm/1000 (metros), CostoUnit = barra/6 (por metro)
//   Accesorios:  Medida = 1, CostoUnit = precio catálogo
//   Vidrio:      Medida = 1, CostoUnit = precio catálogo (cantidad ya es m²)
//   Mano Obra:   Medida = 1, CostoUnit = costo_mo_m2 (cantidad ya es m²)
// ============================================================================

function buildHojaAuditoria(
    wb: ExcelJS.Workbook,
    data: ExportCotizacionData
) {
    const ws = wb.addWorksheet("Auditoría Despiece", {
        properties: { defaultColWidth: 14 },
    });

    const { desglose } = data;

    const headers = [
        "Ítem Padre", "Tipo Componente", "SKU", "Descripción",
        "Acabado", "Medida", "Ángulo (°)",
        "Cantidad", "Costo Unitario", "Costo Total",
    ];

    const colWidths = [14, 14, 18, 28, 10, 12, 10, 10, 14, 14];
    colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

    // Header
    const hRow = ws.getRow(1);
    headers.forEach((h, i) => { hRow.getCell(i + 1).value = h; });
    styleHeaderRow(hRow, headers.length);

    ws.views = [{ state: "frozen", ySplit: 1, xSplit: 0 }];

    // Agrupar por ítem padre
    let currentItem = "";
    let rowIdx = 2;

    desglose?.forEach((mat: any) => {
        // Separador de grupo
        if (mat.etiqueta_item !== currentItem) {
            if (currentItem !== "") {
                const sepRow = ws.getRow(rowIdx);
                for (let c = 1; c <= headers.length; c++) {
                    sepRow.getCell(c).fill = GRIS_SEPARADOR;
                    sepRow.getCell(c).border = BORDE_FINO;
                }
                sepRow.height = 6;
                rowIdx++;
            }
            currentItem = mat.etiqueta_item;
        }

        const r = ws.getRow(rowIdx);
        const qtyItem = mat.cantidad_item || 1;
        const qtyUnit = mat.cantidad_unitaria || 0;
        const displayQty = qtyUnit * qtyItem;
        const tipo = mat.tipo_componente || "";
        const esPerfil = tipo === "Perfil";

        // ====================================================================
        // BACK-CALCULATE desde costo_total_item (ya convertido a PEN por SQL)
        // fn_generar_despiece_ingenieria ya aplica: USD*tipo_cambio y /6 para perfiles
        // Así garantizamos que los costos son correctos sin importar la moneda original
        // ====================================================================
        const costoTotalStored = mat.costo_unitario || 0; // = costo_total_item (PEN, per unit)

        // Columna MEDIDA: Perfiles → metros. Todo lo demás → 1
        let medidaValue: number;
        if (esPerfil) {
            medidaValue = (mat.medida_corte_mm || 0) / 1000; // mm → metros
        } else {
            medidaValue = 1;
        }

        // Columna COSTO UNITARIO (back-calculated, ya en PEN):
        //   Perfiles:    total = qty × medida_m × costo_metro  →  costo_metro = total / (qty × medida_m)
        //   Accesorios:  total = qty × costo_unit              →  costo_unit = total / qty
        //   Vidrio/Serv: total = qty × costo_unit              →  costo_unit = total / qty
        let costoUnitValue: number;
        if (esPerfil && qtyUnit > 0 && medidaValue > 0) {
            costoUnitValue = costoTotalStored / (qtyUnit * medidaValue);
        } else if (qtyUnit > 0) {
            costoUnitValue = costoTotalStored / qtyUnit;
        } else {
            costoUnitValue = 0;
        }

        r.getCell(1).value = mat.etiqueta_item || "";
        r.getCell(2).value = tipo;
        r.getCell(3).value = mat.sku_real || mat.codigo_base || "";
        r.getCell(4).value = mat.nombre_componente || mat.descripcion_sku || "";
        r.getCell(5).value = mat.detalle_acabado || "";
        r.getCell(6).value = medidaValue;
        r.getCell(6).numFmt = esPerfil ? "#,##0.000" : "0";
        r.getCell(7).value = mat.angulo_corte || 0;
        r.getCell(8).value = displayQty;
        r.getCell(8).numFmt = "#,##0.##";
        r.getCell(9).value = costoUnitValue;
        r.getCell(9).numFmt = "#,##0.00";

        // ★ FÓRMULA NATIVA DE EXCEL: Medida × Cantidad × Costo Unitario
        r.getCell(10).value = { formula: `F${rowIdx}*H${rowIdx}*I${rowIdx}` };
        r.getCell(10).numFmt = "#,##0.00";

        styleDataRow(r, headers.length);
        rowIdx++;
    });

    // Total general
    rowIdx++;
    const totalRow = ws.getRow(rowIdx);
    ws.mergeCells(`H${rowIdx}:I${rowIdx}`);
    totalRow.getCell(8).value = "COSTO TOTAL:";
    totalRow.getCell(8).font = { name: "Calibri", size: 12, bold: true };
    totalRow.getCell(8).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(10).value = { formula: `SUM(J2:J${rowIdx - 1})` };
    totalRow.getCell(10).numFmt = "#,##0.00";
    totalRow.getCell(10).font = { name: "Calibri", size: 12, bold: true, color: { argb: "FF1E3A5F" } };
    totalRow.getCell(10).border = {
        top: { style: "double", color: { argb: "FF1E3A5F" } },
        bottom: { style: "double", color: { argb: "FF1E3A5F" } },
    };

    // AutoFilter
    ws.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: rowIdx - 1, column: headers.length },
    };
}

// ============================================================================
// HOJA 3: BOM PRODUCCIÓN (SIN PRECIOS)
// ============================================================================

function buildHojaBOM(
    wb: ExcelJS.Workbook,
    data: ExportCotizacionData
) {
    const ws = wb.addWorksheet("BOM Producción", {
        properties: { defaultColWidth: 14 },
    });

    const { desglose } = data;

    const headers = [
        "Ítem Padre", "Tipo", "SKU", "Descripción",
        "Medida Corte (mm)", "Ángulo Corte (°)", "Cantidad",
    ];

    const colWidths = [14, 14, 18, 32, 16, 13, 10];
    colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

    // Header
    const hRow = ws.getRow(1);
    headers.forEach((h, i) => { hRow.getCell(i + 1).value = h; });
    styleHeaderRow(hRow, headers.length);

    ws.views = [{ state: "frozen", ySplit: 1, xSplit: 0 }];

    // Datos — SIN PRECIOS
    let currentItem = "";
    let rowIdx = 2;

    desglose?.forEach((mat: any) => {
        if (mat.etiqueta_item !== currentItem) {
            if (currentItem !== "") {
                const sepRow = ws.getRow(rowIdx);
                for (let c = 1; c <= headers.length; c++) {
                    sepRow.getCell(c).fill = GRIS_SEPARADOR;
                    sepRow.getCell(c).border = BORDE_FINO;
                }
                sepRow.height = 6;
                rowIdx++;
            }
            currentItem = mat.etiqueta_item;
        }

        const r = ws.getRow(rowIdx);
        const qtyItem = mat.cantidad_item || 1;
        const qtyUnit = mat.cantidad_unitaria || 0;
        const displayQty = qtyUnit * qtyItem;

        r.getCell(1).value = mat.etiqueta_item || "";
        r.getCell(2).value = mat.tipo_componente || "";
        r.getCell(3).value = mat.sku_real || mat.codigo_base || "";
        r.getCell(4).value = mat.nombre_componente || mat.descripcion_sku || "";
        r.getCell(5).value = mat.medida_corte_mm || 0;
        r.getCell(5).numFmt = "#,##0";
        r.getCell(6).value = mat.angulo_corte || 0;
        r.getCell(7).value = displayQty;
        r.getCell(7).numFmt = "#,##0.##";

        styleDataRow(r, headers.length);
        rowIdx++;
    });

    // AutoFilter
    ws.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: rowIdx - 1, column: headers.length },
    };
}

// ============================================================================
// FUNCIÓN PÚBLICA: Exportar Cotización Completa a Excel
// ============================================================================

export async function exportCotizacionToExcel(data: ExportCotizacionData) {
    const wb = new ExcelJS.Workbook();
    wb.creator = data.configEmpresa?.nombre_empresa || "ERP WMS";
    wb.created = new Date();

    // Construir las 3 hojas
    buildHojaResumen(wb, data);
    buildHojaAuditoria(wb, data);
    buildHojaBOM(wb, data);

    // Generar buffer y descargar
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const nombreArchivo = `Cotizacion_${data.cabecera.nombre_proyecto || "SIN_NOMBRE"}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(blob, nombreArchivo);
}
