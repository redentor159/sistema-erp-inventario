# 09 — Diccionario de Datos

> **Detalle columna por columna de cada tabla del sistema**  
> **Motor:** PostgreSQL 15 (vía Supabase)  
> **Última actualización:** 2026-02-21

## Documentos Relacionados

- [02_ESQUEMA_BASE_DATOS.md](./02_ESQUEMA_BASE_DATOS.md) — Diagrama ER y resumen
- [04_API_REFERENCIA.md](./04_API_REFERENCIA.md) — APIs que consultan estas tablas
- [10_FLUJOS_DE_NEGOCIO.md](./10_FLUJOS_DE_NEGOCIO.md) — Procesos que usan estos datos

---

## CAPA MST — Tablas Maestras

### `mst_config_general` — Configuración Global

| Columna | Tipo | PK/FK | Nullable | Descripción |
|---------|------|:-----:|:--------:|-------------|
| `id_config` | TEXT | PK | No | Identificador único (normalmente `"GLOBAL"`) |
| `margen_ganancia_default` | NUMERIC | — | No | Margen de ganancia % por defecto |
| `igv` | NUMERIC | — | No | Impuesto General a las Ventas (18% en Perú) |
| `markup_cotizaciones_default` | NUMERIC | — | No | Markup % aplicado a cotizaciones nuevas |
| `costo_mo_m2_default` | NUMERIC | — | No | Costo de mano de obra por m² en PEN |
| `tipo_cambio_referencial` | NUMERIC | — | No | Tipo de cambio PEN/USD vigente |
| `cuenta_bcp_soles` | TEXT | — | Sí | Número de cuenta BCP en soles |
| `cuenta_bcp_dolares` | TEXT | — | Sí | Número de cuenta BCP en dólares |
| `cci_soles` | TEXT | — | Sí | CCI soles para transferencias interbancarias |
| `cci_dolares` | TEXT | — | Sí | CCI dólares |
| `cuenta_bbva_soles` | TEXT | — | Sí | Cuenta BBVA soles |
| `cuenta_bbva_dolares` | TEXT | — | Sí | Cuenta BBVA dólares |
| `cci_bbva_soles` | TEXT | — | Sí | CCI BBVA soles |
| `cci_bbva_dolares` | TEXT | — | Sí | CCI BBVA dólares |
| `nombre_titular_cuenta` | TEXT | — | Sí | Nombre del titular bancario |
| `texto_condiciones_base` | TEXT | — | Sí | Texto de condiciones para cotizaciones |
| `texto_garantia` | TEXT | — | Sí | Texto de garantía |
| `texto_forma_pago` | TEXT | — | Sí | Formas de pago disponibles |
| `notas_pie_cotizacion` | TEXT | — | Sí | Notas al pie de cotización |
| `nombre_empresa` | TEXT | — | Sí | Razón social de la empresa |
| `ruc` | TEXT | — | Sí | RUC de la empresa |
| `direccion_fiscal` | TEXT | — | Sí | Dirección fiscal |
| `telefono_contacto` | TEXT | — | Sí | Teléfono principal |
| `email_empresa` | TEXT | — | Sí | Email corporativo |
| `logo_url` | TEXT | — | Sí | URL del logo (Supabase Storage) |
| `firma_digital_url` | TEXT | — | Sí | URL de la firma del representante |
| `nombre_representante` | TEXT | — | Sí | Nombre del representante legal |
| `cargo_representante` | TEXT | — | Sí | Cargo (ej: "Gerente General") |
| `color_primario` | TEXT | — | Sí | Color hexadecimal de la marca |
| `moneda_default` | TEXT | — | Sí | `'PEN'` o `'USD'` |
| `validez_cotizacion_dias` | INT | — | Sí | Días de validez por defecto |
| `descuento_maximo_pct` | NUMERIC | — | Sí | Descuento máximo permitido % |

---

### `mst_clientes` — Clientes

