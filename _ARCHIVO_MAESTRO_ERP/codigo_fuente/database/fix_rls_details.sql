-- Enable RLS and add policies for Transaction Details

-- 1. Ensure RLS is enabled (good practice, though sometimes it's off by default)
ALTER TABLE trx_salidas_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE trx_entradas_detalle ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for READING (Select)
-- Allow authenticated users to view details
CREATE POLICY "Allow read access to authenticated users" ON trx_salidas_detalle
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow read access to authenticated users" ON trx_entradas_detalle
    FOR SELECT
    TO authenticated
    USING (true);

-- OPTIONAL: If using anon for dev:
CREATE POLICY "Allow read access to anon users" ON trx_salidas_detalle
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow read access to anon users" ON trx_entradas_detalle
    FOR SELECT
    TO anon
    USING (true);
