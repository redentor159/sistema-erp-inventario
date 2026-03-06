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

const CABECERA_CORP: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF8FAFC" },
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
    color: { argb: "FF0F172A" },
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
        cell.fill = CABECERA_CORP;
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
        const precioUnit = (item._vc_subtotal_linea_calc || 0) / (item.cantidad || 1);
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
        r.getCell(10).numFmt = `"${simbolo}"#,##0.00;[Red]-"${simbolo}"#,##0.00;"-"`;
        r.getCell(11).value = { formula: `I${headerRow + 1 + idx}*J${headerRow + 1 + idx}` };
        r.getCell(11).numFmt = `"${simbolo}"#,##0.00;[Red]-"${simbolo}"#,##0.00;"-"`;
        styleDataRow(r, headers.length);
        r.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
        r.getCell(9).alignment = { horizontal: "center", vertical: "middle" };
    });

    // --- TOTALES (100% DINÁMICOS CON FÓRMULAS NATIVAS) ---
    const lastDataRow = headerRow + (detalles?.length || 0);
    const totalesStart = lastDataRow + 2;
    let idxRow = totalesStart;

    const incluyeIgv = cabecera.incluye_igv || false;
    const sumRange = lastDataRow >= (headerRow + 1) ? `K${headerRow + 1}:K${lastDataRow}` : "0";
    const fijosInstalacion = cabecera.costo_fijo_instalacion || 0;

    // Subtotal Ítems
    const rSubItems = ws.getRow(idxRow);
    ws.mergeCells(`I${idxRow}:J${idxRow}`);
    rSubItems.getCell(9).value = "Subtotal Ítems:";
    rSubItems.getCell(9).font = FUENTE_NORMAL;
    rSubItems.getCell(9).alignment = { horizontal: "right", vertical: "middle" };
    rSubItems.getCell(11).value = { formula: `SUM(${sumRange})` };
    rSubItems.getCell(11).numFmt = `"${simbolo}"#,##0.00;[Red]-"${simbolo}"#,##0.00;"-"`;
    rSubItems.getCell(11).border = BORDE_FINO;
    const rowSubItems = idxRow;
    idxRow++;

    // Instalación
    let rowInstalacion = 0;
    if (fijosInstalacion > 0) {
        const rInst = ws.getRow(idxRow);
        ws.mergeCells(`I${idxRow}:J${idxRow}`);
        rInst.getCell(9).value = "Cargos de Instalación:";
        rInst.getCell(9).font = FUENTE_NORMAL;
        rInst.getCell(9).alignment = { horizontal: "right", vertical: "middle" };
        rInst.getCell(11).value = fijosInstalacion;
        rInst.getCell(11).numFmt = `"${simbolo}"#,##0.00;[Red]-"${simbolo}"#,##0.00;"-"`;
        rInst.getCell(11).border = BORDE_FINO;
        rowInstalacion = idxRow;
        idxRow++;
    }

    // Subtotal Neto
    const rNeto = ws.getRow(idxRow);
    ws.mergeCells(`I${idxRow}:J${idxRow}`);
    rNeto.getCell(9).value = "Subtotal Neto:";
    rNeto.getCell(9).font = FUENTE_BOLD;
    rNeto.getCell(9).alignment = { horizontal: "right", vertical: "middle" };
    rNeto.getCell(11).value = { formula: rowInstalacion > 0 ? `K${rowSubItems} + K${rowInstalacion}` : `K${rowSubItems}` };
    rNeto.getCell(11).numFmt = `"${simbolo}"#,##0.00;[Red]-"${simbolo}"#,##0.00;"-"`;
    rNeto.getCell(11).font = FUENTE_BOLD;
    rNeto.getCell(11).border = BORDE_FINO;
    const rowNeto = idxRow;
    idxRow++;

    // IGV
    const rIgv = ws.getRow(idxRow);
    ws.mergeCells(`I${idxRow}:J${idxRow}`);
    rIgv.getCell(9).value = `IGV (18%):`;
    rIgv.getCell(9).font = FUENTE_BOLD;
    rIgv.getCell(9).alignment = { horizontal: "right", vertical: "middle" };
    rIgv.getCell(11).value = { formula: `K${rowNeto} * 0.18` };
    rIgv.getCell(11).numFmt = `"${simbolo}"#,##0.00;[Red]-"${simbolo}"#,##0.00;"-"`;
    rIgv.getCell(11).font = FUENTE_BOLD;
    rIgv.getCell(11).border = BORDE_FINO;
    const rowIgv = idxRow;
    idxRow++;

    // TOTAL
    const rTot = ws.getRow(idxRow);
    ws.mergeCells(`I${idxRow}:J${idxRow}`);
    rTot.getCell(9).value = "TOTAL:";
    rTot.getCell(9).font = FUENTE_BOLD;
    rTot.getCell(9).alignment = { horizontal: "right", vertical: "middle" };
    rTot.getCell(11).value = { formula: `K${rowNeto} + K${rowIgv}` };
    rTot.getCell(11).numFmt = `"${simbolo}"#,##0.00;[Red]-"${simbolo}"#,##0.00;"-"`;
    rTot.getCell(11).font = { name: "Calibri", size: 13, bold: true, color: { argb: "FF1E3A5F" } };
    rTot.getCell(11).border = BORDE_FINO;

    // --- PRINT SETUP & PROTECTION ---
    ws.pageSetup = {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 999,
        printTitlesRow: `1:${headerRow}`,
    };
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
        r.getCell(8).numFmt = '#,##0.00_ ;-#,##0.00_ ;"-"';
        r.getCell(9).value = costoUnitValue;
        r.getCell(9).numFmt = '"S/"#,##0.00;[Red]-"S/"#,##0.00;"-"';

        // ★ FÓRMULA NATIVA DE EXCEL: Medida × Cantidad × Costo Unitario
        r.getCell(10).value = { formula: `F${rowIdx}*H${rowIdx}*I${rowIdx}` };
        r.getCell(10).numFmt = '"S/"#,##0.00;[Red]-"S/"#,##0.00;"-"';

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
    totalRow.getCell(10).numFmt = '"S/"#,##0.00;[Red]-"S/"#,##0.00;"-"';
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

    // --- PRINT SETUP & PROTECTION ---
    ws.pageSetup = {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 999,
        printTitlesRow: '1:1',
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

    // --- PRINT SETUP & PROTECTION ---
    ws.pageSetup = {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 999,
        printTitlesRow: '1:1',
    };
}

