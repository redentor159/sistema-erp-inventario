# 12 — Guía Completa de Supabase

> **Sistema:** ERP Vidriería de Aluminio - Carpintería Metálica  
> **Proyecto Supabase:** `gnvayzzufcmjseuxggks` (región: us-east-1)  
> **Última actualización:** Febrero 2026  

---

## Documentos Relacionados

| Documento | Enlace |
|-----------|--------|
| Arquitectura General | [01_ARQUITECTURA_GENERAL.md](./01_ARQUITECTURA_GENERAL.md) |
| Esquema de Base de Datos | [02_ESQUEMA_BASE_DATOS.md](./02_ESQUEMA_BASE_DATOS.md) |
| Autenticación y Roles | [11_AUTENTICACION_Y_ROLES.md](./11_AUTENTICACION_Y_ROLES.md) |
| Contingencia | [13_CONTINGENCIA_RECUPERACION.md](./13_CONTINGENCIA_RECUPERACION.md) |

---

## 1. Introducción a Supabase

Supabase es la plataforma de base de datos en la nube que **almacena y sirve todos los datos** del ERP. Es el corazón del sistema.

```mermaid
graph TB
    subgraph "SUPABASE CLOUD (gnvayzzufcmjseuxggks)"
        AUTH["🔐 Auth Service<br/>(Usuarios y Sesiones)"]
        PGREST["🔌 PostgREST API<br/>(REST automático sobre PostgreSQL)"]
        PG["🗄️ PostgreSQL 17<br/>(Base de datos principal)"]
        RLS["🛡️ Row Level Security<br/>(Políticas de acceso)"]
        TRIG["⚡ Triggers & Functions<br/>(Lógica de negocio en BD)"]
        VIEWS["📊 Vistas SQL<br/>(vw_stock_realtime, etc.)"]
    end

    APP["SPA Next.js\n(Navegador del usuario)"] -->|"HTTPS + JWT"| AUTH
    APP -->|"HTTPS REST"| PGREST
    PGREST --> PG
    PG --> RLS
    PG --> TRIG
    PG --> VIEWS
```

### ¿Qué servicios de Supabase usa el ERP?

| Servicio | Para qué se usa | Esencial |
|---------|----------------|---------|
| **PostgreSQL** | Base de datos principal con todas las tablas | ✅ Sí |
| **PostgREST** | API REST automática sobre PostgreSQL | ✅ Sí |
| **Supabase Auth** | Login de usuarios (email/contraseña) | ✅ Sí |
| **Row Level Security** | Controlar qué datos ve cada rol | ✅ Sí |
| **Edge Functions** | ❌ No se usa | — |
| **Storage** | ❌ No se usa (logos van en config) | — |
| **Realtime** | ❌ No se usa (TanStack Query hace polling) | — |

---

## 2. Acceso al Dashboard de Supabase

### URL del proyecto
```
https://supabase.com/dashboard/project/gnvayzzufcmjseuxggks
```

### Estructura del panel lateral

```
📁 Dashboard de Supabase
├── 🏠 Home              → Métricas generales del proyecto
├── 🗄️ Table Editor      → Editar datos visualmente (como Excel)
├── 🔌 SQL Editor        → Ejecutar consultas SQL directas
├── 🔐 Authentication    → Gestión de usuarios y sesiones
├── ⚙️  Settings         → Configuración del proyecto
│   ├── General          → Nombre, región
│   ├── Database         → Contraseña, connection strings
│   ├── API              → Claves y URLs
│   └── Auth             → Proveedores, emails
└── 📊 Logs              → Logs de API, Auth, PostgreSQL
```

---

## 3. Configuración Inicial del Proyecto

### Variables de Entorno del ERP

El archivo `.env.local` en la raíz del proyecto contiene las credenciales de conexión:

```env
NEXT_PUBLIC_SUPABASE_URL=https://gnvayzzufcmjseuxggks.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  (clave pública anon)
```

> **⚠️ Seguridad:** La `ANON_KEY` es pública. Funciona gracias a las políticas de RLS que limitan los datos accesibles. La `SERVICE_ROLE_KEY` (clave secreta de administrador) **NUNCA** debe estar en el frontend.

### Cómo obtener las claves

