-- FIX RLS for Headers (Cabeceras)
-- It seems we forgot to add policies for the header tables!

-- 1. Enable RLS for Headers
ALTER TABLE trx_salidas_cabecera ENABLE ROW LEVEL SECURITY;
ALTER TABLE trx_entradas_cabecera ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to be safe
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON trx_salidas_cabecera;
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON trx_entradas_cabecera;
DROP POLICY IF EXISTS "Allow read access to anon users" ON trx_salidas_cabecera;
DROP POLICY IF EXISTS "Allow read access to anon users" ON trx_entradas_cabecera;
DROP POLICY IF EXISTS "Allow insert access to authenticated users" ON trx_salidas_cabecera;
DROP POLICY IF EXISTS "Allow insert access to authenticated users" ON trx_entradas_cabecera;


-- 3. Create READ Policies
CREATE POLICY "Allow read access to authenticated users" ON trx_salidas_cabecera
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to authenticated users" ON trx_entradas_cabecera
    FOR SELECT TO authenticated USING (true);
    
-- 4. Create INSERT Policies (so you can register new ones!)
CREATE POLICY "Allow insert access to authenticated users" ON trx_salidas_cabecera
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow insert access to authenticated users" ON trx_entradas_cabecera
    FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Optional: Anon access for dev
CREATE POLICY "Allow read access to anon users" ON trx_salidas_cabecera
    FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read access to anon users" ON trx_entradas_cabecera
    FOR SELECT TO anon USING (true);
CREATE POLICY "Allow insert access to anon users" ON trx_salidas_cabecera
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow insert access to anon users" ON trx_entradas_cabecera
    FOR INSERT TO anon WITH CHECK (true);
