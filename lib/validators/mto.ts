import { z } from "zod";

// Detalle (Items de la cotización)
export const cotizacionDetalleSchema = z.object({
  id_modelo: z.string().optional(), // ID Plantilla or Free text
  color_perfiles: z.string().optional(),
  cantidad: z.coerce.number().min(1, "Cantidad mínima 1"),
  ancho_mm: z.coerce.number().min(0).optional(),
  alto_mm: z.coerce.number().min(0).optional(),
  etiqueta_item: z.string().optional(), // e.g. "V-01"
  ubicacion: z.string().optional(), // e.g. "Dormitorio Principal"
  tipo_cierre: z.string().optional(),
  tipo_vidrio: z.string().optional(),
  grupo_opcion: z.string().optional(), // Deprecated or for backward compat
  opciones_seleccionadas: z.record(z.string(), z.any()).optional(), // JSONB { "TIPO_BRAZO": "BRA30F" }
  costo_base_ref: z.coerce.number().optional(),
  subtotal_linea: z.coerce.number().optional(),
});

// Cabecera
export const cotizacionCabeceraSchema = z.object({
  id_cliente: z.string().min(1, "Cliente es requerido"),
  nombre_proyecto: z.string().min(1, "Nombre del proyecto es requerido"),
  id_marca: z.string().optional(),
  fecha_emision: z.date().optional(),
  moneda: z.enum(["PEN", "USD"]),
  validez_dias: z.coerce.number().default(15),
  plazo_entrega: z.string().optional(),
  condicion_pago: z.string().optional(),
  incluye_igv: z.boolean().default(true),
  observaciones: z.string().optional(),
  estado: z.string().optional(), // Borrador, Enviado, Aprobado, Rechazado

  // Financials
  costo_mano_obra_m2: z.coerce.number().optional(),
  costo_global_instalacion: z.coerce.number().optional(), // Deprecated, usar costo_fijo_instalacion
  costo_fijo_instalacion: z.coerce.number().optional(), // Nuevo: costo fijo de instalación a nivel cotización
  markup_aplicado: z.coerce.number().optional(),

  detalles: z
    .array(cotizacionDetalleSchema)
    .min(1, "Debe agregar al menos un item"),
});

export type CotizacionForm = z.infer<typeof cotizacionCabeceraSchema>;
export type CotizacionDetalleForm = z.infer<typeof cotizacionDetalleSchema>;
