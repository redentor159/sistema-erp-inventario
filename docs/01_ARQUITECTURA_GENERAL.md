# 01 — Arquitectura General del Sistema ERP

> **Proyecto:** Sistema ERP de Inventario y Cotizaciones para Carpintería Metálica  
> **Stack:** Next.js 16 (SPA Estática) + Supabase (PostgreSQL) + TanStack Query  
> **Última actualización:** 2026-02-21

## Documentos Relacionados

| Documento | Enlace |
|-----------|--------|
| Esquema de Base de Datos | [02_ESQUEMA_BASE_DATOS.md](./02_ESQUEMA_BASE_DATOS.md) |
| Módulos y Funcionalidades | [03_MODULOS_Y_FUNCIONALIDADES.md](./03_MODULOS_Y_FUNCIONALIDADES.md) |
| Referencia de API | [04_API_REFERENCIA.md](./04_API_REFERENCIA.md) |
| Guía del Desarrollador | [05_GUIA_DESARROLLADOR.md](./05_GUIA_DESARROLLADOR.md) |
| Blindaje Arquitectónico | [06_BLINDAJE_ARQUITECTONICO.md](./06_BLINDAJE_ARQUITECTONICO.md) |
| Contingencia Supabase | [../CONTINGENCIA_SUPABASE.md](../CONTINGENCIA_SUPABASE.md) |
| Handoff Maestro | [../HANDOFF_MAESTRO.md](../HANDOFF_MAESTRO.md) |
| Diccionario de Datos | [09_DICCIONARIO_DATOS.md](./09_DICCIONARIO_DATOS.md) |
| Flujos de Negocio | [10_FLUJOS_DE_NEGOCIO.md](./10_FLUJOS_DE_NEGOCIO.md) |

---

## 1. Visión General

Este sistema ERP está diseñado para una empresa de **carpintería metálica** (vidriería de aluminio) en Perú. Gestiona el ciclo completo desde la cotización de ventanas/mamparas hasta el control del inventario de perfiles, accesorios y vidrios, incluyendo la producción tipo Kanban.

### Características Principales
- **Catálogo Maestro** de perfiles, vidrios y accesorios con SKU dinámico
- **Motor de Cotizaciones** con despiece automático de ingeniería (BOM)
- **Inventario tipo Kardex** con entradas, salidas y stock en tiempo real
- **Dashboard KPI** con métricas comerciales y operativas
- **Tablero Kanban** de producción
- **Exportador Excel** multi-hoja para análisis en Power BI
- **Editor de Impresión** de cotizaciones con temas visuales

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión Congelada | Propósito |
|------|-----------|-------------------|-----------|
| **Framework** | Next.js | 16.1.6 | SPA estática (`output: 'export'`) |
| **UI Library** | React | 19.2.3 | Renderizado de componentes |
| **Estilos** | Tailwind CSS | 4.x | Sistema de diseño utilitario |
| **Componentes UI** | Radix UI | 1.x | Primitivos accesibles (Dialog, Tabs, etc.) |
| **State/Data** | TanStack Query | 5.90.20 | Cache y fetching client-side |
| **Formularios** | React Hook Form + Zod | 7.71.1 / 4.3.6 | Validación tipada |
| **Backend** | Supabase (PostgreSQL) | 2.94.0 | Base de datos, Auth, RLS |
| **Exportación** | ExcelJS + FileSaver | 4.4.0 / 2.0.5 | Generación de XLSX en cliente |
| **Gráficos** | Recharts | 3.7.0 | Visualizaciones del Dashboard |
| **Drag & Drop** | @hello-pangea/dnd | 18.0.1 | Tablero Kanban |

---

## 3. Diagrama de Arquitectura por Capas

```mermaid
graph TB
    subgraph "NAVEGADOR DEL USUARIO"
        A["Next.js SPA (HTML/JS Estático)"]
        B["TanStack Query Cache"]
        C["React Components"]
        D["ExcelJS (Generación local)"]
    end

    subgraph "CDN / HOSTING ESTÁTICO"
        E["Carpeta /out<br/>(Netlify, S3, IIS)"]
    end

    subgraph "SUPABASE CLOUD"
        F["API REST (PostgREST)"]
        G["PostgreSQL 15"]
        H["Row Level Security"]
        I["Triggers & Functions"]
        J["Vistas Materializadas"]
    end

    E -->|"Sirve archivos"| A
    A --> B
    B --> C
    C -->|"HTTPS (fetch)"| F
    F --> G
    G --> H
    G --> I
    G --> J
    C --> D
```

---

## 4. Arquitectura por Capas de Datos

