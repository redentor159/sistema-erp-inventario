# 13 — Contingencia, Backups y Recuperación de Desastres

> **Sistema:** ERP de Inventario y Cotizaciones — Carpintería Metálica  
> **Última actualización:** Febrero 2026  
> **Nivel de urgencia:** Activar solo ante eventos críticos (ver tabla de escenarios)  

---

## Documentos Relacionados

| Documento | Enlace |
|-----------|--------|
| Guía Supabase | [12_GUIA_SUPABASE.md](./12_GUIA_SUPABASE.md) |
| Arquitectura General | [01_ARQUITECTURA_GENERAL.md](./01_ARQUITECTURA_GENERAL.md) |
| Handoff Maestro | [../HANDOFF_MAESTRO.md](../HANDOFF_MAESTRO.md) |

---

## 1. Escenarios de Contingencia y Niveles de Urgencia

| Escenario | Nivel | Tiempo de reacción | Acción a tomar |
|-----------|:-----:|-------------------|---------------|
| Supabase proyecto **pausado** (plan free 7 días) | 🟡 Bajo | Minutos | Reactivar desde dashboard |
| Supabase Cloud **caída temporal** (<4h) | 🟡 Bajo | Esperar | Monitorear status.supabase.com |
| Supabase Cloud **caída prolongada** (>24h) | 🟠 Medio | <4 horas | Activar self-hosting temporal |
| Supabase **sube precios** significativamente | 🟠 Medio | 30 días | Planificar migración |
| **Corrupción o pérdida de datos** | 🔴 Crítico | <2 horas | Restaurar desde backup |
| Supabase **cierra el servicio Cloud** | 🔴 Crítico | 30 días | Migrar a self-hosting permanente |
| **Brecha de seguridad** / acceso no autorizado | 🔴 Crítico | Inmediato | Revocar claves + auditar accesos |

---

## 2. Sistema de Backups Automáticos

### 2.1 Workflow de GitHub Actions (Backup Diario)

El proyecto tiene configurado en `.github/workflows/backup-base-datos.yml` un workflow que se ejecuta **automáticamente cada día a las 2:00 AM UTC** y genera un dump de la base de datos.

```mermaid
flowchart LR
    A["⏰ Cron: 2 AM UTC\n(GitHub Actions)"] --> B["🔌 Conecta a Supabase\nvía pg_dump"]
    B --> C["💾 Genera backup.sql\n(dump completo)"]
    C --> D["📁 Commit al repositorio\nbranch: backups"]
    D --> E["✅ Backup disponible\nen GitHub"]
```

#### Cómo verificar que los backups funcionan

1. Ve a tu repositorio en GitHub
2. Clic en la pestaña **"Actions"**
3. Busca el workflow **"Backup Base de Datos"**
4. Verifica que el último run tiene el ícono ✅ verde

#### ¿Qué hacer si el backup falla?

Causas comunes:
- El secret `SUPABASE_DB_PASSWORD` expiró o cambió → actualizar en GitHub Settings → Secrets
- La URL de conexión cambió → verificar en Supabase Dashboard → Settings → Database

### 2.2 Keep-Alive (Prevención de Pausa)

El plan Free de Supabase pausa proyectos sin actividad por 7 días. El workflow `.github/workflows/keep-alive-supabase.yml` hace una ping-query cada 4 días para evitar esto.

```
Workflow: keep-alive-supabase.yml
Schedule: Cada 4 días (cron: '0 12 */4 * *')
Acción: SELECT 1 FROM mst_config_general LIMIT 1
```

### 2.3 Backup Manual (Cuando lo Necesites)

```bash
# Desde tu computadora local (requiere PostgreSQL instalado)
pg_dump "postgresql://postgres.gnvayzzufcmjseuxggks:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  -f backup_manual_$(date +%Y%m%d_%H%M).sql

echo "Backup generado: backup_manual_$(date +%Y%m%d_%H%M).sql"
```

> **💡 El password** se obtiene en Supabase Dashboard → Settings → Database → "Database password".

---

## 3. Procedimiento: Reactivar Proyecto Pausado

