import { supabase } from "@/lib/supabase/client";
import { CotizacionForm } from "@/lib/validators/mto";

export const mtoApi = {
  // --- COTIZACIONES ---
  getCotizaciones: async () => {
    const { data, error } = await supabase
      .from("trx_cotizaciones_cabecera")
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

  createCotizacion: async (cotizacion: CotizacionForm) => {
    // LLamada a la RPC atómica para crear Cabecera + Detalles + Generar Despiece
    const { data: cotizacionId, error } = await supabase.rpc(
      "fn_crear_cotizacion_mto",
      {
        p_id_cliente: cotizacion.id_cliente,
        p_nombre_proyecto: cotizacion.nombre_proyecto,
        p_id_marca: cotizacion.id_marca,
        p_fecha_emision: cotizacion.fecha_emision,
        p_moneda: cotizacion.moneda,
        p_validez_dias: cotizacion.validez_dias,
        p_plazo_entrega: cotizacion.plazo_entrega,
        p_condicion_pago: cotizacion.condicion_pago,
        p_incluye_igv: cotizacion.incluye_igv,
        p_observaciones: cotizacion.observaciones,
        p_costo_mano_obra_m2: cotizacion.costo_mano_obra_m2,
        p_costo_global_instalacion: cotizacion.costo_global_instalacion,
        p_markup_aplicado: cotizacion.markup_aplicado,
        p_detalles: cotizacion.detalles,
      },
    );

    if (error) throw error;
    if (!cotizacionId) throw new Error("No se pudo crear la cotización");

    return { id_cotizacion: cotizacionId };
  },
};
