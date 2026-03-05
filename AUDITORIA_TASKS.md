# 🔬 AUDITORÍA ARQUITECTÓNICA — ERP MAKE-TO-ORDER (MTO)
> Fecha de inicio: 2026-03-05
> Auditor: AI Architect (Antigravity)
> Estándares base: `vercel-react-best-practices` (58 reglas) + `supabase-postgres-best-practices` (35 reglas)
> **MODO: LECTURA ÚNICAMENTE — CERO MODIFICACIONES DE CÓDIGO**

---

## MÓDULO 1: Autenticación y Guards de Sesión
**Archivos bajo revisión:**
- `components/auth-provider.tsx` — Context de autenticación
- `components/auth-guard.tsx` — Guard de rutas protegidas
- `lib/supabase/client.ts` — Cliente Supabase (browser)
- `lib/supabase/server.ts` — Cliente Supabase (server)
- `lib/supabase/middleware.ts` — Middleware de sesión
- `app/login/page.tsx` — Página de login
- `app/reset-password/page.tsx` — Reset de contraseña
- `app/page.tsx` — Página raíz (redirect)

**Criterios de evaluación:**
- [ ] ¿Se usa `createBrowserClient` solo en Client Components?
- [ ] ¿Se usa `createServerClient` en Server Components/Actions?
- [ ] ¿El middleware renueva tokens correctamente?
- [ ] ¿Los guards protegen contra acceso directo por URL?
- [ ] ¿Se exponen claves secretas (service_role key) al cliente?

**Estado:** `- [ ] PENDIENTE`

---

## MÓDULO 2: Layout Principal y Navegación (Dashboard Shell)
**Archivos bajo revisión:**
- `app/layout.tsx` — Root layout
- `app/(dashboard)/layout.tsx` — Dashboard layout
- `components/providers.tsx` — Wrapper de providers
- `components/dashboard/app-sidebar.tsx` — Sidebar principal
- `components/dashboard/mobile-sidebar.tsx` — Sidebar móvil
- `components/dashboard/user-nav.tsx` — Navegación de usuario

**Criterios de evaluación:**
- [ ] ¿El layout shell es un Server Component?
- [ ] ¿Se están pasando props innecesarios de servidor a cliente? (`server-serialization`)
- [ ] ¿Los providers están correctamente anidados?
- [ ] ¿Hay barrel imports que inflacionen el bundle? (`bundle-barrel-imports`)

**Estado:** `- [ ] PENDIENTE`

---

## MÓDULO 3: Dashboard y Analíticas
**Archivos bajo revisión:**
- `app/(dashboard)/dashboard/page.tsx`
- `components/dashboard/sheet-analytics.tsx` (18KB)
- `components/dashboard/sheet-commercial.tsx` (8KB)
- `components/dashboard/sheet-executive.tsx` (9KB)
- `components/dashboard/sheet-operations.tsx` (7KB)
- `components/dashboard/sheet-risk.tsx` (6KB)
- `components/dashboard/help-panel.tsx` (24KB)
- `lib/api/dashboard.ts`

**Criterios de evaluación:**
- [ ] ¿Se hacen múltiples fetches secuenciales que deberían ser paralelos? (`async-parallel`)
- [ ] ¿Se usa Suspense para streaming de datos? (`async-suspense-boundaries`)
- [ ] ¿Hay componentes pesados que deberían usar dynamic imports? (`bundle-dynamic-imports`)
- [ ] ¿Se mezcla lógica de cálculo de métricas en los componentes visuales?

**Estado:** `- [ ] PENDIENTE`

---

## MÓDULO 4: Catálogo de Productos
**Archivos bajo revisión:**
- `app/(dashboard)/catalog/page.tsx`
- `components/cat/product-list.tsx` (38KB ⚠️ archivo muy grande)
- `components/cat/product-form.tsx` (22KB)
- `components/cat/product-detail-sheet.tsx` (7KB)
- `components/cat/plantilla-list.tsx` (16KB)
- `components/cat/plantilla-form.tsx` (8KB)
- `components/cat/market-cost-dialog.tsx` (3KB)
- `components/cat/stock-adjustment-dialog.tsx` (7KB)
- `lib/api/cat.ts` (11KB)
- `lib/validators/cat.ts` (3KB)

