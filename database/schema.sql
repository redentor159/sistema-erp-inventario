-- ERP/WMS Metallic Carpentry SQL Schema
-- Author: Windsurf Agent (Antigravity)
-- Context: High Precision MTO

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================================================
-- 1. CAPA MAESTRA (MST)
-- =================================================================================================

-- 1.1 MST_CONFIG_GENERAL
CREATE TABLE mst_config_general (
    id_config TEXT PRIMARY KEY,
    margen_ganancia_default NUMERIC NOT NULL,
    igv NUMERIC NOT NULL,
    markup_cotizaciones_default NUMERIC NOT NULL,
    costo_mo_m2_default NUMERIC NOT NULL,
    tipo_cambio_referencial NUMERIC NOT NULL,
    cuenta_bcp_soles TEXT,
    texto_condiciones_base TEXT
);

-- 1.2 MST_CLIENTES
CREATE TABLE mst_clientes (
    id_cliente TEXT PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    ruc TEXT UNIQUE NOT NULL,
    telefono TEXT,
    direccion_obra_principal TEXT,
    tipo_cliente TEXT CHECK (tipo_cliente IN ('EMPRESA', 'PERSONA'))
);

-- 1.3 MST_PROVEEDORES
CREATE TABLE mst_proveedores (
    id_proveedor TEXT PRIMARY KEY,
    razon_social TEXT NOT NULL,
    ruc TEXT UNIQUE NOT NULL,
    nombre_comercial TEXT,
    contacto_vendedor TEXT,
    telefono_pedidos TEXT,
    email_pedidos TEXT,
    dias_credito INT,
    moneda_predeterminada TEXT CHECK (moneda_predeterminada IN ('PEN', 'USD'))
);

-- 1.4 METADATA TABLES
CREATE TABLE mst_familias (
    id_familia TEXT PRIMARY KEY,
    nombre_familia TEXT NOT NULL,
    categoria_odoo TEXT
);

CREATE TABLE mst_marcas (
    id_marca TEXT PRIMARY KEY,
    nombre_marca TEXT NOT NULL,
    pais_origen TEXT
);

CREATE TABLE mst_materiales (
    id_material TEXT PRIMARY KEY,
    nombre_material TEXT NOT NULL,
    odoo_code TEXT
);

CREATE TABLE mst_acabados_colores (
    id_acabado TEXT PRIMARY KEY,
    nombre_acabado TEXT NOT NULL,
    sufijo_sku TEXT
);

CREATE TABLE mst_series_equivalencias (
    id_sistema TEXT PRIMARY KEY,
    nombre_comercial TEXT NOT NULL,
    cod_corrales TEXT,
    cod_eduholding TEXT,
    cod_hpd TEXT,
    cod_limatambo TEXT,
    uso_principal TEXT
);

-- 2. CAPA DE CATÁLOGO (CAT)
-- 2.1 CAT_PLANTILLAS
CREATE TABLE cat_plantillas (
    id_plantilla TEXT PRIMARY KEY,
    nombre_generico TEXT NOT NULL,
    id_familia TEXT REFERENCES mst_familias(id_familia),
    id_sistema TEXT REFERENCES mst_series_equivalencias(id_sistema),
    largo_estandar_mm NUMERIC,
    peso_teorico_kg NUMERIC,
    imagen_ref TEXT
);

-- 2.2 CAT_PRODUCTOS_VARIANTES
CREATE TABLE cat_productos_variantes (
    id_sku TEXT PRIMARY KEY,
    id_plantilla TEXT REFERENCES cat_plantillas(id_plantilla),
    id_marca TEXT REFERENCES mst_marcas(id_marca),
    id_material TEXT REFERENCES mst_materiales(id_material),
    id_acabado TEXT REFERENCES mst_acabados_colores(id_acabado),
    cod_proveedor TEXT,
    nombre_completo TEXT NOT NULL,
    unidad_medida TEXT,
    costo_mercado_unit NUMERIC NOT NULL,
    moneda_reposicion TEXT,
    fecha_act_precio TIMESTAMP,
    es_templado BOOLEAN,
    espesor_mm NUMERIC,
    costo_flete_m2 NUMERIC
);