Si el proyecto se pausó (pantalla de "Project is paused"):

```mermaid
flowchart TD
    A["🔴 Sistema no responde\nError 503 o pantalla pausa"] --> B["Ir a:\nsupabase.com/dashboard"]
    B --> C["Seleccionar proyecto\nia inventario"]
    C --> D["Hacer clic en:\n'Restore project'"]
    D --> E["Esperar ~2 minutos\nhasta que vuelva Active"]
    E --> F["✅ Sistema operativo\nde nuevo"]
```

**Tiempo estimado de restauración:** 2-5 minutos.

---

## 4. Procedimiento: Restaurar desde un Backup

Sigue este procedimiento si los datos están corruptos o perdidos:

### Paso 1: Obtener el backup más reciente

```bash
# Opción A: Desde GitHub (backup automático)
git clone https://github.com/[TU_ORG]/[TU_REPO].git
cd [TU_REPO]
git checkout backups
ls -la backups/  # Ver archivos de backup disponibles

# Opción B: Usar un backup local si tienes uno
ls -la ~/backups/
```

### Paso 2: Restaurar en Supabase Cloud

```bash
# ADVERTENCIA: Esto sobreescribe los datos actuales
psql "postgresql://postgres.gnvayzzufcmjseuxggks:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
  -f backup_YYYYMMDD.sql
```

### Paso 3: Verificar integridad después de restaurar

Ejecuta en el SQL Editor de Supabase:

```sql
-- Verificar conteo de registros en tablas críticas
SELECT 'mst_clientes' AS tabla, COUNT(*) AS registros FROM mst_clientes
UNION ALL
SELECT 'cat_productos_variantes', COUNT(*) FROM cat_productos_variantes
UNION ALL
SELECT 'trx_movimientos', COUNT(*) FROM trx_movimientos
UNION ALL
SELECT 'trx_cotizaciones_cabecera', COUNT(*) FROM trx_cotizaciones_cabecera
UNION ALL
SELECT 'dat_kanban_produccion', COUNT(*) FROM dat_kanban_produccion
ORDER BY tabla;
```

---

## 5. Procedimiento: Self-Hosting (Plan B Permanente)

Si necesitas migrar a infraestructura propia completamente:

### 5.1 Requisitos del Servidor

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| **CPU** | 2 cores | 4 cores |
| **RAM** | 4 GB | 8 GB |
| **Disco** | 20 GB SSD | 50 GB SSD |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| **Software** | Docker 24+, Docker Compose | Docker 24+, Docker Compose |

### 5.2 Instalación de Self-Hosted Supabase

```bash
# 1. Instalar Docker en Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 2. Clonar el stack de Supabase
git clone https://github.com/supabase/supabase.git
cd supabase/docker

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env: POSTGRES_PASSWORD, JWT_SECRET, SITE_URL

# 4. Levantar todos los servicios
docker compose up -d

# 5. Verificar que todos están corriendo
docker compose ps
```

Servicios que se levantan:
- **PostgreSQL** → puerto 5432
- **PostgREST** (API REST) → puerto 3000
- **Supabase Studio** (Dashboard local) → puerto 8000
- **GoTrue** (Auth) → puerto 9999
- **Nginx** (Reverse proxy) → puerto 8000

### 5.3 Migrar datos al Self-Hosted

```bash
# 1. Exportar desde Supabase Cloud
pg_dump "postgresql://postgres.gnvayzzufcmjseuxggks:[PASS]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
  --no-owner --no-acl --clean --if-exists \
  -f backup_migracion.sql

# 2. Importar en el Docker local
docker cp backup_migracion.sql supabase-db:/tmp/
docker exec -it supabase-db psql -U postgres -d postgres -f /tmp/backup_migracion.sql
```

### 5.4 Reconfigurar el Frontend

Solo cambia el archivo `.env.local`:

```env
# ANTES — Supabase Cloud:
NEXT_PUBLIC_SUPABASE_URL=https://gnvayzzufcmjseuxggks.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (clave cloud)

# DESPUÉS — Self-Hosted:
NEXT_PUBLIC_SUPABASE_URL=http://tu-servidor-ip:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (nueva clave del .env del Docker)
```

