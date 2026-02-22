-- =================================================================================================
-- SCRIPT DE CORRECCIÓN SEMÁNTICA (INTEGRITY + APP COMPATIBILITY)
-- Fecha: 2026-02-10
-- Descripción: Restaura los Constraints pero con los valores REALES encontrados en el código fuente.
--              Entradas: App usa 'INGRESADO', Test usa 'RECIBIDO'. Permitimos ambos + 'PENDIENTE'/'CANCELADO'.
--              Salidas: App usa 'CONFIRMADO', Test usa 'CONFIRMADO'. Permitimos 'PENDIENTE'/'CANCELADO'.
-- =================================================================================================

-- 1. LIMPIEZA PREVIA (Por si acaso)
ALTER TABLE trx_entradas_cabecera DROP CONSTRAINT IF EXISTS chk_entrada_estado;
ALTER TABLE trx_salidas_cabecera DROP CONSTRAINT IF EXISTS chk_salida_estado;

-- 2. NORMALIZACIÓN DE DATOS EXISTENTES
-- Si hay algún estado 'RECIBIDO' que la App llama 'INGRESADO', lo dejamos.
-- Pero si hay nulos, los ponemos en 'PENDIENTE'.
UPDATE trx_entradas_cabecera SET estado = 'PENDIENTE' WHERE estado IS NULL;
UPDATE trx_salidas_cabecera SET estado = 'PENDIENTE' WHERE estado IS NULL;

-- 3. APLICAR CONSTRAINTS CORRECTOS (UNION DE APP + LOGICA DE NEGOCIO)

-- Entradas:
-- 'INGRESADO': Valor por defecto en entrada-form.tsx
-- 'RECIBIDO': Valor usado en tests y lógica de almacén.
-- 'PENDIENTE': Valor lógico para tránsitos.
-- 'CANCELADO': Valor lógico para anulaciones.
ALTER TABLE trx_entradas_cabecera
    ADD CONSTRAINT chk_entrada_estado
    CHECK (estado IN ('PENDIENTE', 'RECIBIDO', 'INGRESADO', 'CANCELADO'));

-- Salidas:
-- 'CONFIRMADO': Valor por defecto en salida-form.tsx
-- 'PENDIENTE': Valor lógico.
-- 'CANCELADO': Valor lógico.
ALTER TABLE trx_salidas_cabecera
    ADD CONSTRAINT chk_salida_estado
    CHECK (estado IN ('PENDIENTE', 'CONFIRMADO', 'CANCELADO'));

-- 4. Notificar
DO $$
BEGIN
    RAISE NOTICE '✅ Constraints aplicados correctamente compatibles con la App (INGRESADO/CONFIRMADO).';
END $$;
