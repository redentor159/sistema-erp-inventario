
SELECT 'MST_CLIENTES' as table_name, count(*) as count FROM mst_clientes
UNION ALL
SELECT 'MST_MARCAS', count(*) FROM mst_marcas
UNION ALL
SELECT 'MST_SERIES_EQUIVALENCIAS', count(*) FROM mst_series_equivalencias
UNION ALL
SELECT 'MST_RECETAS_INGENIERIA', count(*) FROM mst_recetas_ingenieria
UNION ALL
SELECT 'CAT_PRODUCTOS_VARIANTES (Vidrios)', count(*) FROM cat_productos_variantes WHERE id_familia = 'VID' OR id_sku LIKE 'VID%'
UNION ALL
SELECT 'MST_ACABADOS_COLORES', count(*) FROM mst_acabados_colores;
