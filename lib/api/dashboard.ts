import { supabase } from "@/lib/supabase/client";

export const dashboardApi = {
  getValorizacion: async () => {
    const { data, error } = await supabase
      .from("vw_kpi_valorizacion")
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  getOTIF: async () => {
    const { data, error } = await supabase
      .from("vw_kpi_otif")
      .select("*")
      .order("mes", { ascending: false })
      .limit(6); // Last 6 months
    if (error) throw error;
    return data;
  },

  getABC: async () => {
    const { data, error } = await supabase
      .from("vw_kpi_abc_analisis")
      .select("*")
      .order("valor_salida", { ascending: false })
      .limit(20); // Top 20 for chart
    if (error) throw error;
    return data;
  },

  getDynamicABC: async (days: number | null) => {
    // Call the RPC function 'get_abc_analysis_v2'
    const { data, error } = await supabase.rpc("get_abc_analysis_v2", {
      p_dias: days,
    });
    if (error) throw error;
    return data.slice(0, 20); // Limit to top 20 here as well
  },

  getABCInventoryValuation: async () => {
    const { data, error } = await supabase.rpc("get_abc_inventory_valuation");
    if (error) throw error;
    return data.slice(0, 20);
  },

  getStockCritico: async () => {
    const { data, error } = await supabase
      .from("vw_dashboard_stock_realtime")
      .select("*")
      .or("estado_abastecimiento.eq.CRITICO,estado_abastecimiento.eq.ALERTA")
      .order("stock_actual", { ascending: true });
    if (error) throw error;
    return data;
  },

  getConversion: async () => {
    const { data, error } = await supabase
      .from("vw_kpi_conversion")
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  getTicket: async () => {
    const { data, error } = await supabase
      .from("vw_kpi_ticket_promedio")
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  getTopProducts: async () => {
    const { data, error } = await supabase
      .from("vw_kpi_top_productos")
      .select("*")
      .limit(10);
    if (error) throw error;
    return data;
  },

  getRetazos: async () => {
    const { data, error } = await supabase
      .from("vw_kpi_retazos_valorizados")
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  getMargin: async () => {
    const { data, error } = await supabase
      .from("vw_kpi_margen_real")
      .select("*")
      .order("mes", { ascending: false })
      .limit(6);
    if (error) throw error;
    return data;
  },

  getSalesCycle: async () => {
    const { data, error } = await supabase
      .from("vw_kpi_ciclo_ventas")
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  getZombies: async () => {
    const { data, error } = await supabase
      .from("vw_kpi_stock_zombie")
      .select("*")
      .limit(10);
    if (error) throw error;
    return data;
  },
};
