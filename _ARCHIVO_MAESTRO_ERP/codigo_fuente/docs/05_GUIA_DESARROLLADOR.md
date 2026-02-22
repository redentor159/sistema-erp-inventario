# 05 — Guía del Desarrollador

> **Última actualización:** 2026-02-21

## Documentos Relacionados

- [01_ARQUITECTURA_GENERAL.md](./01_ARQUITECTURA_GENERAL.md) — Stack tecnológico
- [04_API_REFERENCIA.md](./04_API_REFERENCIA.md) — APIs disponibles
- [06_BLINDAJE_ARQUITECTONICO.md](./06_BLINDAJE_ARQUITECTONICO.md) — Restricciones de la SPA pura
- [../HANDOFF_MAESTRO.md](../HANDOFF_MAESTRO.md) — Procedimientos de build

---

## 1. Estructura de Carpetas

```
ia inventario/
├── app/                          # Rutas de Next.js (App Router)
│   ├── (dashboard)/              # Layout principal con sidebar
│   │   ├── layout.tsx            # Layout con <Sidebar> + <Providers>
│   │   ├── dashboard/page.tsx    # Dashboard KPI
│   │   ├── catalog/page.tsx      # Catálogo de productos
│   │   ├── clients/page.tsx      # Gestión de clientes
│   │   ├── configuracion/        # Configuración general + recetas
│   │   ├── cotizaciones/         # Listado y detalle de cotizaciones
│   │   │   └── [id]/             # Ruta dinámica
│   │   │       ├── page.tsx      # Detalle (Server Component wrapper)
│   │   │       └── print/        # Editor de impresión
│   │   │           ├── page.tsx  # Server wrapper con generateStaticParams
│   │   │           └── client.tsx# Client Component real (789 líneas)
│   │   ├── export/page.tsx       # Exportador Excel
│   │   ├── inventory/page.tsx    # Inventario (Stock, Entradas, Salidas, Kardex)
│   │   ├── production/page.tsx   # Tablero Kanban
│   │   ├── quotes/page.tsx       # Cotizaciones rápidas
│   │   ├── recetas/page.tsx      # Editor de recetas
│   │   ├── settings/page.tsx     # Configuración alternativa
│   │   └── suppliers/page.tsx    # Proveedores
│   ├── layout.tsx                # Root layout (Fonts, Meta)
│   └── page.tsx                  # Página de inicio (redirect)
│
├── components/
│   ├── cat/                      # Componentes de Catálogo (7 archivos)
│   │   ├── product-form.tsx      # Formulario CRUD de SKU (~28KB)
│   │   ├── product-list.tsx      # Lista paginada con filtros (~30KB)
│   │   ├── plantilla-form.tsx    # Formulario de plantillas
│   │   └── ...
│   │
│   ├── trx/                      # Componentes Transaccionales (18 archivos)
│   │   ├── cotizacion-detail.tsx # Detalle completo (~44KB, mayor componente)
│   │   ├── cotizacion-item-dialog.tsx  # Diálogo de agregar ventana (~38KB)
│   │   ├── entrada-form.tsx      # Formulario de compras
│   │   ├── salida-form.tsx       # Formulario de salidas
│   │   └── ...
│   │
│   ├── mst/                      # Componentes Maestros (6 archivos)
│   │   ├── config-general-form.tsx  # Formulario mega (~51KB)
│   │   ├── client-form.tsx       # CRUD clientes
│   │   └── ...
│   │
│   ├── mto/                      # Componentes de Ingeniería (7 archivos)
│   │   ├── recipe-editor.tsx     # Editor de recetas (~47KB)
│   │   ├── quote-form.tsx        # Formulario de cotización (~26KB)
│   │   └── ...
│   │
│   ├── production/               # Componentes de Producción (8 archivos)
│   │   ├── kanban-board.tsx      # Tablero Drag & Drop
│   │   ├── stats-modal.tsx       # Modal de estadísticas (~26KB)
│   │   └── ...
│   │
│   ├── dashboard/                # Componentes del Dashboard (6 archivos)
│   │
│   └── ui/                       # Componentes base Radix/shadcn (25 archivos)
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── table.tsx
│       └── ...
│
├── lib/
│   ├── api/                      # Servicios de datos (10 archivos)
│   │   ├── cat.ts                # Catálogo
│   │   ├── trx.ts                # Transacciones
│   │   ├── cotizaciones.ts       # Cotizaciones
│   │   ├── recetas.ts            # Recetas
│   │   ├── kanban.ts             # Kanban
│   │   ├── dashboard.ts          # Dashboard
│   │   └── ...
│   │
│   ├── supabase/client.ts        # Singleton de Supabase (anon key)
│   ├── export/excel-export.ts    # Generador Excel client-side
│   ├── hooks/                    # Custom hooks (2 archivos)
│   ├── validators/               # Esquemas Zod (4 archivos)
│   ├── utils.ts                  # Helpers (formatCurrency, cn)
│   ├── numerosALetras.ts         # Conversor número a texto
│   └── kanban-*.ts               # Lógica Kanban
│
├── types/
│   ├── index.ts                  # Tipos MST + CAT (~151 líneas)
│   ├── cotizaciones.ts           # Tipos de cotizaciones (~222 líneas)
│   └── materiales.ts             # Tipos de materiales
│
├── database/                     # Scripts SQL (~150 archivos)
│   ├── schema.sql                # Esquema base
│   ├── 001_add_recipe_formulas.sql
│   ├── ...023_fix_markup_math.sql
│   ├── seed_*.sql                # Datos semilla
│   └── current_schema.json       # Snapshot JSON del esquema
│
├── docs/                         # Documentación (esta carpeta)
├── CONTINGENCIA_SUPABASE.md      # Plan de emergencia Docker
├── HANDOFF_MAESTRO.md            # Protocolo de entrega
├── package.json                  # Deps congeladas (sin ^ ni ~)
├── package-lock.json             # Lockfile sagrado
├── next.config.ts                # output: 'export'
├── .env.local                    # Variables de entorno (NO commitear)
└── tsconfig.json                 # Configuración TypeScript
```

