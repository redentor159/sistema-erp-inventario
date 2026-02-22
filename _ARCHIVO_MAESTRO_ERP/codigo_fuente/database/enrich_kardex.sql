-- ENRICH KARDEX VIEW
-- This script creates a master view for reporting and visualizing the Kardex with full context.

-- 1. Optional: Strengthen Relationship between Sales and Clients
-- We try to add a FK. Use DO block to avoid error if some data is invalid or constraint exists.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_salidas_destinatario_cliente') THEN
        -- Only add if data is valid (or we could clean it first, but let's try)
        -- Removing invalid data might be dangerous, acting safe:
        -- ALTER TABLE trx_salidas_cabecera 
        -- ADD CONSTRAINT fk_salidas_destinatario_cliente 
        -- FOREIGN KEY (id_destinatario) REFERENCES mst_clientes(id_cliente);
        
        -- Since we can't guarantee data integrity yet, we will handle the relationship in the VIEW via LEFT JOIN
        null; 
    END IF;
END $$;

-- 2. CREATE THE VIEW
DROP VIEW IF EXISTS vw_kardex_reporte;

CREATE OR REPLACE VIEW vw_kardex_reporte AS
SELECT 
    -- Movimiento Base
    m.id_movimiento,
    m.fecha_hora,
    m.tipo_movimiento,
    m.cantidad,
    m.moneda_origen,
    m.costo_unit_doc,
    m.costo_total_pen,
    m.comentarios,
    m.referencia_doc, -- ID of Sale or Purchase
    
    -- Producto Info
    p.id_sku,
    p.nombre_completo as producto_nombre,
    p.unidad_medida,
    p.cod_proveedor,
    
    -- Jerarquia
    fam.nombre_familia,
    marc.nombre_marca,
    
    -- Contexto Transaccional (Entidad y Documento)
    CASE 
        WHEN m.tipo_movimiento = 'COMPRA' THEN prov.razon_social
        WHEN m.tipo_movimiento = 'VENTA' THEN cli.nombre_completo
        ELSE NULL
    END as entidad_nombre,
    
    CASE 
        WHEN m.tipo_movimiento = 'COMPRA' THEN ec.nro_documento_fisico
        ELSE NULL
    END as nro_documento
    
FROM trx_movimientos m
-- Join Producto
LEFT JOIN cat_productos_variantes p ON m.id_sku = p.id_sku
-- Join Jerarquia via Plantilla
LEFT JOIN cat_plantillas plant ON p.id_plantilla = plant.id_plantilla
LEFT JOIN mst_familias fam ON plant.id_familia = fam.id_familia
LEFT JOIN mst_marcas marc ON p.id_marca = marc.id_marca

-- Joins Transaccionales
-- Entradas
LEFT JOIN trx_entradas_cabecera ec ON m.referencia_doc = ec.id_entrada
LEFT JOIN mst_proveedores prov ON ec.id_proveedor = prov.id_proveedor

-- Salidas
LEFT JOIN trx_salidas_cabecera sc ON m.referencia_doc = sc.id_salida
LEFT JOIN mst_clientes cli ON sc.id_destinatario = cli.id_cliente;

-- 3. Security (Grant Access)
GRANT SELECT ON vw_kardex_reporte TO authenticated;
GRANT SELECT ON vw_kardex_reporte TO anon;
