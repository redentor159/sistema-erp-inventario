# 08 — Arquitectura del Motor de Recetas y Cotizaciones

> **Documento técnico del corazón del ERP:** el motor de despiece automático (BOM Engine)
> que convierte dimensiones de ventanas en listas de materiales con costos.
> **Verificado contra schema real:** 2026-02-21

## Documentos Relacionados

| Documento | Enlace |
|-----------|--------|
| Esquema de Base de Datos | [02_ESQUEMA_BASE_DATOS.md](./02_ESQUEMA_BASE_DATOS.md) |
| Módulos y Funcionalidades | [03_MODULOS_Y_FUNCIONALIDADES.md](./03_MODULOS_Y_FUNCIONALIDADES.md) |
| API de Cotizaciones | [04_API_REFERENCIA.md](./04_API_REFERENCIA.md) |
| Diccionario de Datos | [09_DICCIONARIO_DATOS.md](./09_DICCIONARIO_DATOS.md) |
| Flujos de Negocio | [10_FLUJOS_DE_NEGOCIO.md](./10_FLUJOS_DE_NEGOCIO.md) |

---

## 1. Modelo de Datos del Motor de Recetas

```mermaid
erDiagram
    MST_SERIES_EQUIVALENCIAS ||--o{ MST_RECETAS_MODELOS : "agrupa modelos"
    MST_RECETAS_MODELOS ||--o{ MST_RECETAS_INGENIERIA : "contiene lineas"
    MST_SERIES_EQUIVALENCIAS ||--o{ CAT_PLANTILLAS : contiene
    CAT_PLANTILLAS ||--o{ CAT_PRODUCTOS_VARIANTES : genera
    CAT_PLANTILLAS ||--o{ MST_RECETAS_INGENIERIA : define
    MST_MARCAS ||--o{ CAT_PRODUCTOS_VARIANTES : etiqueta
    MST_ACABADOS_COLORES ||--o{ CAT_PRODUCTOS_VARIANTES : colorea
    MST_MATERIALES ||--o{ CAT_PRODUCTOS_VARIANTES : compone

    TRX_COTIZACIONES_CABECERA ||--o{ TRX_COTIZACIONES_DETALLE : tiene
    TRX_COTIZACIONES_CABECERA }|--|| MST_MARCAS : usa
    TRX_COTIZACIONES_CABECERA }|--|| MST_CLIENTES : cliente
    TRX_COTIZACIONES_DETALLE ||--o{ TRX_DESGLOSE_MATERIALES : desglosa

    MST_RECETAS_INGENIERIA }|--|| CAT_PLANTILLAS : "plantilla base"
    MST_RECETAS_INGENIERIA }|--|| MST_MATERIALES : material
    MST_RECETAS_INGENIERIA }|--|| MST_ACABADOS_COLORES : acabado
    MST_RECETAS_INGENIERIA }|--|| MST_MARCAS : marca
    CAT_PRODUCTOS_VARIANTES }|--|| CAT_PLANTILLAS : "instancia de"

    MST_SERIES_EQUIVALENCIAS {
        TEXT id_sistema PK "SYS_20, SYS_25, SYS_80"
        TEXT nombre_comercial "S20, S25, S80"
    }

    MST_RECETAS_MODELOS {
        TEXT id_modelo PK "S20_2H, S25_4H_FCCF"
        TEXT id_sistema FK
        TEXT nombre_comercial "Serie 20 - 2 Hojas"
        INT num_hojas "2, 4, 6"
        TEXT descripcion
        BOOL activo "true/false"
    }

    CAT_PLANTILLAS {
        TEXT id_plantilla PK "2001, 2501, CI25F"
        TEXT nombre_generico "Riel Sup, Cierre"
        TEXT id_familia FK "AL, VID, ACC"
        TEXT id_sistema FK
    }

    CAT_PRODUCTOS_VARIANTES {
        TEXT id_sku PK "AL-2001-BLA-FURUKAWA"
        TEXT id_plantilla FK
        TEXT id_marca FK
        TEXT id_acabado FK
        NUMERIC costo_mercado_unit
        BOOLEAN es_templado
        NUMERIC espesor_mm
        NUMERIC costo_flete_m2
    }

    MST_RECETAS_INGENIERIA {
        TEXT id_receta PK
        TEXT id_modelo FK
        TEXT id_sistema FK
        TEXT id_plantilla FK
        TEXT tipo "Perfil Accesorio Vidrio Servicio"
        TEXT seccion "MARCO HOJAS ACCESORIOS_MARCO..."
        INT orden_visual "0..N"
        NUMERIC cantidad_base
        TEXT formula_cantidad "ancho * 2 + alto"
        TEXT formula_perfil "ancho - 22"
        NUMERIC factor_corte_ancho
        NUMERIC factor_corte_alto
        NUMERIC constante_corte_mm
        INT angulo "0, 45, 90"
        TEXT condicion "BASE, OPCIONAL"
        TEXT grupo_opcion
        TEXT id_sku_catalogo
        NUMERIC precio_unitario_manual
    }

    TRX_COTIZACIONES_CABECERA {
        UUID id_cotizacion PK
        estado_cotizacion estado "Borrador Aprobada Finalizada..."
        TEXT id_marca FK "FURUKAWA, HPD"
        NUMERIC markup_aplicado "0.35"
        NUMERIC costo_mano_obra_m2
        NUMERIC costo_fijo_instalacion
    }

    TRX_COTIZACIONES_DETALLE {
        UUID id_linea_cot PK
        TEXT id_modelo FK "S20_2H"
        TEXT color_perfiles "BLA, CHA, MAD"
        NUMERIC ancho_mm
        NUMERIC alto_mm
        TEXT tipo_vidrio FK
        JSONB opciones_seleccionadas
        BOOL es_despiece_manual
    }

    TRX_DESGLOSE_MATERIALES {
        UUID id_desglose PK
        TEXT tipo_componente "Perfil Vidrio Accesorio Servicio"
        TEXT sku_real "Calculado dinamicamente"
        NUMERIC medida_corte_mm
        NUMERIC cantidad_calculada
        NUMERIC costo_total_item
        TEXT detalle_formula
    }
```

