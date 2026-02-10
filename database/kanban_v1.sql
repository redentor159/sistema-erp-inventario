-- KANBAN SYSTEM MIGRATION V1
-- Author: Windsurf Agent
-- Date: 2026-02-05

-- 1. KANBAN CONFIGURATION
-- Stores global settings like Company Name and WIP Limits
CREATE TABLE IF NOT EXISTS mst_kanban_config (
    config_key TEXT PRIMARY KEY, -- 'main_config'
    company_name TEXT DEFAULT 'Mi Vidriería',
    wip_limits JSONB DEFAULT '{"column-en-corte": 5, "column-en-ensamblaje": 5}'::jsonb
);

-- Insert default config if not exists
INSERT INTO mst_kanban_config (config_key) 
VALUES ('main_config') 
ON CONFLICT DO NOTHING;

-- 2. ACTIVE WORK ORDERS (The Board)
CREATE TABLE IF NOT EXISTS trx_kanban_orders (
    id TEXT PRIMARY KEY, -- User friendly ID like "OT-001"
    column_id TEXT NOT NULL,
    position_rank INT DEFAULT 0, -- For sorting within column
    
    -- Core Data
    client_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    brand TEXT,
    color TEXT,
    crystal_type TEXT,
    
    -- Dimensions
    width_mm NUMERIC,
    height_mm NUMERIC,
    
    -- Dates
    delivery_date DATE,
    creation_date DATE DEFAULT CURRENT_DATE,
    completion_date DATE,
    
    -- Meta
    additional_desc TEXT,
    rework_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. KANBAN HISTORY (Archived/Deleted/Finished)
-- Stores full history for statistics
CREATE TABLE IF NOT EXISTS trx_kanban_history (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_order_id TEXT, -- Keep ref but allow duplicates if IDs reused eventually
    
    -- Copied Data
    client_name TEXT,
    product_name TEXT,
    brand TEXT,
    color TEXT,
    crystal_type TEXT,
    width_mm NUMERIC,
    height_mm NUMERIC,
    delivery_date DATE,
    creation_date DATE,
    completion_date DATE,
    
    -- Status Info
    final_status TEXT, -- 'Finalizado', 'Eliminado', 'Archivado'
    deleted_from_column TEXT,
    deletion_date TIMESTAMP DEFAULT NOW(),
    
    -- JSON History Logs
    rework_history JSONB,   -- Array of {from, to, date}
    movement_history JSONB  -- Array of {stage, entryDate, exitDate}
);

-- 4. INDICES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_kanban_col_pos ON trx_kanban_orders(column_id, position_rank);
CREATE INDEX IF NOT EXISTS idx_kanban_hist_date ON trx_kanban_history(deletion_date);

-- 5. FUNCTION TO ARCHIVE ORDER
CREATE OR REPLACE FUNCTION fn_archive_kanban_order(
    p_order_id TEXT,
    p_status TEXT,
    p_deleted_from TEXT,
    p_rework_hist JSONB,
    p_move_hist JSONB
) RETURNS VOID AS $$
DECLARE
    v_order trx_kanban_orders%ROWTYPE;
BEGIN
    -- Get order data
    SELECT * INTO v_order FROM trx_kanban_orders WHERE id = p_order_id;
    
    IF FOUND THEN
        INSERT INTO trx_kanban_history (
            original_order_id,
            client_name, product_name, brand, color, crystal_type,
            width_mm, height_mm,
            delivery_date, creation_date, completion_date,
            final_status, deleted_from_column, deletion_date,
            rework_history, movement_history
        ) VALUES (
            v_order.id,
            v_order.client_name, v_order.product_name, v_order.brand, v_order.color, v_order.crystal_type,
            v_order.width_mm, v_order.height_mm,
            v_order.delivery_date, v_order.creation_date, v_order.completion_date,
            p_status, p_deleted_from, NOW(),
            p_rework_hist, p_move_hist
        );
        
        -- Delete from active
        DELETE FROM trx_kanban_orders WHERE id = p_order_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