| Columna | Tipo | PK/FK | Nullable | Descripción |
|---------|------|:-----:|:--------:|-------------|
| `id_cliente` | TEXT | PK | No | Código del cliente (ej: `"CLI-001"`) |
| `nombre_completo` | TEXT | — | No | Nombre o razón social |
| `ruc` | TEXT | UK | No | RUC o DNI (único) |
| `telefono` | TEXT | — | Sí | Teléfono de contacto |
| `direccion_obra_principal` | TEXT | — | Sí | Dirección principal de obra |
| `tipo_cliente` | TEXT | — | — | `'EMPRESA'` o `'PERSONA'` |

---

### `mst_proveedores` — Proveedores

| Columna | Tipo | PK/FK | Nullable | Descripción |
|---------|------|:-----:|:--------:|-------------|
| `id_proveedor` | TEXT | PK | No | Código del proveedor |
| `razon_social` | TEXT | — | No | Razón social |
| `ruc` | TEXT | UK | No | RUC (único) |
| `nombre_comercial` | TEXT | — | Sí | Nombre comercial |
| `contacto_vendedor` | TEXT | — | Sí | Nombre del vendedor asignado |
| `telefono_pedidos` | TEXT | — | Sí | Teléfono para pedidos |
| `email_pedidos` | TEXT | — | Sí | Email para pedidos |
| `dias_credito` | INT | — | Sí | Días de crédito otorgados |
| `moneda_predeterminada` | TEXT | — | Sí | `'PEN'` o `'USD'` |

---

### `mst_familias` — Familias de Productos

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_familia` | TEXT (PK) | Código (ej: `"PERFIL"`, `"VIDRIO"`, `"ACCESORIO"`) |
| `nombre_familia` | TEXT | Nombre descriptivo |
| `categoria_odoo` | TEXT | Código legacy de Odoo (migración) |

---

### `mst_marcas`, `mst_materiales`, `mst_acabados_colores`

| Tabla | PK | Campos Principales |
|-------|-----|-------------------|
| `mst_marcas` | `id_marca` | `nombre_marca`, `pais_origen` |
| `mst_materiales` | `id_material` | `nombre_material`, `odoo_code` |
| `mst_acabados_colores` | `id_acabado` | `nombre_acabado`, `sufijo_sku` |

---

### `mst_series_equivalencias` — Sistemas de Perfilería

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_sistema` | TEXT (PK) | Código del sistema (ej: `"SERIE_25"`) |
| `nombre_comercial` | TEXT | Nombre comercial (ej: "Serie 25 Corrediza") |
| `cod_corrales` | TEXT | Código del proveedor Corrales |
| `cod_eduholding` | TEXT | Código del proveedor Eduholding |
| `cod_hpd` | TEXT | Código HPD |
| `cod_limatambo` | TEXT | Código Limatambo |
| `uso_principal` | TEXT | Tipo de uso (ej: "Ventana Corrediza") |

---

### `mst_recetas_ingenieria` — Componentes BOM

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_receta` | TEXT (PK) | Identificador de la línea de receta |
| `id_modelo` | TEXT | Referencia al modelo de ventana |
| `id_plantilla` | TEXT (FK) | Plantilla del componente |
| `id_material_receta` | TEXT (FK) | Material base |
| `id_acabado_receta` | TEXT (FK) | Acabado/Color |
| `id_marca_receta` | TEXT (FK) | Marca preferida |
| `nombre_componente` | TEXT | Nombre descriptivo del componente |
| `tipo` | TEXT | `'Perfil'`, `'Accesorio'` o `'Vidrio'` |
| `cantidad_base` | NUMERIC | Cantidad fija por unidad |
| `factor_cantidad_ancho` | NUMERIC | Multiplicador basado en ancho |
| `factor_cantidad_alto` | NUMERIC | Multiplicador basado en alto |
| `factor_cantidad_area` | NUMERIC | Multiplicador basado en área |
| `factor_corte_ancho` | NUMERIC | Factor de corte sobre el ancho |
| `factor_corte_alto` | NUMERIC | Factor de corte sobre el alto |
| `constante_corte_mm` | NUMERIC | Constante sumada/restada al corte (mm) |
| `angulo` | INT | Ángulo de corte: `45` o `90` grados |
| `condicion` | TEXT | `'BASE'` (siempre) o `'OPCIONAL'` |
| `formula_cantidad` | TEXT | Fórmula dinámica (ej: `"ANCHO > 1200 ? 2 : 1"`) |
| `formula_perfil` | TEXT | Fórmula de longitud (ej: `"ANCHO - 22"`) |

---

## CAPA CAT — Catálogo

### `cat_plantillas` — Plantillas Genéricas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_plantilla` | TEXT (PK) | Código de plantilla (ej: `"RIEL_INF_S25"`) |
| `nombre_generico` | TEXT | Nombre genérico sin marca/color |
| `id_familia` | TEXT (FK) | Familia del producto |
| `id_sistema` | TEXT (FK) | Sistema o serie de perfilería |
| `largo_estandar_mm` | NUMERIC | Largo estándar de barra (ej: 6000 mm) |
| `peso_teorico_kg` | NUMERIC | Peso por barra en kg |
| `imagen_ref` | TEXT | URL de imagen referencial |