-- 1.5 MST_RECETAS_INGENIERIA (Requires cat_plantillas FK)
CREATE TABLE mst_recetas_ingenieria (
    id_receta TEXT PRIMARY KEY,
    id_modelo TEXT,
    id_plantilla TEXT REFERENCES cat_plantillas(id_plantilla),
    id_material_receta TEXT REFERENCES mst_materiales(id_material),
    id_acabado_receta TEXT REFERENCES mst_acabados_colores(id_acabado),
    id_marca_receta TEXT REFERENCES mst_marcas(id_marca),
    nombre_componente TEXT,
    tipo TEXT CHECK (tipo IN ('Perfil', 'Accesorio', 'Vidrio')),
    cantidad_base NUMERIC,
    factor_cantidad_ancho NUMERIC,
    factor_cantidad_alto NUMERIC,
    factor_cantidad_area NUMERIC,
    factor_corte_ancho NUMERIC,
    factor_corte_alto NUMERIC,
    constante_corte_mm NUMERIC,
    angulo INT CHECK (angulo IN (45, 90)),
    condicion TEXT CHECK (condicion IN ('BASE', 'OPCIONAL'))
);

-- =================================================================================================
-- 3. CAPA TRANSACCIONAL (TRX)
-- =================================================================================================

-- 3.1 TRX_MOVIMIENTOS (Kardex)
CREATE TABLE trx_movimientos (
    id_movimiento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha_hora TIMESTAMP DEFAULT NOW(),
    tipo_movimiento TEXT CHECK (tipo_movimiento IN ('COMPRA', 'VENTA', 'PRODUCCION', 'AJUSTE', 'RETORNO')),
    id_sku TEXT REFERENCES cat_productos_variantes(id_sku),
    cantidad NUMERIC NOT NULL,
    id_almacen TEXT DEFAULT 'PRINCIPAL',
    moneda_origen TEXT,
    costo_unit_doc NUMERIC,
    tipo_cambio NUMERIC,
    costo_total_pen NUMERIC,
    referencia_doc UUID,
    usuario_reg TEXT,
    motivo_ajuste TEXT,
    comentarios TEXT
);

-- 3.2 TRX_ENTRADAS_CABECERA
CREATE TABLE trx_entradas_cabecera (
    id_entrada UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_entrada TEXT,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    id_proveedor TEXT REFERENCES mst_proveedores(id_proveedor),
    id_cliente TEXT REFERENCES mst_clientes(id_cliente), -- Para devoluciones
    nro_documento_fisico TEXT,
    moneda TEXT,
    tipo_cambio NUMERIC,
    estado TEXT,
    evidencia_adjunta TEXT,
    comentarios TEXT
);

-- 3.3 TRX_ENTRADAS_DETALLE
CREATE TABLE trx_entradas_detalle (
    id_linea_entrada UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_entrada UUID REFERENCES trx_entradas_cabecera(id_entrada) ON DELETE CASCADE,
    id_sku TEXT REFERENCES cat_productos_variantes(id_sku),
    cantidad NUMERIC NOT NULL,
    costo_unitario NUMERIC NOT NULL,
    descuento NUMERIC DEFAULT 0,
    total_linea NUMERIC NOT NULL
);

-- 3.4 TRX_SALIDAS_CABECERA
CREATE TABLE trx_salidas_cabecera (
    id_salida UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_salida TEXT,
    fecha TIMESTAMP DEFAULT NOW(),
    id_destinatario TEXT, -- Podria ser FK a cliente o interno
    estado TEXT,
    comentario TEXT,
    total_dinero NUMERIC,
    responsable_interno TEXT
);

-- 3.5 TRX_SALIDAS_DETALLE
CREATE TABLE trx_salidas_detalle (
    id_linea_salida UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_salida UUID REFERENCES trx_salidas_cabecera(id_salida) ON DELETE CASCADE,
    id_sku TEXT REFERENCES cat_productos_variantes(id_sku),
    cantidad NUMERIC NOT NULL,
    precio_unitario NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL
);

-- =================================================================================================
-- 4. CAPA DE COTIZACIÓN (MTO)
-- =================================================================================================

-- 4.1 TRX_COTIZACIONES_CABECERA
CREATE TABLE trx_cotizaciones_cabecera (
    id_cotizacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha_emision TIMESTAMP DEFAULT NOW(),
    estado TEXT,
    id_cliente TEXT REFERENCES mst_clientes(id_cliente),
    id_marca TEXT REFERENCES mst_marcas(id_marca),
    nombre_proyecto TEXT,
    moneda TEXT,
    validez_dias INT,
    plazo_entrega TEXT,
    condicion_pago TEXT,
    markup_aplicado NUMERIC,
    incluye_igv BOOLEAN,
    aplica_detraccion BOOLEAN,
    costo_mano_obra_m2 NUMERIC,
    costo_global_instalacion NUMERIC,
    total_costo_directo NUMERIC,
    total_precio_venta NUMERIC,
    observaciones TEXT,
    link_pdf TEXT
);