---

## 2. Convenciones de Código

### Naming

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Archivo de página | `page.tsx` | `app/(dashboard)/catalog/page.tsx` |
| Componente | PascalCase | `ProductList`, `CotizacionDetail` |
| API Service | camelCase | `catApi.getProductos()` |
| Tabla SQL | snake_case con prefijo | `mst_clientes`, `trx_movimientos` |
| Tipo TS | PascalCase con prefijo | `MstCliente`, `CatProductoVariante` |
| Validador Zod | PascalCase + `Form` | `EntradaForm`, `PlantillaForm` |

### Prefijos de Tablas

| Prefijo | Significado | Ejemplo |
|---------|------------|---------|
| `mst_` | Maestra (referencial) | `mst_clientes`, `mst_familias` |
| `cat_` | Catálogo (productos) | `cat_plantillas`, `cat_productos_variantes` |
| `trx_` | Transaccional (movimiento) | `trx_movimientos`, `trx_entradas_cabecera` |
| `dat_` | Operativa (producción) | `dat_retazos_disponibles` |
| `vw_` | Vista (calculada) | `vw_stock_realtime` |
| `fn_` | Función PostgreSQL | `fn_trigger_entrada_to_kardex` |
| `tg_` | Trigger | `tg_entrada_kardex` |

---

## 3. Cómo Agregar un Nuevo Módulo

### Paso 1: Crear la Tabla en SQL
```sql
-- database/XXX_nuevo_modulo.sql
CREATE TABLE trx_mi_tabla (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campo TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Paso 2: Crear el Servicio API
```typescript
// lib/api/mi-modulo.ts
import { supabase } from "@/lib/supabase/client"

export const miModuloApi = {
    getAll: async () => {
        const { data, error } = await supabase
            .from('trx_mi_tabla')
            .select('*')
        if (error) throw error
        return data
    },
    // ... más métodos
}
```

### Paso 3: Crear el Validador
```typescript
// lib/validators/mi-modulo.ts
import { z } from "zod"

export const miFormSchema = z.object({
    campo: z.string().min(1, "Campo requerido"),
})

export type MiForm = z.infer<typeof miFormSchema>
```

### Paso 4: Crear la Página
```tsx
// app/(dashboard)/mi-modulo/page.tsx
"use client"
import { useQuery } from "@tanstack/react-query"
import { miModuloApi } from "@/lib/api/mi-modulo"

export default function MiModuloPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['mi-modulo'],
        queryFn: miModuloApi.getAll
    })
    
    return <div>{/* UI */}</div>
}
```

---

## 4. Variables de Entorno

| Variable | Obligatoria | Descripción |
|----------|:-----------:|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Clave anónima (pública) |

> ⚠️ **NUNCA** commitees `.env.local` al repositorio. Está en `.gitignore`.

---

## 5. Comandos Esenciales

| Comando | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `npm ci` | Instalación limpia desde lockfile | **Siempre** (nunca `npm install`) |
| `npm run dev` | Servidor de desarrollo | Mientras trabajas |
| `npm run build` | Build estático → `/out` | Para producción |
| `npx serve out` | Servir la carpeta out | Para probar el build |

---

## 6. Reglas de Oro

1. **Jamás** uses `npm install`. Solo `npm ci`.
2. **Jamás** agregues `export const dynamic = 'force-dynamic'`.
3. **Jamás** crees rutas en `app/api/`. No hay servidor en producción.
4. **Toda** la lógica de datos va en `lib/api/` llamando a Supabase directamente.
5. **Todo** componente de página es `"use client"` (SPA pura).
6. Para rutas con `[id]`, **necesitas** `generateStaticParams()` en un Server Component wrapper.
