-- 010_fix_arms_condition.sql
-- Change condition from 'OPCIONAL' to 'BASE' so it is picked up by the Despiece Loop
-- (The loop filters by BASE or tipo_cierre)

UPDATE mst_recetas_ingenieria
SET condicion = 'BASE'
WHERE grupo_opcion = 'TIPO_BRAZO';