> **Diferencia clave vs doc anterior:** se añadió la tabla `mst_recetas_modelos` que agrupa las recetas por modelo. El campo `estado` de `trx_cotizaciones_cabecera` es un ENUM PostgreSQL con 5 valores: `'Borrador'`, `'Aprobada'`, `'Finalizada'`, `'Rechazada'`, `'Anulada'`.

---

## 2. Flujo del Despiece Automático (`fn_generar_despiece_ingenieria`)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as cotizacion-item-dialog
    participant API as cotizacionesApi
    participant DB as PostgreSQL
    participant FN as fn_generar_despiece_ingenieria

    U->>UI: Selecciona Sistema (SYS_20)
    UI->>API: getModelosBySistema("SYS_20")
    API->>DB: SELECT FROM mst_recetas_modelos WHERE id_sistema
    DB-->>UI: [S20_2H, S20_4H_FCCF...]

    U->>UI: Selecciona Modelo, Color, Dimensiones
    U->>UI: Click "Agregar"

    UI->>API: addLineItem(cotId, item)
    API->>DB: INSERT INTO trx_cotizaciones_detalle RETURNING id_linea_cot
    DB-->>API: nuevo UUID

    API->>DB: SELECT fn_generar_despiece_ingenieria(nuevo_uuid)

    Note over FN: PASO 1: Cargar datos (línea, cabecera, config, modelo)
    FN->>DB: SELECT * FROM trx_cotizaciones_detalle
    FN->>DB: SELECT * FROM trx_cotizaciones_cabecera
    FN->>DB: SELECT * FROM mst_config_general
    FN->>DB: SELECT num_hojas FROM mst_recetas_modelos

    Note over FN: PASO 2: Limpiar despiece anterior
    FN->>DB: DELETE FROM trx_desglose_materiales WHERE id_linea_cot

    Note over FN: PASO 3: Leer opciones_seleccionadas (factor_flete, etc.)
    FN->>FN: Parse JSONB opciones

    loop Por cada receta del modelo
        Note over FN: PASO 4a: Calcular CANTIDAD
        alt formula_cantidad existe
            FN->>FN: fn_evaluar_formula(formula, ancho, alto, hojas)
        else legacy factors
            FN->>FN: cantidad_base + factor_ancho * ancho + factor_alto * alto
        end

        Note over FN: PASO 4b: Calcular MEDIDA CORTE (solo Perfiles)
        alt formula_perfil existe
            FN->>FN: fn_evaluar_formula(formula_perfil, ancho, alto, hojas)
        else legacy factors
            FN->>FN: factor_corte_ancho * ancho + factor_corte_alto * alto + constante
        end

        Note over FN: PASO 4c: Resolver SKU
        alt grupo_opcion en opciones_seleccionadas
            FN->>FN: SKU = valor seleccionado por usuario
        else id_sku_catalogo definido
            FN->>FN: SKU = id_sku_catalogo (override directo)
        else
            FN->>FN: fn_calcular_sku_real(tipo, plantilla, color, marca)
        end

        Note over FN: PASO 4d: Buscar costo + conversión moneda
        FN->>DB: SELECT costo_mercado_unit, moneda FROM cat_productos_variantes
        FN->>FN: Si USD entonces costo *= tipo_cambio
        FN->>FN: Si Perfil entonces costo /= 6.0 (barra 6m) y usar medida/1000

        Note over FN: PASO 4e: INSERT desglose (UNITARIO, sin multiplicar por cantidad_item)
        FN->>DB: INSERT INTO trx_desglose_materiales
    end

    Note over FN: PASO 5: Vidrio (si tipo_vidrio definido)
    FN->>DB: Buscar SKU vidrio, calcular area_m2, INSERT

    Note over FN: PASO 6: Flete (si factor_flete > 0 en opciones)
    FN->>DB: INSERT Servicio flete = area * factor * precio_unit

    Note over FN: PASO 7: Mano de Obra (si costo_mo_m2 > 0)
    FN->>DB: INSERT Servicio MO = area * costo_m2

    Note over FN: PASO 8: Actualizar totales en la línea
    FN->>DB: UPDATE trx_cotizaciones_detalle SET costo_base_ref, subtotal_linea

    FN-->>API: Despiece completo
    API-->>UI: Éxito → Recargar datos
