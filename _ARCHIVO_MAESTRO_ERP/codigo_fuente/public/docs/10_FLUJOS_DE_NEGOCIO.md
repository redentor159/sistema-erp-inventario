# 10 — Flujos de Negocio

> **Diagramas de secuencia y flujo de los procesos clave del ERP**  
> **Última actualización:** 2026-02-21

## Documentos Relacionados

- [03_MODULOS_Y_FUNCIONALIDADES.md](./03_MODULOS_Y_FUNCIONALIDADES.md) — Módulos involucrados
- [04_API_REFERENCIA.md](./04_API_REFERENCIA.md) — APIs utilizadas
- [09_DICCIONARIO_DATOS.md](./09_DICCIONARIO_DATOS.md) — Tablas afectadas

---

## 1. Flujo Completo de Cotización

### Visión General

```mermaid
flowchart TD
    A["👤 Vendedor abre<br/>/cotizaciones"] --> B["Crea nueva cotización"]
    B --> C["Selecciona cliente,<br/>marca, moneda"]
    C --> D["Agrega ítems<br/>(ventanas/mamparas)"]
    D --> E["Motor de Despiece<br/>(BOM automático)"]
    E --> F{"¿Despiece OK?"}
    F -->|"Sí"| G["Revisa totales<br/>(costos + markup + IGV)"]
    F -->|"No"| H["Edita manualmente<br/>el despiece"]
    H --> G
    G --> I["Editor de Impresión<br/>(/print)"]
    I --> J["window.print() → PDF"]
    J --> K["Envía al cliente"]
    K --> L{"¿Cliente acepta?"}
    L -->|"Sí"| M["Estado: Aprobada ✅"]
    L -->|"No"| N["Estado: Rechazada ❌"]
    M --> O["Pasa a Producción<br/>(Kanban)"]
```

### Secuencia Técnica del Despiece

```mermaid
sequenceDiagram
    participant UI as "Componente React"
    participant API as "cotizacionesApi"
    participant SB as "Supabase"
    participant PG as "PostgreSQL (RPC)"

    UI->>API: addLineItem(idCot, {modelo, ancho, alto, vidrio})
    API->>SB: INSERT trx_cotizaciones_detalle
    SB-->>API: id_linea_cot (UUID)
    
    UI->>API: triggerDespiece(id_linea_cot)
    API->>SB: RPC fn_calcular_despiece(id_linea)
    SB->>PG: Busca recetas del modelo
    PG->>PG: Aplica fórmulas (ANCHO-22, etc.)
    PG->>PG: Resuelve SKU real (plantilla+marca+color)
    PG->>PG: Calcula costos (qty × precio)
    PG-->>SB: INSERT múltiples trx_desglose_materiales
    SB-->>API: OK
    
    UI->>API: getDesgloseMateriales(id_linea)
    API->>SB: SELECT * WHERE id_linea_cot = ?
    SB-->>API: Filas de componentes
    API-->>UI: Renderiza tabla de BOM
```

---

## 2. Flujo de Compra (Entrada de Inventario)

```mermaid
flowchart TD
    A["📥 Usuario abre<br/>módulo Entradas"] --> B["Crea nueva entrada"]
    B --> C["Selecciona proveedor"]
    C --> D["Ingresa documento<br/>(Factura, Guía)"]
    D --> E["Agrega líneas<br/>(SKU + Qty + Precio)"]
    E --> F["Guarda entrada"]
    F --> G["INSERT trx_entradas_cabecera"]
    G --> H["INSERT trx_entradas_detalle<br/>(por cada línea)"]
    H --> I["🔔 TRIGGER automático:<br/>fn_trigger_entrada_to_kardex()"]
    I --> J["INSERT trx_movimientos<br/>(COMPRA, +qty)"]
    J --> K["vw_stock_realtime<br/>se actualiza"]
    K --> L["✅ Stock incrementado"]
```

### Detalle del Trigger

```mermaid
sequenceDiagram
    participant User as "Usuario"
    participant API as "trxApi.createEntrada()"
    participant SB as "Supabase"
    participant TG as "Trigger tg_entrada_kardex"
    participant KDX as "trx_movimientos"

    User->>API: Formulario de compra
    API->>SB: INSERT cabecera
    SB-->>API: id_entrada
    
    loop Por cada línea
        API->>SB: INSERT detalle (id_sku, qty, costo)
        SB->>TG: AFTER INSERT disparado
        TG->>KDX: INSERT movimiento COMPRA (+qty)
    end
    
    API-->>User: Entrada creada ✅
    Note over KDX: Stock se recalcula<br/>en vw_stock_realtime
```

---

## 3. Flujo de Despacho (Salida de Inventario)

```mermaid
flowchart TD
    A["📤 Crea salida"] --> B["Tipo: VENTA,<br/>PRODUCCION, AJUSTE"]
    B --> C["Selecciona destinatario"]
    C --> D["Agrega líneas SKU"]
    D --> E["Guarda salida"]
    E --> F["INSERT trx_salidas_detalle"]
    F --> G["🔔 TRIGGER:<br/>fn_trigger_salida_to_kardex()"]
    G --> H["INSERT trx_movimientos<br/>(tipo_salida, -qty)"]
    H --> I["Stock reducido ✅"]
```

