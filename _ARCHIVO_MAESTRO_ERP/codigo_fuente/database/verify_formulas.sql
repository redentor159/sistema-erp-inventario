-- VERIFICACION DE FORMULAS
-- 1. Crear un modelo dummy
INSERT INTO mst_recetas_modelos (id_modelo, id_sistema, nombre_comercial, num_hojas, activo)
VALUES ('TEST_MODELO_FORMULA', 'SYS_20', 'Modelo Test Formulas', 2, true)
ON CONFLICT (id_modelo) DO NOTHING;

-- 2. Crear una receta con formulas complejas
-- Cantidad = (Ancho / 1000) * 2  -> Si ancho es 1000, cantidad should be 2
-- Medida = (Alto / 2) - 50 -> Si alto es 2000, medida should be 950
DELETE FROM mst_recetas_ingenieria WHERE id_modelo = 'TEST_MODELO_FORMULA';

INSERT INTO mst_recetas_ingenieria (
    id_receta, id_modelo, tipo, nombre_componente,
    formula_cantidad, formula_perfil,
    condicion, orden_visual, seccion
) VALUES (
    'TEST-RECETA-1', 'TEST_MODELO_FORMULA', 'Perfil', 'Perfil Test Formula',
    '(ancho/1000)*2', '(alto/2)-50',
    'BASE', 1, 'Marco'
);

-- 3. Crear una cotizacion dummy
INSERT INTO trx_cotizaciones_cabecera (id_cotizacion, id_cliente, fecha_emision, estado)
VALUES ('00000000-0000-0000-0000-000000000000', 'CLI-TEST', NOW(), 'Borrador')
ON CONFLICT (id_cotizacion) DO UPDATE SET fecha_emision = NOW();

INSERT INTO trx_cotizaciones_detalle (
    id_linea_cot, id_cotizacion, id_modelo,
    ancho_mm, alto_mm, cantidad,
    color_perfiles, tipo_vidrio
) VALUES (
    '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'TEST_MODELO_FORMULA',
    1000, 2000, 5, -- 5 Ventanas
    'BLA', 'GLS-06-INC'
) ON CONFLICT (id_linea_cot) DO UPDATE SET ancho_mm=1000, alto_mm=2000, cantidad=5;

-- 4. Ejecutar Despiece
SELECT fn_generar_despiece_ingenieria('11111111-1111-1111-1111-111111111111');

-- 5. Verificar Resultados
SELECT 
    nombre_componente,
    cantidad_calculada as cant_total_esperada_10, -- (1000/1000)*2 * 5 ventanas = 10
    medida_corte_mm as medida_esperada_950 -- (2000/2)-50 = 950
FROM trx_desglose_materiales
WHERE id_linea_cot = '11111111-1111-1111-1111-111111111111';
