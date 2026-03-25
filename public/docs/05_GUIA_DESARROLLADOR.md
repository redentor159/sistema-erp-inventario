# 05 — Guía del Desarrollador

> **Última actualización:** 2026-03-24

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
│   ├── layout.tsx                # Root layout (Fonts, Meta, <html>)
│   ├── page.tsx                  # Página de inicio (redirect a login/dashboard)
│   ├── globals.css               # Estilos globales + Tailwind
│   ├── icon.png                  # Favicon
│   ├── login/page.tsx            # Pantalla de autenticación
│   ├── reset-password/page.tsx   # Restablecer contraseña
│   ├── mantenimiento/page.tsx    # Herramientas admin (refresh vistas, limpieza)
│   │
│   └── (dashboard)/              # Route Group: layout con Sidebar
│       ├── layout.tsx            # Layout con <Sidebar> + <Providers>
│       ├── dashboard/page.tsx    # Dashboard KPI
│       ├── catalog/page.tsx      # Catálogo de productos
│       ├── clients/page.tsx      # Gestión de clientes
│       ├── suppliers/page.tsx    # Gestión de proveedores
│       ├── inventory/page.tsx    # Inventario (Stock, Entradas, Salidas, Kardex)
│       ├── cotizaciones/         # Cotizaciones
│       │   ├── page.tsx          # Lista de cotizaciones
│       │   ├── [id]/             # Ruta dinámica por ID
│       │   │   ├── page.tsx      # Detalle
│       │   │   └── print/        # Editor de impresión
│       │   ├── detalle/          # Ruta alternativa de detalle
│       │   └── imprimir/         # Ruta alternativa de impresión
│       ├── quotes/page.tsx       # Cotizaciones rápidas
│       ├── recetas/page.tsx      # Editor de recetas de ingeniería
│       ├── production/page.tsx   # Tablero Kanban
│       ├── export/page.tsx       # Exportador Excel
│       ├── hojas-conteo/page.tsx # Generador de hojas de conteo (~55KB)
│       ├── configuracion/        # Configuración general
│       │   ├── page.tsx          # Config principal
│       │   └── recetas/page.tsx  # Config de recetas
│       ├── settings/page.tsx     # Configuración alternativa
│       ├── maestros/             # Datos maestros genéricos
│       │   ├── page.tsx          # Familias, marcas, materiales, acabados, almacenes
│       │   └── series/page.tsx   # Series y equivalencias
│       └── experimento-grid/     # ⚠️ EXPERIMENTAL: diseño visual SVG (no en producción)
│
├── components/                   # Componentes React reutilizables
│   ├── ui/                       # 🧱 Primitivos shadcn/ui (28 archivos)
│   │   ├── button.tsx, dialog.tsx, table.tsx, tabs.tsx
│   │   ├── toast.tsx, toaster.tsx, use-toast.ts
│   │   ├── select.tsx, input.tsx, textarea.tsx, label.tsx
│   │   ├── form.tsx, command.tsx, popover.tsx
│   │   ├── sheet.tsx, dropdown-menu.tsx, alert-dialog.tsx
│   │   ├── badge.tsx, card.tsx, checkbox.tsx, switch.tsx
│   │   ├── scroll-area.tsx, separator.tsx, slider.tsx
│   │   ├── accordion.tsx, collapsible.tsx, alert.tsx
│   │   └── simple-tooltip.tsx
│   │
│   ├── cat/                      # Catálogo (7 archivos)
│   │   ├── plantilla-form.tsx    # Formulario CRUD de plantillas
│   │   ├── plantilla-list.tsx    # Lista de plantillas
│   │   ├── product-form.tsx      # Formulario de variantes SKU (~29KB)
│   │   ├── product-list.tsx      # Lista paginada con filtros (~46KB)
│   │   ├── product-detail-sheet.tsx  # Panel lateral de detalle
│   │   ├── market-cost-dialog.tsx    # Diálogo de costo de mercado
│   │   └── stock-adjustment-dialog.tsx # Ajuste de stock
│   │
│   ├── trx/                      # Transaccionales (20 archivos)
│   │   ├── stock-list.tsx        # Vista de stock actual
│   │   ├── entrada-form/list/detail.tsx  # Entradas de compra
│   │   ├── salida-form/list/detail.tsx   # Salidas de almacén
│   │   ├── kardex-list/detail.tsx        # Historial Kardex
│   │   ├── cotizaciones-list.tsx         # Lista de cotizaciones
│   │   ├── cotizacion-detail.tsx         # Detalle completo (~43KB, mayor componente)
│   │   ├── cotizacion-item-dialog.tsx    # Agregar ventana (~34KB)
│   │   ├── cotizacion-despiece-dialog.tsx # Despiece de materiales
│   │   ├── cotizacion-ingenieria-manual-dialog.tsx # Ingeniería manual
│   │   ├── despiece-preview.tsx          # Vista previa despiece
│   │   ├── ItemRenderer.tsx              # Renderizador de ítems
│   │   ├── client-combobox.tsx           # Buscador de clientes
│   │   ├── product-combobox.tsx          # Buscador de productos
│   │   ├── server-product-combobox.tsx   # Buscador server-side
│   │   └── inline-product-combobox.tsx   # Buscador inline
│   │
│   ├── mst/                      # Maestros (10 archivos)
│   │   ├── config-general-form.tsx       # Config general (~39KB)
│   │   ├── client-form/list.tsx          # CRUD clientes
│   │   ├── supplier-form/list.tsx        # CRUD proveedores
│   │   ├── series-form/list.tsx          # Series y equivalencias
│   │   ├── company-identity-form.tsx     # Identidad de empresa
│   │   ├── secret-danger-zone.tsx        # Zona peligrosa admin
│   │   └── generic-master-data-client.tsx # CRUD genérico maestros
│   │
│   ├── mto/                      # Ingeniería/Recetas (7 archivos)
│   │   ├── recipe-editor.tsx     # Editor de recetas (~55KB)
│   │   ├── recipe-model-list.tsx # Lista de modelos
│   │   ├── recipe-editor-page.tsx # Página wrapper
│   │   ├── recipe-mass-audit.tsx # Auditoría masiva
│   │   ├── quote-form.tsx        # Formulario cotización (~22KB)
│   │   ├── catalog-sku-selector.tsx # Selector de SKU
│   │   └── formula-input.tsx     # Input de fórmulas
│   │
│   ├── dat/                      # Operativos (2 archivos)
│   │   ├── retazo-form.tsx       # Formulario de retazos
│   │   └── retazo-list.tsx       # Lista de retazos
│   │
│   ├── dashboard/                # Dashboard y Navegación (10 archivos)
│   │   ├── app-sidebar.tsx       # Sidebar principal
│   │   ├── mobile-sidebar.tsx    # Sidebar móvil
│   │   ├── nav-item.tsx          # Elemento de navegación
│   │   ├── user-nav.tsx          # Menú del usuario
│   │   ├── help-panel.tsx        # Panel de ayuda integrado (~20KB)
│   │   ├── sheet-executive.tsx   # KPI ejecutivo
│   │   ├── sheet-commercial.tsx  # KPI comercial
│   │   ├── sheet-operations.tsx  # KPI operaciones
│   │   ├── sheet-analytics.tsx   # KPI analítico (~18KB)
│   │   └── sheet-risk.tsx        # KPI riesgo
│   │
│   ├── production/               # Producción Kanban (8 archivos)
│   │   ├── kanban-board.tsx      # Tablero Drag & Drop (~15KB)
│   │   ├── work-order-dialog.tsx # Órdenes de trabajo
│   │   ├── stats-modal.tsx       # Estadísticas (~25KB)
│   │   ├── tutorial-modal.tsx    # Tutorial interactivo
│   │   ├── history-modal.tsx     # Historial de cambios
│   │   ├── settings-modal.tsx    # Config del Kanban
│   │   ├── export-modal.tsx      # Exportar producción
│   │   └── docs-modal.tsx        # Docs integrada
│   │
│   ├── experimento-grid/         # ⚠️ EXPERIMENTAL: diseñador SVG (4 archivos)
│   │   ├── GridPlayground.tsx, GeneradorSVG.tsx
│   │   ├── ControlsPanel.tsx, CatalogPalette.tsx
│   │
│   ├── auth-guard.tsx            # Guardia de autenticación
│   ├── error-boundary.tsx        # Captura de errores global
│   └── providers.tsx             # Providers (TanStack Query, etc.)
│
├── lib/                          # Lógica de negocio
│   ├── api/                      # Servicios de datos Supabase (10 archivos)
│   │   ├── cat.ts                # Catálogo
│   │   ├── trx.ts                # Transacciones
│   │   ├── cotizaciones.ts       # Cotizaciones
│   │   ├── recetas.ts            # Recetas
│   │   ├── kanban.ts             # Kanban
│   │   ├── dashboard.ts          # Dashboard
│   │   ├── mst.ts                # Maestros
│   │   ├── mto.ts                # Mantenimiento
│   │   ├── retazos.ts            # Retazos
│   │   └── config.ts             # Configuración
│   │
│   ├── supabase/                 # Cliente de Supabase (3 archivos)
│   │   ├── client.ts             # Singleton para navegador
│   │   ├── server.ts             # Cliente para SSR
│   │   └── middleware.ts         # Middleware de auth
│   │
│   ├── validators/               # Esquemas Zod (4 archivos)
│   │   ├── cat.ts, trx.ts, mst.ts, mto.ts
│   │
│   ├── utils/                    # Utilidades (4 archivos)
│   │   ├── errorHandler.ts       # Manejo centralizado de errores
│   │   ├── exportToExcel.ts      # Generador Excel (~27KB)
│   │   ├── formula-engine.ts     # Motor de fórmulas (~11KB)
│   │   └── matrix-engine.ts      # Motor de matrices
│   │
│   ├── export/                   # Exportación de datos (4 archivos)
│   │   ├── excel-export.ts       # Exportador principal
│   │   ├── hojas-conteo-excel.ts # Hojas de conteo Excel
│   │   ├── hojas-conteo-pdf.tsx  # Hojas de conteo PDF
│   │   └── hojas-conteo-queries.ts # Queries para conteo
│   │
│   ├── hooks/                    # Hooks específicos (2 archivos)
│   │   ├── useCotizacion.ts      # Lógica de cotizaciones
│   │   └── useToastHelper.ts     # Helper de notificaciones
│   │
│   ├── tipologias/               # Motor de tipologías (1 archivo)
│   │   └── matrixEngine.ts       # Motor de matriz para ventanas
│   │
│   ├── utils.ts                  # Helpers generales (cn, formatCurrency)
│   ├── numerosALetras.ts         # Conversor número → texto español
│   ├── kanban-adapter.ts         # Adaptador de datos Kanban
│   └── kanban-data.ts            # Constantes Kanban
│
├── types/                        # Tipos TypeScript centralizados (4 archivos)
│   ├── index.ts                  # MstCliente, CatPlantilla, CatProductoVariante, etc.
│   ├── cotizaciones.ts           # Tipos de cotizaciones y despiece
│   ├── materiales.ts             # Tipos de materiales
│   └── tipologias.ts             # Tipos de tipologías
│
├── config/                       # Configuración de la app (1 archivo)
│   └── navigation.ts             # Sidebar: íconos, rutas, etiquetas
│
├── hooks/                        # Hooks globales (2 archivos)
│   ├── useRole.ts                # Detección de rol (admin/operador)
│   └── useTableSort.ts           # Ordenamiento de tablas reutilizable
│
├── store/                        # Estado global Zustand (1 archivo)
│   └── tipologiasStore.ts        # Estado para módulo experimental
│
├── database/                     # Scripts SQL (177 archivos)
│   ├── 000_MIGRATION_ORDER.md    # Guía de orden de ejecución
│   ├── schema.sql                # Esquema base
│   ├── 001_...026_*.sql          # Migraciones numeradas (~30)
│   ├── seed_*.sql                # Datos semilla (~25)
│   ├── fix_*.sql                 # Correcciones (~30)
│   ├── sprint*_*.sql             # Features por sprint (~15)
│   ├── 10X_experimento_*.sql     # Experimentos (~10)
│   ├── add_variants_*.sql        # Variantes de productos
│   └── current_schema.json       # Snapshot JSON del esquema
│
├── sql/                          # Scripts SQL independientes (4 archivos)
│   ├── 09_almacenes.sql          # Lógica de almacenes
│   ├── 16_semaforo_costo.sql     # Alertas de costo
│   ├── 17_trigger_actualizar_costo_mercado.sql
│   └── 18_rpc_limpieza_modular.sql
│
├── docs/                         # Documentación técnica (22 archivos + 2 subcarpetas)
│   ├── 00_INDICE_MAESTRO.md      # Índice general
│   ├── 01_...16_*.md             # Documentos numerados
│   ├── tutoriales/               # 13 tutoriales (T01...T13) para Help Panel
│   └── manual_entrenamiento/     # Manual operativo MTO
│
├── scripts/                      # Scripts de utilidad (18 archivos)
│   ├── generar_capsula_tiempo.ps1 # Backup "Cápsula del Tiempo"
│   ├── generate-docs-manifest.mjs # Genera manifest para Help Panel
│   ├── check_*.js, inspect-*.ts  # Debug y verificación
│   └── verify_*.ts               # Validación de lógica
│
├── tests/                        # Pruebas automatizadas
│   ├── unit/                     # Tests unitarios (Vitest)
│   │   ├── formulas.test.ts, validators.test.ts
│   │   ├── api-transforms.test.ts
│   │   └── tipologias/           # Tests de tipologías
│   ├── e2e/                      # Tests E2E (Playwright)
│   │   ├── auth.spec.ts, cotizaciones.spec.ts
│   │   ├── inventory.spec.ts, produccion.spec.ts
│   └── components/               # Tests de componentes
│       └── sidebar.test.tsx
│
├── supabase/                     # Configuración Supabase CLI
│   ├── config.toml               # Config local (~15KB)
│   └── migrations/               # Migraciones formales (3 archivos)
│
├── public/                       # Archivos estáticos
│   ├── docs/                     # Copia de docs/ para Help Panel (con manifest.json)
│   └── *.svg                     # Íconos SVG
│
├── design-system/                # Guía de diseño visual
│   └── erp-metalmecanica/        # Especificaciones del sistema de diseño
│
├── .github/                      # GitHub Actions + Dependabot
│   ├── dependabot.yml            # Monitoreo de dependencias
│   └── workflows/
│       ├── ci-pipeline.yml       # CI: lint + build
│       ├── backup-base-datos.yml # Backup diario automático
│       ├── keep-alive-supabase.yml # Anti-suspensión
│       └── update-supabase-types.yml # Regenerar tipos TS
│
├── .agents/skills/               # Skills para agentes de IA
│   ├── supabase-postgres-best-practices/
│   └── vercel-react-best-practices/
│
├── .agent/                       # Reglas obligatorias para agentes de IA
│   ├── rules/                    # 5 archivos de reglas (00...04)
│   └── skills/                   # Skills adicionales
│
├── _ARCHIVO_MAESTRO_ERP/         # "Cápsula del Tiempo" (backup total)
│   ├── base_datos/, build_out/, codigo_fuente/
│   ├── documentacion/, instaladores/, secretos/
│
├── _EMERGENCIA_SUPABASE/         # Kit de emergencia Docker
│   ├── .env.local, docker/, instaladores/
│
├── HANDOFF_MAESTRO.md            # Protocolo de entrega
├── CONTINGENCIA_SUPABASE.md      # Plan B si Supabase falla
├── README.md                     # Presentación del proyecto
├── REPORTE_DEUDA_TECNICA.md      # Inventario de deuda técnica
├── AUDITORIA_TASKS.md            # Tareas de auditoría
├── CHANGELOG_CORRECCIONES_*.md   # Registro de correcciones
├── COMANDOS_GIT.md               # Guía rápida Git
├── GIT_GUIDE.md                  # Guía Git adicional
├── package.json                  # Deps congeladas (sin ^ ni ~)
├── package-lock.json             # Lockfile sagrado
├── next.config.ts                # output: 'export'
├── tsconfig.json                 # Configuración TypeScript
├── eslint.config.mjs             # Reglas de linting
├── vitest.config.ts              # Config tests unitarios
├── playwright.config.ts          # Config tests E2E
├── postcss.config.mjs            # PostCSS para Tailwind
├── components.json               # Config shadcn/ui
└── .env.local                    # Variables de entorno (NO commitear)
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