### `cat_productos_variantes` — SKUs Concretos

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_sku` | TEXT (PK) | SKU único (ej: `"RIEL_INF_S25-CORRALES-AL-NEGRO"`) |
| `id_plantilla` | TEXT (FK) | Plantilla base |
| `id_marca` | TEXT (FK) | Marca del producto |
| `id_material` | TEXT (FK) | Material |
| `id_acabado` | TEXT (FK) | Color/acabado |
| `cod_proveedor` | TEXT | Código del proveedor |
| `nombre_completo` | TEXT | Nombre largo descriptivo |
| `unidad_medida` | TEXT | `"UND"`, `"ML"`, `"M2"`, `"KG"` |
| `costo_mercado_unit` | NUMERIC | Costo unitario vigente |
| `moneda_reposicion` | TEXT | Moneda del costo (`'PEN'`/`'USD'`) |
| `fecha_act_precio` | TIMESTAMP | Última fecha de actualización |
| `es_templado` | BOOLEAN | Si es vidrio templado |
| `espesor_mm` | NUMERIC | Espesor en mm (solo vidrios) |
| `costo_flete_m2` | NUMERIC | Costo de flete por m² (templados) |
| `stock_minimo` | NUMERIC | Stock mínimo de seguridad |
| `punto_pedido` | NUMERIC | Nivel de reorden |

---

## CAPA TRX — Transaccional

### `trx_movimientos` — Kardex

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_movimiento` | UUID (PK) | Auto-generado |
| `fecha_hora` | TIMESTAMP | Momento del movimiento |
| `tipo_movimiento` | TEXT | `'COMPRA'`, `'VENTA'`, `'PRODUCCION'`, `'AJUSTE'`, `'RETORNO'` |
| `id_sku` | TEXT (FK) | Producto afectado |
| `cantidad` | NUMERIC | Positivo (+) = entrada, Negativo (-) = salida |
| `id_almacen` | TEXT | Almacén (`'PRINCIPAL'` por defecto) |
| `moneda_origen` | TEXT | Moneda del documento origen |
| `costo_unit_doc` | NUMERIC | Costo por unidad según documento |
| `tipo_cambio` | NUMERIC | Tipo de cambio al momento |
| `costo_total_pen` | NUMERIC | Costo total en PEN |
| `referencia_doc` | UUID | ID del documento origen (entrada/salida) |
| `usuario_reg` | TEXT | Usuario que registró |
| `motivo_ajuste` | TEXT | Justificación (solo para ajustes) |
| `comentarios` | TEXT | Notas adicionales |

