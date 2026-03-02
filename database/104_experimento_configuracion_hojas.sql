-- Agregamos la columna de configuracion_hojas para soportar combinaciones F / C (Fijo/Corrediza)
ALTER TABLE public.tipologias_items 
ADD COLUMN IF NOT EXISTS configuracion_hojas VARCHAR(50);

COMMENT ON COLUMN public.tipologias_items.configuracion_hojas IS 'Ej: CC, FCC, FCCF, FCF, etc. Aplica mayormente a ventanas/mamparas corredizas.';
