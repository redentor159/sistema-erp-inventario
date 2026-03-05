# 🔴 REPORTE DE DEUDA TÉCNICA — ERP MTO (Yahiro)

**Fecha de Auditoría:** 2026-03-05  
**Auditor:** Arquitecto de Software Senior / Auditor de Seguridad  
**Alcance:** 14 módulos, ~50 archivos clave, ~15,000+ líneas de código

---

## ⚠️ NOTA DE CONTEXTO ARQUITECTÓNICO

> [!IMPORTANT]
> Este sistema es **intencionalmente una SPA estática** (`output: 'export'`). La decisión de usar client-side fetching puro, sin Server Actions, sin SSR, y con dependencia total de RLS **es una decisión arquitectónica documentada** en los archivos `06_BLINDAJE_ARQUITECTONICO.md` y `07_GUIA_DESPLIEGUE_ESTATICO.md`.
>
> **Las "Reglas de Oro" del proyecto son:**
> 1. Jamás uses `npm install`. Solo `npm ci`.
> 2. Jamás agregues `export const dynamic = 'force-dynamic'`.
> 3. Jamás crees rutas en `app/api/`. No hay servidor en producción.
> 4. Toda la lógica de datos va en `lib/api/` llamando a Supabase directamente.
> 5. Todo componente de página es `"use client"` (SPA pura).
>
> Por tanto, hallazgos tipo "no usa Server Actions" o "dashboard es `use client`" **no aplican** a esta arquitectura. El reporte se centra en bugs, rendimiento y seguridad **dentro del paradigma SPA+RLS elegido**.

---

## 📊 RESUMEN EJECUTIVO

| Severidad | Cantidad | Impacto |
|-----------|----------|---------|
| 🔴 CRÍTICO | 4 | Bugs activos, pérdida de datos posible, seguridad |
| 🟠 ALTO | 11 | Degradación de rendimiento, mantenibilidad |
| 🟡 MEDIO | 8 | Deuda técnica menor, calidad de código |
| 🔵 BAJO | 4 | Mejoras cosméticas |

**Calificación General de Salud: 5.5 / 10** (ajustada respecto al contexto SPA)

---

## 🔴 HALLAZGOS CRÍTICOS

### CRIT-01: `load()` Ejecutado DOS VECES en useEffect