Luego reconstruye:

```bash
npm run build
# Despliega la nueva carpeta /out en tu CDN o servidor HTTP
```

---

## 6. Diagrama de Decisión de Contingencia

```mermaid
flowchart TD
    INC["🔴 Incidente detectado"] --> Q1{{"¿El proyecto está\npausado?"}}
    Q1 -->|Sí| FIX1["Reactivar en dashboard\nsupabase.com (2 min)"]
    Q1 -->|No| Q2{{"¿Supabase Cloud\nresponde?"}}
    Q2 -->|Sí| Q3{{"¿Los datos están\nincompletos/corruptos?"}}
    Q2 -->|No| Q4{{"¿Caída < 4h?"}}
    Q3 -->|Sí| FIX2["Restaurar desde backup\n(ver sección 4)"]
    Q3 -->|No| FIX3["Revisar permisos\ny configuración"]
    Q4 -->|Sí| WAIT["Esperar y\nmonitorear status"]
    Q4 -->|No| FIX4["Activar self-hosting\ntemporal (ver sección 5)"]
```

---

## 7. Cronograma de Mantenimiento Preventivo

| Frecuencia | Tarea | Responsable | Cómo verificar |
|-----------|-------|-------------|----------------|
| **Diario** | Verificar que backup corrió sin errores | Admin | GitHub → Actions → verde ✅ |
| **Semanal** | Revisar logs de Auth por errores | Admin | Supabase → Logs → Auth |
| **Mensual** | Verificar tamaño de BD (< 500 MB en free) | Admin | Supabase → Home → DB size |
| **Mensual** | Descargar un backup manualmente | Admin | Guardar en disco externo |
| **Trimestral** | Probar restauración del backup en entorno prueba | IT | Comprobar que los datos son correctos |
| **Semestral** | Probar levantamiento completo del self-hosting | IT | Verificar que Docker levanta correctamente |

---

## 8. Kit de Emergencia Offline

Guarda en un **disco duro externo dedicado** (y en Google Drive como respaldo):

```
_EMERGENCIA_SUPABASE/
├── docker/                     # Copia del repo supabase/docker (sin internet)
├── instaladores/
│   ├── docker-24.x.deb         # Instalador Docker offline
│   └── docker-compose-v2.deb
├── backups/
│   └── backup_YYYYMMDD.sql     # Último dump de la BD
├── .env.template               # Template de variables con comentarios
├── docs/                       # Copia de esta documentación
└── INSTRUCCIONES_RAPIDAS.txt   # Los comandos más importantes en texto plano
```

**Contenido sugerido de `INSTRUCCIONES_RAPIDAS.txt`:**
```
=== INSTRUCCIONES DE EMERGENCIA (SIN INTERNET) ===

1. Instalar Docker: dpkg -i instaladores/docker-24.x.deb
2. Copiar .env.template → .env y llenar contraseñas
3. docker compose -f docker/docker-compose.yml up -d
4. docker cp backups/backup_ULTIMO.sql supabase-db:/tmp/
5. docker exec -it supabase-db psql -U postgres -d postgres -f /tmp/backup_ULTIMO.sql
6. Cambiar .env.local del ERP → URL: http://esta-ip:8000
7. npm run build (en la carpeta del ERP)
8. Copiar /out al servidor HTTP

ACCEDER AL STUDIO LOCAL: http://esta-ip:8000
```

---

## 🔗 Documentos Relacionados

- [12_GUIA_SUPABASE.md](./12_GUIA_SUPABASE.md) — Referencia completa de Supabase
- [11_AUTENTICACION_Y_ROLES.md](./11_AUTENTICACION_Y_ROLES.md) — Si hay brecha de seguridad
- [07_GUIA_DESPLIEGUE_ESTATICO.md](./07_GUIA_DESPLIEGUE_ESTATICO.md) — Cómo hacer build y deploy
- [../HANDOFF_MAESTRO.md](../HANDOFF_MAESTRO.md) — Estado general del sistema