1. Ve al dashboard → **Settings** → **API**
2. En la sección "Project API keys":
   - **Project URL:** `https://gnvayzzufcmjseuxggks.supabase.co`
   - **anon public:** Usar en `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret:** Solo para scripts de mantenimiento, nunca en el frontend

---

## 4. Estructura de la Base de Datos

### Esquema de Capas

```mermaid
graph LR
    subgraph "CAPA MST (Maestra)"
        direction TB
        m1["mst_config_general"]
        m2["mst_clientes"]
        m3["mst_proveedores"]
        m4["mst_familias"]
        m5["mst_marcas"]
        m6["mst_materiales"]
        m7["mst_acabados_colores"]
        m8["mst_series_equivalencias"]
        m9["mst_recetas_modelos"]
        m10["mst_recetas_ingenieria"]
        m11["user_roles"]
        m12["login_logs"]
    end

    subgraph "CAPA CAT (Catálogo)"
        direction TB
        c1["cat_plantillas"]
        c2["cat_productos_variantes (SKUs)"]
    end

    subgraph "CAPA TRX (Transaccional)"
        direction TB
        t1["trx_movimientos (Kardex)"]
        t2["trx_entradas_cabecera"]
        t3["trx_entradas_detalle"]
        t4["trx_salidas_cabecera"]
        t5["trx_salidas_detalle"]
        t6["trx_cotizaciones_cabecera"]
        t7["trx_cotizaciones_detalle"]
        t8["trx_desglose_materiales"]
    end

    subgraph "CAPA DAT (Operativa)"
        direction TB
        d1["dat_retazos_disponibles"]
        d2["dat_kanban_produccion"]
    end

    m4 --> c1
    c1 --> c2
    c2 --> t1
    m2 --> t6
    t6 --> t7
    t7 --> t8
```

### Vistas SQL Principales

| Vista | Función | Usada en |
|-------|---------|---------|
| `vw_stock_realtime` | Stock actual calculado desde Kardex | Módulo Inventario |
| `vw_kardex_reporte` | Movimientos con nombre de producto | Módulo Kardex |
| `vw_cotizacion_resumen` | Resumen de cotizaciones con totales | Módulo Cotizaciones |

### Funciones y Triggers PostgreSQL

| Objeto | Tipo | Propósito |
|--------|------|-----------|
| `fn_trigger_entrada_to_kardex()` | Trigger AFTER INSERT | Inserta en `trx_movimientos` cuando hay entrada |
| `fn_trigger_salida_to_kardex()` | Trigger AFTER INSERT | Inserta en `trx_movimientos` cuando hay salida |
| `fn_calcular_despiece(id_linea)` | RPC Function | Calcula el BOM de una línea de cotización |
| `fn_generar_sku()` | Trigger BEFORE INSERT | Genera código SKU automáticamente |

---

## 5. Seguridad: Row Level Security (RLS)

### ¿Qué es RLS?

RLS es una característica de PostgreSQL que permite definir **políticas de acceso a nivel de fila**. Aunque el usuario tenga la clave pública (`anon key`), solo puede ver y modificar las filas que las políticas le permiten.

### Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as "Usuario (Navegador)"
    participant SB as "Supabase Auth"
    participant PG as "PostgreSQL + RLS"

    U->>SB: email + contraseña
    SB->>SB: Verifica en auth.users
    SB-->>U: JWT Token (incluye user_id)
    
    U->>PG: SELECT * FROM trx_cotizaciones_cabecera
    PG->>PG: Extrae user_id del JWT
    PG->>PG: Consulta user_roles WHERE user_id = ?
    PG->>PG: Aplica política RLS según rol
    PG-->>U: Solo devuelve filas permitidas
```

### Roles y Permisos por Tabla

| Tabla | ADMIN | SECRETARIA | OPERARIO |
|-------|-------|-----------|---------|
| `mst_clientes` | CRUD | CRUD | Read |
| `mst_proveedores` | CRUD | CRUD | Read |
| `cat_productos_variantes` | CRUD | Read | Read |
| `trx_cotizaciones_cabecera` | CRUD | CRUD | Read |
| `trx_entradas_cabecera` | CRUD | CRUD | — |
| `trx_salidas_cabecera` | CRUD | CRUD | — |
| `dat_kanban_produccion` | CRUD | Read | CRUD |
| `mst_recetas_modelos` | CRUD | Read | — |
| `user_roles` | CRUD | — | — |
| `mst_config_general` | CRUD | — | — |

### Ver las Políticas RLS

En Supabase Dashboard → **Table Editor** → selecciona una tabla → pestaña **"Policies"**.

