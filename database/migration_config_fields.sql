-- Migration: Add new configuration fields for improved quotation support
-- Run this in Supabase SQL Editor

-- Add new columns to mst_config_general table
ALTER TABLE mst_config_general 
ADD COLUMN IF NOT EXISTS email_empresa TEXT,
ADD COLUMN IF NOT EXISTS validez_cotizacion_dias INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS descuento_maximo_pct NUMERIC(5,4) DEFAULT 0.15,
ADD COLUMN IF NOT EXISTS moneda_default TEXT DEFAULT 'PEN',
ADD COLUMN IF NOT EXISTS cuenta_bcp_dolares TEXT,
ADD COLUMN IF NOT EXISTS cci_soles TEXT,
ADD COLUMN IF NOT EXISTS cci_dolares TEXT,
ADD COLUMN IF NOT EXISTS nombre_titular_cuenta TEXT,
ADD COLUMN IF NOT EXISTS texto_garantia TEXT,
ADD COLUMN IF NOT EXISTS texto_forma_pago TEXT,
ADD COLUMN IF NOT EXISTS notas_pie_cotizacion TEXT,
ADD COLUMN IF NOT EXISTS nombre_representante TEXT,
ADD COLUMN IF NOT EXISTS cargo_representante TEXT,
ADD COLUMN IF NOT EXISTS color_primario TEXT DEFAULT '#2563eb';

-- Set default values for existing row
UPDATE mst_config_general 
SET 
    validez_cotizacion_dias = COALESCE(validez_cotizacion_dias, 15),
    descuento_maximo_pct = COALESCE(descuento_maximo_pct, 0.15),
    moneda_default = COALESCE(moneda_default, 'PEN'),
    color_primario = COALESCE(color_primario, '#2563eb')
WHERE id_config = 'CONFIG_MAIN';

-- Add check constraint for moneda_default
ALTER TABLE mst_config_general 
ADD CONSTRAINT chk_moneda_default 
CHECK (moneda_default IN ('PEN', 'USD'));

COMMENT ON COLUMN mst_config_general.validez_cotizacion_dias IS 'Días de validez por defecto para cotizaciones';
COMMENT ON COLUMN mst_config_general.descuento_maximo_pct IS 'Descuento máximo permitido (0-1)';
COMMENT ON COLUMN mst_config_general.texto_garantia IS 'Texto de garantía para cotizaciones';
COMMENT ON COLUMN mst_config_general.nombre_representante IS 'Nombre del representante de ventas';
