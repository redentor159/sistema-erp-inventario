# 🚨 PLAN DE CONTINGENCIA SUPABASE — El Botón de Pánico

> **Documento de emergencia para levantar el backend en infraestructura propia**  
> **Última actualización:** 2026-02-21

## Documentos Relacionados

- [docs/01_ARQUITECTURA_GENERAL.md](./docs/01_ARQUITECTURA_GENERAL.md) — Arquitectura del sistema
- [docs/02_ESQUEMA_BASE_DATOS.md](./docs/02_ESQUEMA_BASE_DATOS.md) — Esquema completo de BD
- [docs/06_BLINDAJE_ARQUITECTONICO.md](./docs/06_BLINDAJE_ARQUITECTONICO.md) — Blindaje del sistema
- [HANDOFF_MAESTRO.md](./HANDOFF_MAESTRO.md) — Protocolo de entrega

---

## ¿Cuándo Activar Este Plan?

Activa este protocolo si ocurre **cualquiera de los siguientes escenarios**:

| Escenario | Nivel de Urgencia | Acción |
|-----------|:-----------------:|--------|
| Supabase anuncia cierre del servicio Cloud | 🟡 Media | Migrar en 30 días |
| Supabase cambia precios drásticamente | 🟡 Media | Evaluar → Migrar si no es viable |
| Supabase Cloud tiene caída prolongada (>24h) | 🟠 Alta | Activar instancia local temporal |
| Supabase altera API incompatiblemente | 🔴 Crítica | Migrar inmediatamente |
| Amenaza geopolítica o regulatoria | 🔴 Crítica | Activar instancia local |

---

## Ventaja Clave: Supabase es Open Source

Supabase no es un servicio cerrado. El código completo está disponible en GitHub y puede ser auto-alojado (self-hosted). Tu ERP solo necesita:

1. Una URL de PostgreSQL
2. Una clave de API de PostgREST

---

## Procedimiento de Self-Hosting

### Requisitos del Servidor

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| **CPU** | 2 cores | 4 cores |
| **RAM** | 4 GB | 8 GB |
| **Disco** | 20 GB SSD | 50 GB SSD |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| **Software** | Docker 24+, Docker Compose | Docker 24+, Docker Compose |

### Paso 1: Instalar Docker

```bash
# En Ubuntu 22.04
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Paso 2: Clonar Supabase

```bash
git clone https://github.com/supabase/supabase.git
cd supabase/docker
```

> ⚠️ **IMPORTANTE:** Guarda una copia de este repositorio HOY en un disco externo. No dependas de que GitHub siga disponible en el futuro.

### Paso 3: Configurar Variables

```bash
cp .env.example .env
```

Edita el `.env` y configura:

| Variable | Acción |
|----------|--------|
| `POSTGRES_PASSWORD` | Establece una contraseña fuerte |
| `JWT_SECRET` | Genera una clave de 32+ caracteres |
| `ANON_KEY` | Se generará automáticamente |
| `SERVICE_ROLE_KEY` | Se generará automáticamente |
| `SITE_URL` | La URL de tu frontend (ej: `http://tu-ip:3000`) |

### Paso 4: Levantar Supabase

```bash
docker compose up -d
```

Esto levantará:
- **PostgreSQL** en el puerto 5432
- **PostgREST** (API REST) en el puerto 3000
- **Studio** (Dashboard) en el puerto 8000
- **Auth** (Autenticación) en el puerto 9999

### Paso 5: Verificar

```bash
# Ver los contenedores
docker compose ps

# Acceder al Studio
# Abrir: http://tu-servidor:8000
```

---

## Migración de Datos

### Exportar desde Supabase Cloud

1. Accede a tu proyecto en [app.supabase.com](https://app.supabase.com)
2. Ve a **Settings → Database → Connection String**
3. Ejecuta:

```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    > backup_completo.sql
```

### Importar en Self-Hosted

```bash
# Copiar al contenedor
docker cp backup_completo.sql supabase-db:/tmp/

# Ejecutar restauración
docker exec -it supabase-db psql -U postgres -d postgres -f /tmp/backup_completo.sql
```

### Verificar Integridad

```sql
-- Contar registros en tablas críticas
SELECT 'mst_clientes' AS tabla, COUNT(*) FROM mst_clientes
UNION ALL
SELECT 'cat_productos_variantes', COUNT(*) FROM cat_productos_variantes
UNION ALL
SELECT 'trx_movimientos', COUNT(*) FROM trx_movimientos
UNION ALL
SELECT 'trx_cotizaciones_cabecera', COUNT(*) FROM trx_cotizaciones_cabecera;
```

---

## Reconfigurar el Frontend

### Único Cambio Necesario

Edita `.env.local` en tu proyecto ERP:

```env
# ANTES (Cloud):
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...

# DESPUÉS (Self-Hosted):
NEXT_PUBLIC_SUPABASE_URL=http://tu-servidor:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...  # La nueva anon key generada
```

### Reconstruir

```bash
npm run build
```

La nueva carpeta `/out` apuntará a tu servidor local.

---

## Diagrama del Flujo de Migración

```mermaid
flowchart TD
    A["Evento Trigger<br/>(Supabase caído/caro)"] --> B["pg_dump del Cloud"]
    B --> C["Levantar Docker local"]
    C --> D["pg_restore en contenedor"]
    D --> E["Cambiar .env.local"]
    E --> F["npm run build"]
    F --> G["Deploy /out en CDN"]
    G --> H["ERP funcionando<br/>con backend local"]
```

---

## Backups Periódicos Recomendados

| Frecuencia | Qué Guardar | Dónde |
|-----------|-------------|-------|
| **Diario** | `pg_dump` automático | Disco duro externo |
| **Semanal** | Copia de `pg_dump` | Nube diferente (Google Drive) |
| **Mensual** | Código fuente + dump + `.env` | USB cifrado en caja fuerte |
| **Semestral** | Verificar que Docker Self-Host funciona | Servidor de prueba |

---

## Kit de Emergencia Offline

Guarda en un **disco duro externo** dedicado:

```
_EMERGENCIA_SUPABASE/
├── docker/                    # Repo completo de supabase/docker
├── backup_yyyy-mm-dd.sql      # Último dump de la base de datos
├── instaladores/
│   ├── docker-24.x.deb        # Instalador de Docker offline
│   └── docker-compose-v2.deb  # Docker Compose
├── .env.example               # Template de variables
└── INSTRUCCIONES.md           # Copia de este documento
```
