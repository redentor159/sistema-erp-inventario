-- ADDING HISTORY COLUMNS TO ACTIVE ORDERS
-- Author: Windsurf Agent
-- Date: 2026-02-05

-- Explanation:
-- To track movement and reworks *while the card is active* (for the "Ver Historial" feature),
-- we need to store these arrays on the active table, not just the archive table.

ALTER TABLE trx_kanban_orders 
ADD COLUMN IF NOT EXISTS movement_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS rework_history JSONB DEFAULT '[]'::jsonb;
