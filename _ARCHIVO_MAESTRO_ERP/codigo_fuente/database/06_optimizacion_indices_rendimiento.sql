-- =========================================================================================
-- SCRIPT DE OPTIMIZACIÓN DE RENDIMIENTO: ÍNDICES PARA LLAVES FORÁNEAS (FOREIGN KEYS)
-- =========================================================================================
-- Explicación: PostgreSQL no crea índices automáticamente para las columnas que son
-- llaves foráneas (FKs). Cuando se hace un JOIN, UPDATE o DELETE que involucra estas FKs,
-- si no hay un índice, la base de datos debe escanear secuencialmente toda la tabla,
-- lo cual degrada severamente el rendimiento a medida que crecen los datos (como en variates).
-- =========================================================================================

-- 1. Índices para Catálogo de Plantillas
CREATE INDEX IF NOT EXISTS idx_cat_plantillas_id_familia ON public.cat_plantillas(id_familia);
CREATE INDEX IF NOT EXISTS idx_cat_plantillas_id_sistema ON public.cat_plantillas(id_sistema);

-- 2. Índices críticos para la tabla más pesada: Variantes (5,800+ filas)
CREATE INDEX IF NOT EXISTS idx_cat_productos_variantes_id_marca ON public.cat_productos_variantes(id_marca);
CREATE INDEX IF NOT EXISTS idx_cat_productos_variantes_id_material ON public.cat_productos_variantes(id_material);
CREATE INDEX IF NOT EXISTS idx_cat_productos_variantes_id_acabado ON public.cat_productos_variantes(id_acabado);
CREATE INDEX IF NOT EXISTS idx_cat_productos_variantes_id_plantilla ON public.cat_productos_variantes(id_plantilla);

-- 3. Índices para Retazos Disponibles
CREATE INDEX IF NOT EXISTS idx_dat_retazos_disponibles_id_sku_padre ON public.dat_retazos_disponibles(id_sku_padre);

-- 4. Índices para las complejas Recetas de Ingeniería
CREATE INDEX IF NOT EXISTS idx_mst_recetas_ingenieria_id_modelo ON public.mst_recetas_ingenieria(id_modelo);
CREATE INDEX IF NOT EXISTS idx_mst_recetas_ingenieria_id_plantilla ON public.mst_recetas_ingenieria(id_plantilla);
CREATE INDEX IF NOT EXISTS idx_mst_recetas_ingenieria_id_material_receta ON public.mst_recetas_ingenieria(id_material_receta);
CREATE INDEX IF NOT EXISTS idx_mst_recetas_ingenieria_id_acabado_receta ON public.mst_recetas_ingenieria(id_acabado_receta);
CREATE INDEX IF NOT EXISTS idx_mst_recetas_ingenieria_id_marca_receta ON public.mst_recetas_ingenieria(id_marca_receta);
CREATE INDEX IF NOT EXISTS idx_mst_recetas_ingenieria_id_sistema ON public.mst_recetas_ingenieria(id_sistema);

-- 5. Índices para Recetas de Modelos
CREATE INDEX IF NOT EXISTS idx_mst_recetas_modelos_id_sistema ON public.mst_recetas_modelos(id_sistema);

-- 6. Índices para Transacciones: Cotizaciones
CREATE INDEX IF NOT EXISTS idx_trx_cotizaciones_cabecera_id_cliente ON public.trx_cotizaciones_cabecera(id_cliente);
CREATE INDEX IF NOT EXISTS idx_trx_cotizaciones_cabecera_id_marca ON public.trx_cotizaciones_cabecera(id_marca);
CREATE INDEX IF NOT EXISTS idx_trx_cotizaciones_detalle_id_cotizacion ON public.trx_cotizaciones_detalle(id_cotizacion);
CREATE INDEX IF NOT EXISTS idx_trx_desglose_materiales_id_linea_cot ON public.trx_desglose_materiales(id_linea_cot);

-- 7. Índices para Transacciones: Entradas (Compras)
CREATE INDEX IF NOT EXISTS idx_trx_entradas_cabecera_id_proveedor ON public.trx_entradas_cabecera(id_proveedor);
CREATE INDEX IF NOT EXISTS idx_trx_entradas_cabecera_id_cliente ON public.trx_entradas_cabecera(id_cliente);
CREATE INDEX IF NOT EXISTS idx_trx_entradas_detalle_id_entrada ON public.trx_entradas_detalle(id_entrada);
CREATE INDEX IF NOT EXISTS idx_trx_entradas_detalle_id_sku ON public.trx_entradas_detalle(id_sku);

-- 8. Índices para Transacciones: Salidas (Consumos/Despachos)
CREATE INDEX IF NOT EXISTS idx_trx_salidas_cabecera_id_destinatario ON public.trx_salidas_cabecera(id_destinatario);
CREATE INDEX IF NOT EXISTS idx_trx_salidas_detalle_id_salida ON public.trx_salidas_detalle(id_salida);
CREATE INDEX IF NOT EXISTS idx_trx_salidas_detalle_id_sku ON public.trx_salidas_detalle(id_sku);

-- 9. Índices para el Kardex (Movimientos)
CREATE INDEX IF NOT EXISTS idx_trx_movimientos_id_sku ON public.trx_movimientos(id_sku);
