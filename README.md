# Sistema ERP — Vidriería y Carpintería Metálica HOLAXD

> **Stack:** Next.js 16 · Supabase PostgreSQL 17 · TanStack Query · Tailwind CSS  
> **Tipo:** SPA Estática (export) + Backend Supabase Cloud  
> **Estado:** ✅ Activo y en producción

---

## 🚀 Quick Start

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/redentor159/sistema-erp-inventario.git
cd sistema-erp-inventario
npm ci

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con las claves de Supabase

# 3. Iniciar en desarrollo
npm run dev

# 4. Build para producción
npm run build   # Genera carpeta /out estática
```

---

## 📚 Documentación Completa

Toda la documentación está en la carpeta [`/docs`](./docs/):

**👉 [Ver el Índice Maestro](./docs/00_INDICE_MAESTRO.md) ← Empieza aquí**

### Tutoriales Rápidos por Módulo

| Módulo | Tutorial |
|--------|---------|
| 📊 Dashboard KPI | [T01_TUTORIAL_DASHBOARD.md](./docs/tutoriales/T01_TUTORIAL_DASHBOARD.md) |
| 📝 Cotizaciones | [T02_TUTORIAL_COTIZACIONES.md](./docs/tutoriales/T02_TUTORIAL_COTIZACIONES.md) |
| 📦 Catálogo / SKUs | [T03_TUTORIAL_CATALOGO.md](./docs/tutoriales/T03_TUTORIAL_CATALOGO.md) |
| 📋 Inventario | [T04_TUTORIAL_INVENTARIO.md](./docs/tutoriales/T04_TUTORIAL_INVENTARIO.md) |
| 📥 Entradas | [T05_TUTORIAL_ENTRADAS.md](./docs/tutoriales/T05_TUTORIAL_ENTRADAS.md) |
| 📤 Salidas | [T06_TUTORIAL_SALIDAS.md](./docs/tutoriales/T06_TUTORIAL_SALIDAS.md) |
| 📒 Kardex | [T07_TUTORIAL_KARDEX.md](./docs/tutoriales/T07_TUTORIAL_KARDEX.md) |
| 🔧 Recetas | [T08_TUTORIAL_RECETAS.md](./docs/tutoriales/T08_TUTORIAL_RECETAS.md) |
| 🏭 Producción (Kanban) | [T09_TUTORIAL_PRODUCCION.md](./docs/tutoriales/T09_TUTORIAL_PRODUCCION.md) |
| 📊 Exportador Excel | [T10_TUTORIAL_EXPORTADOR.md](./docs/tutoriales/T10_TUTORIAL_EXPORTADOR.md) |
| 👥 Clientes / Proveedores | [T11_TUTORIAL_CLIENTES_PROVEEDORES.md](./docs/tutoriales/T11_TUTORIAL_CLIENTES_PROVEEDORES.md) |
| ⚙️ Configuración | [T12_TUTORIAL_CONFIGURACION.md](./docs/tutoriales/T12_TUTORIAL_CONFIGURACION.md) |

### Docs Técnicos

| Doc | Contenido |
|-----|-----------|
| [01 — Arquitectura General](./docs/01_ARQUITECTURA_GENERAL.md) | Stack, capas, despliegue |
| [02 — Esquema Base de Datos](./docs/02_ESQUEMA_BASE_DATOS.md) | Tablas y relaciones |
| [05 — Guía del Desarrollador](./docs/05_GUIA_DESARROLLADOR.md) | Setup local, convenciones |
| [11 — Autenticación y Roles](./docs/11_AUTENTICACION_Y_ROLES.md) | Usuarios, JWT, RLS |
| [12 — Guía Supabase](./docs/12_GUIA_SUPABASE.md) | Config, API, monitoreo |
| [13 — Contingencia y Backups](./docs/13_CONTINGENCIA_RECUPERACION.md) | Backups, self-hosting |

---

## 🗺️ Arquitectura en Una Imagen

```
[Navegador] ──HTTPS──▶ [CDN/IIS (archivos /out)] → SPA Estática
     │
     └──HTTPS──▶ [Supabase Cloud (gnvayzzufcmjseuxggks)]
                      ├── PostgREST API
                      ├── PostgreSQL 17 (datos)
                      └── Auth (JWT + RLS)
```

---

## ⚙️ Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon (segura para exponer) |

---

## 🛠️ Scripts Disponibles

| Comando | Qué hace |
|---------|---------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Genera `/out` estático para producción |
| `npm run lint` | ESLint sobre el código fuente |
| `npm test` | Ejecuta tests con Vitest |
| `npm run test:e2e` | Tests end-to-end con Playwright |

---

## 🚨 Emergencias

- **Supabase pausado:** [Ver instrucciones](./docs/13_CONTINGENCIA_RECUPERACION.md#3-procedimiento-reactivar-proyecto-pausado)
- **Pérdida de datos:** [Ver instrucciones de restauración](./docs/13_CONTINGENCIA_RECUPERACION.md#4-procedimiento-restaurar-desde-un-backup)
- **Acceso de administrador perdido:** [Ver instrucciones](./docs/11_AUTENTICACION_Y_ROLES.md#7-apéndice-qué-hacer-si-el-admin-se-queda-sin-acceso)