### Prefijos de Componentes (por carpeta)

| Carpeta | Capa | Responsabilidad |
|---------|------|----------------|
| `components/ui/` | Base | Primitivos shadcn/ui (botones, diálogos, tablas). **No modificar para lógica de negocio.** |
| `components/cat/` | Catálogo | CRUD de plantillas y variantes SKU |
| `components/trx/` | Transaccional | Inventario, entradas, salidas, kardex, cotizaciones |
| `components/mst/` | Maestros | Clientes, proveedores, config general, datos maestros |
| `components/mto/` | Ingeniería | Recetas, fórmulas, cotizador |
| `components/dat/` | Operativo | Retazos de material |
| `components/dashboard/` | Navegación/KPI | Sidebar, help panel, hojas de métricas |
| `components/production/` | Producción | Kanban, estadísticas, órdenes de trabajo |

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

### Paso 5: Agregar al Sidebar
```typescript
// config/navigation.ts — agregar entrada al array de navegación
{ label: "Mi Módulo", href: "/mi-modulo", icon: IconComponent }
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
| `npx vitest run` | Tests unitarios | Antes de hacer push |
| `npx playwright test` | Tests E2E | Para validar flujos completos |

---

## 6. Reglas de Oro

1. **Jamás** uses `npm install`. Solo `npm ci`.
2. **Jamás** agregues `export const dynamic = 'force-dynamic'`.
3. **Jamás** crees rutas en `app/api/`. No hay servidor en producción.
4. **Toda** la lógica de datos va en `lib/api/` llamando a Supabase directamente.
5. **Todo** componente de página es `"use client"` (SPA pura).
6. Para rutas con `[id]`, **necesitas** `generateStaticParams()` en un Server Component wrapper.
7. Los componentes de `components/ui/` son primitivos de shadcn. **No metas lógica de negocio ahí.**
8. Cada módulo nuevo debe seguir el patrón: SQL → `lib/api/` → `lib/validators/` → `components/` → `app/page.tsx` → `config/navigation.ts`.