O en SQL Editor:

```sql
-- Ver todas las políticas RLS del proyecto
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 6. API REST (PostgREST)

PostgREST genera automáticamente una API REST sobre cada tabla y vista de PostgreSQL.

### URL Base de la API

```
https://gnvayzzufcmjseuxggks.supabase.co/rest/v1/
```

### Patrones de API más usados en el ERP

| Operación | Método | Endpoint | Ejemplo |
|-----------|--------|----------|---------|
| Listar registros | GET | `/rest/v1/{tabla}` | `GET /rest/v1/mst_clientes` |
| Filtrar | GET | `/rest/v1/{tabla}?campo=eq.valor` | `GET /rest/v1/trx_cotizaciones_cabecera?estado=eq.Aprobada` |
| Crear | POST | `/rest/v1/{tabla}` | `POST /rest/v1/mst_clientes` body: `{...}` |
| Actualizar | PATCH | `/rest/v1/{tabla}?id=eq.{id}` | `PATCH /rest/v1/mst_clientes?id=eq.123` |
| Eliminar | DELETE | `/rest/v1/{tabla}?id=eq.{id}` | `DELETE /rest/v1/mst_clientes?id=eq.123` |
| RPC (función) | POST | `/rest/v1/rpc/{funcion}` | `POST /rest/v1/rpc/fn_calcular_despiece` |

### Headers requeridos en todas las peticiones

```http
apikey: eyJ...  (anon key)
Authorization: Bearer eyJ...  (JWT del usuario autenticado)
Content-Type: application/json
```

### Cómo el ERP usa la API

El cliente Supabase de JavaScript (`@supabase/supabase-js`) abstrae estas llamadas. En el código del ERP:

```typescript
// Ejemplo: obtener cotizaciones aprobadas
const { data, error } = await supabase
  .from('trx_cotizaciones_cabecera')
  .select('*')
  .eq('estado', 'Aprobada')
  .order('fecha_emision', { ascending: false });
```

---

## 7. Gestión de Usuarios y Autenticación

### Panel de Usuarios

En Supabase Dashboard → **Authentication** → **Users**:

```
┌───────────────────────────────────────────────────────────┐
│  USERS                                    [Add user]       │
├────────────────────┬────────────────┬───────────┬─────────┤
│ Email              │ Created        │ Last sign │ Status  │
├────────────────────┼────────────────┼───────────┼─────────┤
│ admin@empresa.com  │ 03/02/2026     │ Hoy       │ Active  │
│ secre@empresa.com  │ 05/02/2026     │ Hoy       │ Active  │
│ op1@empresa.com    │ 10/02/2026     │ Ayer      │ Active  │
└────────────────────┴────────────────┴───────────┴─────────┘
```

### Proceso completo para nuevo usuario

Ver [T12_TUTORIAL_CONFIGURACION.md](./tutoriales/T12_TUTORIAL_CONFIGURACION.md) y [11_AUTENTICACION_Y_ROLES.md](./11_AUTENTICACION_Y_ROLES.md).

---

## 8. Monitoreo y Métricas

### Dashboard de Uso (Supabase Home)

En el Home del proyecto en Supabase, encontrarás métricas en tiempo real:

| Métrica | Qué mide | Límite Free Plan |
|---------|---------|----------------|
| **Database Size** | Tamaño total de la BD | 500 MB |
| **Egress** | Datos transferidos al cliente | 2 GB/mes |
| **Requests** | Llamadas API totales | No limitado |
| **Auth Users** | Usuarios registrados | 50,000 |
| **Storage** | No se usa en este proyecto | — |

> **⚠️ Alerta de Plan Free (Inactividad):** A Supabase le cuesta mantener servidores sin uso. El plan Free **pausa el proyecto permanentemente** si no hay llamadas directas a la base de datos en 7 días. Esto se evita y se mantiene "vivo" (Keep-Alive) de forma automática con la ejecución de tu workflow de GitHub `.github/workflows/backup-base-datos.yml` cada 24 horas. Ver [13_CONTINGENCIA_RECUPERACION.md](./13_CONTINGENCIA_RECUPERACION.md).

### Ver Logs en Tiempo Real

**Supabase Dashboard** → **Logs** → selecciona el tipo:

| Log Type | Qué muestra |
|----------|-------------|
| **API** | Todas las peticiones REST (éxito y error) |
| **Postgres** | Queries SQL ejecutadas, errores de BD |
| **Auth** | Logins, registros, errores de autenticación |

### Consulta SQL de auditoría del sistema

```sql
-- Ver los últimos 20 accesos al sistema
SELECT email, role, logged_in_at, user_agent
FROM public.login_logs
ORDER BY logged_in_at DESC
LIMIT 20;

