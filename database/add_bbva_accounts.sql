-- Add BBVA account columns to mst_config_general
DO $$
BEGIN
    -- Soles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'cuenta_bbva_soles') THEN
        ALTER TABLE mst_config_general ADD COLUMN cuenta_bbva_soles TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'cci_bbva_soles') THEN
        ALTER TABLE mst_config_general ADD COLUMN cci_bbva_soles TEXT;
    END IF;

    -- Dolares
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'cuenta_bbva_dolares') THEN
        ALTER TABLE mst_config_general ADD COLUMN cuenta_bbva_dolares TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mst_config_general' AND column_name = 'cci_bbva_dolares') THEN
        ALTER TABLE mst_config_general ADD COLUMN cci_bbva_dolares TEXT;
    END IF;
END $$;