// ============================================================================
// HOJA 0: CARÁTULA DE PRESENTACIÓN (COVER SHEET)
// ============================================================================

function buildHojaCaratula(wb: ExcelJS.Workbook, data: ExportCotizacionData) {
    const ws = wb.addWorksheet("Propuesta Comercial", {
        properties: { defaultColWidth: 20 },
        views: [{ showGridLines: false }]
    });

    const { cabecera, configEmpresa } = data;
    const cliente = cabecera.mst_clientes || {};
    const moneda = cabecera.moneda || "PEN";
    const simbolo = moneda === "USD" ? "US$" : "S/";

    // Header Logo & Company
    ws.mergeCells("B2:F4");
    const logoCell = ws.getCell("B2");
    logoCell.value = configEmpresa?.nombre_empresa || "CORPORACIÓN EMPRESARIAL";
    logoCell.font = { name: "Arial Black", size: 22, color: { argb: "FF1E3A5F" } };
    logoCell.alignment = { vertical: "middle", horizontal: "left" };

    ws.mergeCells("B6:I7");
    const titleCell = ws.getCell("B6");
    titleCell.value = "PROPUESTA COMERCIAL TÉCNICA";
    titleCell.font = { name: "Calibri", size: 26, bold: true, color: { argb: "FF0F172A" } };
    titleCell.alignment = { vertical: "middle", horizontal: "left" };

    // Meta Info
    ws.getCell("B9").value = "Nro. Referencia:";
    ws.getCell("B9").font = FUENTE_BOLD;
    ws.getCell("C9").value = cabecera.id_cotizacion?.toUpperCase().substring(0, 13) || "-";

    ws.getCell("B10").value = "Fecha de Emisión:";
    ws.getCell("B10").font = FUENTE_BOLD;
    ws.getCell("C10").value = new Date(cabecera.fecha_emision).toLocaleDateString();

    ws.getCell("B11").value = "Validez de Oferta:";
    ws.getCell("B11").font = FUENTE_BOLD;
    ws.getCell("C11").value = `${cabecera.validez_dias || 15} días calendario`;

    // Client Info
    ws.mergeCells("B13:D13");
    ws.getCell("B13").value = "PREPARADO PARA:";
    ws.getCell("B13").font = { name: "Calibri", size: 12, bold: true, color: { argb: "FF64748B" } };
    ws.getCell("B13").border = { bottom: { style: "medium", color: { argb: "FFCBD5E1" } } };

    ws.mergeCells("B14:E14");
    ws.getCell("B14").value = cliente.nombre_completo || "-";
    ws.getCell("B14").font = { name: "Calibri", size: 14, bold: true };

    ws.getCell("B15").value = `RUC/DNI: ${cliente.ruc || "-"}`;
    ws.getCell("B15").font = FUENTE_NORMAL;

    ws.getCell("B16").value = `Proyecto: ${cabecera.nombre_proyecto || "-"}`;
    ws.getCell("B16").font = FUENTE_NORMAL;

    // Investment Summary
    ws.mergeCells("G13:I13");
    ws.getCell("G13").value = "RESUMEN DE INVERSIÓN:";
    ws.getCell("G13").font = { name: "Calibri", size: 12, bold: true, color: { argb: "FF64748B" } };
    ws.getCell("G13").border = { bottom: { style: "medium", color: { argb: "FFCBD5E1" } } };

    ws.getCell("G14").value = "Moneda:";
    ws.getCell("H14").value = moneda;

    ws.getCell("G15").value = "Total Inversión (Inc. IGV):";
    ws.getCell("G15").font = FUENTE_BOLD;
    ws.getCell("H15").value = cabecera._vc_precio_final_cliente || 0;
    ws.getCell("H15").numFmt = `"${simbolo}"#,##0.00`;
    ws.getCell("H15").font = { name: "Calibri", size: 16, bold: true, color: { argb: "FF0F172A" } };

    // Terms & Conditions
    ws.mergeCells("B19:I19");
    ws.getCell("B19").value = " TÉRMINOS Y CONDICIONES COMERCIALES";
    ws.getCell("B19").font = { name: "Calibri", size: 12, bold: true, color: { argb: "FF1E3A5F" } };
    ws.getCell("B19").fill = GRIS_CABECERA;
    ws.getCell("B19").border = { bottom: { style: "thin", color: { argb: "FFCBD5E1" } }, top: { style: "thin", color: { argb: "FFCBD5E1" } } };

    ws.mergeCells("B21:I28");
    const termsCell = ws.getCell("B21");
    termsCell.value = cabecera.terminos_personalizados || configEmpresa?.texto_condiciones_base || "1. Tiempo de entrega sujeto a disponibilidad de stock.\n2. Forma de pago: Adelanto 50%, saldo contra entrega.\n3. La validez de la oferta expirará finalizado el plazo fijado.\n4. La instalación asume condiciones estándar de obra y acceso libre.";
    termsCell.font = { name: "Calibri", size: 11, color: { argb: "FF475569" } };
    termsCell.alignment = { vertical: "top", horizontal: "left", wrapText: true };

    // Logo Base64 Injection (Placeholder if not available)
    const logoBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const imageId = wb.addImage({
        base64: 'data:image/png;base64,' + logoBase64,
        extension: 'png',
    });
    ws.addImage(imageId, {
        tl: { col: 8, row: 1 },
        ext: { width: 60, height: 60 }
    });

    ws.pageSetup = {
        orientation: "portrait",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 1,
        printArea: 'A1:J30'
    };
}

