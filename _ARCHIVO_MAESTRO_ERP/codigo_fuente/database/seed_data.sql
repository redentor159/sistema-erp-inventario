
-- =================================================================================================
-- SCRIPT DE CARGA MASIVA DE DATOS (SEED DATA)
-- METALLIC CARPENTRY & GLASS BUSINESS
-- =================================================================================================

-- 1. MAESTROS GENERALES
-- 1.1 Familias
INSERT INTO public.mst_familias (codigo_familia, nombre_familia, descripcion) VALUES
('PER', 'Perfiles de Aluminio', 'Perfiles lineales para estructuras'),
('VID', 'Vidrios y Cristales', 'Vidrios crudos, templados y laminados'),
('ACC', 'Accesorios', 'Manijas, rodamientos, felpas y gomas'),
('CON', 'Consumibles', 'Siliconas, tornillos y selladores'),
('SER', 'Servicios', 'Mano de obra e instalación');

-- 1.2 Marcas
INSERT INTO public.mst_marcas (nombre_marca, origen) VALUES
('Furukawa', 'Nacional'),
('Sodimac Basic', 'Importado'),
('Miyasato', 'Nacional'),
('Importada China', 'Importado'),
('Stanley', 'Internacional'),
('3M', 'Internacional');

-- 1.3 Materiales
INSERT INTO public.mst_materiales (codigo_material, nombre_material) VALUES
('AL', 'Aluminio'),
('CR', 'Cristal / Vidrio'),
('AC', 'Acero Inoxidable'),
('PL', 'Plástico / Nylon'),
('GO', 'Goma / Caucho');

-- 1.4 Acabados
INSERT INTO public.mst_acabados_colores (codigo_acabado, nombre_acabado, categoria) VALUES
('MATE', 'Aluminio Mate / Natural', 'General'),
('NEGRO', 'Anodizado Negro', 'General'),
('BLANCO', 'Pintura Blanca', 'General'),
('MADERA', 'Efecto Madera', 'Premium'),
('INC', 'Incoloro (Transparente)', 'Vidrio'),
('BRONCE', 'Bronce', 'Vidrio'),
('GRIS', 'Gris / Humo', 'Vidrio');

-- 2. SOCIOS DE NUGOCIO
-- 2.1 Clientes
INSERT INTO public.mst_clientes (tipo_documento, nro_documento, nombre_completo, direccion, telefono, email, categoria) VALUES
('DNI', '45678901', 'Juan Perez Arquitecto', 'Av. Larco 123, Miraflores', '999888777', 'juan@arq.com', 'VIP'),
('RUC', '20100010001', 'Constructora Los Andes SAC', 'Calle Industrial 505', '01-444-5555', 'compras@losandes.pe', 'EMPRESA'),
('DNI', '10203040', 'Maria Gonzalez (Cliente Final)', 'Jr. Los Pinos 200', '987654321', 'maria.gonz@gmail.com', 'REGULAR'),
('RUC', '20555555551', 'Inmobiliaria Futura', 'Av. Javier Prado 2020', '01-222-3333', 'proyectos@futura.com', 'VIP');

-- 2.2 Proveedores
INSERT INTO public.mst_proveedores (tipo_documento, nro_documento, razon_social, nombre_contacto, telefono_contacto) VALUES
('RUC', '20111111111', 'Corporación Furukawa', 'Carlos Ventas', '999000111'),
('RUC', '20222222222', 'Corporación Miyasato', 'Ana Vidrios', '999000222'),
('RUC', '20333333333', 'Importaciones Chinas SAC', 'Li Wei', '999000333'),
('RUC', '20444444444', 'Sodimac Perú', 'Venta Empresa', '01-600-0000');

