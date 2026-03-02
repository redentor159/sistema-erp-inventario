-- EMPEZAMOS CON EL HITO 1: ESTRUCTURA DE BASE DE DATOS PARA TIPOLOGÍAS
-- Este script es para ejecutar en DBeaver sobre tu base de datos de experimento

-- 1. Tabla: Tipologías (El Contenedor Maestro)
CREATE TABLE IF NOT EXISTS public.tipologias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- FK temporal si es necesario vincular a la cotización, puede ser nulo por ahora
    pedido_id UUID REFERENCES public.trx_cotizaciones_cabecera(id_cotizacion) ON DELETE CASCADE, 
    descripcion VARCHAR(255) NOT NULL,
    ancho_total_mm NUMERIC(10,2) NOT NULL,
    alto_total_mm NUMERIC(10,2) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla: Cruces (El Motor del Grid)
CREATE TABLE IF NOT EXISTS public.tipologias_cruces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipologia_id UUID NOT NULL REFERENCES public.tipologias(id) ON DELETE CASCADE,
    tipo_eje VARCHAR(1) NOT NULL CHECK (tipo_eje IN ('X', 'Y')), -- 'X' es Vertical (Corta el ancho), 'Y' es Horizontal (Corta el alto)
    distancia_desde_origen_mm NUMERIC(10,2) NOT NULL CHECK (distancia_desde_origen_mm > 0),
    espesor_perfil_mm NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla: Items (Los Hijos / Ventanas)
CREATE TABLE IF NOT EXISTS public.tipologias_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipologia_id UUID NOT NULL REFERENCES public.tipologias(id) ON DELETE CASCADE,
    
    -- FK hacia la tabla de productos / variantes original
    producto_id TEXT NOT NULL REFERENCES public.cat_productos_variantes(id_sku) ON DELETE RESTRICT,
    
    -- Coordenadas de Matriz
    grid_col_start INTEGER NOT NULL CHECK (grid_col_start >= 1),
    grid_row_start INTEGER NOT NULL CHECK (grid_row_start >= 1),
    grid_col_span INTEGER NOT NULL DEFAULT 1 CHECK (grid_col_span >= 1),
    grid_row_span INTEGER NOT NULL DEFAULT 1 CHECK (grid_row_span >= 1),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Triggers Básicos (Opcional, para mantener el updated_at)
CREATE OR REPLACE FUNCTION update_tipologias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tipologias_timestamp
BEFORE UPDATE ON public.tipologias
FOR EACH ROW EXECUTE FUNCTION update_tipologias_updated_at();

CREATE TRIGGER trigger_update_tipologias_items_timestamp
BEFORE UPDATE ON public.tipologias_items
FOR EACH ROW EXECUTE FUNCTION update_tipologias_updated_at();

-- 5. Configuración de Seguridad RLS (APAGADO PARA EXPERIMENTOS LOCALES)
-- Para que puedas probar sin problemas de sesion, esto esta comentado.
-- ALTER TABLE public.tipologias ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tipologias_cruces ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tipologias_items ENABLE ROW LEVEL SECURITY;

-- 6. Comentarios (Para documentar la BD en DBeaver)
COMMENT ON TABLE public.tipologias IS 'Contenedores padre del motor paramétrico (vanos).';
COMMENT ON COLUMN public.tipologias_cruces.tipo_eje IS 'X = Vertical (afecta el ancho), Y = Horizontal (afecta el alto)';
COMMENT ON TABLE public.tipologias_items IS 'Ítems o productos reales posicionados en el grid de la tipología principal.';