-- 4.2 TRX_COTIZACIONES_DETALLE
CREATE TABLE trx_cotizaciones_detalle (
    id_linea_cot UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cotizacion UUID REFERENCES trx_cotizaciones_cabecera(id_cotizacion) ON DELETE CASCADE,
    id_modelo TEXT,
    color_perfiles TEXT,
    cantidad NUMERIC NOT NULL,
    ancho_mm NUMERIC,
    alto_mm NUMERIC,
    etiqueta_item TEXT,
    ubicacion TEXT,
    tipo_cierre TEXT,
    tipo_vidrio TEXT,
    grupo_opcion TEXT,
    costo_base_ref NUMERIC,
    subtotal_linea NUMERIC
);

-- 4.3 TRX_DESGLOSE_MATERIALES
CREATE TABLE trx_desglose_materiales (
    id_desglose UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_linea_cot UUID REFERENCES trx_cotizaciones_detalle(id_linea_cot) ON DELETE CASCADE,
    tipo_componente TEXT CHECK (tipo_componente IN ('Perfil', 'Vidrio', 'Accesorio')),
    codigo_base TEXT, -- ID_Plantilla
    nombre_componente TEXT,
    detalle_acabado TEXT,
    medida_corte_mm NUMERIC,
    angulo_corte INT,
    cantidad_calculada NUMERIC,
    sku_real TEXT REFERENCES cat_productos_variantes(id_sku),
    costo_total_item NUMERIC,
    precio_venta_item NUMERIC
);

-- =================================================================================================
-- 5. CAPA OPERATIVA (DAT)
-- =================================================================================================

-- 5.1 DAT_RETAZOS_DISPONIBLES
CREATE TABLE dat_retazos_disponibles (
    id_retazo TEXT PRIMARY KEY,
    id_sku_padre TEXT REFERENCES cat_productos_variantes(id_sku),
    longitud_mm NUMERIC NOT NULL,
    ubicacion TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    estado TEXT CHECK (estado IN ('DISPONIBLE', 'USADO')),
    orden_trabajo TEXT,
    fecha_consumo TIMESTAMP
);

-- =================================================================================================
-- 6. TRIGGERS & LOGIC
-- =================================================================================================

-- Function to update Kardex on Purchase (Entradas)
CREATE OR REPLACE FUNCTION fn_trigger_entrada_to_kardex()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO trx_movimientos (
        tipo_movimiento,
        id_sku,
        cantidad,
        costo_unit_doc,
        costo_total_pen,
        referencia_doc,
        comentarios
    )
    VALUES (
        'COMPRA',
        NEW.id_sku,
        NEW.cantidad, -- Positive
        NEW.costo_unitario,
        NEW.total_linea,
        NEW.id_entrada,
        'Auto-generated from Entrada'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_entrada_kardex
AFTER INSERT ON trx_entradas_detalle
FOR EACH ROW
EXECUTE FUNCTION fn_trigger_entrada_to_kardex();

-- Function to update Kardex on Sales/Production (Salidas)
CREATE OR REPLACE FUNCTION fn_trigger_salida_to_kardex()
RETURNS TRIGGER AS $$
DECLARE
    v_tipo_salida TEXT;
    v_comentario TEXT;
BEGIN
    -- Get header info
    SELECT tipo_salida, comentario INTO v_tipo_salida, v_comentario
    FROM trx_salidas_cabecera
    WHERE id_salida = NEW.id_salida;

    INSERT INTO trx_movimientos (
        tipo_movimiento,
        id_sku,
        cantidad,
        costo_unit_doc,
        costo_total_pen,
        referencia_doc,
        comentarios,
        tipo_cambio,       -- Super Bot: 1.00
        id_almacen,        -- Super Bot: PRINCIPAL
        moneda_origen      -- Super Bot: PEN
    )
    VALUES (
        v_tipo_salida,
        NEW.id_sku,
        NEW.cantidad * -1, -- Negative for outbound
        NEW.precio_unitario,
        (NEW.cantidad * -1) * NEW.precio_unitario, -- Total value negative
        NEW.id_salida,
        v_comentario,
        1.00,
        'PRINCIPAL',
        'PEN'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_salida_kardex
AFTER INSERT ON trx_salidas_detalle
FOR EACH ROW
EXECUTE FUNCTION fn_trigger_salida_to_kardex();

-- Enable RLS (Examples - default deny is safest, open for now for development if needed, but best practise is to enable)
-- ALTER TABLE mst_clientes ENABLE ROW LEVEL SECURITY;
-- (Add policies as needed)