**Criterios de evaluación:**
- [ ] ¿`product-list.tsx` (38KB) mezcla lógica de negocio con presentación?
- [ ] ¿Se llama a Supabase directamente desde `"use client"` components?
- [ ] ¿Hay waterfalls en la carga de datos del catálogo?
- [ ] ¿Se usa Zod o schema validation para los formularios?
- [ ] ¿Los dialogs/sheets se cargan dinámicamente? (`bundle-dynamic-imports`)

**Estado:** `- [ ] PENDIENTE`

---

## MÓDULO 5: Maestros — Clientes, Proveedores y Series
**Archivos bajo revisión:**
- `app/(dashboard)/clients/page.tsx`
- `app/(dashboard)/suppliers/page.tsx`
- `app/(dashboard)/maestros/series/page.tsx`
- `components/mst/client-list.tsx` (15KB)
- `components/mst/client-form.tsx` (8KB)
- `components/mst/supplier-list.tsx` (16KB)
- `components/mst/supplier-form.tsx` (11KB)
- `components/mst/series-list.tsx` (15KB)
- `components/mst/series-form.tsx` (11KB)
- `lib/api/mst.ts` (4KB)
- `lib/validators/mst.ts` (3KB)

**Criterios de evaluación:**
- [ ] ¿Los listados hacen fetch desde Server Components?
- [ ] ¿Los formularios validan datos antes de enviar a Supabase?
- [ ] ¿Hay duplicación de lógica entre client-form y supplier-form?
- [ ] ¿Se manejan errores de BD apropiadamente?

**Estado:** `- [ ] PENDIENTE`

---

## MÓDULO 6: Cotizaciones (CRUD, Detalle, Impresión)
**Archivos bajo revisión:**
- `app/(dashboard)/cotizaciones/page.tsx`
- `app/(dashboard)/cotizaciones/[id]/page.tsx`
- `app/(dashboard)/cotizaciones/[id]/layout.tsx`
- `app/(dashboard)/cotizaciones/[id]/print/page.tsx`
- `app/(dashboard)/cotizaciones/detalle/page.tsx`
- `app/(dashboard)/cotizaciones/imprimir/page.tsx`
- `app/(dashboard)/quotes/page.tsx`
- `components/trx/cotizaciones-list.tsx` (13KB)
- `components/trx/cotizacion-detail.tsx` (42KB ⚠️ archivo MUY grande)
- `components/trx/cotizacion-item-dialog.tsx` (34KB ⚠️ archivo MUY grande)
- `components/trx/cotizacion-despiece-dialog.tsx` (15KB)
- `components/trx/cotizacion-ingenieria-manual-dialog.tsx` (19KB)
- `components/trx/despiece-preview.tsx` (5KB)
- `components/trx/ItemRenderer.tsx` (17KB)
- `components/trx/client-combobox.tsx` (3KB)
- `components/trx/product-combobox.tsx` (4KB)
- `components/trx/inline-product-combobox.tsx` (7KB)
- `components/trx/server-product-combobox.tsx` (7KB)
- `lib/api/cotizaciones.ts` (12KB)
- `lib/hooks/useCotizacion.ts` (2KB)
- `lib/validators/trx.ts` (3KB)
- `types/cotizaciones.ts` (6KB)

**Criterios de evaluación:**
- [ ] ¿`cotizacion-detail.tsx` (42KB) viola el principio de responsabilidad única?
- [ ] ¿`cotizacion-item-dialog.tsx` (34KB) mezcla lógica MTO con presentación?
- [ ] ¿Se hacen llamadas a Supabase desde Client Components con `"use client"`?
- [ ] ¿Las Server Actions (mutaciones) validan autenticación internamente? (`server-auth-actions`)
- [ ] ¿Hay request waterfalls al cargar el detalle de una cotización?
- [ ] ¿Los datos de impresión cargan únicamente lo necesario?
- [ ] ¿Se usa `revalidatePath`/`revalidateTag` tras mutaciones?

**Estado:** `- [ ] PENDIENTE`

---

## MÓDULO 7: Recetas y MTO (Motor de Fórmulas, Generación de SKU)
**Archivos bajo revisión:**
- `app/(dashboard)/recetas/page.tsx`
- `app/(dashboard)/configuracion/recetas/page.tsx`
- `components/mto/recipe-editor.tsx` (50KB ⚠️ archivo ENORME)
- `components/mto/recipe-editor-page.tsx` (2KB)
- `components/mto/recipe-model-list.tsx` (14KB)
- `components/mto/recipe-mass-audit.tsx` (9KB)
- `components/mto/quote-form.tsx` (21KB)
- `components/mto/catalog-sku-selector.tsx` (5KB)
- `components/mto/formula-input.tsx` (4KB)
- `lib/utils/formula-engine.ts` (11KB)
- `lib/utils/matrix-engine.ts` (4KB)
- `lib/tipologias/matrixEngine.ts` (5KB)
- `lib/api/recetas.ts` (14KB)
- `lib/api/mto.ts` (2KB)
- `lib/validators/mto.ts` (2KB)
- `store/tipologiasStore.ts` (14KB)
- `types/tipologias.ts` (3KB)

