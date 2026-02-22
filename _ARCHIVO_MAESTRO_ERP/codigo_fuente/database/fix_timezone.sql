-- FIX: TIMEZONE SETTINGS
-- Sets the timezone to Peru (UTC-5) for accurate timestamps.

-- Opción 1: Set for Config (Persistent if allowed by Superuser)
-- ALTER DATABASE postgres SET timezone TO 'America/Lima';

-- Opción 2: Function helper to ensure inserts use local time
-- Actualizamos la columna default en las tablas principales
ALTER TABLE trx_cotizaciones_cabecera 
ALTER COLUMN fecha_emision SET DEFAULT (now() AT TIME ZONE 'America/Lima');

ALTER TABLE trx_movimientos 
ALTER COLUMN fecha_hora SET DEFAULT (now() AT TIME ZONE 'America/Lima');

ALTER TABLE trx_entradas_cabecera 
ALTER COLUMN fecha_registro SET DEFAULT (now() AT TIME ZONE 'America/Lima');

ALTER TABLE trx_salidas_cabecera 
ALTER COLUMN fecha SET DEFAULT (now() AT TIME ZONE 'America/Lima');

-- Nota: Si usas Supabase, tambien puedes configurarlo en Project Settings > Database > Timezone.