```

---

## 3. Fórmulas de SKU Dinámico

### 3.1 Resolución de SKU (3 niveles de prioridad)

```mermaid
flowchart TD
    A["Receta tiene<br/>grupo_opcion?"] -->|Sí| B["opciones_seleccionadas<br/>tiene ese campo?"]
    B -->|Sí| C["SKU = valor del JSONB<br/>(selección del usuario)"]
    B -->|No| D["¿id_sku_catalogo<br/>definido?"]
    A -->|No| D
    D -->|Sí| E["SKU = id_sku_catalogo<br/>(override directo)"]
    D -->|No| F["fn_calcular_sku_real()"]
    F --> G{"tipo = Perfil?"}
    G -->|Sí| H["AL- + plantilla + -COLOR- + MARCA"]
    G -->|No| I["MATERIAL- + plantilla + -ACABADO- + MARCA_RECETA"]
```

### 3.2 Para PERFILES (Aluminio)

```
SKU = "AL-" + id_plantilla + "-" + color_perfiles + "-" + id_marca_cotizacion
```

| Variable | Valor | Origen |
|----------|-------|--------|
| Plantilla | `2001` | Receta (`id_plantilla`) |
| Color | `BLA` | Selección del usuario en ítem (`color_perfiles`) |
| Marca | `FURUKAWA` | Cabecera de cotización (`id_marca`) |
| **SKU** | **`AL-2001-BLA-FURUKAWA`** | Calculado dinámicamente |

### 3.3 Para ACCESORIOS

```
SKU = COALESCE(material_receta, 'AC') + "-" + plantilla + "-" + COALESCE(acabado_receta, 'GEN') + "-" + COALESCE(marca_receta, 'GEN')
```

| Variable | Valor | Origen |
|----------|-------|--------|
| Material | `GEN` | Fijo en la receta |
| Plantilla | `CI25F` | Receta |
| Acabado | `GEN` | Fijo en la receta |
| Marca | `GEN` | Fijo en la receta |
| **SKU** | **`GEN-CI25F-GEN-GEN`** | Calculado |

### 3.4 Implementación SQL Real

```sql
CREATE OR REPLACE FUNCTION fn_calcular_sku_real(
    p_tipo TEXT,
    p_id_plantilla TEXT,
    p_color_perfiles TEXT,     -- Del usuario (solo Perfiles)
    p_id_marca_cot TEXT,       -- De la cabecera (solo Perfiles)
    p_id_material_receta TEXT, -- De la receta
    p_id_acabado_receta TEXT,  -- De la receta
    p_id_marca_receta TEXT     -- De la receta
) RETURNS TEXT AS $$
BEGIN
    IF p_tipo = 'Perfil' THEN
        RETURN 'AL-' || p_id_plantilla || '-' || p_color_perfiles || '-' || p_id_marca_cot;
    ELSE
        RETURN COALESCE(p_id_material_receta, 'AC') || '-' ||
               p_id_plantilla || '-' ||
               COALESCE(p_id_acabado_receta, 'GEN') || '-' ||
               COALESCE(p_id_marca_receta, 'GEN');
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

## 4. Evaluador de Fórmulas (`fn_evaluar_formula`)

Función que permite usar **expresiones dinámicas** en las recetas:

```sql
CREATE OR REPLACE FUNCTION fn_evaluar_formula(
    p_expression TEXT,    -- "ancho - 22" o "alto * 2 + 50"
    p_ancho NUMERIC,      -- Ancho del ítem en mm
    p_alto NUMERIC,       -- Alto del ítem en mm
    p_cant_hojas NUMERIC  -- Número de hojas del modelo (default 1)
) RETURNS NUMERIC
```

### Variables Disponibles

| Variable | Se reemplaza por | Ejemplo |
|----------|-----------------|---------|
| `ancho` | `p_ancho` (mm) | `ancho - 22` → `2000 - 22` = `1978` |
| `alto` | `p_alto` (mm) | `alto * 0.5` → `1500 * 0.5` = `750` |
| `hojas` | `p_cant_hojas` | `hojas * 2` → `2 * 2` = `4` |

### Seguridad

- Solo permite caracteres: `0-9 . + - * / ( ) espacio`
- Cualquier carácter no numérico/operador retorna `0`
- Errores de ejecución retornan `0` (nunca falla fatalmente)

---

## 5. Cálculos de Cantidades y Medidas

### 5.1 Medida de Corte (Perfiles) — Doble sistema

| Prioridad | Método | Cuándo se usa |
|:-:|--------|---------------|
| 1️⃣ | `formula_perfil` | Si el campo tiene valor (nueva forma) |
| 2️⃣ | `factor_corte_ancho/alto + constante` | Legacy, cuando no hay fórmula |

**Tabla de factores reales:**

| Componente | Plantilla | F. Ancho | F. Alto | Constante | Fórmula Equiv. |
|------------|-----------|:---:|:---:|:---:|---|
| Riel Superior | `2001` | 1 | 0 | -12 | `ancho - 12` |
| Jamba | `2009` | 0 | 1 | 0 | `alto` |
| Zócalo Superior | `2004` | 0.5 | 0 | -4 | `(ancho / 2) - 4` |
| Traslapo | `2010` | 0 | 1 | -28 | `alto - 28` |
| Marco 45° | `80501` | 1 | 0 | 0 | `ancho` (corte a 45°) |

### 5.2 Cantidad Calculada — Doble sistema

| Prioridad | Método | Cuándo se usa |
|:-:|--------|---------------|
| 1️⃣ | `formula_cantidad` | Si el campo tiene valor |
| 2️⃣ | `cantidad_base` o factores legacy | Cuando no hay fórmula |

### 5.3 Lógica de Costo por Tipo

| Tipo | Fórmula de Costo |
|------|-----------------|
| **Perfil** | `costo_barra / 6.0` → `cantidad × (medida_mm / 1000) × costo_metro` |
| **Accesorio** | `cantidad × costo_unitario` |
| **Vidrio** | `area_m² × costo_m²` |
| **Servicio** | `area_m² × costo_m²` (MO) o `area × factor × precio` (Flete) |

> **Conversión de moneda:** Si `moneda_reposicion = 'USD'`, se multiplica por `tipo_cambio_referencial` (de `mst_config_general`).

---

## 6. Pipeline Completo de Costos

```mermaid
flowchart TD
    A["Ventana 2000×1500mm"] --> B["fn_generar_despiece_ingenieria"]

    B --> C["Perfiles"]
    B --> D["Accesorios"]
    B --> E["Vidrio"]
    B --> F["Flete"]
    B --> G["Mano de Obra"]

    C --> C1["costo_barra/6 × medida/1000 × qty"]
    D --> D1["qty × costo_unit"]
    E --> E1["area_m2 × costo_vidrio_m2"]
    F --> F1["area_m2 × factor_flete × precio_flete"]
    G --> G1["area_m2 × costo_mo_m2"]

    C1 --> H["SUM = costo_base_ref<br/>(Costo UNITARIO del ítem)"]
    D1 --> H
    E1 --> H
    F1 --> H
    G1 --> H

    H --> I["subtotal_linea =<br/>costo_base_ref × (1 + markup) × cantidad"]
    I --> J["vw_cotizaciones_totales<br/>SUM(subtotales) + costo_fijo_instalacion"]
    J --> K["× (1 + IGV 18%)<br/>= Precio Final Cliente"]
```

> **Importante:** Los costos en `trx_desglose_materiales` son **UNITARIOS** (por 1 unidad del ítem). La multiplicación por `cantidad` del ítem ocurre al calcular `subtotal_linea` en la línea.

---

## 7. Opciones Dinámicas (`opciones_seleccionadas`)

