-- Consolidate Configuration to 'CONFIG_MAIN'
-- 1. Ensure CONFIG_MAIN exists with valid values (updating if exists)
INSERT INTO mst_config_general (
    id_config, 
    margen_ganancia_default, 
    igv, 
    markup_cotizaciones_default, 
    costo_mo_m2_default, 
    tipo_cambio_referencial
) VALUES (
    'CONFIG_MAIN', 
    0.30, -- Default Sales Margin
    0.18, -- Default IGV
    0.10, -- Default Quote Markup (Different from Sales)
    50.00, 
    3.80
)
ON CONFLICT (id_config) DO UPDATE SET
    -- Keep existing values if they are valid, or verify logic here. 
    -- For now, we trust the latest update is what we want, or we reset to defaults if confused.
    -- Let's just ensure it exists.
    margen_ganancia_default = EXCLUDED.margen_ganancia_default;

-- 2. Delete any config that is NOT 'CONFIG_MAIN'
DELETE FROM mst_config_general WHERE id_config != 'CONFIG_MAIN';

-- 3. Verify
SELECT * FROM mst_config_general;
