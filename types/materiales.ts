/**
 * Tipos para el módulo de materiales y desglose de ingeniería
 * @module types/materiales
 */

/**
 * Desglose de materiales generado por la función de ingeniería
 */
export interface TrxDesgloseMateriales {
  id_desglose: string;
  id_linea_cot: string;
  sku_real: string;
  nombre_componente: string;
  tipo_componente: "Perfil" | "Vidrio" | "Accesorio" | "Servicio";
  cantidad_calculada: number;
  medida_corte_mm?: number;
  costo_unit_mercado: number;
  costo_total_item: number;
  detalle_formula?: string; // Formula usada para cálculo
  created_at?: string;
}

/**
 * Sistema de perfiles (25M, 38M, 50M, etc.)
 */
export interface MstSistema {
  id_sistema: string;
  nombre_comercial: string;
  familia: string;
  activo: boolean;
}

/**
 * Receta de ingeniería (BOM)
 */
export interface MstReceta {
  id_receta: string;
  id_modelo: string;
  id_sistema: string;
  id_plantilla: string;
  nombre_componente: string;
  tipo: "Perfil" | "Vidrio" | "Accesorio" | "Servicio";
  id_material_receta?: string;
  id_acabado_receta?: string;
  id_marca_receta?: string;
}

/**
 * Catálogo de vidrios
 */
export interface CatVidrio {
  id_sku: string;
  id_plantilla: string;
  nombre_completo: string;
  espesor_mm?: number;
  costo_mercado_unit: number;
  unidad_medida: string;
}

/**
 * Acabados de aluminio (colores)
 */
export interface MstAcabado {
  id_acabado: string;
  nombre_acabado: string;
  tipo_acabado: "Anodizado" | "Pintado" | "Natural";
}

/**
 * Marcas de sistemas
 */
export interface MstMarca {
  id_marca: string;
  nombre_marca: string;
}
