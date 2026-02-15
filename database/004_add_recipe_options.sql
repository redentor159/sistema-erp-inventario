-- 1. Add 'grupo_opcion' to Recipe Table
ALTER TABLE mst_recetas_ingenieria ADD COLUMN IF NOT EXISTS grupo_opcion TEXT;

-- 2. Add 'opciones_seleccionadas' to Quote Detail Table
ALTER TABLE trx_cotizaciones_detalle ADD COLUMN IF NOT EXISTS opciones_seleccionadas JSONB DEFAULT '{}';

-- 3. Create generic Plantilla for Options
INSERT INTO cat_plantillas (id_plantilla, nombre_generico, id_familia, id_sistema) VALUES
('PLT_BRAZO_PROY', 'Brazo Proyectante (Genérico)', 'ACC', 'SYS_GEN')
ON CONFLICT (id_plantilla) DO NOTHING;

-- 5. Insert ONE Generic Recipe Line for Options (S42_1H and S3831_1H)
-- This allows the user to selected the specific SKU in the Quote Form.

-- S42_1H GENERIC OPTION
INSERT INTO mst_recetas_ingenieria (
    id_receta, id_modelo, tipo, id_plantilla, id_material_receta, id_acabado_receta,
    nombre_componente, seccion, formula_cantidad, orden_visual, id_sku_catalogo, grupo_opcion, condicion
) VALUES 
('S42-OPT-BRAZO', 'S42_1H', 'Accesorio', 'PLT_BRAZO_PROY', 'AC', 'MAT', 'Brazo Proyectante (Seleccionar)', 'ACCESORIOS_MARCO', '1', 90, NULL, 'TIPO_BRAZO', 'OPCIONAL')
ON CONFLICT (id_receta) DO UPDATE SET 
    grupo_opcion = EXCLUDED.grupo_opcion, 
    condicion = EXCLUDED.condicion;

-- S3831_1H GENERIC OPTION
INSERT INTO mst_recetas_ingenieria (
    id_receta, id_modelo, tipo, id_plantilla, id_material_receta, id_acabado_receta,
    nombre_componente, seccion, formula_cantidad, orden_visual, id_sku_catalogo, grupo_opcion, condicion
) VALUES 
('S3831-OPT-BRAZO', 'S3831_1H', 'Accesorio', 'PLT_BRAZO_PROY', 'AC', 'MAT', 'Brazo Proyectante (Seleccionar)', 'ACCESORIOS_MARCO', '1', 90, NULL, 'TIPO_BRAZO', 'OPCIONAL')
ON CONFLICT (id_receta) DO UPDATE SET 
    grupo_opcion = EXCLUDED.grupo_opcion, 
    condicion = EXCLUDED.condicion;

