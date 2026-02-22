-- =============================================================================
-- INSERTAR NUEVO ACABADO: CUADRICULADO (CUA)
-- Fecha: 2026-02-07
-- =============================================================================

INSERT INTO cat_acabados (id_acabado, nombre_acabado, sufijo_sku)
VALUES ('CUA', 'Cuadriculado', 'CUA')
ON CONFLICT (id_acabado) DO NOTHING;

-- Verificar que el material CR existe
INSERT INTO cat_materiales (id_material, nombre_material, descripcion)
VALUES ('CR', 'Cristal/Vidrio', 'Material de cristal o vidrio para ventanas y mamparas')
ON CONFLICT (id_material) DO NOTHING;

-- Verificar que la familia CRIS existe
INSERT INTO cat_familias (id_familia, nombre_familia, descripcion)
VALUES ('CRIS', 'Cristales', 'Familia de productos de cristal y vidrio')
ON CONFLICT (id_familia) DO NOTHING;

-- Verificar que la marca GEN existe
INSERT INTO cat_marcas (id_marca, nombre_marca, pais_origen)
VALUES ('GEN', 'Genérico', 'N/A')
ON CONFLICT (id_marca) DO NOTHING;