-- Ver el tamaño de cada tabla
SELECT relname AS tabla,
       pg_size_pretty(pg_total_relation_size(relid)) AS tamaño
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Ver las cotizaciones por estado (auditoría rápida)
SELECT estado, COUNT(*) AS total, SUM(total_final) AS valor_total
FROM trx_cotizaciones_cabecera
GROUP BY estado;
```

---

## 9. Backups Automáticos

### Backup Automático via GitHub Actions

El proyecto tiene configurado un workflow en `.github/workflows/backup-base-datos.yml` que ejecuta un `pg_dump` diario y sube el resultado al repositorio.

**Ver información completa:** [13_CONTINGENCIA_RECUPERACION.md](./13_CONTINGENCIA_RECUPERACION.md)

### Backup Manual desde el Dashboard

Supabase no ofrece backup descargable directamente en el plan Free. Para backups manuales:

```bash
# Desde tu máquina local con pg_dump instalado
pg_dump "postgresql://postgres.[ID_PROYECTO]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  -f backup_$(date +%Y%m%d).sql
```

---

## 10. Configuración Avanzada del Proyecto

### Configuración de Auth

En Supabase → **Authentication** → **Providers** → **Email**:

| Configuración | Valor recomendado | Por qué |
|--------------|------------------|---------|
| **Enable Email Signup** | ❌ Desactivado | Solo ADMIN crea usuarios manualmente |
| **Confirm Email** | ❌ No requerido | Usuarios creados por admin ya son confiables |
| **Minimum Password Length** | 8 caracteres | Seguridad básica |

### Connection Pooling

Para conexiones desde scripts batch o herramientas externas, usar el **Transaction Pooler**:

```
Host: aws-0-us-east-1.pooler.supabase.com
Port: 6543 (Transaction) o 5432 (Session)
Database: postgres
User: postgres.gnvayzzufcmjseuxggks
```

---

## 11. Tareas de Mantenimiento Periódico

| Frecuencia | Tarea | Dónde hacerlo |
|-----------|-------|--------------|
| **Diario** | Verificar que el backup se ejecutó | GitHub → Actions → último workflow |
| **Semanal** | Revisar logs de Auth por errores | Supabase → Logs → Auth |
| **Semanal** | Revisar alertas de versión (Dependabot) | GitHub → Pestaña Security/Dependabot |
| **Mensual** | Verificar tamaño de la BD | Supabase → Home → Database size |
| **Mensual** | Revisar usuarios activos | Supabase → Authentication → Users |
| **Trimestral** | Probar restauración del backup | Ver procedimiento en doc 13 |
| **Semestral** | Revisar y limpiar datos zombie | Correr consulta de stock zombie |
| **Anual** | Revisar obsolescencia (Deprecation) API | Alertas de Dependabot y notas de Supabase |

---

## 12. Solución de Problemas Comunes

| Problema | Causa probable | Solución |
|---------|---------------|---------|
| "JWTExpired error" | Token de sesión vencido | Usuario debe hacer logout y login de nuevo |
| "42501 permission denied" | RLS rechaza el acceso | Verificar que el usuario tiene el rol correcto en `user_roles` |
| "PGRST204 Not authenticated" | Sin token en la petición | Verificar que `SUPABASE_ANON_KEY` está en `.env.local` |
| Proyecto pausado | Plan Free + sin actividad 7 días | Ir al dashboard de Supabase → "Restore project" |
| API muy lenta | Consulta sin índice | Analizar con `EXPLAIN ANALYZE` en SQL Editor |

---

## 🔗 Documentos Relacionados

- [11_AUTENTICACION_Y_ROLES.md](./11_AUTENTICACION_Y_ROLES.md) — Guía completa de usuarios y roles
- [13_CONTINGENCIA_RECUPERACION.md](./13_CONTINGENCIA_RECUPERACION.md) — Backups y recuperación de desastres
- [02_ESQUEMA_BASE_DATOS.md](./02_ESQUEMA_BASE_DATOS.md) — Esquema completo de tablas
- [04_API_REFERENCIA.md](./04_API_REFERENCIA.md) — Referencia completa de la API
