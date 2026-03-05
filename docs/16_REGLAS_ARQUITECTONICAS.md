# 🛡️ REGLAS ARQUITECTÓNICAS — ERP MTO Yahiro

> **Generado:** 2026-03-05 por Auditoría Arquitectónica (Fase 4)  
> **Paradigma:** SPA Estática (`output: 'export'`) + Client-Side Fetching + Supabase RLS  
> **Propósito:** Vacunas permanentes contra recurrencia de deuda técnica

---

## REGLA 0: Identidad del Sistema (NUNCA Violar)

Este ERP es una **SPA estática pura**. Las siguientes son **PROHIBICIONES ABSOLUTAS**:

```
❌ PROHIBIDO: Server Actions ("use server")
❌ PROHIBIDO: API Routes (app/api/)  
❌ PROHIBIDO: force-dynamic
❌ PROHIBIDO: cookies() / headers()
❌ PROHIBIDO: middleware.ts (Next.js middleware)
❌ PROHIBIDO: npm install (solo npm ci)
❌ PROHIBIDO: ^ o ~ en versiones de package.json
```

**TODA la lógica de datos va en `lib/api/*.ts` → Supabase client directo.**  
**TODA la seguridad vive en PostgreSQL RLS, NO en el frontend.**

---

## REGLA 1: Paralelización Obligatoria de Fetches

**ANTES (Prohibido):**
```tsx
const a = await fetchA();
const b = await fetchB();  // Espera a que A termine
const c = await fetchC();  // Espera a que B termine
```

**DESPUÉS (Obligatorio):**
```tsx
const [a, b, c] = await Promise.all([
  fetchA(),
  fetchB(),
  fetchC(),
]);
```

> Si los fetches NO dependen entre sí, DEBEN ser paralelos. Esto aplica especialmente a la carga de datos maestros (clientes, marcas, acabados, vidrios, modelos).

---

## REGLA 2: Prohibición de useEffect con Llamadas Duplicadas

```tsx
// ❌ PROHIBIDO:
useEffect(() => {
  load();
  load(); // NUNCA duplicar
}, [id]);

// ✅ CORRECTO:
useEffect(() => {
  load();
}, [id]);
```

> React StrictMode ya duplica effects en desarrollo. Con un `load()` duplicado, se ejecutarían 4 invocaciones. **Revisar SIEMPRE que useEffect tenga una sola invocación.**

---

## REGLA 3: Transacciones Atómicas via RPC

Para operaciones que involucran **múltiples tablas** (cabecera + detalle), SIEMPRE usar una función RPC PostgreSQL:

```sql
-- ✅ CORRECTO: Función atómica
CREATE OR REPLACE FUNCTION fn_crear_entrada(
  p_cabecera JSONB,
  p_detalles JSONB
) RETURNS UUID AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO trx_entradas_cabecera (...) VALUES (...)
    RETURNING id_entrada INTO v_id;
  INSERT INTO trx_entradas_detalle (...)
    SELECT ... FROM jsonb_array_elements(p_detalles);
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

```tsx
// ❌ PROHIBIDO: 2 inserts separados
const header = await supabase.from('cabecera').insert(...);
const details = await supabase.from('detalle').insert(...); // Si falla, cabecera queda huérfana

// ✅ CORRECTO: 1 llamada RPC atómica
const result = await supabase.rpc('fn_crear_entrada', { ... });
```

---

## REGLA 4: Protección de Funciones Destructivas

**NUNCA** exponer funciones que borren datos masivamente desde el cliente sin protección RLS:

```tsx
// ❌ PROHIBIDO en producción:
deleteAllCards: async () => {
  await supabase.from('tabla').delete().neq('id', 'fake-uuid');
}

// ✅ SOLUCIÓN: 
// 1. Eliminar la función del código de producción
// 2. O proteger con RLS que solo ADMIN pueda DELETE
// 3. O mover a un script CLI separado (no en lib/api/)
```

> Las funciones `generateDemoData`, `deleteAllCards`, `resetEverything` NO deben existir en el code base de producción.

---

## REGLA 5: Auth — Usar `getUser()` Nunca `getSession()`

```tsx
// ❌ PROHIBIDO: Lee localStorage, no valida JWT
const { data: { session } } = await supabase.auth.getSession();

// ✅ CORRECTO: Valida contra servidor Supabase
const { data: { user } } = await supabase.auth.getUser();
```

> `getSession()` puede retornar un token expirado. El guard muestra la interfaz pero las requests a Supabase fallan. Usar `getUser()` asegura que el JWT es válido.

---

## REGLA 6: Estado del Usuario — Un Solo Contexto

El rol y datos del usuario autenticado deben consultarse **UNA VEZ** en un solo provider/context, no en múltiples componentes independientes:

```tsx
// ❌ PROHIBIDO: 3 queries separadas a user_roles
// auth-guard.tsx  → supabase.from('user_roles')...
// auth-provider.tsx → supabase.from('user_roles')...
// user-nav.tsx → supabase.from('user_roles')...

