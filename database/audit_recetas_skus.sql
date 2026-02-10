-- =================================================================================================
-- AUDITORÍA DE INTEGRIDAD: RECETAS vs PRODUCTOS VARIANTES
-- Fecha: 2026-02-07
-- 
-- Este script genera vistas para identificar TODOS los SKUs que las recetas
-- generarían pero NO existen en cat_productos_variantes.
-- =================================================================================================

-- 1. VISTA: Simular TODOS los SKUs que generarían las recetas
-- Para cada receta, calculamos el SKU que se generaría según su tipo

DROP VIEW IF EXISTS vw_audit_skus_recetas CASCADE;

CREATE OR REPLACE VIEW vw_audit_skus_recetas AS
SELECT 
    r.id_receta,
    r.id_modelo,
    r.id_sistema,
    r.id_plantilla,
    r.nombre_componente,
    r.tipo,
    r.id_material_receta,
    r.id_acabado_receta,
    r.id_marca_receta,
    -- SKU que se generaría (simulación para ACCESORIOS que no dependen del color/marca de cotización)
    CASE 
        WHEN r.tipo = 'Perfil' THEN 
            'AL-' || r.id_plantilla || '-{COLOR}-{MARCA}'  -- Dinámico, depende de la cotización
        WHEN r.tipo = 'Accesorio' THEN 
            COALESCE(r.id_material_receta, 'AC') || '-' || r.id_plantilla || '-' || 
            COALESCE(r.id_acabado_receta, 'GEN') || '-' || COALESCE(r.id_marca_receta, 'GEN')
        WHEN r.tipo = 'Servicio' THEN 
            COALESCE(r.id_material_receta, 'SRV') || '-' || r.id_plantilla || '-GEN-GEN'
        ELSE 
            'UNKNOWN-' || r.id_plantilla
    END as sku_generado,
    -- Flag: ¿Es SKU fijo o dinámico?
    CASE WHEN r.tipo = 'Perfil' THEN FALSE ELSE TRUE END as es_sku_fijo
FROM mst_recetas_ingenieria r;

-- 2. VISTA: SKUs FALTANTES (Solo accesorios/servicios - los que son fijos)
DROP VIEW IF EXISTS vw_audit_skus_faltantes CASCADE;

CREATE OR REPLACE VIEW vw_audit_skus_faltantes AS
SELECT 
    a.id_receta,
    a.id_modelo,
    a.id_sistema,
    a.id_plantilla,
    a.nombre_componente,
    a.tipo,
    a.sku_generado,
    a.id_material_receta,
    a.id_acabado_receta,
    a.id_marca_receta,
    -- Estado
    CASE 
        WHEN p.id_sku IS NOT NULL THEN '✅ EXISTE'
        ELSE '❌ FALTA'
    END as estado,
    -- Info adicional del producto si existe
    p.nombre_completo as nombre_producto_existente,
    p.costo_mercado_unit as costo_existente
FROM vw_audit_skus_recetas a
LEFT JOIN cat_productos_variantes p ON p.id_sku = a.sku_generado
WHERE a.es_sku_fijo = TRUE;  -- Solo SKUs fijos (Accesorios/Servicios)

-- 3. VISTA: Resumen por Sistema/Modelo
DROP VIEW IF EXISTS vw_audit_resumen_sistema CASCADE;

CREATE OR REPLACE VIEW vw_audit_resumen_sistema AS
SELECT 
    id_sistema,
    id_modelo,
    COUNT(*) as total_componentes,
    SUM(CASE WHEN estado = '✅ EXISTE' THEN 1 ELSE 0 END) as skus_ok,
    SUM(CASE WHEN estado = '❌ FALTA' THEN 1 ELSE 0 END) as skus_faltantes,
    ROUND(
        100.0 * SUM(CASE WHEN estado = '✅ EXISTE' THEN 1 ELSE 0 END) / COUNT(*), 
        1
    ) as porcentaje_completado
FROM vw_audit_skus_faltantes
GROUP BY id_sistema, id_modelo
ORDER BY porcentaje_completado ASC, id_sistema, id_modelo;

-- 4. VISTA: Plantillas faltantes en cat_plantillas
DROP VIEW IF EXISTS vw_audit_plantillas_faltantes CASCADE;

CREATE OR REPLACE VIEW vw_audit_plantillas_faltantes AS
SELECT DISTINCT
    r.id_plantilla,
    r.nombre_componente,
    r.id_sistema,
    r.tipo,
    CASE 
        WHEN p.id_plantilla IS NOT NULL THEN '✅ EXISTE'
        ELSE '❌ FALTA'
    END as estado_plantilla
FROM mst_recetas_ingenieria r
LEFT JOIN cat_plantillas p ON p.id_plantilla = r.id_plantilla
WHERE p.id_plantilla IS NULL
ORDER BY r.id_sistema, r.tipo, r.id_plantilla;

-- 5. CONSULTA ÚTIL: Ver todos los accesorios faltantes agrupados
-- Ejecuta esto para ver el resumen:
/*
SELECT * FROM vw_audit_skus_faltantes WHERE estado = '❌ FALTA' ORDER BY id_sistema, tipo, id_plantilla;
*/

-- 6. CONSULTA ÚTIL: Ver resumen por sistema
/*
SELECT * FROM vw_audit_resumen_sistema;
*/

-- 7. CONSULTA ÚTIL: Ver plantillas que faltan crear
/*
SELECT * FROM vw_audit_plantillas_faltantes;
*/

-- 8. GENERAR INSERTS para los SKUs faltantes (ejecutar esto y copiar el resultado)
/*
SELECT 
    'INSERT INTO cat_productos_variantes (id_sku, id_plantilla, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion) VALUES (''' ||
    sku_generado || ''', ''' || id_plantilla || ''', ''' || nombre_componente || ''', ''UND'', 10.00, ''PEN'') ON CONFLICT DO NOTHING;'
    as sql_insert
FROM vw_audit_skus_faltantes 
WHERE estado = '❌ FALTA';
*/
