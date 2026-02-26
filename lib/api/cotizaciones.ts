import { supabase } from "@/lib/supabase/client";
import { CotizacionForm } from "@/lib/validators/mto";

export const cotizacionesApi = {
  /**
   * Obtiene todas las cotizaciones con datos de cliente.
   */
  getCotizaciones: async () => {
    // Usamos la vista para traer ya los totales calculados si es posible,
    // o la tabla base si la vista es muy pesada. Por ahora tabla base + joins.
    // Pero idealmente usariamos vw_cotizaciones_totales para mostrar el "Total" real en la lista.
    const { data, error } = await supabase
      .from("vw_cotizaciones_totales") // Usamos la vista poderosa
      .select(
        `
                *,
                mst_clientes (nombre_completo)
            `,
      )
      .order("fecha_emision", { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene una cotización específica con sus detalles y desglose.
   */
  getCotizacionById: async (id: string) => {
    const { data: cabecera, error: cabeceraError } = await supabase
      .from("vw_cotizaciones_totales")
      .select(`*, mst_clientes(*)`)
      .eq("id_cotizacion", id)
      .single();

    if (cabeceraError) throw cabeceraError;

    const { data: detalles, error: detallesError } = await supabase
      .from("vw_cotizaciones_detalladas")
      .select("*")
      .eq("id_cotizacion", id);

    if (detallesError) throw detallesError;

    return { ...cabecera, detalles };
  },

  /**
   * Crea la cabecera de la cotización.
   */
  createCotizacion: async (data: Partial<CotizacionForm>) => {
    // 1. Fetch Default Markup and MO Cost from Config
    const { data: configData } = await supabase
      .from("mst_config_general")
      .select("markup_cotizaciones_default, costo_mo_m2_default")
      .single();

    const defaultMarkup = configData?.markup_cotizaciones_default || 0.35;
    const defaultMoCost = configData?.costo_mo_m2_default || 0;

    // 2. Create Header with Snapshot of Config values
    const { data: newRow, error } = await supabase
      .from("trx_cotizaciones_cabecera")
      .insert({
        id_cliente: data.id_cliente,
        nombre_proyecto: data.nombre_proyecto,
        id_marca: data.id_marca,
        estado: "Borrador",
        moneda: data.moneda || "PEN",
        validez_dias: 15,
        incluye_igv: true,
        markup_aplicado: defaultMarkup, // Freeze current config value
        costo_mano_obra_m2: defaultMoCost, // Freeze current labor cost
      })
      .select()
      .single();

    console.log("API createCotizacion result:", newRow, error);

    if (error) throw error;
    return newRow;
  },

  /**
   * Actualiza la cabecera de la cotización.
   */
  updateCotizacion: async (id: string, updates: Partial<any>) => {
    const { data, error } = await supabase
      .from("trx_cotizaciones_cabecera")
      .update(updates)
      .eq("id_cotizacion", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualiza el estado de la cotización (Aprobar/Rechazar/Anular).
   */
  updateEstado: async (
    id: string,
    nuevoEstado: string,
    motivoRechazo?: string,
  ) => {
    const updates: any = {
      estado: nuevoEstado,
    };

    const now = new Date().toISOString();

    if (nuevoEstado === "Aprobada") {
      updates.fecha_aprobacion = now;
      updates.fecha_rechazo = null;
      updates.motivo_rechazo = null;
    } else if (nuevoEstado === "Rechazada") {
      updates.fecha_rechazo = now;
      updates.motivo_rechazo = motivoRechazo;
      updates.fecha_aprobacion = null;
    } else if (nuevoEstado === "Finalizada") {
      updates.fecha_entrega_real = now;
    } else if (nuevoEstado === "Borrador") {
      // Reset audit if going back to draft (optional, depending on business logic)
      updates.fecha_aprobacion = null;
      updates.fecha_rechazo = null;
      updates.motivo_rechazo = null;
    }

    const { data, error } = await supabase
      .from("trx_cotizaciones_cabecera")
      .update(updates)
      .eq("id_cotizacion", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Agrega una linea (Ventana/Ítem) a la cotización.
   */
  addLineItem: async (idCotizacion: string, item: any) => {
    const { data, error } = await supabase
      .from("trx_cotizaciones_detalle")
      .insert({
        id_cotizacion: idCotizacion,
        id_modelo: item.id_modelo,
        color_perfiles: item.color_perfiles,
        cantidad: item.cantidad,
        ancho_mm: item.ancho_mm,
        alto_mm: item.alto_mm,
        tipo_vidrio: item.tipo_vidrio,
        tipo_cierre: item.tipo_cierre,
        etiqueta_item: item.etiqueta_item,
        ubicacion: item.ubicacion,
        opciones_seleccionadas: item.opciones_seleccionadas || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * EJECUTA LA MAGIA: Dispara el despiece automático en base de datos via RPC.
   */
  triggerDespiece: async (idLineaCot: string) => {
    const { error } = await supabase.rpc("fn_generar_despiece_ingenieria", {
      p_id_linea_cot: idLineaCot,
    });

    if (error) throw error;
    return true;
  },

  /**
   * Inserta manualmente un item de desglose (para Servicios o Extras).
   */
  addDesgloseItem: async (item: any) => {
    const { data, error } = await supabase
      .from("trx_desglose_materiales")
      .insert(item)
      .select();
    if (error) throw error;
    return data;
  },

  updateDesgloseItem: async (id: string, updates: any) => {
    // Ensure new fields are passed
    const { data, error } = await supabase
      .from("trx_desglose_materiales")
      .update({
        nombre_componente: updates.nombre_componente,
        sku_real: updates.sku_real,
        cantidad_calculada: updates.cantidad_calculada,
        costo_total_item: updates.costo_total_item,
        tipo_componente: updates.tipo_componente,
        medida_corte_mm: updates.medida_corte_mm,
        detalle_formula: updates.detalle_formula,
      })
      .eq("id_desglose", id)
      .select();
    if (error) throw error;
    return data;
  },

  deleteDesgloseItem: async (id: string) => {
    const { error } = await supabase
      .from("trx_desglose_materiales")
      .delete()
      .eq("id_desglose", id);
    if (error) throw error;
    return true;
  },

  setManualFlag: async (idLineaCot: string, isManual: boolean) => {
    const { error } = await supabase
      .from("trx_cotizaciones_detalle")
      .update({ es_despiece_manual: isManual })
      .eq("id_linea_cot", idLineaCot);
    if (error) throw error;
    return true;
  },

  /**
   * Obtiene el desglose de materiales para visualización.
   */
  getDesgloseMateriales: async (idLineaCot: string) => {
    const { data, error } = await supabase
      .from("trx_desglose_materiales")
      .select("*")
      .eq("id_linea_cot", idLineaCot);

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene el reporte detallado de ingeniería para toda la cotización.
   */
  getReporteDesglose: async (idCotizacion: string) => {
    const { data, error } = await supabase
      .from("vw_reporte_desglose")
      .select("*")
      .eq("id_cotizacion", idCotizacion);

    if (error) throw error;
    return data;
  },

  // Auxiliares para el Dialogo de Items
  getSistemas: async () => {
    const { data, error } = await supabase
      .from("mst_series_equivalencias")
      .select("*")
      .order("nombre_comercial");
    if (error) throw error;
    return data;
  },

  // Fetching Engineering Recipes with system info for filtering
  // Obtener IDs de recetas (OPTIMIZED) - Used by Item Dialog
  getRecetasIDs: async () => {
    const { data, error } = await supabase
      .from("mst_recetas_modelos")
      .select("id_modelo, id_sistema")
      .eq("activo", true)
      .order("id_modelo");

    if (error) throw error;
    return data;
  },

  // Filtrar modelos por sistema seleccionado (OPTIMIZED)
  getModelosBySistema: async (idSistema: string) => {
    // Query mst_recetas_modelos directly instead of scanning engineering table
    const { data, error } = await supabase
      .from("mst_recetas_modelos")
      .select("id_modelo, nombre_comercial, descripcion")
      .eq("id_sistema", idSistema)
      .eq("activo", true)
      .order("id_modelo");

    if (error) throw error;
    return data;
  },

  getModelos: async () => {
    const { data, error } = await supabase
      .from("mst_recetas_modelos")
      .select("id_modelo")
      .eq("activo", true)
      .order("id_modelo");

    if (error) throw error;
    return data;
  },

  getVidrios: async () => {
    const { data, error } = await supabase
      .from("cat_productos_variantes")
      .select(
        `
                id_sku,
                nombre_completo,
                costo_mercado_unit,
                es_templado,
                espesor_mm,
                cat_plantillas!inner(id_familia)
            `,
      )
      .eq("cat_plantillas.id_familia", "VID")
      .order("nombre_completo");
    if (error) throw error;
    return data;
  },

  // Sprint 2 Features
  clonarCotizacion: async (id_cotizacion: string) => {
    const { data, error } = await supabase.rpc("fn_clonar_cotizacion", {
      p_id_cotizacion: id_cotizacion,
    });
    if (error) throw error;
    return data; // Returns new ID
  },

  clonarItem: async (id_linea_cot: string) => {
    const { data, error } = await supabase.rpc("fn_clonar_item_cotizacion", {
      p_id_linea_cot: id_linea_cot,
    });
    if (error) throw error;
    return data; // Returns new ID
  },

  updateLineItems: async (ids: string[], updates: any) => {
    const { data, error } = await supabase
      .from("trx_cotizaciones_detalle")
      .update(updates)
      .in("id_linea_cot", ids)
      .select();

    if (error) throw error;
    return data;
  },

  deleteLineItem: async (id: string) => {
    const { error } = await supabase
      .from("trx_cotizaciones_detalle")
      .delete()
      .eq("id_linea_cot", id);

    if (error) throw error;
    return true;
    if (error) throw error;
    return true;
  },

  deleteCotizacion: async (id: string) => {
    // First delete details (if not cascaded by DB, but usually good practice to be explicit or rely on FK)
    // Assuming FK has ON DELETE CASCADE, we just delete header.
    const { error } = await supabase
      .from("trx_cotizaciones_cabecera")
      .delete()
      .eq("id_cotizacion", id);

    if (error) throw error;
    return true;
  },

  // Master Data
  getAcabados: async () => {
    // Solo retornar colores/acabados que aplican a perfiles de aluminio
    const { data, error } = await supabase
      .from("mst_acabados_colores")
      .select("*")
      .in("id_acabado", ["BLA", "CHA", "MAD", "MAT", "NEG"])
      .order("nombre_acabado");
    if (error) throw error;
    return data;
  },

  // Header & Clientes
  getClientes: async () => {
    const { data, error } = await supabase
      .from("mst_clientes")
      .select("*")
      .order("nombre_completo");
    if (error) throw error;
    return data;
  },

  getMarcas: async () => {
    const { data, error } = await supabase
      .from("mst_marcas")
      .select("*")
      .order("nombre_marca");
    if (error) throw error;
    return data;
  },

  getGlobalConfig: async () => {
    const { data, error } = await supabase
      .from("mst_config_general")
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
};