El campo JSONB `opciones_seleccionadas` en `trx_cotizaciones_detalle` permite configuraciones dinámicas por ítem:

```json
{
    "factor_flete": "1.5",
    "factor_flete_otro": "",
    "tipo_vidrio_custom": "VID-6MM-TEMPLADO"
}
```

### Cómo interactúan con las recetas:

1. **`grupo_opcion`** en `mst_recetas_ingenieria` define qué campo del JSONB usar
2. Si el campo existe en el JSONB → el valor se usa como SKU directamente
3. Si no existe → se usa el flujo normal de SKU dinámico

### Flete Dinámico:

| Valor `factor_flete` | Comportamiento |
|----------------------|---------------|
| `"1.5"` | `area × 1.5 × precio_flete_unit` |
| `"Otro"` | Lee `factor_flete_otro` como número |
| `null` o vacío | No se agrega flete |

---

## 8. Secciones de Recetas

Las recetas se organizan en **secciones** para el editor visual:

| Sección | Descripción |
|---------|-------------|
| `MARCO` | Perfiles del marco exterior |
| `HOJAS` | Perfiles de hojas móviles |
| `ACCESORIOS_MARCO` | Accesorios del marco |
| `ACCESORIOS_HOJAS` | Accesorios de las hojas |
| `INTERIOR` | Componentes internos |
| `CRUCES` | Perfiles de cruce |
| `ACCESORIOS_CRUCES` | Accesorios de cruce |
| `GENERAL` | Default (componentes sin clasificar) |

El campo `orden_visual` controla el orden de aparición dentro de cada sección.

---

## 9. Vistas SQL de Cálculo

### 9.1 `vw_cotizaciones_detalladas`

Agrega columnas calculadas a cada línea de cotización:

| Columna Virtual | Fórmula |
|----------------|---------|
| `_costo_materiales` | `SUM(costo_total_item) FROM trx_desglose_materiales` |
| `_vc_precio_unit_oferta_calc` | `_costo_materiales × (1 + COALESCE(markup, config.default, 0.35))` |
| `_vc_subtotal_linea_calc` | `_vc_precio_unit_oferta_calc × cantidad` |

### 9.2 `vw_cotizaciones_totales`

Agrega totales a cada cabecera:

| Columna Virtual | Fórmula |
|----------------|---------|
| `_vc_total_costo_materiales` | `SUM(_costo_materiales)` de todos los ítems |
| `_vc_subtotal_venta` | `SUM(_vc_subtotal_linea_calc) + costo_fijo_instalacion` |
| `_vc_monto_igv` | `_vc_subtotal_venta × igv` (solo si `incluye_igv = true`) |
| `_vc_precio_final_cliente` | `_vc_subtotal_venta × (1 + igv)` o `_vc_subtotal_venta` |

### 9.3 Vistas de Auditoría

| Vista | Propósito |
|-------|----------|
| `vw_audit_skus_recetas` | Genera el SKU teórico de cada receta |
| `vw_audit_skus_faltantes` | Cruza SKUs teóricos con catálogo real |
| `vw_audit_plantillas_faltantes` | Recetas que referencian plantillas inexistentes |
| `vw_audit_resumen_sistema` | % de completitud por sistema/modelo |

---

## 10. Funciones RPC Auxiliares

| Función | Propósito |
|---------|----------|
| `fn_clonar_cotizacion(uuid)` | Clona cabecera + detalle + regenera despiece |
| `fn_clonar_item_cotizacion(uuid)` | Clona un ítem individual y regenera su BOM |
| `fn_archive_kanban_order(...)` | Archiva orden Kanban completada al historial |
| `rename_sku(old, new, data)` | Renombra un SKU propagando a todas las tablas FK |
| `update_costos_mercado_bulk(jsonb)` | Actualización masiva de precios |
| `get_abc_analysis_v2(dias)` | Análisis ABC por valor de salidas |
| `get_abc_inventory_valuation()` | Análisis ABC por valorización de stock |

### APIs del Frontend

| Operación | API | Método |
|-----------|-----|--------|
| Listar modelos | `recetasApi` | `getModelos()` |
| Ver líneas de un modelo | `recetasApi` | `getRecetasByModelo(id)` |
| Agregar componente | `recetasApi` | `createRecetaLinea(data)` |
| Clonar modelo completo | `recetasApi` | `clonarModelo(id, nuevo_id, nombre)` |
| Auditoría masiva | `recetasApi` | `getAllRecetasConCatalogInfo()` |

> Para la referencia completa de la API, ver [04_API_REFERENCIA.md](./04_API_REFERENCIA.md).
