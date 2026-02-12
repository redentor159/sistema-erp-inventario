-- Asegurar que la tabla de configuración tenga todas las columnas de textos y bancos
-- Idempotente: Solo agrega si no existen

DO $$
BEGIN
    -- 1. Textos Legales
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'texto_condiciones_base') THEN
        ALTER TABLE mst_config_general ADD COLUMN texto_condiciones_base TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'texto_garantia') THEN
        ALTER TABLE mst_config_general ADD COLUMN texto_garantia TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'texto_forma_pago') THEN
        ALTER TABLE mst_config_general ADD COLUMN texto_forma_pago TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'notas_pie_cotizacion') THEN
        ALTER TABLE mst_config_general ADD COLUMN notas_pie_cotizacion TEXT;
    END IF;

    -- 2. Cuentas BBVA (Soles)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'cuenta_bbva_soles') THEN
        ALTER TABLE mst_config_general ADD COLUMN cuenta_bbva_soles TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'cci_bbva_soles') THEN
        ALTER TABLE mst_config_general ADD COLUMN cci_bbva_soles TEXT;
    END IF;

    -- 3. Cuentas BBVA (Dólares)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'cuenta_bbva_dolares') THEN
        ALTER TABLE mst_config_general ADD COLUMN cuenta_bbva_dolares TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'cci_bbva_dolares') THEN
        ALTER TABLE mst_config_general ADD COLUMN cci_bbva_dolares TEXT;
    END IF;

    -- 4. Personalización y Firma
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'firma_digital_url') THEN
        ALTER TABLE mst_config_general ADD COLUMN firma_digital_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'nombre_representante') THEN
        ALTER TABLE mst_config_general ADD COLUMN nombre_representante TEXT;
    END IF;

     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'cargo_representante') THEN
        ALTER TABLE mst_config_general ADD COLUMN cargo_representante TEXT;
    END IF;

END $$;
