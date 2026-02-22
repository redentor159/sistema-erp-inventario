-- Sprint 3: Dashboard & Delivery Logic (STEP 7: BONUS DATA GENERATION)
-- Description: Generates 'Retazos' (Offcuts) and ensures recent movements for ABC/Zombie analysis.

-- 1. GENERATE RETAZOS (OFFCUTS)
-- Simulate that we have some valuable aluminum offcuts stored.
INSERT INTO dat_retazos_disponibles (
    id_sku_padre,
    longitud_mm,
    ubicacion,
    estado,
    fecha_registro,
    usuario_registro
)
SELECT 
    id_sku,
    floor(random() * (2500 - 800 + 1) + 800)::numeric as longitud_mm, -- Between 800mm and 2500mm
    'RESTOS-A' as ubicacion,
    'DISPONIBLE' as estado,
    NOW() - (random() * interval '30 days') as fecha_registro,
    'sistema' as usuario_registro
FROM cat_productos_variantes
WHERE id_material = 'AL' -- Only Aluminum
ORDER BY random()
LIMIT 45 -- Generate 45 pieces
ON CONFLICT DO NOTHING;

-- 2. ENSURE RECENT MOVEMENTS (FOR ABC ANALYSIS)
-- The ABC view looks at the last 90 days. If the simulation date range ended earlier, we see nothing.
-- Let's inject some recent 'VENTA' and 'PRODUCCION' movements for the top items.

INSERT INTO trx_movimientos (
    tipo_movimiento,
    id_sku,
    cantidad,
    id_almacen,
    fecha_hora,
    usuario_reg,
    comentarios
)
SELECT 
    CASE WHEN random() > 0.5 THEN 'VENTA' ELSE 'PRODUCCION' END as tipo_movimiento,
    id_sku,
    -(floor(random() * 50 + 10)) as cantidad, -- Negative for output
    'PRINCIPAL',
    NOW() - (random() * interval '60 days'), -- Last 60 days
    'sistema_bonus',
    'Movimiento generado para asegurar ABC recent'
FROM cat_productos_variantes
ORDER BY random()
LIMIT 150; -- 150 recent movements