### `trx_cotizaciones_cabecera` — Cabecera de Cotización

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_cotizacion` | UUID (PK) | Auto-generado |
| `fecha_emision` | TIMESTAMP | Fecha de creación |
| `estado` | TEXT | `'Borrador'`, `'Aprobada'`, `'Rechazada'`, `'Anulada'` |
| `id_cliente` | TEXT (FK) | Cliente destinatario |
| `id_marca` | TEXT (FK) | Marca de perfilería preferida |
| `nombre_proyecto` | TEXT | Nombre del proyecto/obra |
| `moneda` | TEXT | `'PEN'` o `'USD'` |
| `validez_dias` | INT | Días de validez de la oferta |
| `plazo_entrega` | TEXT | Texto libre de plazo |
| `condicion_pago` | TEXT | Condiciones de pago |
| `markup_aplicado` | NUMERIC | Margen de ganancia aplicado % |
| `incluye_igv` | BOOLEAN | Si el precio final incluye IGV |
| `aplica_detraccion` | BOOLEAN | Si aplica detracción SUNAT |
| `costo_mano_obra_m2` | NUMERIC | Costo MO/m² para esta cotización |
| `costo_fijo_instalacion` | NUMERIC | Costo fijo de instalación |
| `observaciones` | TEXT | Notas internas |
| `terminos_personalizados` | TEXT | Texto personalizado de condiciones |
| `titulo_documento` | TEXT | Título para impresión |
| `fecha_aprobacion` | TIMESTAMP | Fecha de aprobación |
| `fecha_rechazo` | TIMESTAMP | Fecha de rechazo |
| `motivo_rechazo` | TEXT | Razón del rechazo |
| `fecha_prometida` | TIMESTAMP | Fecha prometida de entrega |
| `fecha_entrega_real` | TIMESTAMP | Fecha real de entrega (OTIF) |

### `trx_cotizaciones_detalle` — Ítems de Cotización

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_linea_cot` | UUID (PK) | Auto-generado |
| `id_cotizacion` | UUID (FK) | Cotización padre |
| `id_modelo` | TEXT | Modelo de receta usado |
| `color_perfiles` | TEXT | Acabado seleccionado |
| `cantidad` | NUMERIC | Número de unidades |
| `ancho_mm` | NUMERIC | Ancho de la ventana en mm |
| `alto_mm` | NUMERIC | Alto de la ventana en mm |
| `etiqueta_item` | TEXT | Nombre descriptivo (ej: "Ventana Sala") |
| `ubicacion` | TEXT | Ubicación en la obra |
| `tipo_cierre` | TEXT | Tipo de cierre/cerradura |
| `tipo_vidrio` | TEXT | Tipo de vidrio seleccionado |
| `opciones_seleccionadas` | JSONB | Opciones adicionales |

### `trx_desglose_materiales` — BOM / Despiece

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_desglose` | UUID (PK) | Auto-generado |
| `id_linea_cot` | UUID (FK) | Ítem de cotización padre |
| `tipo_componente` | TEXT | `'Perfil'`, `'Vidrio'`, `'Accesorio'`, `'Servicio'` |
| `codigo_base` | TEXT | ID de la plantilla usada |
| `nombre_componente` | TEXT | Nombre descriptivo |
| `detalle_acabado` | TEXT | Acabado/color aplicado |
| `medida_corte_mm` | NUMERIC | Longitud de corte calculada |
| `angulo_corte` | INT | Ángulo de corte (45° o 90°) |
| `cantidad_calculada` | NUMERIC | Cantidad requerida |
| `sku_real` | TEXT (FK) | SKU concreto del catálogo |
| `costo_total_item` | NUMERIC | Costo total del componente |
| `precio_venta_item` | NUMERIC | Precio de venta con markup |

---

## CAPA DAT — Operativa

### `dat_retazos_disponibles` — Retazos Reutilizables

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_retazo` | TEXT (PK) | Código del retazo |
| `id_sku_padre` | TEXT (FK) | SKU del perfil de origen |
| `longitud_mm` | NUMERIC | Longitud disponible en mm |
| `ubicacion` | TEXT | Ubicación en el taller |
| `fecha_creacion` | TIMESTAMP | Cuándo se generó el retazo |
| `estado` | TEXT | `'DISPONIBLE'` o `'USADO'` |
| `orden_trabajo` | TEXT | OT que generó el retazo |
| `fecha_consumo` | TIMESTAMP | Cuándo fue consumido |