El sistema utiliza un modelo de **4 capas lógicas** en la base de datos, inspirado en arquitectura de Data Warehouse:

```mermaid
graph LR
    subgraph "CAPA MST (Maestra)"
        M1["mst_config_general"]
        M2["mst_clientes"]
        M3["mst_proveedores"]
        M4["mst_familias"]
        M5["mst_marcas"]
        M6["mst_materiales"]
        M7["mst_acabados_colores"]
        M8["mst_series_equivalencias"]
        M9["mst_recetas_modelos"]
        M10["mst_recetas_ingenieria"]
    end

    subgraph "CAPA CAT (Catálogo)"
        C1["cat_plantillas"]
        C2["cat_productos_variantes"]
    end

    subgraph "CAPA TRX (Transaccional)"
        T1["trx_movimientos (Kardex)"]
        T2["trx_entradas_cabecera"]
        T3["trx_entradas_detalle"]
        T4["trx_salidas_cabecera"]
        T5["trx_salidas_detalle"]
        T6["trx_cotizaciones_cabecera"]
        T7["trx_cotizaciones_detalle"]
        T8["trx_desglose_materiales"]
    end

    subgraph "CAPA DAT (Operativa)"
        D1["dat_retazos_disponibles"]
        D2["dat_kanban_produccion"]
    end

    M4 --> C1
    M8 --> C1
    C1 --> C2
    M5 --> C2
    M6 --> C2
    M7 --> C2
    C2 --> T1
    C2 --> T3
    C2 --> T5
    M2 --> T6
    T6 --> T7
    T7 --> T8
    C2 --> D1
```

---

## 5. Flujo de Datos (Data Flow)

```mermaid
sequenceDiagram
    participant U as Usuario (Navegador)
    participant TQ as TanStack Query
    participant SB as Supabase REST API
    participant PG as PostgreSQL

    U->>TQ: Abre módulo (ej: Inventario)
    TQ->>SB: GET /rest/v1/vw_stock_realtime
    SB->>PG: SELECT * FROM vw_stock_realtime
    PG-->>SB: Rows []
    SB-->>TQ: JSON Response
    TQ-->>U: Renderiza tabla con datos

    Note over TQ: staleTime: 0<br/>refetchOnWindowFocus: true

    U->>TQ: Cambia de pestaña y vuelve
    TQ->>SB: Re-fetch automático
    SB-->>TQ: Datos frescos
    TQ-->>U: Actualiza UI
```

---

## 6. Modelo de Despliegue

| Entorno | Tecnología | Descripción |
|---------|-----------|-------------|
| **Desarrollo** | `npm run dev` | Servidor local Next.js con HMR |
| **Build** | `npm run build` | Genera carpeta `/out` estática |
| **Producción** | CDN estático | Netlify, S3, IIS, Cloudflare Pages |
| **Base de datos** | Supabase Cloud | PostgreSQL gestionado con RLS |
| **Contingencia** | Docker (Self-host) | Ver [CONTINGENCIA_SUPABASE.md](../CONTINGENCIA_SUPABASE.md) |

### Diagrama de Despliegue

```mermaid
graph LR
    DEV["Desarrollador<br/>npm run dev"] -->|"npm run build"| BUILD["Carpeta /out"]
    BUILD -->|"Upload"| CDN["CDN Estático<br/>(Netlify/S3/IIS)"]
    CDN -->|"HTTPS"| USER["Usuario Final"]
    USER -->|"API Calls"| SUPA["Supabase Cloud<br/>PostgreSQL"]
```

---

## 7. Seguridad

| Capa | Mecanismo | Detalle |
|------|-----------|---------|
| **Transporte** | HTTPS/TLS | Todas las comunicaciones cifradas |
| **Autenticación** | Supabase Anon Key | Clave pública para acceso controlado |
| **Autorización** | Row Level Security (RLS) | Políticas a nivel de fila en PostgreSQL |
| **Variables** | `.env.local` | Claves nunca expuestas en el código |
| **Versiones** | `package-lock.json` | Dependencias congeladas con `npm ci` |

---

## 8. Principios de Diseño

1. **SPA Pura (Serverless):** Todo el renderizado ocurre en el navegador. No hay servidor Node.js en producción.
2. **Client-Side Fetching:** TanStack Query maneja todo el estado remoto con revalidación agresiva.
3. **Inmutabilidad Temporal:** Versiones exactas en `package.json` para reproducibilidad a 10+ años.
4. **Separación por Capas:** MST → CAT → TRX → DAT, cada capa con responsabilidad clara.
5. **Exportación Portátil:** La carpeta `/out` es autosuficiente y deployable en cualquier servidor HTTP.
