-- Robust RLS Fix: Drop existing policies first to avoid errors, then recreate.

-- 1. Enable RLS (Idempotent)
ALTER TABLE trx_salidas_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE trx_entradas_detalle ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent "already exists" error
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON trx_salidas_detalle;
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON trx_entradas_detalle;
DROP POLICY IF EXISTS "Allow read access to anon users" ON trx_salidas_detalle;
DROP POLICY IF EXISTS "Allow read access to anon users" ON trx_entradas_detalle;

-- 3. Re-create Policies for READING (Select)
-- Authenticated Users
CREATE POLICY "Allow read access to authenticated users" ON trx_salidas_detalle
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow read access to authenticated users" ON trx_entradas_detalle
    FOR SELECT
    TO authenticated
    USING (true);

-- Anon Users (Optional, helpful for dev/testing if auth is bypassed)
CREATE POLICY "Allow read access to anon users" ON trx_salidas_detalle
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow read access to anon users" ON trx_entradas_detalle
    FOR SELECT
    TO anon
    USING (true);
