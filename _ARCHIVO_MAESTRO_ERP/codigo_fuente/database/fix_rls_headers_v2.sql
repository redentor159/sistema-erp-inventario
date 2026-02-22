-- FIX RLS for Headers (Cabeceras) - VERSION 2 (ROBUST)
-- This script explicitly drops ALL policies before creating them to avoid "already exists" errors.

-- 1. Enable RLS (Idempotent)
ALTER TABLE trx_salidas_cabecera ENABLE ROW LEVEL SECURITY;
ALTER TABLE trx_entradas_cabecera ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies (Read/Insert for Auth/Anon)
-- Salidas
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON trx_salidas_cabecera;
DROP POLICY IF EXISTS "Allow insert access to authenticated users" ON trx_salidas_cabecera;
DROP POLICY IF EXISTS "Allow read access to anon users" ON trx_salidas_cabecera;
DROP POLICY IF EXISTS "Allow insert access to anon users" ON trx_salidas_cabecera;

-- Entradas
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON trx_entradas_cabecera;
DROP POLICY IF EXISTS "Allow insert access to authenticated users" ON trx_entradas_cabecera;
DROP POLICY IF EXISTS "Allow read access to anon users" ON trx_entradas_cabecera;
DROP POLICY IF EXISTS "Allow insert access to anon users" ON trx_entradas_cabecera;


-- 3. Create READ Policies
CREATE POLICY "Allow read access to authenticated users" ON trx_salidas_cabecera
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to authenticated users" ON trx_entradas_cabecera
    FOR SELECT TO authenticated USING (true);
    
-- 4. Create INSERT Policies
CREATE POLICY "Allow insert access to authenticated users" ON trx_salidas_cabecera
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow insert access to authenticated users" ON trx_entradas_cabecera
    FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Anon access (Dev/Testing)
CREATE POLICY "Allow read access to anon users" ON trx_salidas_cabecera
    FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read access to anon users" ON trx_entradas_cabecera
    FOR SELECT TO anon USING (true);
CREATE POLICY "Allow insert access to anon users" ON trx_salidas_cabecera
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow insert access to anon users" ON trx_entradas_cabecera
    FOR INSERT TO anon WITH CHECK (true);