---

## 4. Flujo de Producción (Kanban)

```mermaid
flowchart LR
    A["BACKLOG<br/>(Por Planificar)"] -->|"Drag"| B["CORTE<br/>(En Fábrica)"]
    B -->|"Drag"| C["ARMADO<br/>(Ensamblaje)"]
    C -->|"Drag"| D["ACABADO<br/>(Pintura/Anodizado)"]
    D -->|"Drag"| E["CONTROL<br/>(Inspección QC)"]
    E -->|"Drag"| F["ENTREGADO ✅"]
```

### Cómo llegan las órdenes al Kanban

```mermaid
sequenceDiagram
    participant COT as "Cotización Aprobada"
    participant KB as "Kanban Board"
    participant DB as "dat_kanban_produccion"

    COT->>KB: Usuario importa cotización
    KB->>DB: INSERT orden (estado: BACKLOG)
    
    Note over KB: Drag & Drop...
    KB->>DB: UPDATE estado = 'CORTE'
    KB->>DB: UPDATE estado = 'ARMADO'
    KB->>DB: UPDATE estado = 'ACABADO'
    KB->>DB: UPDATE estado = 'CONTROL'
    KB->>DB: UPDATE estado = 'ENTREGADO'
```

---

## 5. Flujo de Exportación Excel

```mermaid
flowchart TD
    A["📊 Usuario abre /export"] --> B["Selecciona tipo:<br/>Comercial/Inventario/Kardex/Maestros"]
    B --> C{"¿Filtro de fecha?"}
    C -->|"Sí"| D["Selecciona rango"]
    C -->|"No"| E["Sin filtro"]
    D --> F["Click: Exportar"]
    E --> F
    F --> G["exportDataToExcelType()"]
    G --> H["Consulta Supabase<br/>(múltiples tablas)"]
    H --> I["ExcelJS genera<br/>workbook multi-hoja"]
    I --> J["FileSaver.saveAs()<br/>descarga .xlsx"]
    J --> K["✅ Archivo en disco"]
```

---

## 6. Flujo de Cálculo de Precios en Cotización

```mermaid
flowchart TD
    A["Ventana:<br/>2000mm × 1500mm<br/>Serie 25"] --> B["Motor de Despiece"]
    
    B --> C["Perfiles"]
    B --> D["Vidrios"]
    B --> E["Accesorios"]
    
    C --> F["Riel Superior: 2000-22 = 1978mm<br/>Costo: S/ 45.00"]
    C --> G["Riel Inferior: 2000-22 = 1978mm<br/>Costo: S/ 52.00"]
    C --> H["Jamba: 1500-30 = 1470mm × 2<br/>Costo: S/ 78.00"]
    
    D --> I["Vidrio: 0.97 × 0.73 m² × 2 hojas<br/>Costo: S/ 120.00"]
    
    E --> J["Felpa, Seguro, Jalador<br/>Costo: S/ 35.00"]
    
    F --> K["Subtotal Materiales<br/>S/ 330.00"]
    G --> K
    H --> K
    I --> K
    J --> K
    
    K --> L["+ Mano de Obra<br/>(3.0 m² × S/ 25/m²)"]
    L --> M["= Costo Directo<br/>S/ 405.00"]
    M --> N["× Markup (35%)<br/>= S/ 546.75"]
    N --> O["+ IGV (18%)<br/>= S/ 645.17"]
    O --> P["💰 PRECIO FINAL<br/>S/ 645.17"]
```

---

## 7. Flujo de Datos en Tiempo Real (SPA)

```mermaid
flowchart TD
    subgraph "NAVEGADOR"
        A["Componente React"] -->|"useQuery()"| B["TanStack Query"]
        B -->|"Cache Hit?"| C{"¿Caché válido?"}
        C -->|"No (staleTime: 0)"| D["fetch a Supabase"]
        C -->|"Sí"| E["Renderiza desde caché"]
        D --> F["Actualiza caché"]
        F --> E
    end

    subgraph "SUPABASE"
        D --> G["PostgREST API"]
        G --> H["PostgreSQL"]
        H --> I["Vistas (VW)"]
        I --> G
    end

    subgraph "INVALIDACIÓN"
        J["useMutation().onSuccess"] --> K["queryClient.invalidateQueries()"]
        K --> B
    end
```

---

## 8. Ciclo de Vida de una Cotización (Estado)

```mermaid
stateDiagram-v2
    [*] --> Borrador : createCotizacion()
    Borrador --> Borrador : Editar ítems
    Borrador --> Aprobada : updateEstado('Aprobada')
    Borrador --> Rechazada : updateEstado('Rechazada', motivo)
    Aprobada --> Anulada : updateEstado('Anulada')
    Rechazada --> Borrador : Reactivar (crear clon)
    
    Aprobada --> [*] : Pasa a Producción
    Anulada --> [*]
    
    note right of Borrador
        Se pueden editar
        ítems, precios y
        condiciones
    end note
    
    note right of Aprobada
        Fecha de aprobación
        se registra
        automáticamente
    end note
```
