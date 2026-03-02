-- Hito 5/6: Experimento Grid
-- Eliminamos la llave foránea estricta a cat_productos_variantes 
-- porque ahora los items pueden ser modelos genéricos de mst_recetas_modelos (ej. "MDL-VCO-001")

ALTER TABLE public.tipologias_items 
DROP CONSTRAINT IF EXISTS tipologias_items_producto_id_fkey;

-- Agregamos un comentario para recordar por qué se quitó
COMMENT ON COLUMN public.tipologias_items.producto_id IS 'ID del producto o modelo (ya no es FK directa a cat_productos_variantes para permitir IDs de mst_recetas_modelos)';
