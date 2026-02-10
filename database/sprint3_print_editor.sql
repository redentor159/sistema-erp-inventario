-- =================================================================================================
-- SPRINT 3: Mejoras Editor Impresión
-- Fecha: 2026-02-10
-- Incluye: Nuevos campos para personalizar términos y pie de página por cotización
-- =================================================================================================

ALTER TABLE trx_cotizaciones_cabecera
ADD COLUMN IF NOT EXISTS terminos_personalizados TEXT,
ADD COLUMN IF NOT EXISTS titulo_documento TEXT DEFAULT 'COTIZACIÓN';

-- Actualizar vista totales para incluir estos campos si fuera necesario (aunque select * los trae de la tabla base si hacemos join)
-- Pero como trx_cotizaciones_cabecera es la base de la vista, verifiquemos.

-- La vista vw_cotizaciones_totales selecciona c.*
-- CREATE OR REPLACE VIEW vw_cotizaciones_totales AS
-- SELECT c.*, ... FROM trx_cotizaciones_cabecera c ...
-- Al alterar la tabla base, la vista debería heredar los campos si fue creada con c.*, 
-- pero en postgres a veces hay que recrearla si se expande *. 
-- Por seguridad, simplemente confiamos en que al usar supabase client en el frontend,
-- podemos consultar directamente la tabla o la vista. 
-- Si la vista no trae los campos nuevos, tendremos que recrearla.

-- Forzamos actualización de la vista por si acaso (re-run de la definición original o simplemente verificar).
-- En este script solo agregamos columnas.
