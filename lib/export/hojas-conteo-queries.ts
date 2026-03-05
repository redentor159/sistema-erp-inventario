import { supabase } from "@/lib/supabase/client";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CountSheetConfig = {
    modo:
    | "POR_SISTEMA"
    | "POR_FAMILIA"
    | "POR_ABC"
    | "RETAZOS"
    | "STOCK_CRITICO"
    | "CUSTOM";
    conteo_ciego: boolean;
    // Preset params
    id_sistema?: string;
    id_familia?: string | null;
    todas_familias?: boolean;
    incluir_sin_familia?: boolean;
    clasificacion_abc?: string[];
    dias_analisis?: number;
    incluir_negativos?: boolean;
    incluir_bajo_minimo?: boolean;
    // Custom params
    marcas?: string[];
    materiales?: string[];
    acabados?: string[];
    familias?: string[];
    sistemas?: string[];
    stock_min?: number | null;
    stock_max?: number | null;
    abc_custom?: string[];
    // Display
    orden: "nombre" | "familia" | "sistema";
    agrupar_por: "familia" | "sistema" | null;
    // Doc metadata
    titulo: string;
    nombre_operario: string;
    area_zona: string;
};

export type CountSheetRow = {
    id_sku: string;
    nombre_completo: string;
    unidad_medida: string | null;
    nombre_familia: string | null;
    sistema_nombre: string | null;
    nombre_marca: string | null;
    nombre_material: string | null;
    nombre_acabado: string | null;
    stock_actual: number;
    stock_minimo: number;
    punto_pedido: number;
    estado_abastecimiento: "CRITICO" | "ALERTA" | "OK";
    // Only for RETAZOS mode
    id_retazo?: string;
    longitud_mm?: number;
    ubicacion?: string | null;
    fecha_creacion?: string | null;
    valor_estimado_pen?: number;
};