-- 3. CATÁLOGO
-- 3.1 Plantillas (Modelos de Ventanas/Puertas)
INSERT INTO public.cat_plantillas (codigo_interno, nombre_generico, tipo_elemento, descripcion, sistema_proyeccion) VALUES
('V-COR-2H', 'Ventana Corrediza 2 Hojas', 'Ventana', 'Ventana clásica de 2 hojas móviles', 'Sistema 20/25'),
('V-COR-4H', 'Ventana Corrediza 4 Hojas', 'Ventana', 'Ventana amplia de 4 hojas (2 fijas, 2 móviles)', 'Sistema 20/25'),
('V-PROY', 'Ventana Proyectante', 'Ventana', 'Ventana con apertura hacia afuera', 'Sistema 38/42'),
('P-BAT', 'Puerta Batiente', 'Puerta', 'Puerta de ingreso peatonal', 'Sistema 42'),
('MAM-FIJA', 'Mampara Fija', 'Mampara', 'Paño fijo de vidrio templado', 'Templex'),
('MAM-COR', 'Mampara Corrediza', 'Mampara', 'Mampara de piso a techo corrediza', 'Sistema 8025');

-- 3.2 SKU (Productos / Materiales Reales)
-- Perfiles
INSERT INTO public.cat_productos_variantes (id_familia, sku, nombre_completo, unidad_medida, costo_estandar, precio_base_venta, stock_minimo, stock_actual) VALUES
((SELECT id_familia FROM mst_familias WHERE codigo_familia='PER' LIMIT 1), 'AL-2025-SUP', 'Riel Superior Serie 20', 'VAR', 45.00, 65.00, 10, 50),
((SELECT id_familia FROM mst_familias WHERE codigo_familia='PER' LIMIT 1), 'AL-2025-INF', 'Riel Inferior Serie 20', 'VAR', 42.00, 60.00, 10, 48),
((SELECT id_familia FROM mst_familias WHERE codigo_familia='PER' LIMIT 1), 'AL-2025-JAM', 'Jamba Lateral Serie 20', 'VAR', 38.00, 55.00, 20, 100),
((SELECT id_familia FROM mst_familias WHERE codigo_familia='PER' LIMIT 1), 'AL-2025-TRA', 'Traslape Serie 20', 'VAR', 35.00, 50.00, 20, 80),
((SELECT id_familia FROM mst_familias WHERE codigo_familia='PER' LIMIT 1), 'AL-2025-ZOC', 'Zócalo Serie 20', 'VAR', 40.00, 58.00, 20, 75);

-- Vidrios (Por M2)
INSERT INTO public.cat_productos_variantes (id_familia, sku, nombre_completo, unidad_medida, costo_estandar, precio_base_venta, stock_minimo, stock_actual) VALUES
((SELECT id_familia FROM mst_familias WHERE codigo_familia='VID' LIMIT 1), 'VID-CRU-6MM', 'Vidrio Crudo Incoloro 6mm', 'M2', 25.00, 45.00, 50, 200),
((SELECT id_familia FROM mst_familias WHERE codigo_familia='VID' LIMIT 1), 'VID-TEM-8MM', 'Vidrio Templado Incoloro 8mm', 'M2', 80.00, 120.00, 0, 0), -- Se compra a pedido
((SELECT id_familia FROM mst_familias WHERE codigo_familia='VID' LIMIT 1), 'VID-LAM-6MM', 'Vidrio Laminado 6mm', 'M2', 60.00, 95.00, 20, 50);

-- Accesorios
INSERT INTO public.cat_productos_variantes (id_familia, sku, nombre_completo, unidad_medida, costo_estandar, precio_base_venta, stock_minimo, stock_actual) VALUES
((SELECT id_familia FROM mst_familias WHERE codigo_familia='ACC' LIMIT 1), 'ACC-ROD-SIM', 'Rodamiento Simple', 'UND', 2.50, 5.00, 100, 500),
((SELECT id_familia FROM mst_familias WHERE codigo_familia='ACC' LIMIT 1), 'ACC-FEL-GRIS', 'Felpa Gris 5x5', 'RLL', 15.00, 25.00, 5, 20),
((SELECT id_familia FROM mst_familias WHERE codigo_familia='ACC' LIMIT 1), 'ACC-CIERRE', 'Cierre Caracol Negro', 'UND', 3.00, 8.00, 50, 150);

-- Crear un movimiento inicial de inventario (Saldo Inicial)
INSERT INTO public.trx_movimientos (tipo_movimiento, id_sku, cantidad, costo_unit_doc, comentarios)
SELECT 'SALDO_INICIAL', id_sku, stock_actual, costo_estandar, 'Carga inicial de sistema'
FROM public.cat_productos_variantes
WHERE stock_actual > 0;
