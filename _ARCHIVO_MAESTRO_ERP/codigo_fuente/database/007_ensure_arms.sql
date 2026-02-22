-- 007_ensure_arms.sql
-- Force insert of Projecting Arms options for S42 and S3831
-- This ensures they appear even if previous scripts (003) deleted them.

INSERT INTO mst_recetas_ingenieria (
    id_receta, id_modelo, tipo, id_plantilla, id_material_receta, id_acabado_receta,
    nombre_componente, seccion, formula_cantidad, orden_visual, id_sku_catalogo, grupo_opcion, condicion, id_sistema
) VALUES 
-- Series 42 (1 Hoja Proyectante)
('S42-OPT-BRAZO', 'S42_1H', 'Accesorio', 'PLT_BRAZO_PROY', 'AC', 'MAT', 'Brazo Proyectante (Seleccionar)', 'ACCESORIOS_MARCO', '1', 90, NULL, 'TIPO_BRAZO', 'OPCIONAL', 'SYS_42'),

-- Series 3831 (1 Hoja Proyectante)
('S3831-OPT-BRAZO', 'S3831_1H', 'Accesorio', 'PLT_BRAZO_PROY', 'AC', 'MAT', 'Brazo Proyectante (Seleccionar)', 'ACCESORIOS_MARCO', '1', 90, NULL, 'TIPO_BRAZO', 'OPCIONAL', 'SYS_3831')

ON CONFLICT (id_receta) DO UPDATE SET 
    grupo_opcion = EXCLUDED.grupo_opcion,
    id_sistema = EXCLUDED.id_sistema, -- Fix system if it was NULL
    nombre_componente = EXCLUDED.nombre_componente;