- **Archivo:** [cotizacion-detail.tsx](file:///c:/Users/jsori/Downloads/ia%20inventario/components/trx/cotizacion-detail.tsx#L384-L386)
- **Código:**
  ```tsx
  useEffect(() => {
    load();
    load(); // ← DUPLICADO
  }, [id]);
  ```
- **Impacto:** Cada apertura de cotización dispara 2× `load()`. En React StrictMode (desarrollo) son **4 invocaciones**. Cada `load()` ejecuta 6 fetches secuenciales = mínimo **24 queries** en dev. Fix: eliminar la segunda línea.

### CRIT-02: Transacciones No Atómicas (Cabecera + Detalle)

- **Archivos:** [trx.ts:createEntrada](file:///c:/Users/jsori/Downloads/ia%20inventario/lib/api/trx.ts#L52-L91), [trx.ts:createSalida](file:///c:/Users/jsori/Downloads/ia%20inventario/lib/api/trx.ts#L123-L158)
- **Impacto:** INSERT cabecera → INSERT detalles. Si el segundo INSERT falla, la cabecera queda huérfana. **No hay rollback**. Esto puede causar inconsistencias contables en el Kardex.
- **Solución:** Usar una función RPC PostgreSQL con `BEGIN...COMMIT/ROLLBACK` (esto sí es compatible con SPA estática, solo cambia el lado DB).

### CRIT-03: Funciones Destructivas Expuestas al Cliente

- **Archivo:** [kanban.ts](file:///c:/Users/jsori/Downloads/ia%20inventario/lib/api/kanban.ts#L369-L393)
- **Funciones:**
  - `deleteAllCards()` — borra TODAS las órdenes Kanban
  - `resetEverything()` — borra TODOS los datos de producción + historial
  - `generateDemoData()` — inserta 500 registros falsos en producción
- **Impacto:** Cualquier usuario autenticado puede invocar estas funciones. Incluso un OPERARIO. La protección debe estar en **RLS policies** que impidan DELETE masivo, o eliminar estas funciones del code base de producción.

### CRIT-04: `getSession()` Usado en Lugar de `getUser()` 

- **Archivos:** [auth-guard.tsx:L38](file:///c:/Users/jsori/Downloads/ia%20inventario/components/auth-guard.tsx#L38), [auth-provider.tsx:L34](file:///c:/Users/jsori/Downloads/ia%20inventario/components/auth-provider.tsx#L34)
- **Impacto:** `getSession()` lee del almacenamiento local sin validar el JWT contra el servidor. Un token expirado o manipulado sería aceptado. En una SPA donde la seguridad depende 100% de RLS, el token expirado simplemente fallará en Supabase (las requests serán rechazadas), pero el **guard del frontend podría dejar pasar al usuario a la interfaz** mostrando datos inaccesibles. Fix: usar `getUser()` que valida contra el servidor.

---

## 🟠 HALLAZGOS ALTOS

### ALTO-01: Fetches Secuenciales en Cascade — No Usa `Promise.all`

- **Archivo:** [cotizacion-detail.tsx:load()](file:///c:/Users/jsori/Downloads/ia%20inventario/components/trx/cotizacion-detail.tsx#L267-L339)
- **Impacto:** 6 fetches secuenciales (cotización → clientes → marcas → acabados → vidrios → modelos). Con 100ms/query se pierden ~600ms. Deben paralelizarse con `Promise.all` (los fetches de maestros no dependen entre sí).

### ALTO-02: `handleSaveAll` en Recipe Editor — Loop Secuencial

- **Archivo:** [recipe-editor.tsx:L221-L240](file:///c:/Users/jsori/Downloads/ia%20inventario/components/mto/recipe-editor.tsx#L221-L240)
- **Código:** `for (const [id, fields] of entries) { await recetasApi.updateRecetaLinea(id, fields); }`
- **Impacto:** 20 componentes editados = 20 queries secuenciales. Debería usar `Promise.all` o un batch RPC.

### ALTO-03: `updatePreciosMasivos` — N Queries Sin Batch

- **Archivo:** `lib/api/cat.ts` → `updatePreciosMasivos()`
- **Impacto:** N queries UPDATE individuales. Supabase soporta batch upsert en una sola operación.

### ALTO-04: `setState` Durante Render — Anti-pattern React

- **Archivo:** [app-sidebar.tsx:L30-L37](file:///c:/Users/jsori/Downloads/ia%20inventario/components/dashboard/app-sidebar.tsx#L30-L37)
- **Impacto:** Causa re-renders innecesarios. El estado `collapsed` debería derivarse de `pathname` con `useMemo` o un `useEffect`.

### ALTO-05: Triple Query Redundante a `user_roles`

- **Archivos:** `auth-provider.tsx`, `auth-guard.tsx`, `user-nav.tsx`
- **Impacto:** 3 componentes hacen la MISMA query a `user_roles`. Debería existir UN solo contexto de usuario/rol.

### ALTO-06: `AuthProvider` NUNCA Se Usa — Código Muerto (117 líneas)

- **Archivo:** [auth-provider.tsx](file:///c:/Users/jsori/Downloads/ia%20inventario/components/auth-provider.tsx)
- **Evidencia:** `app/layout.tsx` NO importa `AuthProvider`. Solo se usa `AuthGuard`.

### ALTO-07: Componentes Monolíticos > 500 Líneas

| Componente | Líneas |
|---|---|
| `recipe-editor.tsx` | 1,488 |
| `cotizacion-detail.tsx` | 1,099 |
| `config-general-form.tsx` | 966 |
| `product-list.tsx` | 946 |

- **Impacto:** Bundle size excesivo, testabilidad nula, difícil mantenimiento.

### ALTO-08: `setTimeout(800)` Hardcodeados × 5

- **Archivo:** `cotizacion-detail.tsx` L163, L235, L248, L365, L453
- **Impacto:** 5 timeouts arbitrarios de 800ms. Indica que los triggers DB son asíncronos. Debería usarse polling o `queryClient.invalidateQueries` con retry.

### ALTO-09: `confirm()` y `alert()` Nativos del Browser

- **Archivos:** Múltiples
- **Impacto:** Bloquean main thread, no son estilizables, mala UX. Deberían ser componentes Dialog/AlertDialog.

### ALTO-10: Interpolación de Strings en Filtros Supabase

- **Archivo:** [trx.ts:L29-L31](file:///c:/Users/jsori/Downloads/ia%20inventario/lib/api/trx.ts#L29-L31)
- **Impacto:** Caracteres especiales de PostgREST (`,`, `.`) en input de usuario podrían manipular el filtro `.or()`.

### ALTO-11: `NavItem` Duplicado en 2 Archivos

- **Archivos:** `app-sidebar.tsx` L183-212, `mobile-sidebar.tsx` L149-177
- **Impacto:** Componente duplicado. Cambiar un nav item requiere editar 2 archivos.

---

## 🟡 HALLAZGOS MEDIOS

### MED-01: Uso Extensivo de `any` en Tipos
Múltiples archivos (product-list, cotizacion-detail, recipe-editor, NavItem icon prop). Pérdida de type safety.

### MED-02: `zodResolver(...) as any` — Bypass de Tipado
`entrada-form.tsx` L60, `config-general-form.tsx` L57. Silencia errores que podrían ser bugs.

### MED-03: No Se Usa `next/dynamic` para Imports Pesados
`recharts` (~200KB), `@hello-pangea/dnd` (~70KB) se cargan siempre. `next/dynamic` con `{ ssr: false }` los cargaría bajo demanda.

### MED-04: Sin Optimistic Updates en Mutaciones
Cada mutation hace `load()` completo. Debería actualizar cache local optimísticamente.

### MED-05: `kanbanApi.generateDemoData` — 135 Líneas de Código Demo en Producción
Debería ser un script de seeding separado, no parte del code base.

### MED-06: Código Muerto y Comentarios Residuales
- `cotizacionesApi.deleteLineItem` L357-358: lógica duplicada
- `trxApi.createSalida` L156: comentario duplicado
- `trxApi.getStockActual`: función que retorna `[]`

### MED-07: `staleTime: 0` para Datos Maestros
Para familias, marcas, sistemas que cambian raramente, `staleTime: 5 * 60 * 1000` ahorraría refetches.

### MED-08: `login/actions.ts` — Server Actions Residuales (52 líneas código muerto)
Contiene `"use server"` que **viola las Reglas de Oro**. Debería eliminarse.

---

## 🔵 HALLAZGOS BAJOS

- **LOW-01:** Inconsistencia `createClient()` vs singleton `supabase` en `lib/supabase/client.ts`
- **LOW-02:** Duplicación de rutas de navegación sin fuente única de verdad
- **LOW-03:** `console.log`/`console.error` en código de producción
- **LOW-04:** Sin tests de ningún tipo

---

## 📈 ORDEN DE REMEDIACIÓN

### Fix Inmediato (< 1 hora):
- CRIT-01: Eliminar `load()` duplicado (1 línea)
- ALTO-06: Eliminar `auth-provider.tsx` muerto
- MED-08: Eliminar `login/actions.ts` (viola Reglas de Oro)
- MED-06: Limpiar código muerto

### Sprint Corto (1-3 días):
- CRIT-03: Eliminar/proteger funciones destructivas de Kanban (RLS + eliminar del código)
- CRIT-04: Cambiar `getSession()` → `getUser()` (3 archivos)
- ALTO-01: Paralelizar fetches con `Promise.all`
- ALTO-04: Refactorizar sidebar state
- ALTO-05: Unificar query de `user_roles` en un solo contexto

### Sprint Medio (1-2 semanas):
- CRIT-02: Crear RPCs transaccionales (entradas/salidas)
- ALTO-02/03: Batch saves con RPCs
- ALTO-07: Extraer sub-componentes de archivos monolíticos
- ALTO-08: Reemplazar `setTimeout(800)` con invalidación inteligente

---

## 🔒 ESTADO DE SEGURIDAD (Contexto SPA + RLS)

| Vector | Estado | Detalle |
|--------|--------|---------|
| RLS (Row Level Security) | ⚠️ AUDITAR | La seguridad 100% depende de RLS — necesita auditoría de políticas |
| Auth Guard (Frontend) | 🟡 PARCIAL | Usa `getSession()` en vez de `getUser()` |
| Funciones Destructivas | 🔴 EXPUESTAS | `deleteAllCards`, `resetEverything` sin protección RLS |
| Service Role Key | ✅ OK | No expuesta al cliente |
| Input Validation | 🟡 PARCIAL | Zod en forms, no en API layer |
| Versiones Congeladas | ✅ OK | Sin `^` ni `~` en package.json |
| Static Export | ✅ OK | `output: 'export'` correctamente configurado |

---

*Este reporte fue generado como Fase 3 del Protocolo de Auditoría Arquitectónica. **Reclasificado** según contexto arquitectónico SPA estática documentado en docs/06 y docs/07. No se modificó ningún archivo de código fuente.*
