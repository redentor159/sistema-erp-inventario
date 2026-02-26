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

  [sheetHeaders, sheetDetails, sheetBom, sheetProd].forEach((s) => {
    s.getRow(1).font = { bold: true };
    s.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9E1F2" },
    };
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

  [sheetStock, sheetOffcuts, sheetZombie].forEach((s) => {
    s.getRow(1).font = { bold: true };
    s.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2EFDA" },
    };
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

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFCE4D6" },
  };
}

// --- 4. MASTER DATA EXPORT (NEW) ---
async function generateMasterDataExcel(workbook: ExcelJS.Workbook) {
  const sheetCat = workbook.addWorksheet("Dim_SKU_Catalogo");
  sheetCat.columns = [
    { header: "id_sku", key: "id_sku", width: 20 },
    { header: "nombre_completo", key: "nombre_completo", width: 40 },
    { header: "id_marca", key: "id_marca", width: 15 },
    { header: "id_material", key: "id_material", width: 15 },
    { header: "id_acabado", key: "id_acabado", width: 15 },
    { header: "id_sistema", key: "id_sistema", width: 15 },
    { header: "costo_mercado_unit", key: "costo_mercado_unit", width: 15 },
    { header: "lote_econ_compra", key: "lote_econ_compra", width: 15 },
    {
      header: "tiempo_reposicion_dias",
      key: "tiempo_reposicion_dias",
      width: 20,
    },
  ];
  const queryCatData = supabase.from("cat_productos_variantes").select("*");
  const catData = await fetchAllRows(queryCatData);
  catData?.forEach((row: any) => sheetCat.addRow(row));

  const sheetClients = workbook.addWorksheet("Dim_Clientes");
  sheetClients.columns = [
    { header: "id_cliente", key: "id_cliente", width: 20 },
    { header: "ruc", key: "ruc", width: 15 },
    { header: "nombre_completo", key: "nombre_completo", width: 40 },
    { header: "tipo_cliente", key: "tipo_cliente", width: 15 },
  ];
  const queryCData = supabase.from("mst_clientes").select("*");
  const cData = await fetchAllRows(queryCData);
  cData?.forEach((row: any) => sheetClients.addRow(row));

  const sheetProv = workbook.addWorksheet("Dim_Proveedores");
  sheetProv.columns = [
    { header: "id_proveedor", key: "id_proveedor", width: 20 },
    { header: "ruc", key: "ruc", width: 15 },
    { header: "razon_social", key: "razon_social", width: 40 },
    { header: "dias_credito", key: "dias_credito", width: 15 },
  ];
  const queryPData = supabase.from("mst_proveedores").select("*");
  const pData = await fetchAllRows(queryPData);
  pData?.forEach((row: any) => sheetProv.addRow(row));

  const sheetPlantillas = workbook.addWorksheet("Dim_Sistemas_Familias");
  sheetPlantillas.columns = [
    { header: "id_familia", key: "id_familia", width: 20 },
    { header: "nombre_familia", key: "nombre_familia", width: 40 },
    { header: "prefijo", key: "prefijo", width: 15 },
    { header: "categoria", key: "categoria", width: 15 },
  ];
  const queryFamData = supabase.from("mst_familias").select("*");
  const famData = await fetchAllRows(queryFamData);
  famData?.forEach((row: any) => sheetPlantillas.addRow(row));

  [sheetClients, sheetProv, sheetCat, sheetPlantillas].forEach((s) => {
    s.getRow(1).font = { bold: true };
    s.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFF2CC" },
    };
  });
}
