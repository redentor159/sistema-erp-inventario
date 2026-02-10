# 🏛️ Guía Definitiva: Arquitectura Estática para ERP de Larga Duración

> **Objetivo:** Transformar tu ERP en un sistema "inmortal" que pueda funcionar durante años (potencialmente una década) sin intervención técnica, sin actualizaciones forzadas, y sin dependencia de un servidor Node.js en producción.

---

## 📋 Índice

1. [Respuesta Directa: ¿Ahora o Después?](#1-respuesta-directa-ahora-o-después)
2. [Checklist Pre-Vuelo: Verificaciones Obligatorias](#2-checklist-pre-vuelo-verificaciones-obligatorias)
3. [Sección A: Versiones Congeladas](#3-sección-a-versiones-congeladas)
4. [Sección B: Plan de Contingencia Supabase](#4-sección-b-plan-de-contingencia-supabase)
5. [Sección C: Procedimiento de Compilación Final](#5-sección-c-procedimiento-de-compilación-final)
6. [Sección D: Kit de Supervivencia (Artefactos a Resguardar)](#6-sección-d-kit-de-supervivencia-artefactos-a-resguardar)
7. [Sección E: Escenarios de Emergencia y Soluciones](#7-sección-e-escenarios-de-emergencia-y-soluciones)
8. [Anexo: Glosario para No-Programadores](#8-anexo-glosario-para-no-programadores)

---

## 1. Respuesta Directa: ¿Ahora o Después?

### 🎯 Veredicto: **DESPUÉS de terminar y comprobar todo.**

**Razón Técnica:**
El proceso de "congelamiento" para arquitectura estática es una **operación de una sola vía** (o al menos, muy costosa de revertir). Una vez que "congelas" las versiones y compiles el artefacto final, cualquier cambio futuro requerirá:

1. Descongelar el entorno de desarrollo.
2. Hacer el cambio.
3. Volver a congelar y recompilar.

**El Momento Correcto:**
Debes ejecutar este plan **únicamente cuando:**

- [x] Todas las funcionalidades del ERP están implementadas y probadas.
- [x] La base de datos tiene su estructura final (todas las tablas, columnas, y políticas RLS).
- [x] Has probado el flujo completo: crear cliente, crear producto, hacer cotización, mover inventario.
- [x] No hay errores de TypeScript en el build (`npm run build` pasa sin errores).
- [x] Has verificado que el sistema funciona en modo producción local (`npm start`).

**Consecuencia de Hacerlo Antes de Tiempo:**
Si congelas el sistema y luego descubres que falta un campo en la base de datos o una funcionalidad, tendrás que repetir todo el proceso de congelamiento. No es el fin del mundo, pero es trabajo duplicado.

---

## 2. Checklist Pre-Vuelo: Verificaciones Obligatorias

Antes de ejecutar el plan de congelamiento, un programador (o una IA) debe verificar los siguientes puntos. Cada punto tiene instrucciones específicas.

### 🔍 2.1 Verificación de Código Fuente

| # | Verificación | Archivo/Ubicación | Qué Buscar | Estado |
|---|---|---|---|---|
| 1 | **Conflicto `force-dynamic`** | `app/(dashboard)/layout.tsx` | Buscar `export const dynamic = 'force-dynamic'`. **DEBE REMOVERSE** antes de activar `output: 'export'`. | ⬜ |
| 2 | **API Routes** | `app/api/` o `pages/api/` | Verificar que esta carpeta esté **vacía** o no exista. Si hay archivos, su código dejará de funcionar. | ⬜ |
| 3 | **Server Actions** | Buscar en todo el proyecto | Buscar la directiva `"use server"`. Si existe, esa funcionalidad **no funcionará** en modo estático. | ⬜ |
| 4 | **Variables de Entorno** | `.env.local` | Verificar que TODAS las variables usadas en el frontend empiecen con `NEXT_PUBLIC_`. | ⬜ |
| 5 | **Imágenes Externas** | `next.config.ts` o `next.config.mjs` | Si usas imágenes de dominios externos (Supabase Storage, Cloudinary), verificar que estén en `images.remotePatterns`. | ⬜ |
| 6 | **Uso de `cookies()` o `headers()`** | Buscar en todo el proyecto | Estas funciones de Next.js **solo funcionan en Server Components**. Si se usan, el build fallará. | ⬜ |
| 7 | **Componente `<Image />`** | Buscar en todo el proyecto | Verificar que `next.config` tenga `images: { unoptimized: true }` para que las imágenes funcionen sin servidor. | ⬜ |

#### Cómo Ejecutar Esta Verificación (Para Programador o IA):

```bash
# 1. Buscar 'force-dynamic' en el proyecto
grep -r "force-dynamic" --include="*.tsx" --include="*.ts" .

# 2. Listar contenido de carpeta API
ls -la app/api/ 2>/dev/null || echo "No existe app/api"
ls -la pages/api/ 2>/dev/null || echo "No existe pages/api"

# 3. Buscar 'use server' en el proyecto
grep -r "use server" --include="*.tsx" --include="*.ts" .

# 4. Buscar variables de entorno no-públicas usadas en cliente
grep -r "process.env\." --include="*.tsx" --include="*.ts" . | grep -v "NEXT_PUBLIC"

# 5. Buscar uso de cookies() o headers()
grep -r "cookies()" --include="*.tsx" --include="*.ts" .
grep -r "headers()" --include="*.tsx" --include="*.ts" .
```

---

### 🔍 2.2 Verificación de Base de Datos (Supabase)

| # | Verificación | Ubicación | Qué Hacer | Estado |
|---|---|---|---|---|
| 1 | **RLS Activado** | Supabase Dashboard → Cada tabla | Verificar que TODAS las tablas tengan el candado 🔒 (RLS On). | ⬜ |
| 2 | **Políticas Definidas** | Supabase Dashboard → Authentication → Policies | Cada tabla debe tener al menos una política para SELECT, INSERT, UPDATE, DELETE. | ⬜ |
| 3 | **Backup de Esquema** | Supabase Dashboard → Settings → Database | Descargar un dump SQL del esquema (estructura sin datos). | ⬜ |
| 4 | **Backup de Datos** | Supabase Dashboard → Settings → Database | Descargar un dump SQL completo (estructura + datos). | ⬜ |
| 5 | **Documentar URL y Keys** | `.env.local` | Copiar `SUPABASE_URL` y `ANON_KEY` a un lugar seguro fuera del proyecto. | ⬜ |

---

### 🔍 2.3 Verificación de Funcionalidad (Pruebas Manuales)

Antes de congelar, ejecuta estas pruebas en el sistema funcionando (`npm run dev`):

| # | Flujo de Prueba | Pasos | Resultado Esperado | Estado |
|---|---|---|---|---|
| 1 | **Login** | Ir a la app → Iniciar sesión con credenciales válidas | Usuario logueado, redirigido al dashboard | ⬜ |
| 2 | **Crear Cliente** | Dashboard → Clientes → Nuevo Cliente → Guardar | Cliente aparece en la lista | ⬜ |
| 3 | **Crear Producto** | Catálogo → Nuevo Producto → Guardar | Producto aparece en catálogo | ⬜ |
| 4 | **Crear Cotización** | Cotizaciones → Nueva → Agregar items → Guardar | Cotización guardada con total correcto | ⬜ |
| 5 | **Movimiento Inventario** | Inventario → Entrada → Registrar compra | Stock aumenta, Kardex muestra movimiento | ⬜ |
| 6 | **Configuración** | Configuración → Cambiar un valor → Guardar | Valor persiste después de recargar | ⬜ |
| 7 | **Logout + Login** | Cerrar sesión → Volver a entrar | Sesión funciona correctamente | ⬜ |

---

## 3. Sección A: Versiones Congeladas

### 📦 3.1 ¿Qué Significa "Congelar Versiones"?

Cuando instalas dependencias con `npm install`, el sistema usa "rangos de versiones" (ej: `^5.0.0` significa "5.0.0 o cualquier versión compatible superior"). Esto es peligroso para longevidad porque:

- Hoy: Instalas `react@19.2.3`
- En 2028: `npm install` podría instalar `react@22.0.0` que rompe tu código.

**Congelar** significa fijar la versión exacta para que SIEMPRE se instale la misma.

---

### 📦 3.2 Versiones Actuales de Tu Proyecto (Snapshot 2026-02-09)

A continuación se documenta el estado exacto de las dependencias de tu proyecto al momento de esta guía. **Esta lista es tu "receta" para reconstruir el proyecto en el futuro.**

#### Dependencias de Producción (Runtime)

| Paquete | Versión Actual | Función | Criticidad |
|---|---|---|---|
| `next` | 16.1.6 | Framework principal | 🔴 CRÍTICA |
| `react` | 19.2.3 | Motor de UI | 🔴 CRÍTICA |
| `react-dom` | 19.2.3 | Renderizado DOM | 🔴 CRÍTICA |
| `@supabase/supabase-js` | ^2.94.0 | Conexión a base de datos | 🔴 CRÍTICA |
| `@tanstack/react-query` | ^5.90.20 | Gestión de datos/caché | 🟡 ALTA |
| `zod` | ^4.3.6 | Validación de formularios | 🟡 ALTA |
| `react-hook-form` | ^7.71.1 | Manejo de formularios | 🟡 ALTA |
| `@hookform/resolvers` | ^5.2.2 | Integración Zod+Forms | 🟡 ALTA |
| `lucide-react` | ^0.563.0 | Iconos | 🟢 MEDIA |
| `date-fns` | ^4.1.0 | Formateo de fechas | 🟢 MEDIA |
| `recharts` | ^3.7.0 | Gráficos | 🟢 MEDIA |
| `xlsx` | ^0.18.5 | Exportación Excel | 🟢 MEDIA |
| `class-variance-authority` | ^0.7.1 | Utilidades CSS | 🟢 BAJA |
| `clsx` | ^2.1.1 | Clases condicionales | 🟢 BAJA |
| `tailwind-merge` | ^3.4.0 | Merge de clases Tailwind | 🟢 BAJA |
| `cmdk` | ^1.1.1 | Command palette | 🟢 BAJA |
| `@hello-pangea/dnd` | ^18.0.1 | Drag and drop | 🟢 BAJA |
| `@radix-ui/*` | Varias | Componentes UI | 🟢 BAJA |
| `get-nonce` | ^1.0.1 | Seguridad CSP | 🟢 BAJA |
| `pg` | ^8.18.0 | Driver PostgreSQL | ⚠️ Solo desarrollo |

#### Dependencias de Desarrollo (Build-time only)

| Paquete | Versión Actual | Función |
|---|---|---|
| `typescript` | ^5 | Compilador TS |
| `tailwindcss` | ^4 | Framework CSS |
| `@tailwindcss/postcss` | ^4 | Procesador CSS |
| `eslint` | ^9 | Linter |
| `eslint-config-next` | 16.1.6 | Reglas ESLint |
| `@types/node` | ^20 | Tipos Node.js |
| `@types/react` | ^19 | Tipos React |
| `@types/react-dom` | ^19 | Tipos React DOM |
| `tw-animate-css` | ^1.4.0 | Animaciones |

---

### 📦 3.3 Cómo Congelar las Versiones (Procedimiento Paso a Paso)

#### Paso 1: Crear Backup del `package.json` Original

```bash
cp package.json package.json.backup
```

#### Paso 2: Modificar `package.json` para Usar Versiones Exactas

Cambiar el prefijo `^` (que permite actualizaciones menores) por versiones fijas.

**ANTES:**
```json
"react": "^19.2.3"
```

**DESPUÉS:**
```json
"react": "19.2.3"
```

> **Para IA/Programador:** El script para hacer esto automáticamente:
> ```bash
> # En PowerShell (Windows)
> (Get-Content package.json) -replace '\^', '' | Set-Content package.json
> ```

#### Paso 3: Regenerar el `package-lock.json`

```bash
# Eliminar node_modules y lockfile actual
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstalar con versiones exactas
npm install
```

#### Paso 4: Verificar que el Build Funciona

```bash
npm run build
```

Si hay errores, **NO PROCEDAS**. Resuelve los errores primero.

#### Paso 5: Guardar el `package-lock.json` como Artefacto Sagrado

El archivo `package-lock.json` contiene el árbol EXACTO de dependencias (incluyendo dependencias transitivas). **Es tu seguro de vida.**

```bash
# Copiar a carpeta de respaldo
cp package-lock.json ./backup/package-lock.json.frozen
```

---

### 📦 3.4 Archivo de Versiones Congeladas (Plantilla)

Crea un archivo `FROZEN_VERSIONS.md` en la raíz del proyecto con este contenido (a llenar después del congelamiento):

```markdown
# Versiones Congeladas - ERP Inventario

**Fecha de Congelamiento:** [FECHA]
**Versión del Sistema:** [VERSION]
**Responsable:** [NOMBRE]

## Entorno de Desarrollo
- Node.js: [VERSION - ejecutar `node -v`]
- npm: [VERSION - ejecutar `npm -v`]
- Sistema Operativo: [Windows/Mac/Linux + versión]

## Hash de Integridad
- package.json SHA256: [HASH]
- package-lock.json SHA256: [HASH]

## Notas de Compatibilidad
- Este build es compatible con Supabase JS SDK v2.x
- Requiere Supabase proyecto con Auth habilitado
- RLS debe estar activo en todas las tablas

## Instrucciones de Reconstrucción
1. Instalar Node.js [VERSION]
2. Ejecutar `npm ci` (NO `npm install`)
3. Ejecutar `npm run build`
4. La carpeta `out` contiene el artefacto de producción
```

---

## 4. Sección B: Plan de Contingencia Supabase

### ⚠️ 4.1 El Riesgo Real

Tu sistema depende de Supabase para:

1. **Autenticación:** Verificar usuarios
2. **Base de Datos:** Almacenar todo (clientes, productos, inventario)
3. **Storage:** Almacenar archivos/imágenes (si lo usas)

**Escenarios de Riesgo:**

| Escenario | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Supabase sube precios drásticamente | Media | Alto | Plan B: Migrar a Self-Hosted |
| Supabase cierra | Muy Baja | Crítico | Plan C: Migrar a otra plataforma |
| Supabase cambia API (breaking changes) | Baja | Alto | Plan A: Versionado de SDK |
| Tu cuenta Supabase es suspendida | Muy Baja | Crítico | Backups regulares |
| Supabase tiene outage prolongado | Baja | Alto | No hay mitigación (dependencia) |

---

### 🛡️ 4.2 Plan A: Versionado de SDK (Ya cubierto)

Cubierto en la Sección A. Al congelar `@supabase/supabase-js` a una versión específica, tu frontend seguirá hablando el mismo "idioma" que esperaba cuando fue compilado.

**PERO:** Si Supabase depreca esa versión de la API en su backend, eventualmente dejará de funcionar aunque tu frontend no cambie.

**Mitigación:** Supabase tiene política de mantener APIs por al menos 12-24 meses después de deprecar. Eso te da tiempo de reaccionar.

---

### 🛡️ 4.3 Plan B: Self-Hosted Supabase

Supabase es **100% open source**. Puedes correr tu propia instancia.

#### Cuándo Activar Este Plan:
- Supabase sube precios más allá de tu presupuesto.
- Supabase anuncia deprecación de una API crítica.
- Necesitas control total sobre los datos por regulaciones.

#### Qué Necesitas:
1. Un servidor (VPS) con Docker instalado (~$5-10/mes en DigitalOcean, Hetzner, etc.)
2. Conocimientos básicos de Docker y PostgreSQL (o contratar alguien que los tenga)
3. Tu dump de base de datos (ver sección de backups)

#### Procedimiento de Alto Nivel:
```bash
# 1. Clonar repositorio de Supabase Self-Hosted
git clone --depth 1 https://github.com/supabase/supabase

# 2. Ir a carpeta Docker
cd supabase/docker

# 3. Copiar ejemplo de configuración
cp .env.example .env

# 4. Editar .env con tus credenciales
# (Cambiar contraseñas, JWT secret, etc.)

# 5. Levantar servicios
docker-compose up -d

# 6. Restaurar tu base de datos
# (Instrucciones varían según método de backup)
```

#### Cambios en tu Frontend:
Solo necesitas cambiar UNA variable de entorno:
```bash
# ANTES (Supabase Cloud)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# DESPUÉS (Self-Hosted)
NEXT_PUBLIC_SUPABASE_URL=https://tu-servidor.com:8000
```

**Luego recompilar con `npm run build`.**

---

### 🛡️ 4.4 Plan C: Migración a Otra Plataforma

Si Supabase deja de existir o se vuelve inviable, tus opciones son:

#### Opción C1: Firebase (Google)
- **Pros:** Escala infinita, backing de Google
- **Contras:** Vendor lock-in, más caro a escala
- **Esfuerzo de Migración:** ALTO (cambiar todo el código de acceso a datos)

#### Opción C2: Postgres Directo + Auth0
- **Pros:** Control total, sin vendor lock-in
- **Contras:** Requiere mantener servidor
- **Esfuerzo de Migración:** MEDIO (reescribir capa de autenticación)

#### Opción C3: PocketBase (Alternativa Ligera)
- **Pros:** Un solo binario, fácil de hostear
- **Contras:** Menos maduro que Supabase
- **Esfuerzo de Migración:** MEDIO (API similar pero no idéntica)

**Recomendación:** Documenta tu esquema de base de datos de forma agnóstica (sin funciones específicas de Supabase). Si algún día necesitas migrar, esa documentación será invaluable.

---

### 🛡️ 4.5 Procedimiento de Backup Automatizado

#### Backup Manual (Hacer mensualmente mínimo):

1. **Ir a Supabase Dashboard**
2. **Settings → Database → Backups**
3. **Descargar "Full Backup"**
4. **Guardar en 2+ ubicaciones:**
   - Disco duro local
   - Google Drive / OneDrive / Dropbox
   - USB externo (opcional)

#### Backup de Estructura (SQL):

```sql
-- Ejecutar en SQL Editor de Supabase
-- Esto genera un script para recrear todas tus tablas

SELECT 
  'CREATE TABLE ' || table_name || ' (...);' as ddl
FROM information_schema.tables 
WHERE table_schema = 'public';
```

> **Nota:** Para un dump completo con datos, usa `pg_dump` desde línea de comandos (requiere credenciales de conexión directa).

---

## 5. Sección C: Procedimiento de Compilación Final

Este es el procedimiento **paso a paso** para crear el artefacto final de producción.

### 📋 Pre-Requisitos

- [ ] Todas las verificaciones de la Sección 2 completadas
- [ ] Versiones congeladas según Sección 3
- [ ] Backup de Supabase realizado según Sección 4

---

### 🚀 Paso 1: Preparar `next.config.ts`

Modificar el archivo de configuración para modo estático:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 🔴 CRÍTICO: Activa exportación estática
  output: 'export',
  
  // 🔴 CRÍTICO: Desactiva optimización de imágenes (requiere servidor)
  images: {
    unoptimized: true,
  },
  
  // Opcional: Si despliegas en subcarpeta (ej: example.com/erp)
  // basePath: '/erp',
  
  // Opcional: Si usas trailing slashes en URLs
  // trailingSlash: true,
}

export default nextConfig
```

---

### 🚀 Paso 2: Remover `force-dynamic`

Buscar y eliminar cualquier instancia de:

```typescript
export const dynamic = 'force-dynamic'
```

Este código es **incompatible** con `output: 'export'`.

**Ubicación conocida en tu proyecto:**
- `app/(dashboard)/layout.tsx`

---

### 🚀 Paso 3: Crear Archivo `_redirects` para SPA

Crear archivo `public/_redirects` con este contenido:

```
/* /index.html  200
```

Esto asegura que todas las rutas se manejen correctamente en hosting estático.

---

### 🚀 Paso 4: Compilar el Proyecto

```bash
npm run build
```

**Resultado Esperado:**
- Carpeta `out/` creada en la raíz del proyecto
- Archivos HTML para cada ruta
- Archivos JS/CSS optimizados
- Ningún error en la consola

---

### 🚀 Paso 5: Probar Localmente

```bash
# Instalar servidor estático simple
npx serve out

# O usar Python (si está disponible)
cd out && python -m http.server 3000
```

Abrir `http://localhost:3000` y verificar que TODO funciona.

---

### 🚀 Paso 6: Crear Paquete de Distribución

```bash
# Crear ZIP del artefacto
Compress-Archive -Path out/* -DestinationPath ERP-v1.0.0-static.zip

# Calcular hash para integridad
Get-FileHash ERP-v1.0.0-static.zip -Algorithm SHA256
```

---

## 6. Sección D: Kit de Supervivencia (Artefactos a Resguardar)

### 📁 Lista de Archivos Críticos

Estos archivos deben guardarse **fuera del proyecto** en al menos 2 ubicaciones diferentes:

| Archivo | Descripción | Frecuencia de Backup |
|---|---|---|
| `out/` (carpeta completa) | Artefacto de producción | Cada versión |
| `package.json` | Lista de dependencias | Cada versión |
| `package-lock.json` | Versiones exactas | Cada versión |
| `.env.local` | Credenciales | Una vez (mantener seguro) |
| `FROZEN_VERSIONS.md` | Documentación de versiones | Cada versión |
| Dump SQL de Supabase | Base de datos completa | Mensualmente |
| Código fuente (ZIP) | Todo el proyecto | Cada versión |

---

### 📁 Estructura Sugerida del Kit de Supervivencia

```
ERP-Backup-2026-02-09/
├── production/
│   └── ERP-v1.0.0-static.zip    # El artefacto deployable
├── source/
│   └── ia-inventario-source.zip  # Código fuente completo
├── database/
│   ├── schema-backup.sql         # Estructura de tablas
│   └── full-backup.sql           # Datos completos
├── docs/
│   └── FROZEN_VERSIONS.md        # Documentación de versiones
└── credentials/
    └── env-credentials.txt       # URL y keys (ENCRIPTAR!)
```

---

## 7. Sección E: Escenarios de Emergencia y Soluciones

### 🆘 Escenario 1: "El hosting cerró / cambió de política"

**Síntoma:** Tu URL ya no funciona.

**Solución:**
1. Obtener el ZIP de tu artefacto (`ERP-v1.0.0-static.zip`)
2. Crear cuenta en otro hosting (Netlify, Vercel, Cloudflare Pages, GitHub Pages)
3. Subir la carpeta `out/` (descomprimida)
4. Configurar variables de entorno si el hosting lo requiere
5. Actualizar DNS si tienes dominio propio

**Tiempo estimado:** 30 minutos

---

### 🆘 Escenario 2: "Supabase cambió algo y ya no funciona"

**Síntoma:** La app carga pero no muestra datos o da errores de conexión.

**Solución Inmediata:**
1. Verificar en Supabase Dashboard que el proyecto sigue activo
2. Verificar que las políticas RLS no se hayan modificado
3. Revisar logs de Supabase para errores específicos

**Solución a Largo Plazo:**
1. Activar Plan B (Self-Hosted) usando el backup de base de datos
2. Cambiar la URL en las variables de entorno
3. Recompilar el frontend

---

### 🆘 Escenario 3: "Necesito hacer un cambio después de años"

**Síntoma:** Quieres agregar una funcionalidad o corregir algo.

**Procedimiento:**
1. **Instalar la versión EXACTA de Node.js** documentada en `FROZEN_VERSIONS.md`
2. **Descomprimir el código fuente** respaldado
3. **Ejecutar `npm ci`** (NO `npm install`) para instalar dependencias exactas
4. **Hacer el cambio** requerido
5. **Probar localmente** con `npm run dev`
6. **Recompilar** con `npm run build`
7. **Crear nuevo Kit de Supervivencia** con la nueva versión

> **⚠️ CRÍTICO:** Si ejecutas `npm install` en lugar de `npm ci`, podrías descargar versiones más nuevas de dependencias que rompan el código. `npm ci` ignora versiones más nuevas y usa EXACTAMENTE lo que dice `package-lock.json`.

---

### 🆘 Escenario 4: "Perdí acceso a todo"

**Síntoma:** Perdiste el acceso a Supabase, hosting, y código fuente.

**Si tienes el Kit de Supervivencia:**
1. Restaurar código fuente desde backup
2. Crear nueva cuenta en Supabase
3. Ejecutar scripts SQL para recrear tablas
4. Restaurar datos desde dump SQL
5. Actualizar variables de entorno
6. Recompilar y deployar

**Si NO tienes backup:**
😔 El sistema está perdido. No hay recuperación posible.

**Moraleja:** Haz backups. Guárdalos en múltiples lugares. Verifica que funcionan.

---

## 8. Anexo: Glosario para No-Programadores

| Término | Significado Simple |
|---|---|
| **Artefacto** | El producto final compilado. Como un PDF generado desde un Word. |
| **Build** | El proceso de "cocinar" el código en algo que el navegador entiende. |
| **Dependencia** | Un programa que tu programa necesita para funcionar. |
| **Deploy** | Subir tu artefacto a internet para que otros lo usen. |
| **Hash SHA256** | Una "huella digital" del archivo para verificar que no fue alterado. |
| **Hosting** | El servicio que guarda tus archivos y los sirve a internet. |
| **npm** | El "supermercado" de donde descargas dependencias de JavaScript. |
| **RLS** | Las reglas que dicen quién puede ver/editar qué datos. |
| **SDK** | El "kit de herramientas" que te da Supabase para conectarte. |
| **SPA** | "Single Page Application" - Una app que carga una vez y luego navega sin recargar. |
| **Static Export** | Convertir tu app en archivos HTML/JS que no necesitan servidor. |
| **Versión Semántica** | Sistema de numeración como 1.2.3 (mayor.menor.parche). |
| **`npm ci`** | Instala dependencias EXACTAS. `npm install` puede traer versiones nuevas. |

---

## ✅ Resumen Ejecutivo

### Las 5 Acciones Críticas:

1. **Verificar** todo funciona antes de congelar (Sección 2)
2. **Congelar** versiones exactas en `package.json` (Sección 3)
3. **Documentar** el estado en `FROZEN_VERSIONS.md` (Sección 3)
4. **Respaldar** Supabase y código fuente regularmente (Sección 4 y 6)
5. **Compilar** el artefacto final y guardarlo (Sección 5)

### La Regla de Oro:

> **Si algún día necesitas reconstruir el sistema, debes poder hacerlo SOLO con los archivos del Kit de Supervivencia, sin depender de internet ni de ningún servicio externo (excepto para el hosting y la base de datos en producción).**

---

*Documento generado el 2026-02-09. Válido para el proyecto ERP Inventario versión 0.1.0.*