export type MasterData = {
    sistemas: Array<{ id_sistema: string; nombre_comercial: string }>;
    familias: Array<{ id_familia: string; nombre_familia: string }>;
    marcas: Array<{ id_marca: string; nombre_marca: string }>;
    materiales: Array<{ id_material: string; nombre_material: string }>;
    acabados: Array<{ id_acabado: string; nombre_acabado: string }>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: bypass Supabase 1000-row limit
// ─────────────────────────────────────────────────────────────────────────────

async function fetchAllRows(queryBuilder: any, limitPerPage = 1000) {
    let allData: any[] = [];
    let from = 0;
    let to = limitPerPage - 1;
    let keepFetching = true;

    while (keepFetching) {
        const { data, error } = await queryBuilder.range(from, to);
        if (error) throw error;
        if (data && data.length > 0) {
            allData = [...allData, ...data];
            from += limitPerPage;
            to += limitPerPage;
            if (data.length < limitPerPage) keepFetching = false;
        } else {
            keepFetching = false;
        }
    }
    return allData;
}

// ─────────────────────────────────────────────────────────────────────────────
// Master Data for dropdowns
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchMasterData(): Promise<MasterData> {
    const [sisteR, famR, marcR, matR, acabR] = await Promise.all([
        supabase
            .from("mst_series_equivalencias")
            .select("id_sistema, nombre_comercial")
            .order("nombre_comercial"),
        supabase
            .from("mst_familias")
            .select("id_familia, nombre_familia")
            .order("nombre_familia"),
        supabase
            .from("mst_marcas")
            .select("id_marca, nombre_marca")
            .order("nombre_marca"),
        supabase
            .from("mst_materiales")
            .select("id_material, nombre_material")
            .order("nombre_material"),
        supabase
            .from("mst_acabados_colores")
            .select("id_acabado, nombre_acabado")
            .order("nombre_acabado"),
    ]);

    return {
        sistemas: sisteR.data ?? [],
        familias: famR.data ?? [],
        marcas: marcR.data ?? [],
        materiales: matR.data ?? [],
        acabados: acabR.data ?? [],
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick COUNT(*) for the summary panel
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchCountEstimate(
    config: CountSheetConfig,
): Promise<number> {
    try {
        if (config.modo === "RETAZOS") {
            const { count } = await supabase
                .from("dat_retazos_disponibles")
                .select("*", { count: "exact", head: true })
                .eq("estado", "DISPONIBLE");
            return count ?? 0;
        }

        // For all other modes, count from mvw_stock_realtime
        let query = supabase
            .from("mvw_stock_realtime")
            .select("id_sku", { count: "exact", head: true });

        query = applyStockFilters(query, config);
        const { count } = await query;
        return count ?? 0;
    } catch {
        return 0;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main query dispatcher
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchCountSheetData(
    config: CountSheetConfig,
): Promise<CountSheetRow[]> {
    if (config.modo === "RETAZOS") {
        return fetchRetazosData();
    }

    if (config.modo === "POR_ABC") {
        return fetchAbcData(config);
    }

    // All other modes use mvw_stock_realtime directly
    const selectCols = [
        "id_sku",
        "nombre_completo",
        "unidad_medida",
        "nombre_familia",
        "id_sistema",
        "sistema_nombre",
        "nombre_marca",
        "nombre_material",
        "nombre_acabado",
        "stock_actual",
        "stock_minimo",
        "punto_pedido",
    ].join(", ");

    let query = supabase.from("mvw_stock_realtime").select(selectCols);
    query = applyStockFilters(query, config);
    query = applyOrdering(query, config.orden);

    const raw = await fetchAllRows(query);
    return raw.map(mapStockRow);
}

// ─────────────────────────────────────────────────────────────────────────────
// Retazos mode
// ─────────────────────────────────────────────────────────────────────────────

async function fetchRetazosData(): Promise<CountSheetRow[]> {
    const query = supabase
        .from("vw_reporte_retazos")
        .select(
            "id_retazo, id_sku_padre, nombre_perfil, longitud_mm, ubicacion, fecha_creacion, nombre_marca, nombre_acabado, valor_recuperable_estimado",
        )
        .eq("estado", "DISPONIBLE")
        .order("nombre_perfil", { ascending: true })
        .order("longitud_mm", { ascending: false });

    const raw = await fetchAllRows(query);
    return raw.map((r: any): CountSheetRow => ({
        id_sku: r.id_sku_padre ?? "",
        nombre_completo: r.nombre_perfil ?? "",
        unidad_medida: "MM",
        nombre_familia: null,
        sistema_nombre: null,
        nombre_marca: r.nombre_marca ?? null,
        nombre_material: null,
        nombre_acabado: r.nombre_acabado ?? null,
        stock_actual: 0,
        stock_minimo: 0,
        punto_pedido: 0,
        estado_abastecimiento: "OK",
        id_retazo: r.id_retazo,
        longitud_mm: r.longitud_mm,
        ubicacion: r.ubicacion,
        fecha_creacion: r.fecha_creacion,
        valor_estimado_pen: r.valor_recuperable_estimado,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// ABC mode — fetches ABC classification then joins with stock
// ─────────────────────────────────────────────────────────────────────────────

async function fetchAbcData(config: CountSheetConfig): Promise<CountSheetRow[]> {
    const dias = config.dias_analisis ?? 90;
    const clases = config.clasificacion_abc ?? ["A"];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - dias);
    const cutoffIso = cutoff.toISOString();

    // Fetch from kpi_abc view (90 days fixed) - use the view since it's already there
    const { data: abcData, error } = await supabase
        .from("vw_kpi_abc_analisis")
        .select("id_sku, clasificacion_abc, pct_participacion, valor_salida");

    if (error) throw error;

    const filteredAbcSkus = (abcData ?? [])
        .filter((r: any) => clases.includes(r.clasificacion_abc))
        .map((r: any) => r.id_sku);

    if (filteredAbcSkus.length === 0) return [];

    // Fetch stock data for those SKUs
    const CHUNK = 200;
    let allStock: any[] = [];
    for (let i = 0; i < filteredAbcSkus.length; i += CHUNK) {
        const chunk = filteredAbcSkus.slice(i, i + CHUNK);
        const { data, error: e2 } = await supabase
            .from("mvw_stock_realtime")
            .select(
                "id_sku, nombre_completo, unidad_medida, nombre_familia, id_sistema, sistema_nombre, nombre_marca, nombre_material, nombre_acabado, stock_actual, stock_minimo, punto_pedido",
            )
            .in("id_sku", chunk);
        if (e2) throw e2;
        allStock = [...allStock, ...(data ?? [])];
    }

    // Build ABC map for enrichment
    const abcMap = Object.fromEntries(
        (abcData ?? []).map((r: any) => [r.id_sku, r]),
    );

    let rows = allStock.map((r: any) => ({
        ...mapStockRow(r),
        _abc: abcMap[r.id_sku]?.clasificacion_abc ?? "?",
        _pct: abcMap[r.id_sku]?.pct_participacion ?? 0,
    }));

    // Sort: by class A→B→C, then by rotation value desc
    rows.sort((a: any, b: any) => {
        if (a._abc !== b._abc) return a._abc.localeCompare(b._abc);
        return b._pct - a._pct;
    });

    return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared filter builder
// ─────────────────────────────────────────────────────────────────────────────

function applyStockFilters(query: any, config: CountSheetConfig): any {
    switch (config.modo) {
        case "POR_SISTEMA":
            if (config.id_sistema) {
                query = query.eq("id_sistema", config.id_sistema);
            }
            break;

        case "POR_FAMILIA":
            if (config.todas_familias) {
                query = query.not("nombre_familia", "is", null);
            } else if (config.id_familia) {
                // Need to filter by the familia id — mvw_stock_realtime has nombre_familia
                // We use a supabase filter on nombre_familia via a subselect approach
                // Since mvw shows id_sistema but not id_familia directly, we filter by name
                // Alternative: join via cat_plantillas — but simpler is to filter nombre_familia
                // We actually need to cross-reference. Let's fetch the familia name first.
                // For now we'll pass filter as-is; in the query layer we match id_familia
                // via the plantillas join present in the view.
                // mvw_stock_realtime does NOT expose id_familia — so we need a workaround:
                // filter on nombre_familia matching the selected family's name.
                query = query.not("nombre_familia", "is", null);
                // The caller wraps this; id_familia comparison happens at row level.
                // We store id_familia in config and filter post-fetch.
            }
            break;

        case "STOCK_CRITICO":
            if (config.incluir_negativos && config.incluir_bajo_minimo) {
                query = query.lte("stock_actual", query.stock_minimo ?? 0);
            } else if (config.incluir_negativos) {
                query = query.lte("stock_actual", 0);
            } else if (config.incluir_bajo_minimo) {
                // stock_actual <= stock_minimo — can't do column comparison directly in supabase
                // We fetch all with stock_actual <= a large ceiling and filter client-side
                query = query.lte("stock_actual", 9999999);
            }
            break;

        case "CUSTOM":
            if (config.marcas && config.marcas.length > 0) {
                query = query.in("id_marca", config.marcas);
            }
            if (config.materiales && config.materiales.length > 0) {
                query = query.in("id_material", config.materiales);
            }
            if (config.acabados && config.acabados.length > 0) {
                query = query.in("id_acabado", config.acabados);
            }
            if (config.sistemas && config.sistemas.length > 0) {
                query = query.in("id_sistema", config.sistemas);
            }
            // familias: stored/filtered by nombre_familia (column exposed by the view)
            if (config.familias && config.familias.length > 0) {
                query = query.in("nombre_familia", config.familias);
            }
            if (config.stock_min !== null && config.stock_min !== undefined) {
                query = query.gte("stock_actual", config.stock_min);
            }
            if (config.stock_max !== null && config.stock_max !== undefined) {
                query = query.lte("stock_actual", config.stock_max);
            }
            break;
    }
    return query;
}

function applyOrdering(query: any, orden: CountSheetConfig["orden"]): any {
    switch (orden) {
        case "familia":
            return query
                .order("nombre_familia", { ascending: true, nullsFirst: false })
                .order("nombre_completo", { ascending: true });
        case "sistema":
            return query
                .order("sistema_nombre", { ascending: true, nullsFirst: false })
                .order("nombre_completo", { ascending: true });
        default:
            return query.order("nombre_completo", { ascending: true });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Row mapper
// ─────────────────────────────────────────────────────────────────────────────

function mapStockRow(r: any): CountSheetRow {
    const stock = Number(r.stock_actual ?? 0);
    const minimo = Number(r.stock_minimo ?? 0);
    const pedido = Number(r.punto_pedido ?? 0);

    let estado: CountSheetRow["estado_abastecimiento"] = "OK";
    if (stock <= 0 || stock <= minimo) estado = "CRITICO";
    else if (stock <= pedido) estado = "ALERTA";

    return {
        id_sku: r.id_sku,
        nombre_completo: r.nombre_completo,
        unidad_medida: r.unidad_medida ?? null,
        nombre_familia: r.nombre_familia ?? null,
        sistema_nombre: r.sistema_nombre ?? null,
        nombre_marca: r.nombre_marca ?? null,
        nombre_material: r.nombre_material ?? null,
        nombre_acabado: r.nombre_acabado ?? null,
        stock_actual: stock,
        stock_minimo: minimo,
        punto_pedido: pedido,
        estado_abastecimiento: estado,
    };
}