// ✅ CORRECTO: Un solo AuthContext que expone user + role
```

---

## REGLA 7: Límite de Tamaño de Componente — 400 Líneas

Un archivo de componente React NO debe superar 400 líneas. Si lo excede:

1. **Extraer sub-componentes** a archivos separados en la misma carpeta
2. **Extraer lógica** a custom hooks (`useX.ts`)
3. **Extraer constantes** a archivos separados

```
components/trx/cotizacion-detail/
├── index.tsx          ← Componente principal (<400 líneas)
├── CotizacionHeader.tsx
├── CotizacionItems.tsx
├── BulkActionsBar.tsx
├── useCotizacionData.ts  ← Custom hook con load()
└── constants.ts
```

---

## REGLA 8: Prohibición de setTimeout como "DB Propagation"

```tsx
// ❌ PROHIBIDO:
await new Promise((r) => setTimeout(r, 800));
await load();

// ✅ CORRECTO: Invalidar cache de React Query
await cotizacionesApi.triggerDespiece(id);
queryClient.invalidateQueries({ queryKey: ['cotizacion', id] });
```

> Si los triggers de Supabase son asíncronos, la solución es polling con `refetchInterval`, NO timeouts arbitrarios.

---

## REGLA 9: Prohibición de `confirm()` y `alert()` Nativos

```tsx
// ❌ PROHIBIDO:
if (!confirm("¿Eliminar?")) return;
alert("¡Guardado!");

// ✅ CORRECTO: Usar componentes AlertDialog de shadcn/Radix
<AlertDialog>
  <AlertDialogTrigger>Eliminar</AlertDialogTrigger>
  <AlertDialogContent>...</AlertDialogContent>
</AlertDialog>
```

---

## REGLA 10: Batch Operations — Evitar N+1

```tsx
// ❌ PROHIBIDO: Loop secuencial de queries
for (const item of items) {
  await api.update(item.id, item.data);
}

// ✅ CORRECTO OPCIÓN A: Promise.all
await Promise.all(items.map(i => api.update(i.id, i.data)));

// ✅ CORRECTO OPCIÓN B: RPC batch (preferido para >10 items)
await supabase.rpc('fn_batch_update', { p_items: JSON.stringify(items) });
```

---

## REGLA 11: staleTime Estratégico por Tipo de Dato

```tsx
// Datos que cambian frecuentemente (stock, transacciones)
{ staleTime: 0, refetchOnWindowFocus: true }

// Datos maestros que cambian raramente (familias, marcas, sistemas, acabados)
{ staleTime: 5 * 60 * 1000 } // 5 minutos

// Datos de configuración (mst_config_general)
{ staleTime: 10 * 60 * 1000 } // 10 minutos
```

---

## REGLA 12: Sanitización de Inputs en Filtros Supabase

```tsx
// ❌ PELIGROSO: Interpolación directa
query = query.or(`nombre.ilike.%${userInput}%`);

// ✅ SEGURO: Escapar caracteres de PostgREST
const sanitized = userInput.replace(/[,%._()]/g, '');
query = query.or(`nombre.ilike.%${sanitized}%`);

// ✅ MEJOR: Usar .ilike() individual
query = query.ilike('nombre', `%${userInput}%`);
```

---

## REGLA 13: No setState Durante Render

```tsx
// ❌ PROHIBIDO: Llama setState durante render
if (pathname !== prevPathname) {
  setPrevPathname(pathname);
  setCollapsed(pathname === "/production");
}

// ✅ CORRECTO: Usar useEffect o derivar estado
useEffect(() => {
  setCollapsed(pathname === "/production");
}, [pathname]);

// ✅ MEJOR: Estado derivado sin estado extra
const collapsed = pathname === "/production";
```

---

## REGLA 14: `next/dynamic` para Librerías Pesadas

```tsx
// ❌ PROHIBIDO: Import estático de libs pesadas
import { ComposedChart, Bar, Line } from 'recharts';

// ✅ CORRECTO: Dynamic import
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('./ChartComponent'), { ssr: false });
```

> Aplica a: `recharts` (~200KB), `@hello-pangea/dnd` (~70KB), `exceljs` (~300KB)

---

## REGLA 15: Eliminación de Código Muerto

Si un archivo NO es importado por nadie, **eliminarlo**. Verificar periódicamente:

```bash
# Buscar archivos sin importadores
grep -rL "auth-provider" --include="*.tsx" --include="*.ts" app/ components/ lib/
```

Archivos actualmente muertos identificados:
- `components/auth-provider.tsx` (nunca importado en layout)
- `app/login/actions.ts` (viola Regla 0: contiene `"use server"`)
- `trxApi.getStockActual()` (retorna `[]`)

---

*Estas reglas son **no-negociables**. Cualquier pull request que viole estas reglas debe ser rechazado en code review.*
