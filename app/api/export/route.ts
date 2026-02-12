
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import ExcelJS from "exceljs"

// Initialize Supabase Admin Client (server-side only)
// We use the service role key if available for full access, or the anon key if acting on behalf of user
// But here we'll use the environment variables directly as in other API routes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Or Service Role if needed for admin export
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: NextRequest) {
    try {
        const { type, date } = await req.json()
        const workbook = new ExcelJS.Workbook()
        workbook.creator = "Sistema ERP"
        workbook.created = new Date()

        if (type === 'sales') {
            await generateSalesExcel(workbook, date)
        } else if (type === 'inventory') {
            await generateInventoryExcel(workbook)
        } else if (type === 'movements') {
            await generateMovementsExcel(workbook, date)
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 })
        }

        // Buffer the file
        const buffer = await workbook.xlsx.writeBuffer()

        // Return the file
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="export_${type}.xlsx"`
            }
        })

    } catch (error: any) {
        console.error("API Export Error:", error)
        return NextResponse.json({
            error: error.message || "Internal Server Error",
            details: error.toString()
        }, { status: 500 })
    }
}

async function generateSalesExcel(workbook: ExcelJS.Workbook, dateFilter?: string) {
    // SHEET 1: RESUMEN VENTAS (Existing Logic)
    const sheet = workbook.addWorksheet("Resumen Ventas")

    // Fetch Data
    // Filter by Finalizada or Aprobada
    let query = supabase
        .from('trx_cotizaciones_cabecera')
        .select(`
            id_cotizacion,
            fecha_emision,
            estado,
            moneda,
            total_precio_venta,
            nombre_proyecto,
            validez_dias,
            plazo_entrega,
            condicion_pago,
            markup_aplicado,
            incluye_igv,
            aplica_detraccion,
            costo_mano_obra_m2,
            costo_global_instalacion,
            observaciones,
            fecha_prometida,
            fecha_entrega_real,
            terminos_personalizados,
            motivo_rechazo,
            mst_clientes (nombre_completo, ruc, telefono, direccion_obra_principal, tipo_cliente),
            mst_marcas (nombre_marca),
            trx_cotizaciones_detalle (
                etiqueta_item,
                cantidad,
                subtotal_linea,
                id_modelo,
                color_perfiles,
                ancho_mm,
                alto_mm,
                ubicacion,
                tipo_cierre,
                tipo_vidrio,
                grupo_opcion
            )
        `)
        .in('estado', ['Aprobada', 'Finalizada'])
        .order('fecha_emision', { ascending: false })
        .range(0, 19999)

    if (dateFilter) {
        const d = new Date(dateFilter)
        if (!isNaN(d.getTime())) {
            const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
            const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString()
            query = query.gte('fecha_emision', startOfMonth).lte('fecha_emision', endOfMonth)
        }
    }

    const { data: salesData, error: salesError } = await query
    if (salesError) throw salesError

    // Define Columns Sheet 1
    sheet.columns = [
        { header: "ID Cotización", key: "id", width: 36 },
        { header: "Fecha Emisión", key: "fecha", width: 15 },
        { header: "Cliente", key: "cliente", width: 30 },
        { header: "RUC/DNI", key: "ruc", width: 15 },
        { header: "Teléfono", key: "telefono", width: 15 },
        { header: "Dirección Obra", key: "dir_obra", width: 30 },
        { header: "Tipo Cliente", key: "tipo_cli", width: 10 },
        { header: "Proyecto", key: "proyecto", width: 25 },
        { header: "Marca", key: "marca", width: 15 },
        { header: "Estado", key: "estado", width: 15 },
        { header: "Moneda", key: "moneda", width: 10 },
        { header: "Total Venta", key: "total", width: 15 },
        { header: "Validez (Días)", key: "validez", width: 10 },
        { header: "Plazo Entrega", key: "plazo", width: 15 },
        { header: "Cond. Pago", key: "pago", width: 20 },
        { header: "Markup", key: "markup", width: 10 },
        { header: "Inc. IGV", key: "igv", width: 10 },
        { header: "Detracción", key: "detracc", width: 10 },
        { header: "M.O. / m2", key: "mo_m2", width: 12 },
        { header: "Inst. Global", key: "inst_global", width: 12 },
        { header: "Fecha Prometida", key: "f_prometida", width: 15 },
        { header: "Fecha Entrega Real", key: "f_entrega", width: 15 },
        { header: "Observaciones", key: "obs", width: 40 },
        { header: "Motivo Rechazo", key: "rechazo", width: 20 },
        { header: "Item Etiqueta", key: "item", width: 30 },
        { header: "Modelo", key: "modelo", width: 15 },
        { header: "Ubicación", key: "ubic", width: 15 },
        { header: "Cant", key: "cant", width: 10 },
        { header: "Ancho (mm)", key: "ancho", width: 10 },
        { header: "Alto (mm)", key: "alto", width: 10 },
        { header: "Color", key: "color", width: 15 },
        { header: "Vidrio", key: "vidrio", width: 20 },
        { header: "Cierre", key: "cierre", width: 15 },
        { header: "Opcion", key: "opcion", width: 15 },
        { header: "Total Línea", key: "total_linea", width: 15 },
    ]

    salesData.forEach((cot: any) => {
        const header = {
            id: cot.id_cotizacion,
            fecha: new Date(cot.fecha_emision).toLocaleDateString(),
            cliente: cot.mst_clientes?.nombre_completo || "Desconocido",
            ruc: cot.mst_clientes?.ruc || "",
            telefono: cot.mst_clientes?.telefono || "",
            dir_obra: cot.mst_clientes?.direccion_obra_principal || "",
            tipo_cli: cot.mst_clientes?.tipo_cliente || "",
            estado: cot.estado,
            moneda: cot.moneda,
            total: cot.moneda === 'PEN' ? `S/ ${cot.total_precio_venta}` : `$ ${cot.total_precio_venta}`,
            proyecto: cot.nombre_proyecto || "-",
            marca: cot.mst_marcas?.nombre_marca || "-",
            validez: cot.validez_dias,
            plazo: cot.plazo_entrega,
            pago: cot.condicion_pago,
            markup: cot.markup_aplicado,
            igv: cot.incluye_igv ? 'Sí' : 'No',
            detracc: cot.aplica_detraccion ? 'Sí' : 'No',
            mo_m2: cot.costo_mano_obra_m2,
            inst_global: cot.costo_global_instalacion,
            obs: cot.observaciones,
            f_prometida: cot.fecha_prometida ? new Date(cot.fecha_prometida).toLocaleDateString() : "-",
            f_entrega: cot.fecha_entrega_real ? new Date(cot.fecha_entrega_real).toLocaleDateString() : "-",
            rechazo: cot.motivo_rechazo || "-"
        }

        if (!cot.trx_cotizaciones_detalle || cot.trx_cotizaciones_detalle.length === 0) {
            sheet.addRow(header)
        } else {
            cot.trx_cotizaciones_detalle.forEach((det: any) => {
                sheet.addRow({
                    ...header,
                    item: det.etiqueta_item,
                    cant: det.cantidad,
                    total_linea: cot.moneda === 'PEN' ? `S/ ${det.subtotal_linea}` : `$ ${det.subtotal_linea}`,
                    modelo: det.id_modelo,
                    color: det.color_perfiles,
                    ancho: det.ancho_mm,
                    alto: det.alto_mm,
                    ubic: det.ubicacion,
                    cierre: det.tipo_cierre,
                    vidrio: det.tipo_vidrio,
                    opcion: det.grupo_opcion
                })
            })
        }
    })
    sheet.getRow(1).font = { bold: true }
    sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    }

    // SHEET 2: EXPLOSION DE INSUMOS (Despiece)
    const sheetBOM = workbook.addWorksheet("Insumos (Despiece)")
    sheetBOM.columns = [
        { header: "ID Cotización", key: "id", width: 36 },
        { header: "Proyecto", key: "proy", width: 25 },
        { header: "Item", key: "item", width: 20 },
        { header: "Modelo", key: "mod", width: 15 },
        { header: "Cant Item", key: "q_item", width: 10 },
        { header: "Tipo Insumo", key: "tipo", width: 15 },
        { header: "Nombre Insumo", key: "nombre", width: 30 },
        { header: "SKU Real", key: "sku", width: 20 },
        { header: "Descripción SKU", key: "desc_sku", width: 30 },
        { header: "Detalle Acabado", key: "acab", width: 15 },
        { header: "Medida Corte (mm)", key: "corte", width: 15 },
        { header: "Cantidad Total Insumo", key: "q_total", width: 15 },
        { header: "Costo Total (Est.)", key: "costo", width: 15 },
    ]

    // Fetch Desglose Data
    // Note: We don't filter by date here strictly to keep logic simple, or we can fetch only IDs from above.
    // For simplicity and robustness, we fetch last 20k rows of breakdown.
    const { data: bomData, error: bomError } = await supabase
        .from('vw_reporte_desglose')
        .select('*')
        .order('fecha_emision', { ascending: false })
        .range(0, 19999)

    if (bomData && !bomError) {
        bomData.forEach((row: any) => {
            sheetBOM.addRow({
                id: row.id_cotizacion,
                proy: row.nombre_proyecto,
                item: row.etiqueta_item,
                mod: row.id_modelo,
                q_item: row.cantidad_items,
                tipo: row.tipo_componente,
                nombre: row.nombre_componente,
                sku: row.sku_real,
                desc_sku: row.descripcion_sku,
                acab: row.detalle_acabado,
                corte: row.medida_corte_mm,
                q_total: row.cantidad_insumo_total,
                costo: `S/ ${(row.costo_total_item || 0).toFixed(2)}`
            })
        })
    }
    sheetBOM.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    }

    // SHEET 3: PRODUCCIÓN (KANBAN)
    const sheetProd = workbook.addWorksheet("Producción (Kanban)")
    sheetProd.columns = [
        { header: "ID Registro", key: "id", width: 36 },
        { header: "Origen", key: "origen", width: 15 },
        { header: "Estado", key: "estado", width: 20 },
        { header: "Cliente", key: "cli", width: 30 },
        { header: "Producto", key: "prod", width: 30 },
        { header: "Marca", key: "marca", width: 15 },
        { header: "Color", key: "color", width: 15 },
        { header: "Ancho (mm)", key: "w", width: 10 },
        { header: "Alto (mm)", key: "h", width: 10 },
        { header: "Fecha Entrega", key: "delivery", width: 15 },
        { header: "Fecha Término", key: "end", width: 15 },
    ]

    const { data: prodData, error: prodError } = await supabase
        .from('vw_reporte_produccion')
        .select('*')
        .limit(5000)

    if (prodData && !prodError) {
        prodData.forEach((row: any) => {
            sheetProd.addRow({
                id: row.id_registro,
                origen: row.origen,
                estado: row.estado_final || row.estado_actual,
                cli: row.client_name,
                prod: row.product_name,
                marca: row.brand,
                color: row.color,
                w: row.width_mm,
                h: row.height_mm,
                delivery: row.delivery_date ? new Date(row.delivery_date).toLocaleDateString() : "-",
                end: row.fecha_termino ? new Date(row.fecha_termino).toLocaleDateString() : "-"
            })
        })
    }
    sheetProd.getRow(1).font = { bold: true }
    sheetProd.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    }
}

// --- 2. INVENTORY EXPORT (Stock + Retazos + Zombies) ---
async function generateInventoryExcel(workbook: ExcelJS.Workbook) {
    // SHEET 1: STOCK VALORIZADO
    const sheet = workbook.addWorksheet("Inventario Valorizado")

    // ... Columns Definition (Same as before, keep logic) ...
    sheet.columns = [
        { header: "SKU", key: "sku", width: 18 },
        { header: "Descripción", key: "desc", width: 40 },
        { header: "Sistema", key: "sis", width: 20 },
        { header: "Familia", key: "fam", width: 20 },
        { header: "Marca", key: "marca", width: 15 },
        { header: "Material", key: "mat", width: 15 },
        { header: "Acabado", key: "acab", width: 15 },
        { header: "U.M.", key: "um", width: 10 },
        { header: "Cód. Prov.", key: "cod_prov", width: 15 },
        { header: "Moneda Rep.", key: "mon_rep", width: 10 },
        { header: "Stock Actual", key: "stock", width: 15 },
        { header: "Costo Prom. (S/)", key: "costo", width: 15 },
        { header: "Inv. Total (S/)", key: "valor", width: 15 },
        { header: "Prioridad", key: "prio", width: 10 },
        { header: "Stock Mínimo", key: "min", width: 12 },
        { header: "Punto Pedido", key: "pto", width: 12 },
        { header: "Templado", key: "temp", width: 10 },
        { header: "Espesor (mm)", key: "esp", width: 10 },
        { header: "Flete (m2)", key: "flete", width: 10 },
        { header: "Tiempo Rep. (Días)", key: "time_rep", width: 15 },
        { header: "Lote Compra", key: "lote", width: 12 },
        { header: "Demanda Prom.", key: "demanda", width: 12 },
        { header: "Última Act.", key: "last_update", width: 20 },
    ]

    // Use enriched view vw_stock_realtime
    const { data, error } = await supabase
        .from('vw_stock_realtime')
        .select('*')
        .order('id_sku', { ascending: true })
        .range(0, 19999)

    if (error) throw error

    data.forEach((item: any) => {
        sheet.addRow({
            sku: item.id_sku,
            desc: item.nombre_completo,
            sis: item.sistema_nombre || "-",
            fam: item.nombre_familia || "-",
            marca: item.nombre_marca || "-",
            mat: item.nombre_material || "-",
            acab: item.nombre_acabado || "-",
            um: item.unidad_medida,
            cod_prov: item.cod_proveedor || "-",
            mon_rep: item.moneda_reposicion || "-",
            stock: item.stock_actual,
            costo: `S/ ${(item.costo_promedio || 0).toFixed(2)}`,
            valor: `S/ ${(item.inversion_total || 0).toFixed(2)}`,
            prio: item.orden_prioridad === 1 ? 'Negativo' : (item.orden_prioridad === 2 ? 'Positivo' : 'Cero'),
            min: item.stock_minimo,
            pto: item.punto_pedido,
            temp: item.es_templado ? 'Sí' : 'No',
            esp: item.espesor_mm || "-",
            flete: item.costo_flete_m2 || "-",
            time_rep: item.tiempo_reposicion_dias,
            lote: item.lote_econ_compra,
            demanda: item.demanda_promedio_diaria,
            last_update: item.ultima_actualizacion ? new Date(item.ultima_actualizacion).toLocaleDateString() : "-"
        })
    })
    sheet.getRow(1).font = { bold: true }
    sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    }

    // SHEET 2: RETAZOS DISPONIBLES
    const sheetOffcuts = workbook.addWorksheet("Retazos Disponibles")
    sheetOffcuts.columns = [
        { header: "ID Retazo", key: "id", width: 36 },
        { header: "SKU Padre", key: "sku", width: 15 },
        { header: "Nombre Perfil", key: "nom", width: 30 },
        { header: "Longitud (mm)", key: "len", width: 15 },
        { header: "Ubicación", key: "ubic", width: 15 },
        { header: "Estado", key: "st", width: 10 },
        { header: "Orden Trabajo", key: "ot", width: 15 },
        { header: "Fecha Creación", key: "fecha", width: 15 },
        { header: "Valor Est. (S/)", key: "val", width: 15 },
    ]

    const { data: offData, error: offError } = await supabase.from('vw_reporte_retazos').select('*').limit(5000)
    if (offError) throw offError
    if (offData) {
        offData.forEach((r: any) => {
            sheetOffcuts.addRow({
                id: r.id_retazo,
                sku: r.id_sku_padre,
                nom: r.nombre_perfil,
                len: r.longitud_mm,
                ubic: r.ubicacion,
                st: r.estado,
                ot: r.orden_trabajo,
                fecha: new Date(r.fecha_creacion).toLocaleDateString(),
                val: `S/ ${r.valor_recuperable_estimado}`
            })
        })
    }
    sheetOffcuts.getRow(1).font = { bold: true }
    sheetOffcuts.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    }

    // SHEET 3: STOCK ZOMBIE (Slow Moving)
    const sheetZombie = workbook.addWorksheet("Stock Zombie (Inmovilizado)")
    sheetZombie.columns = [
        { header: "SKU", key: "sku", width: 15 },
        { header: "Producto", key: "prod", width: 30 },
        { header: "Stock Actual", key: "st", width: 10 },
        { header: "Costo Unit (S/)", key: "cost", width: 15 },
        { header: "Valor Estancado (S/)", key: "val", width: 15 },
        { header: "Última Salida", key: "last", width: 15 },
    ]
    const { data: zombieData, error: zombieError } = await supabase.from('vw_kpi_stock_zombie').select('*').limit(2000)
    if (zombieError) throw zombieError
    if (zombieData) {
        zombieData.forEach((z: any) => {
            sheetZombie.addRow({
                sku: z.id_sku,
                prod: z.nombre_completo,
                st: z.stock_actual,
                cost: `S/ ${(z.costo_unitario || 0).toFixed(2)}`,
                val: `S/ ${(z.valor_estancado || 0).toFixed(2)}`,
                last: z.ultima_salida_registrada ? new Date(z.ultima_salida_registrada).toLocaleDateString() : 'NUNCA'
            })
        })
    }
    sheetZombie.getRow(1).font = { bold: true }
    sheetZombie.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    }
}

async function generateMovementsExcel(workbook: ExcelJS.Workbook, dateFilter?: string) {
    const sheet = workbook.addWorksheet("Kardex de Movimientos")

    sheet.columns = [
        { header: "ID Movimiento", key: "id", width: 36 },
        { header: "Fecha Hora", key: "fecha", width: 20 },
        { header: "Tipo", key: "tipo", width: 15 },
        { header: "SKU", key: "sku", width: 15 },
        { header: "Producto", key: "desc", width: 40 },
        { header: "U.M.", key: "um", width: 8 },
        { header: "Familia", key: "fam", width: 15 },
        { header: "Marca", key: "marca", width: 15 },
        { header: "Almacén", key: "alm", width: 10 },
        { header: "Entidad (Cli/Prov)", key: "entidad", width: 30 },
        { header: "Doc. Físico", key: "doc_fis", width: 15 },
        { header: "Cantidad", key: "cant", width: 15 },
        { header: "Moneda Orig.", key: "mon_orig", width: 10 },
        { header: "Costo Unit. Doc", key: "costo_doc", width: 15 },
        { header: "T.C.", key: "tc", width: 10 },
        { header: "Costo Unit. PEN", key: "costo_u", width: 15 },
        { header: "Total PEN", key: "total", width: 15 },
        { header: "Usuario", key: "user", width: 15 },
        { header: "Motivo Ajuste", key: "motivo", width: 20 },
        { header: "Comentarios", key: "com", width: 30 },
    ]

    // Use view vw_kardex_reporte which resolves names
    let query = supabase
        .from('vw_kardex_reporte')
        .select('*')
        .order('fecha_hora', { ascending: false })
        .range(0, 19999)

    if (dateFilter) {
        const d = new Date(dateFilter)
        if (!isNaN(d.getTime())) {
            const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
            const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString()
            query = query.gte('fecha_hora', startOfMonth).lte('fecha_hora', endOfMonth)
        }
    }

    const { data, error } = await query
    if (error) throw error

    data.forEach((mov: any) => {
        sheet.addRow({
            id: mov.id_movimiento,
            fecha: new Date(mov.fecha_hora).toLocaleString(),
            tipo: mov.tipo_movimiento,
            sku: mov.id_sku,
            desc: mov.producto_nombre || "???",
            um: mov.unidad_medida,
            fam: mov.nombre_familia || "-",
            marca: mov.nombre_marca || "-",
            alm: mov.id_almacen || "PRINCIPAL",
            entidad: mov.entidad_nombre || "-",
            doc_fis: mov.nro_documento || "-",
            cant: mov.cantidad,
            mon_orig: mov.moneda_origen || "PEN",
            costo_doc: mov.costo_unit_doc,
            tc: mov.tipo_cambio,
            costo_u: (mov.costo_total_pen / (mov.cantidad !== 0 ? mov.cantidad : 1)).toFixed(2), // Derived unit cost PEN
            total: `S/ ${(mov.costo_total_pen || 0).toFixed(2)}`,
            user: mov.usuario_reg || "-",
            motivo: mov.motivo_ajuste || "-",
            com: mov.comentarios || "-"
        })
    })

    sheet.getRow(1).font = { bold: true }
}
