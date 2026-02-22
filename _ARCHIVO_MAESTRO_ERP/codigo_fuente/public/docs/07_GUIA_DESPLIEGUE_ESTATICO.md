# 07 — Guía de Despliegue Estático y Longevidad

> **Objetivo:** Garantizar que el ERP pueda funcionar durante años sin intervención técnica,
> sin actualizaciones forzadas, y sin dependencia de un servidor Node.js en producción.  
> **Estado:** ✅ Ya ejecutado. Este documento sirve como referencia permanente.  
> **Última actualización:** 2026-02-21

## Documentos Relacionados

| Documento | Enlace |
|-----------|--------|
| Arquitectura General | [01_ARQUITECTURA_GENERAL.md](./01_ARQUITECTURA_GENERAL.md) |
| Blindaje Arquitectónico | [06_BLINDAJE_ARQUITECTONICO.md](./06_BLINDAJE_ARQUITECTONICO.md) |
| Contingencia Supabase | [../CONTINGENCIA_SUPABASE.md](../CONTINGENCIA_SUPABASE.md) |
| Handoff Maestro | [../HANDOFF_MAESTRO.md](../HANDOFF_MAESTRO.md) |
| Guía del Desarrollador | [05_GUIA_DESARROLLADOR.md](./05_GUIA_DESARROLLADOR.md) |
| Arquitectura de Recetas | [08_ARQUITECTURA_RECETAS.md](./08_ARQUITECTURA_RECETAS.md) |

---

## 1. Checklist Pre-Vuelo (Verificaciones Ejecutadas)

### 🔍 1.1 Verificación de Código Fuente

| # | Verificación | Archivo | Estado |
|---|---|---|:---:|
| 1 | `force-dynamic` eliminado | `app/(dashboard)/layout.tsx` | ✅ |
| 2 | Carpeta `app/api/` vacía/eliminada | Eliminada completamente | ✅ |
| 3 | Sin `"use server"` en el proyecto | Ninguna instancia encontrada | ✅ |
| 4 | Variables `NEXT_PUBLIC_` correctas | `.env.local` verificado | ✅ |
| 5 | `images: { unoptimized: true }` | `next.config.ts` configurado | ✅ |
| 6 | Sin `cookies()` ni `headers()` | Ninguna instancia encontrada | ✅ |
| 7 | `output: 'export'` activo | `next.config.ts` configurado | ✅ |

#### Comandos de Verificación (para futuras auditorías):

```bash
# 1. Buscar 'force-dynamic' en el proyecto
grep -r "force-dynamic" --include="*.tsx" --include="*.ts" .

# 2. Listar contenido de carpeta API
ls -la app/api/ 2>/dev/null || echo "No existe app/api (CORRECTO)"

# 3. Buscar 'use server' en el proyecto
grep -r "use server" --include="*.tsx" --include="*.ts" .

# 4. Buscar variables de entorno no-públicas usadas en cliente
grep -r "process.env\." --include="*.tsx" --include="*.ts" . | grep -v "NEXT_PUBLIC"

# 5. Buscar uso de cookies() o headers()
grep -r "cookies()" --include="*.tsx" --include="*.ts" .
grep -r "headers()" --include="*.tsx" --include="*.ts" .
```

---

### 🔍 1.2 Verificación de Base de Datos (Supabase)

| # | Verificación | Estado |
|---|---|:---:|
| 1 | RLS activado en tablas críticas | ✅ |
| 2 | Políticas definidas (SELECT, INSERT, UPDATE, DELETE) | ✅ |
| 3 | Backup de esquema realizado | ✅ |
| 4 | URL y Keys documentadas de forma segura | ✅ |

---

### 🔍 1.3 Verificación de Funcionalidad

| # | Flujo | Estado |
|---|---|:---:|
| 1 | Crear Cliente | ✅ |
| 2 | Crear Producto/SKU | ✅ |
| 3 | Crear Cotización con despiece automático | ✅ |
| 4 | Registrar entrada (compra) → Kardex actualizado | ✅ |
| 5 | Exportar a Excel (client-side) | ✅ |
| 6 | Configuración → Guardar → Persistencia | ✅ |

---

## 2. Versiones Congeladas (Snapshot Post-Criogenización)

### Dependencias de Producción (SIN carets `^`)

| Paquete | Versión Exacta | Función | Criticidad |
|---|---|---|:---:|
| `next` | `16.1.6` | Framework SPA | 🔴 |
| `react` | `19.2.3` | Motor de UI | 🔴 |
| `react-dom` | `19.2.3` | Renderizado DOM | 🔴 |
| `@supabase/supabase-js` | `2.94.0` | Conexión BD | 🔴 |
| `@tanstack/react-query` | `5.90.20` | Cache/Fetching | 🟡 |
| `zod` | `4.3.6` | Validación | 🟡 |
| `react-hook-form` | `7.71.1` | Formularios | 🟡 |
| `exceljs` | `4.4.0` | Exportación Excel (cliente) | 🟡 |
| `file-saver` | `2.0.5` | Descarga archivos | 🟡 |
| `recharts` | `3.7.0` | Gráficos | 🟢 |
| `lucide-react` | `0.563.0` | Iconos | 🟢 |
| `date-fns` | `4.1.0` | Fechas | 🟢 |
| `@hello-pangea/dnd` | `18.0.1` | Drag & Drop | 🟢 |
| `@radix-ui/*` | Varias exactas | Componentes UI | 🟢 |

