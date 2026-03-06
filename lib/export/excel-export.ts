import ExcelJS from "exceljs";
import { supabase } from "@/lib/supabase/client";

// Helper to bypass Supabase 1000 row limit
async function fetchAllRows(queryBuilder: any, limitPerPage = 1000) {
  let allData: any[] = [];
  let from = 0;
  let to = limitPerPage - 1;
  let keepFetching = true;

  while (keepFetching) {
    const { data, error } = await queryBuilder.range(from, to);
    if (error) throw error;

    if (data && data.length > 0) {
      allData = [...allData, ...data];
      from += limitPerPage;
      to += limitPerPage;
      if (data.length < limitPerPage) {
        keepFetching = false;
      }
    } else {
      keepFetching = false;
    }
  }
  return allData;
}

export async function exportDataToExcelType(
  type: string,
  startDate?: string,
  endDate?: string,
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistema ERP";
  workbook.created = new Date();

  if (type === "commercial") {
    await generateCommercialExcel(workbook, startDate, endDate);
  } else if (type === "inventory") {
    await generateInventoryExcel(workbook);
  } else if (type === "movements") {
    await generateMovementsExcel(workbook, startDate, endDate);
  } else if (type === "master_data") {
    await generateMasterDataExcel(workbook);
  } else {
    throw new Error("Invalid type");
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

// --- 1. COMMERCIAL EXPORT ---
async function generateCommercialExcel(
  workbook: ExcelJS.Workbook,
  startDate?: string,
  endDate?: string,
) {
  // SHEET 1: CABECERAS (vw_cotizaciones_totales)
  const sheetHeaders = workbook.addWorksheet("Fact_Cotizaciones_Cabecera");
  sheetHeaders.columns = [
    { header: "id_cotizacion", key: "id_cotizacion", width: 36 },
    { header: "id_cliente", key: "id_cliente", width: 36 },
    { header: "id_marca", key: "id_marca", width: 36 },
    { header: "fecha_emision", key: "fecha_emision", width: 20 },
    { header: "fecha_prometida", key: "fecha_prometida", width: 20 },
    { header: "fecha_entrega_real", key: "fecha_entrega_real", width: 20 },
    { header: "fecha_aprobacion", key: "fecha_aprobacion", width: 20 },
    { header: "fecha_rechazo", key: "fecha_rechazo", width: 20 },
    { header: "estado", key: "estado", width: 15 },
    { header: "moneda", key: "moneda", width: 10 },
    { header: "condicion_pago", key: "condicion_pago", width: 20 },
    { header: "aplica_detraccion", key: "aplica_detraccion", width: 15 },
    { header: "incluye_igv", key: "incluye_igv", width: 15 },
    { header: "total_costo_directo", key: "total_costo_directo", width: 18 },
    { header: "total_precio_venta", key: "total_precio_venta", width: 18 },
    {
      header: "_vc_total_costo_materiales",
      key: "_vc_total_costo_materiales",
      width: 18,
    },
    { header: "_vc_subtotal_venta", key: "_vc_base_imponible", width: 18 },
    { header: "_vc_monto_igv", key: "_vc_monto_igv", width: 15 },
    {
      header: "_vc_precio_final_cliente",
      key: "_vc_precio_final_cliente",
      width: 18,
    },
    { header: "costo_mano_obra_m2", key: "costo_mano_obra_m2", width: 15 },
    {
      header: "costo_fijo_instalacion",
      key: "costo_fijo_instalacion",
      width: 15,
    },
    {
      header: "costo_global_instalacion",
      key: "costo_global_instalacion",
      width: 15,
    },
    { header: "nombre_proyecto", key: "nombre_proyecto", width: 30 },
    { header: "plazo_entrega", key: "plazo_entrega", width: 20 },
    { header: "validez_dias", key: "validez_dias", width: 10 },
    { header: "markup_aplicado", key: "markup_aplicado", width: 15 },
    { header: "motivo_rechazo", key: "motivo_rechazo", width: 30 },
  ];

  let queryHeaders = supabase
    .from("vw_cotizaciones_totales")
    .select("*")
    .order("fecha_emision", { ascending: false });
  if (startDate) queryHeaders = queryHeaders.gte("fecha_emision", startDate);
  if (endDate) queryHeaders = queryHeaders.lte("fecha_emision", endDate);

  const headersData = await fetchAllRows(queryHeaders);
  headersData.forEach((row: any) => sheetHeaders.addRow(row));

  // SHEET 2: DETALLES (vw_cotizaciones_detalladas)
  const sheetDetails = workbook.addWorksheet("Fact_Cotizaciones_Detalle");
  sheetDetails.columns = [
    { header: "id_linea_cot", key: "id_linea_cot", width: 36 },
    { header: "id_cotizacion", key: "id_cotizacion", width: 36 },
    { header: "id_modelo", key: "id_modelo", width: 36 },
    { header: "ubicacion", key: "ubicacion", width: 20 },
    { header: "etiqueta_item", key: "etiqueta_item", width: 30 },
    { header: "tipo_cierre", key: "tipo_cierre", width: 15 },
    { header: "color_perfiles", key: "color_perfiles", width: 15 },
    { header: "tipo_vidrio", key: "tipo_vidrio", width: 20 },
    { header: "grupo_opcion", key: "grupo_opcion", width: 15 },
    { header: "cantidad", key: "cantidad", width: 10 },
    { header: "ancho_mm", key: "ancho_mm", width: 10 },
    { header: "alto_mm", key: "alto_mm", width: 10 },
    { header: "costo_base_ref", key: "costo_base_ref", width: 15 },
    { header: "subtotal_linea", key: "subtotal_linea", width: 15 },
    { header: "_costo_materiales", key: "_costo_materiales", width: 18 },
    {
      header: "_vc_precio_unit_oferta_calc",
      key: "_vc_precio_unit_oferta_calc",
      width: 18,
    },
    {
      header: "_vc_subtotal_linea_calc",
      key: "_vc_subtotal_linea_calc",
      width: 18,
    },
    { header: "es_despiece_manual", key: "es_despiece_manual", width: 15 },
    { header: "opciones_seleccionadas", key: "opc_str", width: 30 },
  ];

  const headerIds = headersData.map((h: any) => h.id_cotizacion);
  let queryDetails = supabase.from("vw_cotizaciones_detalladas").select("*");
  if ((startDate || endDate) && headerIds.length > 0) {
    queryDetails = queryDetails.in("id_cotizacion", headerIds);
  } else if ((startDate || endDate) && headerIds.length === 0) {
    queryDetails = queryDetails.in("id_cotizacion", [
      "00000000-0000-0000-0000-000000000000",
    ]);
  }
  const detailsData = await fetchAllRows(queryDetails);
  detailsData.forEach((row: any) =>
    sheetDetails.addRow({
      ...row,
      opc_str: row.opciones_seleccionadas
        ? JSON.stringify(row.opciones_seleccionadas)
        : "",
    }),
  );

  // SHEET 3: DESGLOSE INGENIERIA (vw_reporte_desglose)
  const sheetBom = workbook.addWorksheet("Fact_Desglose_Ingenieria");
  sheetBom.columns = [
    { header: "id_linea_cot", key: "id_linea_cot", width: 36 },
    { header: "id_cotizacion", key: "id_cotizacion", width: 36 },
    { header: "sku_real", key: "sku_real", width: 25 },
    { header: "id_modelo", key: "id_modelo", width: 36 },
    { header: "tipo_componente", key: "tipo_componente", width: 15 },
    { header: "nombre_componente", key: "nombre_componente", width: 30 },
    { header: "detalle_acabado", key: "detalle_acabado", width: 15 },
    { header: "medida_corte_mm", key: "medida_corte_mm", width: 15 },
    { header: "angulo_corte", key: "angulo_corte", width: 15 },
    { header: "detalle_formula", key: "detalle_formula", width: 15 },
    { header: "cantidad_item", key: "cantidad_items", width: 15 },
    { header: "cantidad_unitaria", key: "cantidad_unitaria", width: 15 },
    { header: "costo_unitario", key: "costo_unitario", width: 15 },
    { header: "costo_mercado_unit", key: "costo_mercado_unit", width: 15 },
  ];
  let queryBom = supabase.from("vw_reporte_desglose").select("*");
  if ((startDate || endDate) && headerIds.length > 0) {
    queryBom = queryBom.in("id_cotizacion", headerIds);
  } else if ((startDate || endDate) && headerIds.length === 0) {
    queryBom = queryBom.in("id_cotizacion", [
      "00000000-0000-0000-0000-000000000000",
    ]);
  }
  const bomData = await fetchAllRows(queryBom);
  bomData.forEach((row: any) => sheetBom.addRow(row));

  // SHEET 4: PRODUCCION (vw_reporte_produccion)
  const sheetProd = workbook.addWorksheet("Fact_Produccion_Kanban");
  sheetProd.columns = [
    { header: "id_registro", key: "id_registro", width: 36 },
    { header: "origen", key: "origen", width: 15 },
    { header: "client_name", key: "client_name", width: 30 },
    { header: "product_name", key: "product_name", width: 30 },
    { header: "brand", key: "brand", width: 15 },
    { header: "color", key: "color", width: 15 },
    { header: "crystal_type", key: "crystal_type", width: 20 },
    { header: "width_mm", key: "width_mm", width: 10 },
    { header: "height_mm", key: "height_mm", width: 10 },
    { header: "creation_date", key: "creation_date", width: 20 },
    { header: "delivery_date", key: "delivery_date", width: 20 },
    { header: "fecha_termino", key: "fecha_termino", width: 20 },
    { header: "estado_final", key: "estado_final", width: 20 },
  ];
  const queryProd = supabase.from("vw_reporte_produccion").select("*");
  const prodData = await fetchAllRows(queryProd);
  if (prodData && prodData.length > 0) {
    prodData.forEach((row: any) => sheetProd.addRow(row));
  }

  const currencyFormat = '"S/"#,##0.00;[Red]-"S/"#,##0.00;"-"';
  [14, 15, 16, 17, 18, 19, 20, 21, 22].forEach(c => { sheetHeaders.getColumn(c).numFmt = currencyFormat; });
  [13, 14, 15, 16, 17].forEach(c => { sheetDetails.getColumn(c).numFmt = currencyFormat; });
  [13, 14].forEach(c => { sheetBom.getColumn(c).numFmt = currencyFormat; });

  if (headersData.length > 0) {
    const totalRow = sheetHeaders.getRow(headersData.length + 2);
    totalRow.getCell(13).value = "TOTAL (S/):";
    [14, 15, 16, 17, 18, 19, 22].forEach(c => {
      totalRow.getCell(c).value = { formula: `SUM(${sheetHeaders.getColumn(c).letter}2:${sheetHeaders.getColumn(c).letter}${headersData.length + 1})` };
    });
    totalRow.font = { bold: true };
  }

  [sheetHeaders, sheetDetails, sheetBom, sheetProd].forEach((s) => {
    s.views = [{ state: "frozen", ySplit: 1, xSplit: 0 }];
    s.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: s.columnCount } };
    s.getRow(1).font = { bold: true, color: { argb: "FF0F172A" } };
    s.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF8FAFC" },
    };
    s.getRow(1).border = { bottom: { style: "medium", color: { argb: "FFCBD5E1" } } };
  });
}