**Criterios de evaluación:**
- [ ] ¿`recipe-editor.tsx` (50KB) es mantenible? ¿Debe dividirse?
- [ ] ¿El motor de fórmulas (`formula-engine.ts`) está correctamente aislado de la UI?
- [ ] ¿Hay dos `matrixEngine` (lib/utils vs lib/tipologias)? ¿Duplicación?
- [ ] ¿El store de Zustand (`tipologiasStore.ts`) maneja estado que debería vivir en el servidor?
- [ ] ¿La lógica de generación de SKU está en componentes visuales o en utilidades separadas?
- [ ] ¿Se usa `useCallback`/`useMemo` apropiadamente en el editor de recetas?

**Estado:** `- [ ] PENDIENTE`

---

## MÓDULO 8: Inventario — Entradas, Salidas, Kardex, Stock
**Archivos bajo revisión:**
- `app/(dashboard)/inventory/page.tsx`
- `components/trx/entrada-list.tsx` (15KB)
- `components/trx/entrada-form.tsx` (14KB)
- `components/trx/entrada-detail.tsx` (5KB)
- `components/trx/salida-list.tsx` (12KB)
- `components/trx/salida-form.tsx` (14KB)
- `components/trx/salida-detail.tsx` (5KB)
- `components/trx/kardex-list.tsx` (11KB)
- `components/trx/kardex-detail.tsx` (5KB)
- `components/trx/stock-list.tsx` (5KB)
- `lib/api/trx.ts` (7KB)
- `lib/validators/trx.ts` (3KB)

**Criterios de evaluación:**
- [ ] ¿Las transacciones de inventario (entrada+actualización de stock) son atómicas?
- [ ] ¿Se usa RPC/funciones PostgreSQL para operaciones transaccionales?
- [ ] ¿Los listados cargan datos excesivos sin paginación?
- [ ] ¿Hay duplicación de lógica entre `entrada-form.tsx` y `salida-form.tsx`?

**Estado:** `- [ ] PENDIENTE`

---

## MÓDULO 9: Producción / Kanban
**Archivos bajo revisión:**
- `app/(dashboard)/production/page.tsx`
- `components/production/kanban-board.tsx` (15KB)
- `components/production/work-order-dialog.tsx` (9KB)
- `components/production/stats-modal.tsx` (24KB ⚠️ archivo grande)
- `components/production/settings-modal.tsx` (6KB)
- `components/production/export-modal.tsx` (6KB)
- `components/production/history-modal.tsx` (4KB)
- `components/production/docs-modal.tsx` (2KB)
- `components/production/tutorial-modal.tsx` (15KB)
- `lib/api/kanban.ts` (11KB)
- `lib/kanban-data.ts` (7KB)
- `lib/kanban-adapter.ts` (3KB)

**Criterios de evaluación:**
- [ ] ¿El kanban board re-renderiza excesivamente al mover tarjetas?
- [ ] ¿Se usa optimistic updates para las mutaciones?
- [ ] ¿Los modals (stats 24KB, tutorial 15KB) cargan dinámicamente?
- [ ] ¿Hay suscripciones en tiempo real (Supabase Realtime)?
- [ ] ¿La lógica de drag-and-drop está acoplada al componente visual?

**Estado:** `- [ ] PENDIENTE`

---

## MÓDULO 10: Retazos (DAT)
**Archivos bajo revisión:**
- `components/dat/retazo-list.tsx` (13KB)
- `components/dat/retazo-form.tsx` (10KB)
- `lib/api/retazos.ts` (2KB)

**Criterios de evaluación:**
- [ ] ¿El cálculo de retazos está en la UI o extraído a utilidades?
- [ ] ¿Se validan las dimensiones de retazos antes de guardar?
- [ ] ¿Hay manejo de concurrencia (dos usuarios editando el mismo retazo)?

**Estado:** `- [ ] PENDIENTE`

---

