
import { z } from "zod"

// ═══════════════════════════════════════════════════
// PLANTILLA SCHEMA — Matches cat_plantillas exactly
// ═══════════════════════════════════════════════════
export const plantillaSchema = z.object({
    id_plantilla: z.string().min(1, "ID Plantilla es requerido"),    // TEXT PK
    nombre_generico: z.string().min(1, "El Nombre es requerido"),    // TEXT NOT NULL
    id_familia: z.string().optional().nullable(),                     // TEXT FK nullable
    id_sistema: z.string().optional().nullable(),                     // TEXT FK nullable
    largo_estandar_mm: z.coerce.number().min(0).optional().nullable(), // NUMERIC nullable
    peso_teorico_kg: z.coerce.number().min(0).optional().nullable(),   // NUMERIC nullable
    imagen_ref: z.string().url("URL inválida").optional().or(z.literal("")).nullable(),
})

// ═══════════════════════════════════════════════════
// PRODUCTO VARIANTE SCHEMA — Matches cat_productos_variantes exactly
// ═══════════════════════════════════════════════════
export const productoVarianteSchema = z.object({
    // === IDENTIDAD (PKs y FKs obligatorias) ===
    id_sku: z.string().min(1, "SKU es requerido"),                   // TEXT PK (auto-generated)
    id_plantilla: z.string().min(1, "Plantilla es requerida"),       // TEXT FK required
    id_marca: z.string().min(1, "Marca es requerida"),               // TEXT FK required
    id_material: z.string().min(1, "Material es requerido"),         // TEXT FK required
    id_acabado: z.string().min(1, "Acabado es requerido"),           // TEXT FK required

    // === DATOS GENERALES ===
    cod_proveedor: z.string().optional().nullable(),                  // TEXT nullable
    nombre_completo: z.string().min(1, "Nombre completo requerido"), // TEXT NOT NULL
    unidad_medida: z.string().optional().nullable(),                  // TEXT nullable

    // === COSTOS ===
    costo_mercado_unit: z.coerce.number().min(0, "El costo debe ser ≥ 0").optional().nullable(),
    moneda_reposicion: z.enum(["PEN", "USD"]).optional().nullable(),

    // === PROPIEDADES VIDRIO (condicional) ===
    es_templado: z.boolean().optional().nullable(),
    espesor_mm: z.coerce.number().optional().nullable(),
    costo_flete_m2: z.coerce.number().optional().nullable(),

    // === PARÁMETROS INVENTARIO ===
    stock_minimo: z.coerce.number().min(0).optional().nullable(),
    punto_pedido: z.coerce.number().min(0).optional().nullable(),
    tiempo_reposicion_dias: z.coerce.number().int().min(0).optional().nullable(),
    lote_econ_compra: z.coerce.number().min(0).optional().nullable(),
    demanda_promedio_diaria: z.coerce.number().min(0).optional().nullable(),
})

export type PlantillaForm = z.infer<typeof plantillaSchema>
export type ProductoVarianteForm = z.infer<typeof productoVarianteSchema>
