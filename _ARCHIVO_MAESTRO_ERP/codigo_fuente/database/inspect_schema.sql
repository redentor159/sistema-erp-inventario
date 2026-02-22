-- =================================================================================================
-- SCRIPT DE INTROSPECCIÓN DE ESQUEMA
-- Ejecuta este script en el Editor SQL de Supabase.
-- El resultado será un objeto JSON que describe todas tus tablas y columnas actuales.
-- Copia el resultado y guardalo en un archivo 'current_schema.json' o pégalo en el chat.
-- =================================================================================================

WITH schema_info AS (
    SELECT
        t.table_name,
        (
            SELECT json_agg(json_build_object(
                'column_name', c.column_name,
                'data_type', c.data_type,
                'is_nullable', c.is_nullable,
                'default', c.column_default
            ))
            FROM information_schema.columns c
            WHERE c.table_name = t.table_name
            AND c.table_schema = 'public'
        ) AS columns,
         (
            SELECT json_agg(json_build_object(
                'constraint_name', tc.constraint_name,
                'column_name', kcu.column_name,
                'foreign_table', ccu.table_name,
                'foreign_column', ccu.column_name
            ))
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND tc.table_name = t.table_name
        ) AS foreign_keys
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
)
SELECT json_agg(schema_info) as current_db_schema FROM schema_info;
