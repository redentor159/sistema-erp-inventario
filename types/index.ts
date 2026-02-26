export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// 1. CAPA MAESTRA (MST)
export interface MstConfigGeneral {
  id_config: string;
  margen_ganancia_default: number;
  igv: number;
  markup_cotizaciones_default: number;
  costo_mo_m2_default: number;
  tipo_cambio_referencial: number;

  // Banks
  cuenta_bcp_soles?: string;
  cuenta_bcp_dolares?: string;
  cci_soles?: string;
  cci_dolares?: string;
  // BBVA
  cuenta_bbva_soles?: string;
  cuenta_bbva_dolares?: string;
  cci_bbva_soles?: string;
  cci_bbva_dolares?: string;
  nombre_titular_cuenta?: string;

  // Texts
  texto_condiciones_base?: string;
  texto_garantia?: string;
  texto_forma_pago?: string;
  notas_pie_cotizacion?: string;

  // Company Info
  nombre_empresa?: string;
  ruc?: string;
  direccion_fiscal?: string;
  telefono_contacto?: string;
  email_empresa?: string;
  logo_url?: string;

  // Personalization
  firma_digital_url?: string;
  nombre_representante?: string;
  cargo_representante?: string;
  color_primario?: string;
  moneda_default?: "PEN" | "USD";

  // Other Defaults
  validez_cotizacion_dias?: number;
  descuento_maximo_pct?: number;
}

export interface MstCliente {
  id_cliente: string;
  nombre_completo: string;
  ruc: string;
  telefono?: string;
  direccion_obra_principal?: string;
  tipo_cliente: "EMPRESA" | "PERSONA";
}

export interface MstProveedor {
  id_proveedor: string;
  razon_social: string;
  ruc: string;
  nombre_comercial?: string;
  contacto_vendedor?: string;
  telefono_pedidos?: string;
  email_pedidos?: string;
  dias_credito?: number;
  moneda_predeterminada?: "PEN" | "USD";
}

export interface MstFamilia {
  id_familia: string;
  nombre_familia: string;
  categoria_odoo?: string;
}

export interface MstMarca {
  id_marca: string;
  nombre_marca: string;
  pais_origen?: string;
}

export interface MstMaterial {
  id_material: string;
  nombre_material: string;
  odoo_code?: string;
}

export interface MstAcabado {
  id_acabado: string;
  nombre_acabado: string;
  sufijo_sku?: string;
}

export interface MstSerieEquivalencia {
  id_sistema: string;
  nombre_comercial: string;
  cod_corrales?: string;
  cod_eduholding?: string;
  cod_hpd?: string;
  cod_limatambo?: string;
  uso_principal?: string;
}

// 2. CAPA CATALOGO (CAT)
export interface CatPlantilla {
  id_plantilla: string;
  nombre_generico: string;
  id_familia?: string;
  id_sistema?: string;
  largo_estandar_mm?: number;
  peso_teorico_kg?: number;
  imagen_ref?: string;
}

export interface CatProductoVariante {
  id_sku: string;
  id_plantilla?: string;
  id_marca?: string;
  id_material?: string;
  id_acabado?: string;
  cod_proveedor?: string;
  nombre_completo: string;
  unidad_medida?: string;
  costo_mercado_unit?: number;
  moneda_reposicion?: string;
  fecha_act_precio?: string;
  es_templado?: boolean;
  espesor_mm?: number;
  costo_flete_m2?: number;
  stock_minimo?: number;
  punto_pedido?: number;
  tiempo_reposicion_dias?: number;
  lote_econ_compra?: number;
  demanda_promedio_diaria?: number;
}

// === MÓDULO: MATERIALES Y DESGLOSE ===
export * from "./materiales";

// ============================================================================
// COTIZACIONES - Tipos especializados
// ============================================================================
