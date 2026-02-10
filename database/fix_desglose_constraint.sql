-- FIX: UPDATE CHECK CONSTRAINT FOR TIPO_COMPONENTE
-- The original schema restricted types to 'Perfil', 'Vidrio', 'Accesorio'.
-- Recipes include 'Servicio' (e.g. Flete, Embalaje), causing an insert error.

ALTER TABLE trx_desglose_materiales
DROP CONSTRAINT IF EXISTS trx_desglose_materiales_tipo_componente_check;

ALTER TABLE trx_desglose_materiales
ADD CONSTRAINT trx_desglose_materiales_tipo_componente_check 
CHECK (tipo_componente IN ('Perfil', 'Vidrio', 'Accesorio', 'Servicio', 'Otro'));
