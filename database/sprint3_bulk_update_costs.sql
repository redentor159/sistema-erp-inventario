-- Function to update market costs in bulk
-- Payload example: [{"id_sku": "SKU123", "costo_mercado_unit": 150.50}, ...]

CREATE OR REPLACE FUNCTION public.update_costos_mercado_bulk(payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    item jsonb;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(payload)
    LOOP
        UPDATE cat_productos_variantes
        SET 
            costo_mercado_unit = (item->>'costo_mercado_unit')::numeric,
            fecha_act_precio = NOW()
        WHERE id_sku = (item->>'id_sku')::text;
    END LOOP;
END;
$function$;