// --- 2. INVENTORY EXPORT (Stock + Retazos + Zombies) ---
async function generateInventoryExcel(workbook: ExcelJS.Workbook) {
  const sheetStock = workbook.addWorksheet("Snap_Inventario_Valorizado");
  sheetStock.columns = [
    { header: "id_sku", key: "id_sku", width: 20 },
    { header: "id_marca", key: "id_marca", width: 15 },
    { header: "id_material", key: "id_material", width: 15 },
    { header: "id_acabado", key: "id_acabado", width: 15 },
    { header: "id_sistema", key: "id_sistema", width: 20 },
    { header: "stock_actual", key: "stock_actual", width: 15 },
    { header: "stock_minimo", key: "stock_minimo", width: 12 },
    { header: "punto_pedido", key: "punto_pedido", width: 12 },
    { header: "costo_promedio", key: "costo_promedio", width: 20 },
    { header: "costo_mercado_unit", key: "costo_mercado_unit", width: 15 },
    { header: "inversion_total", key: "inversion_total", width: 20 },
    { header: "clasificacion_abc", key: "clasificacion_abc", width: 10 },
    { header: "orden_prioridad", key: "orden_prioridad", width: 10 },
    {
      header: "estado_abastecimiento",
      key: "estado_abastecimiento",
      width: 15,
    },
    { header: "ultima_actualizacion", key: "ultima_actualizacion", width: 20 },
    { header: "largo_estandar_mm", key: "largo_estandar_mm", width: 15 },
    { header: "peso_teorico_kg", key: "peso_teorico_kg", width: 15 },
  ];

  const queryStock = supabase
    .from("mvw_stock_realtime")
    .select("*")
    .order("id_sku", { ascending: true });
  const stockData = await fetchAllRows(queryStock);
  stockData.forEach((row: any) => sheetStock.addRow(row));

  const sheetOffcuts = workbook.addWorksheet("Fact_Retazos_Disponibles");
  sheetOffcuts.columns = [
    { header: "id_retazo", key: "id_retazo", width: 36 },
    { header: "id_sku_padre", key: "id_sku_padre", width: 20 },
    { header: "orden_trabajo", key: "orden_trabajo", width: 25 },
    { header: "estado", key: "estado", width: 15 },
    { header: "ubicacion", key: "ubicacion", width: 15 },
    { header: "longitud_mm", key: "longitud_mm", width: 15 },
    {
      header: "valor_recuperable_estimado",
      key: "valor_recuperable_estimado",
      width: 25,
    },
    { header: "fecha_creacion", key: "fecha_creacion", width: 20 },
  ];
  const queryOff = supabase.from("vw_reporte_retazos").select("*");
  const offData = await fetchAllRows(queryOff);
  if (offData && offData.length > 0) {
    offData.forEach((row: any) => sheetOffcuts.addRow(row));
  }

  const sheetZombie = workbook.addWorksheet("Stock_Zombie");
  sheetZombie.columns = [
    { header: "id_sku", key: "id_sku", width: 20 },
    { header: "nombre_completo", key: "nombre_completo", width: 40 },
    { header: "stock_actual", key: "stock_actual", width: 15 },
    { header: "costo_unitario", key: "costo_unitario", width: 20 },
    { header: "valor_estancado", key: "valor_estancado", width: 20 },
    {
      header: "ultima_salida_registrada",
      key: "ultima_salida_registrada",
      width: 20,
    },
  ];
  const queryZombie = supabase.from("vw_kpi_stock_zombie").select("*");
  const zombieData = await fetchAllRows(queryZombie);
  if (zombieData && zombieData.length > 0) {
    zombieData.forEach((row: any) => sheetZombie.addRow(row));
  }

  const currencyFormat = '"S/"#,##0.00;[Red]-"S/"#,##0.00;"-"';
  const qtyFormat = '#,##0.00_ ;-#,##0.00_ ;"-"';

  [9, 10, 11].forEach(c => { sheetStock.getColumn(c).numFmt = currencyFormat; });
  [6, 7, 8].forEach(c => { sheetStock.getColumn(c).numFmt = qtyFormat; });
  sheetOffcuts.getColumn(7).numFmt = currencyFormat;
  [4, 5].forEach(c => { sheetZombie.getColumn(c).numFmt = currencyFormat; });

  if (stockData.length > 0) {
    const totalRow = sheetStock.getRow(stockData.length + 2);
    totalRow.getCell(10).value = "INVERSIÓN TOTAL:";
    totalRow.getCell(11).value = { formula: `SUM(K2:K${stockData.length + 1})` };
    totalRow.font = { bold: true };
  }

  [sheetStock, sheetOffcuts, sheetZombie].forEach((s) => {
    s.views = [{ state: "frozen", ySplit: 1, xSplit: 0 }];
    s.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: s.columnCount } };
    s.getRow(1).font = { bold: true, color: { argb: "FF0F172A" } };
    s.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF8FAFC" },
    };
    s.getRow(1).border = { bottom: { style: "medium", color: { argb: "FFCBD5E1" } } };
  });
}