## MÓDULO 11: Configuración General
**Archivos bajo revisión:**
- `app/(dashboard)/configuracion/page.tsx`
- `app/(dashboard)/configuracion/layout.tsx`
- `app/(dashboard)/settings/page.tsx`
- `components/mst/config-general-form.tsx` (37KB ⚠️ archivo MUY grande)
- `components/mst/company-identity-form.tsx` (6KB)
- `lib/api/config.ts` (575B)

**Criterios de evaluación:**
- [ ] ¿`config-general-form.tsx` (37KB) debe dividirse en sub-formularios?
- [ ] ¿Los cambios de configuración se propagan correctamente al resto de la app?
- [ ] ¿Hay dos rutas para configuración (`/configuracion` y `/settings`)? ¿Duplicación?

**Estado:** `- [ ] PENDIENTE`

---

## MÓDULO 12: Exportación, Hojas de Conteo y Utilidades
**Archivos bajo revisión:**
- `app/(dashboard)/export/page.tsx`
- `app/(dashboard)/hojas-conteo/page.tsx`
- `lib/export/excel-export.ts` (17KB)
- `lib/export/hojas-conteo-excel.ts` (16KB)
- `lib/export/hojas-conteo-pdf.tsx` (19KB)
- `lib/export/hojas-conteo-queries.ts` (18KB)
- `lib/utils/exportToExcel.ts` (18KB)
- `lib/utils/errorHandler.ts` (3KB)
- `lib/numerosALetras.ts` (5KB)
- `lib/hooks/useToastHelper.ts` (2KB)

**Criterios de evaluación:**
- [ ] ¿Hay duplicación entre `lib/export/excel-export.ts` y `lib/utils/exportToExcel.ts`?
- [ ] ¿Las queries de hojas de conteo (18KB) están optimizadas con índices apropiados?
- [ ] ¿El PDF se genera en el servidor o en el cliente? (impacto en bundle)
- [ ] ¿`errorHandler.ts` centraliza correctamente el manejo de errores?

**Estado:** `- [ ] PENDIENTE`

---

## MÓDULO 13: Infraestructura Transversal
**Archivos bajo revisión:**
- `lib/supabase/client.ts` — Singleton del cliente browser
- `lib/supabase/server.ts` — Fábrica del cliente server
- `lib/supabase/middleware.ts` — Middleware de refresh
- `components/error-boundary.tsx` — Error boundary global
- `components/providers.tsx` — Stack de providers
- `types/index.ts` — Tipos centrales
- `types/materiales.ts` — Tipos de materiales
- `types/cotizaciones.ts` — Tipos de cotizaciones
- `types/tipologias.ts` — Tipos de tipologías

**Criterios de evaluación:**
- [ ] ¿El cliente Supabase es un singleton o se crea múltiples veces? (`conn-pooling`)
- [ ] ¿El middleware refresca tokens antes de expirar?
- [ ] ¿Los tipos de TypeScript reflejan el schema real de la BD?
- [ ] ¿Se usa `createServerClient` con cookies correctamente en Server Actions?
- [ ] ¿El Error Boundary captura errores de Server Components?

**Estado:** `- [ ] PENDIENTE`

---

## MÓDULO 14: Experimento Grid / Generador SVG
**Archivos bajo revisión:**
- `app/(dashboard)/experimento-grid/page.tsx`
- `components/experimento-grid/GridPlayground.tsx` (7KB)
- `components/experimento-grid/GeneradorSVG.tsx` (32KB ⚠️ archivo grande)
- `components/experimento-grid/ControlsPanel.tsx` (17KB)
- `components/experimento-grid/CatalogPalette.tsx` (4KB)

**Criterios de evaluación:**
- [ ] ¿`GeneradorSVG.tsx` (32KB) está optimizado para re-renders? (`rendering-animate-svg-wrapper`)
- [ ] ¿El playground es experimental o producción? ¿Debe incluirse en el bundle de producción?
- [ ] ¿Se usa `content-visibility` para listas largas? (`rendering-content-visibility`)

**Estado:** `- [ ] PENDIENTE`

---

## PROGRESO GENERAL

| Fase | Estado |
|------|--------|
| FASE 1: Mapeo y Planificación | ✅ COMPLETADA |
| FASE 2: Auditoría Modular Profunda | ⬜ PENDIENTE (0/14 módulos) |
| FASE 3: Reporte de Deuda Técnica | ⬜ PENDIENTE |
| FASE 4: Síntesis de Reglas | ⬜ PENDIENTE |
