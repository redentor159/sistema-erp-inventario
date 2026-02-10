
import { z } from "zod"

export const plantillaSchema = z.object({
    id_plantilla: z.string().min(1, "El Código es requerido"),
    nombre_generico: z.string().min(1, "El Nombre es requerido"),
    id_familia: z.string().optional(),
    id_sistema: z.string().optional(),
    largo_estandar_mm: z.coerce.number().min(0, "Debe ser mayor o igual a 0").optional(),
    peso_teorico_kg: z.coerce.number().min(0).optional(),
    imagen_ref: z.string().url("URL inválida").optional().or(z.literal("")),
})

export const productoVarianteSchema = z.object({
    id_sku: z.string().min(1, "SKU es requerido"),
    id_plantilla: z.string().optional(),
    id_marca: z.string().optional(),
    id_material: z.string().optional(),
    id_acabado: z.string().optional(),
    cod_proveedor: z.string().optional(),
    nombre_completo: z.string().min(1, "Nombre completo requerido"),
    unidad_medida: z.string().optional(),
    costo_mercado_unit: z.coerce.number().min(0, "El costo debe ser mayor a 0"),
    moneda_reposicion: z.enum(["PEN", "USD"]).optional(),
    es_templado: z.boolean().optional(),
    espesor_mm: z.coerce.number().optional(),
    costo_flete_m2: z.coerce.number().optional()
})

export type PlantillaForm = z.infer<typeof plantillaSchema>
export type ProductoVarianteForm = z.infer<typeof productoVarianteSchema>
