-- Hito 7b: Corrección Caché de Schema
-- Añade los campos faltantes a la tabla de items de tipología para persistir los cruces internos de un paño
ALTER TABLE public.tipologias_items 
ADD COLUMN IF NOT EXISTS cruces_verticales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cruces_horizontales INTEGER DEFAULT 0;

-- Refrescar la caché de schema de PostgREST para que Supabase reconozca la columna inmediatamente
NOTIFY pgrst, 'reload schema';