// --- 3. MOVEMENTS EXPORT (Kardex) ---
async function generateMovementsExcel(
  workbook: ExcelJS.Workbook,
  startDate?: string,
  endDate?: string,
) {
  const sheet = workbook.addWorksheet("Fact_Kardex_Movimientos");

  sheet.columns = [
    { header: "id_movimiento", key: "id_movimiento", width: 36 },
    { header: "id_sku", key: "id_sku", width: 20 },
    { header: "referencia_doc", key: "nro_documento", width: 30 },
    { header: "fecha_hora", key: "fecha_hora", width: 20 },
    { header: "tipo_movimiento", key: "tipo_movimiento", width: 15 },
    { header: "cantidad", key: "cantidad", width: 15 },
    { header: "costo_unit_doc", key: "costo_unit_doc", width: 18 },
    { header: "costo_total_pen", key: "costo_total_pen", width: 18 },
    { header: "moneda_origen", key: "moneda_origen", width: 15 },
    { header: "entidad_nombre", key: "entidad_nombre", width: 30 },
    { header: "nro_documento", key: "nro_documento", width: 30 },
  ];

  let query = supabase
    .from("vw_kardex_reporte")
    .select("*")
    .order("fecha_hora", { ascending: false });

  if (startDate) query = query.gte("fecha_hora", startDate);
  if (endDate) query = query.lte("fecha_hora", endDate);

  const data = await fetchAllRows(query);
  data.forEach((row: any) => sheet.addRow(row));

  const currencyFormat = '"S/"#,##0.00;[Red]-"S/"#,##0.00;"-"';
  const qtyFormat = '#,##0.00_ ;-#,##0.00_ ;"-"';

  sheet.getColumn(6).numFmt = qtyFormat;
  [7, 8].forEach(c => sheet.getColumn(c).numFmt = currencyFormat);

  if (data.length > 0) {
    const totalRow = sheet.getRow(data.length + 2);
    totalRow.getCell(7).value = "COSTO TOTAL (S/):";
    totalRow.getCell(8).value = { formula: `SUM(H2:H${data.length + 1})` };
    totalRow.font = { bold: true };
  }

  sheet.views = [{ state: "frozen", ySplit: 1, xSplit: 0 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
  sheet.getRow(1).font = { bold: true, color: { argb: "FF0F172A" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF8FAFC" },
  };
  sheet.getRow(1).border = { bottom: { style: "medium", color: { argb: "FFCBD5E1" } } };
}

// --- 4. MASTER DATA EXPORT (NEW) ---
async function generateMasterDataExcel(workbook: ExcelJS.Workbook) {
  const sheetCat = workbook.addWorksheet("Dim_SKU_Catalogo");
  sheetCat.columns = [
    { header: "id_sku", key: "id_sku", width: 20 },
    { header: "nombre_completo", key: "nombre_completo", width: 40 },
    { header: "id_plantilla", key: "id_plantilla", width: 20 },
    { header: "id_marca", key: "id_marca", width: 15 },
    { header: "id_material", key: "id_material", width: 15 },
    { header: "id_acabado", key: "id_acabado", width: 15 },
    { header: "cod_proveedor", key: "cod_proveedor", width: 20 },
    { header: "id_almacen", key: "id_almacen", width: 15 },
    { header: "unidad_medida", key: "unidad_medida", width: 10 },
    { header: "costo_mercado_unit", key: "costo_mercado_unit", width: 15 },
    { header: "moneda_reposicion", key: "moneda_reposicion", width: 10 },
    { header: "fecha_act_precio", key: "fecha_act_precio", width: 20 },
    { header: "es_templado", key: "es_templado", width: 10 },
    { header: "espesor_mm", key: "espesor_mm", width: 10 },
    { header: "costo_flete_m2", key: "costo_flete_m2", width: 15 },
    { header: "stock_minimo", key: "stock_minimo", width: 15 },
    { header: "punto_pedido", key: "punto_pedido", width: 15 },
    { header: "tiempo_reposicion_dias", key: "tiempo_reposicion_dias", width: 20 },
    { header: "lote_econ_compra", key: "lote_econ_compra", width: 15 },
    { header: "demanda_promedio_diaria", key: "demanda_promedio_diaria", width: 20 },
  ];
  const catData = await fetchAllRows(supabase.from("cat_productos_variantes").select("*"));
  catData?.forEach((row: any) => sheetCat.addRow(row));

  const sheetClients = workbook.addWorksheet("Dim_Clientes");
  sheetClients.columns = [
    { header: "id_cliente", key: "id_cliente", width: 20 },
    { header: "ruc", key: "ruc", width: 15 },
    { header: "nombre_completo", key: "nombre_completo", width: 40 },
    { header: "telefono", key: "telefono", width: 15 },
    { header: "direccion_obra_principal", key: "direccion_obra_principal", width: 40 },
    { header: "tipo_cliente", key: "tipo_cliente", width: 15 },
  ];
  const cData = await fetchAllRows(supabase.from("mst_clientes").select("*"));
  cData?.forEach((row: any) => sheetClients.addRow(row));

  const sheetProv = workbook.addWorksheet("Dim_Proveedores");
  sheetProv.columns = [
    { header: "id_proveedor", key: "id_proveedor", width: 20 },
    { header: "ruc", key: "ruc", width: 15 },
    { header: "razon_social", key: "razon_social", width: 40 },
    { header: "nombre_comercial", key: "nombre_comercial", width: 40 },
    { header: "contacto_vendedor", key: "contacto_vendedor", width: 30 },
    { header: "telefono_pedidos", key: "telefono_pedidos", width: 20 },
    { header: "email_pedidos", key: "email_pedidos", width: 30 },
    { header: "dias_credito", key: "dias_credito", width: 15 },
    { header: "moneda_predeterminada", key: "moneda_predeterminada", width: 20 },
  ];
  const pData = await fetchAllRows(supabase.from("mst_proveedores").select("*"));
  pData?.forEach((row: any) => sheetProv.addRow(row));

  const sheetPlantillas = workbook.addWorksheet("Dim_Familias");
  sheetPlantillas.columns = [
    { header: "id_familia", key: "id_familia", width: 20 },
    { header: "nombre_familia", key: "nombre_familia", width: 40 },
    { header: "categoria_odoo", key: "categoria_odoo", width: 20 },
  ];
  const famData = await fetchAllRows(supabase.from("mst_familias").select("*"));
  famData?.forEach((row: any) => sheetPlantillas.addRow(row));

  const sheetSist = workbook.addWorksheet("Dim_Sistemas");
  sheetSist.columns = [
    { header: "id_sistema", key: "id_sistema", width: 20 },
    { header: "nombre_comercial", key: "nombre_comercial", width: 30 },
    { header: "cod_corrales", key: "cod_corrales", width: 15 },
    { header: "cod_eduholding", key: "cod_eduholding", width: 15 },
    { header: "cod_hpd", key: "cod_hpd", width: 15 },
    { header: "cod_limatambo", key: "cod_limatambo", width: 15 },
    { header: "uso_principal", key: "uso_principal", width: 20 },
  ];
  const sistData = await fetchAllRows(supabase.from("mst_series_equivalencias").select("*"));
  sistData?.forEach((row: any) => sheetSist.addRow(row));

  const sheetPlant = workbook.addWorksheet("Dim_Plantillas");
  sheetPlant.columns = [
    { header: "id_plantilla", key: "id_plantilla", width: 20 },
    { header: "nombre_generico", key: "nombre_generico", width: 40 },
    { header: "id_familia", key: "id_familia", width: 20 },
    { header: "id_sistema", key: "id_sistema", width: 20 },
    { header: "largo_estandar_mm", key: "largo_estandar_mm", width: 15 },
    { header: "peso_teorico_kg", key: "peso_teorico_kg", width: 15 },
    { header: "imagen_ref", key: "imagen_ref", width: 30 },
  ];
  const plantData = await fetchAllRows(supabase.from("cat_plantillas").select("*"));
  plantData?.forEach((row: any) => sheetPlant.addRow(row));

  const sheetMod = workbook.addWorksheet("Dim_Recetas_Modelos");
  sheetMod.columns = [
    { header: "id_modelo", key: "id_modelo", width: 25 },
    { header: "id_sistema", key: "id_sistema", width: 20 },
    { header: "nombre_comercial", key: "nombre_comercial", width: 40 },
    { header: "num_hojas", key: "num_hojas", width: 10 },
    { header: "descripcion", key: "descripcion", width: 40 },
    { header: "activo", key: "activo", width: 10 },
    { header: "tipo_dibujo", key: "tipo_dibujo", width: 20 },
    { header: "config_hojas_default", key: "config_hojas_default", width: 20 },
  ];
  const modData = await fetchAllRows(supabase.from("mst_recetas_modelos").select("*"));
  modData?.forEach((row: any) => sheetMod.addRow(row));

  const sheetIng = workbook.addWorksheet("Dim_Recetas_Ing");
  sheetIng.columns = [
    { header: "id_receta", key: "id_receta", width: 36 },
    { header: "id_modelo", key: "id_modelo", width: 25 },
    { header: "id_plantilla", key: "id_plantilla", width: 20 },
    { header: "id_material_receta", key: "id_material_receta", width: 15 },
    { header: "id_acabado_receta", key: "id_acabado_receta", width: 15 },
    { header: "id_marca_receta", key: "id_marca_receta", width: 15 },
    { header: "id_sistema", key: "id_sistema", width: 15 },
    { header: "nombre_componente", key: "nombre_componente", width: 40 },
    { header: "tipo", key: "tipo", width: 15 },
    { header: "seccion", key: "seccion", width: 15 },
    { header: "orden_visual", key: "orden_visual", width: 10 },
    { header: "cantidad_base", key: "cantidad_base", width: 15 },
    { header: "factor_cantidad_ancho", key: "factor_cantidad_ancho", width: 15 },
    { header: "factor_cantidad_alto", key: "factor_cantidad_alto", width: 15 },
    { header: "factor_corte_ancho", key: "factor_corte_ancho", width: 15 },
    { header: "factor_corte_alto", key: "factor_corte_alto", width: 15 },
    { header: "constante_corte_mm", key: "constante_corte_mm", width: 15 },
    { header: "angulo", key: "angulo", width: 10 },
    { header: "condicion", key: "condicion", width: 15 },
    { header: "formula_cantidad", key: "formula_cantidad", width: 30 },
    { header: "formula_perfil", key: "formula_perfil", width: 30 },
    { header: "grupo_opcion", key: "grupo_opcion", width: 15 },
  ];
  const ingData = await fetchAllRows(supabase.from("mst_recetas_ingenieria").select("*"));
  ingData?.forEach((row: any) => sheetIng.addRow(row));

  const sheetAlm = workbook.addWorksheet("Dim_Almacenes");
  sheetAlm.columns = [{ header: "id_almacen", key: "id_almacen", width: 20 }, { header: "nombre_almacen", key: "nombre_almacen", width: 40 }];
  const almData = await fetchAllRows(supabase.from("mst_almacenes").select("*"));
  almData?.forEach((row: any) => sheetAlm.addRow(row));

  const sheetMarc = workbook.addWorksheet("Dim_Marcas");
  sheetMarc.columns = [{ header: "id_marca", key: "id_marca", width: 20 }, { header: "nombre_marca", key: "nombre_marca", width: 40 }, { header: "pais_origen", key: "pais_origen", width: 20 }];
  const marcData = await fetchAllRows(supabase.from("mst_marcas").select("*"));
  marcData?.forEach((row: any) => sheetMarc.addRow(row));

  const sheetAcab = workbook.addWorksheet("Dim_Acabados");
  sheetAcab.columns = [{ header: "id_acabado", key: "id_acabado", width: 20 }, { header: "nombre_acabado", key: "nombre_acabado", width: 40 }, { header: "sufijo_sku", key: "sufijo_sku", width: 15 }];
  const acabData = await fetchAllRows(supabase.from("mst_acabados_colores").select("*"));
  acabData?.forEach((row: any) => sheetAcab.addRow(row));

  const sheetMat = workbook.addWorksheet("Dim_Materiales");
  sheetMat.columns = [{ header: "id_material", key: "id_material", width: 20 }, { header: "nombre_material", key: "nombre_material", width: 40 }, { header: "odoo_code", key: "odoo_code", width: 20 }];
  const matData = await fetchAllRows(supabase.from("mst_materiales").select("*"));
  matData?.forEach((row: any) => sheetMat.addRow(row));

  const currencyFormat = '"S/"#,##0.00;[Red]-"S/"#,##0.00;"-"';
  sheetCat.getColumn(10).numFmt = currencyFormat;
  sheetCat.getColumn(15).numFmt = currencyFormat;

  [
    sheetCat, sheetClients, sheetProv, sheetPlantillas, sheetSist,
    sheetPlant, sheetMod, sheetIng, sheetAlm, sheetMarc, sheetAcab, sheetMat
  ].forEach((s) => {
    s.views = [{ state: "frozen", ySplit: 1, xSplit: 0 }];
    s.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: s.columnCount } };
    s.getRow(1).font = { bold: true, color: { argb: "FF0F172A" } };
    s.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF8FAFC" },
    };
    s.getRow(1).border = { bottom: { style: "medium", color: { argb: "FFCBD5E1" } } };
  });
}