// ============================================================================
// FUNCIÓN PÚBLICA: Exportar Cotización Completa a Excel
// ============================================================================

export async function exportCotizacionToExcel(data: ExportCotizacionData) {
    const wb = new ExcelJS.Workbook();
    wb.creator = data.configEmpresa?.nombre_empresa || "ERP Corporativo";
    wb.created = new Date();

    // Force strict alphabetical sort by 'etiqueta_item'
    if (data.detalles) {
        data.detalles.sort((a, b) => (a.etiqueta_item || "").localeCompare(b.etiqueta_item || ""));
    }
    if (data.desglose) {
        data.desglose.sort((a, b) => (a.etiqueta_item || "").localeCompare(b.etiqueta_item || ""));
    }

    // Construir las 4 hojas
    buildHojaCaratula(wb, data);
    buildHojaResumen(wb, data);
    buildHojaAuditoria(wb, data);
    buildHojaBOM(wb, data);

    // Activar pestaña Carátula
    wb.views = [
        {
            x: 0,
            y: 0,
            width: 10000,
            height: 20000,
            firstSheet: 0,
            activeTab: 0,
            visibility: "visible",
        },
    ];

    // Generar buffer y descargar
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const nombreArchivo = `Propuesta_Comercial_${data.cabecera.nombre_proyecto || "PROY"}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(blob, nombreArchivo);
}
