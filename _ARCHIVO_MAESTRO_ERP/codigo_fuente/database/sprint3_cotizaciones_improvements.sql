-- =================================================================================================
-- SPRINT 3 ACTUALIZADO: Mejoras al Módulo de Cotizaciones
-- Fecha: 2026-02-07
-- Incluye: Correcciones, nuevas recetas, y costo fijo de instalación a nivel cabecera
-- =================================================================================================

-- 1. CORRECCION: Mover costo_fijo_instalacion de detalle a cabecera
ALTER TABLE trx_cotizaciones_cabecera
ADD COLUMN IF NOT EXISTS costo_fijo_instalacion NUMERIC DEFAULT 0;

-- Eliminar de detalle si existe (de implementación anterior incorrecta)
ALTER TABLE trx_cotizaciones_detalle
DROP COLUMN IF EXISTS costo_fijo_instalacion;

-- 2. Agregar id_sistema a mst_recetas_ingenieria
ALTER TABLE mst_recetas_ingenieria
ADD COLUMN IF NOT EXISTS id_sistema TEXT REFERENCES mst_series_equivalencias(id_sistema);

-- 3. Actualizar constraint de tipo para incluir 'Servicio'
ALTER TABLE mst_recetas_ingenieria
DROP CONSTRAINT IF EXISTS mst_recetas_ingenieria_tipo_check;

ALTER TABLE mst_recetas_ingenieria
ADD CONSTRAINT mst_recetas_ingenieria_tipo_check 
CHECK (tipo IN ('Perfil', 'Accesorio', 'Vidrio', 'Servicio'));

-- 4. Actualizar constraint de condicion para incluir uso futuro
ALTER TABLE mst_recetas_ingenieria
DROP CONSTRAINT IF EXISTS mst_recetas_ingenieria_condicion_check;

ALTER TABLE mst_recetas_ingenieria
ADD CONSTRAINT mst_recetas_ingenieria_condicion_check 
CHECK (condicion IN ('BASE', 'OPCIONAL'));

-- 5. Actualizar constraint de tipo_componente en desglose
ALTER TABLE trx_desglose_materiales 
DROP CONSTRAINT IF EXISTS trx_desglose_materiales_tipo_componente_check;

ALTER TABLE trx_desglose_materiales 
ADD CONSTRAINT trx_desglose_materiales_tipo_componente_check 
CHECK (tipo_componente IN ('Perfil', 'Vidrio', 'Accesorio', 'Servicio'));

-- 6. Crear/actualizar sistemas si no existen
INSERT INTO mst_series_equivalencias (id_sistema, nombre_comercial, uso_principal) VALUES
('SYS_20', 'Sistema 20', 'Ventanas Corredizas Económicas'),
('SYS_25', 'Sistema 25', 'Ventanas Corredizas Estándar'),
('SYS_29', 'Sistema 3131', 'Ventanas Corredizas Pesadas'),
('SYS_3825', 'Sistema 3825', 'Ventanas Corredizas Grandes'),
('SYS_3831', 'Sistema 3831', 'Ventanas Proyectantes'),
('SYS_42', 'Sistema 42', 'Ventanas Proyectantes Premium'),
('SYS_62', 'Sistema 62', 'Mamparas Corredizas'),
('SYS_80', 'Sistema 80', 'Mamparas Pesadas'),
('SYS_GEN', 'General', 'Componentes Genéricos')
ON CONFLICT (id_sistema) DO UPDATE SET nombre_comercial = EXCLUDED.nombre_comercial;