> ⚠️ **Nota sobre `xlsx`:** Este paquete fue **reemplazado** por `exceljs` + `file-saver` durante la criogenización. La exportación Excel ahora se ejecuta 100% en el navegador.

### Dependencias de Desarrollo

| Paquete | Versión Exacta | Función |
|---|---|---|
| `typescript` | `5.x` | Compilador |
| `tailwindcss` | `4.x` | CSS |
| `eslint` | `9.x` | Linter |

---

## 3. Procedimiento de Compilación Final

> Para el procedimiento completo de build y deploy, ver [HANDOFF_MAESTRO.md](../HANDOFF_MAESTRO.md).

### Resumen Rápido

```bash
# 1. Instalar dependencias EXACTAS
npm ci

# 2. Compilar el artefacto estático
npm run build

# 3. Verificar resultado
ls out/    # Debe existir con archivos .html

# 4. Probar localmente
npx serve out
```

### Resultado Esperado del Build

```
Route (app)
├ ○ /dashboard
├ ○ /catalog
├ ○ /clients
├ ○ /cotizaciones
├ ● /cotizaciones/[id]
├ ● /cotizaciones/[id]/print
├ ○ /export
├ ○ /inventory
├ ○ /production
├ ○ /recetas
└ ... (19 páginas total)

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML
```

---

## 4. Plan de Contingencia Supabase

> Ver documento completo: [CONTINGENCIA_SUPABASE.md](../CONTINGENCIA_SUPABASE.md)

### Resumen de Escenarios

| Escenario | Probabilidad | Plan |
|-----------|:---:|---|
| Supabase sube precios | Media | Plan B: Docker Self-Host |
| Supabase cierra | Muy Baja | Plan B: Docker Self-Host |
| Supabase cambia API | Baja | Plan A: SDK versionado (ya congelado) |
| Necesitas migrar a otro BaaS | Baja | Plan C: Firebase / PocketBase / Postgres directo |

### Alternativas a Supabase

| Opción | Esfuerzo de Migración | Ventaja Principal |
|--------|:---:|---|
| **Self-Host Supabase** | 🟢 Bajo | Misma API, solo cambiar URL |
| **PocketBase** | 🟡 Medio | Un solo binario, fácil de hostear |
| **PostgreSQL + Auth0** | 🟠 Alto | Control total, sin vendor lock-in |
| **Firebase** | 🔴 Muy Alto | Infraestructura Google |

---

## 5. Escenarios de Emergencia y Soluciones

### 🆘 Escenario 1: "El hosting cerró"

| Paso | Acción |
|------|--------|
| 1 | Obtener el ZIP del artefacto `/out` |
| 2 | Crear cuenta en otro hosting (Netlify, Cloudflare Pages, S3) |
| 3 | Subir la carpeta `out/` |
| 4 | Actualizar DNS si tienes dominio propio |
| **Tiempo** | **~30 minutos** |

### 🆘 Escenario 2: "Supabase no responde"

| Paso | Acción |
|------|--------|
| 1 | Verificar estado del proyecto en dashboard de Supabase |
| 2 | Si persiste: activar Plan B (Docker Self-Host) |
| 3 | Restaurar backup SQL en instancia local |
| 4 | Cambiar `NEXT_PUBLIC_SUPABASE_URL` → `npm run build` → deploy |

### 🆘 Escenario 3: "Necesito cambiar algo después de años"

| Paso | Acción |
|------|--------|
| 1 | Instalar la versión **exacta** de Node.js documentada |
| 2 | Descomprimir el código fuente respaldado |
| 3 | Ejecutar `npm ci` (**NUNCA** `npm install`) |
| 4 | Hacer el cambio → `npm run dev` para probar |
| 5 | `npm run build` → deploy nueva carpeta `/out` |

### 🆘 Escenario 4: "Perdí acceso a todo"

**Con Kit de Supervivencia:**
1. Restaurar código desde backup → `npm ci` → Nueva cuenta Supabase → Restaurar SQL → Build

**Sin Kit de Supervivencia:**
> 😔 El sistema está perdido. No hay recuperación posible.  
> **Moraleja:** Haz backups. Guárdalos en múltiples lugares.

---

## 6. Glosario para No-Programadores

| Término | Significado Simple |
|---|---|
| **Artefacto** | El producto final compilado. Como un PDF generado desde un Word. |
| **Build** | El proceso de "cocinar" el código en algo que el navegador entiende. |
| **CDN** | Red global de servidores que entrega tu web rápido en todo el mundo. |
| **Dependencia** | Un programa que tu programa necesita para funcionar. |
| **Deploy** | Subir tu artefacto a internet para que otros lo usen. |
| **Hash SHA256** | Una "huella digital" del archivo para verificar que no fue alterado. |
| **npm** | El "supermercado" de donde descargas dependencias de JavaScript. |
| **`npm ci`** | Instala dependencias EXACTAS. `npm install` puede traer versiones nuevas. |
| **RLS** | Las reglas que dicen quién puede ver/editar qué datos. |
| **SPA** | App que carga una vez y luego navega sin recargar la página. |
| **Static Export** | Convertir tu app en archivos HTML/JS que no necesitan servidor. |
