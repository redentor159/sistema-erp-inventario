-- UPDATE RETAZOS CONTRAINT
-- Requirement: Support 'ASIGNADO' status in addition to DISPONIBLE and USADO.

DO $$
BEGIN
    -- Drop existing check if it strictly doesn't include ASIGNADO
    ALTER TABLE dat_retazos_disponibles DROP CONSTRAINT IF EXISTS dat_retazos_disponibles_estado_check;
    
    -- Add new check with corrected values (Upper Case as per DB convention, mapped from UI)
    -- UI: "Asignado (Para planificación)" -> DB: 'ASIGNADO'
    ALTER TABLE dat_retazos_disponibles ADD CONSTRAINT dat_retazos_disponibles_estado_check 
    CHECK (estado IN ('DISPONIBLE', 'ASIGNADO', 'USADO'));
END $$;
