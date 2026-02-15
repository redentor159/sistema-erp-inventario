-- debug_despiece.sql
-- Run this in Supabase SQL Editor to see the error.
-- Replace 'ID_DE_LINEA_QUE_FALLA' with the UUID of the line item causing error.
-- You can find the UUID in the URL or the table.

DO $$
DECLARE
    v_id_linea UUID := 'ID_DE_LINEA_QUE_FALLA'; -- PUT REAL ID HERE
BEGIN
    PERFORM fn_generar_despiece_ingenieria(v_id_linea);
    RAISE NOTICE 'Function executed successfully';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: % %', SQLERRM, SQLSTATE;
END $$;
