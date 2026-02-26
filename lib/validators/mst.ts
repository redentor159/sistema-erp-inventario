import { z } from "zod";

export const configGeneralSchema = z.object({
  id_config: z.string().min(1, "ID is required"),

  // === EMPRESA ===
  nombre_empresa: z.string().optional(),
  ruc: z.string().optional(),
  direccion_fiscal: z.string().optional(),
  telefono_contacto: z.string().optional(),
  email_empresa: z.string().email().optional().or(z.literal("")),
  logo_url: z.string().optional(),

  // === COTIZACIÓN ===
  margen_ganancia_default: z.number().min(0).max(1),
  markup_cotizaciones_default: z.number().min(0),
  costo_mo_m2_default: z.number().min(0),
  validez_cotizacion_dias: z.number().int().min(1).optional(),
  descuento_maximo_pct: z.number().min(0).max(1).optional(),

  // === FINANZAS ===
  igv: z.number().min(0).max(1),
  tipo_cambio_referencial: z.number().positive(),
  moneda_default: z.enum(["PEN", "USD"]).optional(),

  // === BANCOS ===
  cuenta_bcp_soles: z.string().optional(),
  cuenta_bcp_dolares: z.string().optional(),
  cci_soles: z.string().optional(),
  cci_dolares: z.string().optional(),

  cuenta_bbva_soles: z.string().optional(),
  cuenta_bbva_dolares: z.string().optional(),
  cci_bbva_soles: z.string().optional(),
  cci_bbva_dolares: z.string().optional(),

  nombre_titular_cuenta: z.string().optional(),

  // === TEXTOS ===
  texto_condiciones_base: z.string().optional(),
  texto_garantia: z.string().optional(),
  texto_forma_pago: z.string().optional(),
  notas_pie_cotizacion: z.string().optional(),

  // === PERSONALIZACIÓN ===
  firma_digital_url: z.string().optional(),
  nombre_representante: z.string().optional(),
  cargo_representante: z.string().optional(),
  color_primario: z.string().optional(),

  // Legacy
  periodo_cierres_contables: z.string().optional(),
});

export const clienteSchema = z.object({
  id_cliente: z.string().min(1, "ID is required"),
  nombre_completo: z.string().min(1, "Name is required"),
  ruc: z
    .string()
    .length(11, "RUC must be 11 digits")
    .regex(/^\d+$/, "RUC must be numeric"),
  telefono: z.string().optional(),
  direccion_obra_principal: z.string().optional(),
  tipo_cliente: z.enum(["EMPRESA", "PERSONA"]),
});

export const proveedorSchema = z.object({
  id_proveedor: z.string().min(1, "ID is required"),
  razon_social: z.string().min(1, "Razon Social is required"),
  ruc: z
    .string()
    .length(11, "RUC must be 11 digits")
    .regex(/^\d+$/, "RUC must be numeric"),
  nombre_comercial: z.string().optional(),
  contacto_vendedor: z.string().optional(),
  telefono_pedidos: z.string().optional(),
  email_pedidos: z.string().email("Invalid email").optional().or(z.literal("")),
  dias_credito: z.number().int().min(0).optional(),
  moneda_predeterminada: z.enum(["PEN", "USD"]).optional(),
});

export type ConfigGeneralForm = z.infer<typeof configGeneralSchema>;
export type ClienteForm = z.infer<typeof clienteSchema>;
export type ProveedorForm = z.infer<typeof proveedorSchema>;
