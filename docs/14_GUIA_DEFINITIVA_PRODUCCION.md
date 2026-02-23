# 14_GUIA_DEFINITIVA_PRODUCCION
## La Guía Maestra para el Despliegue en Producción (Next.js + Supabase)

Este documento es una guía exhaustiva y sin límites sobre la mejor manera, el estándar de la industria y las prácticas más seguras para llevar una aplicación moderna (como un ERP de gestión de inventarios y cotizaciones) a un entorno de producción real.

Se han descartado enfoques obsoletos (como subir archivos vía FTP o compilar manualmente en servidores) para dar paso a la ingeniería profesional de software, garantizando alta disponibilidad, seguridad extrema y cero tiempo de inactividad durante las actualizaciones.

---

### 1. El Estándar de la Industria: El Enfoque Desacoplado y CI/CD

#### 1.1. Arquitectura Desacoplada (Static Export)
El estándar moderno dicta que la aplicación **no debe vivir en un único servidor (monolito)**. Y en tu caso específico, hemos subido el nivel a **Mantenimiento Cero Absoluto**:
*   **Capa de Presentación (Frontend Estático):** Construida con Next.js pero configurada con `output: 'export'`. Esto significa que Next.js muere en la fase de compilación. El resultado es una carpeta `out` llena de **puro HTML, CSS y JavaScript estático**. No hay un servidor Node.js corriendo, por lo tanto, no hay servidor que se pueda caer.
*   **Capa de Datos (Backend / Base de Datos):** Gestionada por Supabase (PostgreSQL). Toda la lógica vive en el navegador del usuario y hace peticiones directas y seguras a Supabase.
*   **Capa de Almacenamiento (Storage):** Para imágenes, PDFs y documentos, utilizando Supabase Storage.

#### 1.2. CI/CD (Integración y Despliegue Continuos)
La intervención humana directa está prohibida. El despliegue debe ser **100% automatizado**.
*   **Integración Continua (CI):** Cada *commit* a la rama principal dispara el proceso de construcción.
*   **Despliegue Continuo (CD):** El servidor clona el código, ejecuta el compilador de Next.js (`npm run build`), y extrae únicamente la carpeta `out`. Luego, distribuye esos archivos estáticos en una Red de Distribución de Contenido (CDN) global.

---

### 2. Comparativa de Infraestructura para Sitios Estáticos

Analizamos las opciones del mercado para alojar tu carpeta estática `out`:

| Característica | Plataformas Estáticas (Netlify, Vercel, Cloudflare Pages) | Infraestructura IaaS (AWS EC2, VPS clásico) |
| :--- | :--- | :--- |
| **Público Objetivo** | **Tu proyecto**. Archivos HTML, JS, CSS puros. (Mantenimiento 0). | Monolitos legacy, bases de datos internas. |
| **Administración 👨‍💻** | **Mantenimiento CERO**. Solo sirven archivos. No hay sistema operativo que actualizar. | **Mantenimiento Alto**. Debes actualizar Linux, Nginx, firewalls. |
| **Despliegue 🚀** | Automático vía GitHub. | Configuración manual (FTP/SSH). |
| **Costo Inicial 💰** | Gratuito para millones de visitas. | Pago mensual fijo por el servidor encendido. |

**Veredicto y Recomendación Absoluta:**
Al tener configurado `output: 'export'`, **Vercel y Netlify son opciones idénticas a nivel de resultado final**. Ambas tomarán tus archivos estáticos y los distribuirán gratuitamente en su CDN global. No dependes de las funciones exclusivas de servidor de Vercel. Puedes elegir cualquiera de las dos con total confianza; ambas cumplirán la meta de "0 Mantenimiento".
---

### 3. Seguridad de Grado Militar: Lo Innegociable en Producción

Toda aplicación expuesta a internet recibirá ataques automatizados en sus primeras semanas. Las precauciones obligatorias son:

#### 3.1. Separación de Secretos (Variables de Entorno)
*   **Regla de Oro:** **Jamás** incluir credenciales (contraseñas de DB, APIs de Stripe, JWT Secrets) en el código fuente.
*   Se deben usar variables de entorno configuradas directamente en el panel de Vercel (Production Environment Variables) y en Supabase.
*   Las variables públicas que Next.js necesita en el navegador (`NEXT_PUBLIC_...`) solo deben contener URLs y claves anónimas (que están protegidas más adelante).

#### 3.2. Seguridad a Nivel de Fila (RLS - Row Level Security en PostgreSQL)
*   En aplicaciones BaaS (Backend as a Service), el frontend y el usuario final tienen acceso directo al endpoint de la DB.
*   Es **obligatorio** tener activado RLS en todas y cada una de las tablas de Supabase.
*   Las políticas RLS garantizan que el usuario 1 no puede listar, editar ni borrar las facturas del usuario 2, **incluso si un atacante obtiene la API Key anónima**. Todo acceso está validado bajo el token JWT temporal del usuario autenticado (`auth.uid()`).

#### 3.3. Protección de Red y Borde (WAF y DDoS)
*   Al hostear en Vercel, la aplicación queda detrás de un escudo CDN robusto. Esto absorbe ataques de Denegación de Servicio (DDoS) sin costo al cliente y blinda los endpoints contra ataques comunes del Top 10 de OWASP.
*   Supabase, en sus capas superiores o mediante Cloudflare intermedio (si se configura de forma avanzada), provee escudos contra escaneo y fuerza bruta sobre la DB.

#### 3.4. Supabase Network Restrictions (Restricciones de Red)
*   En el entorno de producción, la base de datos de Supabase no debe aceptar conexiones desde cualquier IP global.
*   Si solo se utiliza Supabase mediante API REST (PostgREST o el cliente de SupabaseJS) desde el navegador o servidor de Vercel, deberías **restringir el acceso directo a la IP de la base de datos** solo a tu equipo de desarrollo o IPs confiables.

---

### 4. Estrategia de Entornos Múltiples (Jamás probar en Producción)

Trabajar en vivo y hacer cambios en la base de datos en producción es una catástrofe asegurada. La industria estandariza el flujo en ambientes paralelos:

1.  **Entorno Local (Localhost):**
    *   Servidor Next.js levantado por el desarrollador.
    *   Base de datos local usando Supabase CLI (Docker) o un proyecto "dev" aislado en Supabase Cloud.
2.  **Entorno de Pruebas (Staging / Pre-producción):**
    *   Rama de Git: `develop` o `staging`.
    *   Infraestructura: Una copia idéntica a producción (Preview Deployment en Vercel) apuntando a un proyecto **Staging** independiente en Supabase.
    *   Propósito: Test de calidad final (QA), validaciones del cliente, simulación de migraciones complejas de datos.
3.  **Entorno de Producción (Production):**
    *   Rama de Git: `main` / `master`.
    *   Infraestructura: El dominio oficial (`erp.tuempresa.com`). Solo interactúa con la base de datos oficial. Las variables son las de producción.

---

### 5. Respaldo (Backups) y Plan de Contingencia (Disaster Recovery)

¿Qué pasa si un empleado borra masivamente la base de datos o si ocurre una tragedia mayor?

1.  **Supabase PITR (Point in Time Recovery):** Para aplicaciones críticas, el plan Pro de Supabase ofrece copias de seguridad PITR. Esto permite hacer "rebobinado" de toda la base de datos a **cualquier segundo de los últimos X días**. Es el seguro de vida de los datos de los usuarios.
2.  **Backups Lógicos Periódicos Cronometrados:** Indistintamente del plan de Supabase, se debe implementar una tarea automatizada (cronjob como GitHub Actions o pg_dump en un VPS remoto) que ejecute un volcado de la base de datos completo (schema + datos) diariamente y lo suba a un AWS S3 Bucket externo "Cold Storage".
    *   *Ver `.github/workflows/backup-base-datos.yml` del proyecto actual.*
3.  **Respaldar el Storage Limitado:** Los archivos (imágenes y PDFs) subidos en Supabase Storage también deben replicarse (o utilizar un bucket S3 de AWS como capa primaria por sus bajos costos).
4.  **No Vendor Lock-in a nivel Datos:** Al ser PostgreSQL puro, tienes total dominio sobre tus datos; si Supabase fallara permanentemente, puedes levantar el backup y el esquema en un servidor RDS en AWS y redireccionar los accesos en menos de 4 horas en un equipo hábil (RTO/RPO).

---

### 6. Rendimiento y Caching (Sitio Estático)

Debido a tu configuración estática (`output: 'export'`), el performance depende enteramente del navegador del cliente y de Supabase:
1.  **Carga de Pantallas Instantánea:** Todo tu HTML y JS se carga como si fuera un documento de Word hospedado en la nube. Las pantallas (módulos) cambiarán de inmediato.
2.  **React Query / TanStack Query (Tu Motor de Reactividad):** Puesto que Next.js no puede renderizar datos en el servidor (SSR apagado), *TODA* la carga de datos (inventarios, cotizaciones) ocurre en el navegador de tu cliente. Es vital que TanStack Query esté configurado para cachear resultados (stale time) y evitar bombardear a Supabase con peticiones repetitivas cuando navegas entre pestañas.
3.  **Zonificación:** Al crear el proyecto de Supabase, debes elegir la región física más cercana a los usuarios empresariales objetivo (por ejemplo, *us-east-1* EE.UU. Costa Este o *sa-east-1* Brasil). Esto reduce la latencia en las consultas SQL.
---

### 7. Todo el Proceso Paso a Paso (Checklist Definitiva)

Si estás listo para ir a Producción, asume este protocolo marcial:

#### FASE 1: Sellado del Código (Freeze)
* [ ] Todo el código está commiteado y mergeado en la rama `main` en un repositorio de GitHub Privado (JAMÁS público si contiene secretos de la empresa).
* [ ] Ejecutar localmente `npm run build` y corroborar que no haya fallos de TypeScript ni reglas vitales de ESLint rotas. Es la primera criba.

#### FASE 2: Blindaje del Entorno Único (Enfoque Pragmático)

Si decides mantener un **único proyecto** para Desarrollo y Producción (por simplicidad, para evitar el doble trabajo de sincronización o porque ya tienes todos tus productos cargados), debes implementar un **Blindaje Extremo**. 

En este escenario, tu base de datos de "pruebas" ES tu base de datos de producción. Un error aquí es fatal.

**1. El Riesgo de la Sincronización Automática:**
*   La razón por la que no existe la "sincronización automática" entre proyectos es la **seguridad**. Si haces un cambio que rompe la base de datos en Desarrollo, no quieres que ese error se replique automáticamente en Producción y detenga tu negocio.
*   Al usar un solo proyecto, aceptas que **Desarrollo = Producción**. Cada script que pruebes localmente contra Supabase está afectando a tus datos reales.

**2. Las 3 Reglas de Oro del Proyecto Único:**
*   **Regla 1: RLS Obligatorio al 100%:** No puedes tener tablas sin políticas de seguridad. Debes asegurar que el script `024_audit_remediation_rls_performance.sql` esté aplicado. Esto evita que errores en el código (leaks de datos) expongan información de otros usuarios.
*   **Regla 2: Backups Externos Diarios:** Ya que no tienes un proyecto espejo, tu única red de seguridad ante un borrado accidental es el backup. Debes tener activo el GitHub Action o script de `pg_dump` que guarde una copia de la base de datos fuera de Supabase cada 24 horas.
*   **Regla 3: No tocar el Esquema en horas pico:** Cualquier cambio estructural (columnas, tablas, vistas) debe hacerse con extrema precaución, idealmente en horas de bajo tráfico, ya que no tienes un entorno de Staging para verificar que la aplicación no se rompa al subir el cambio.

**3. Consolidación de Esquema (Recomendado):**
Dado que tienes más de 160 archivos SQL en desorden, se recomienda:
*   **Snapshot Maestro:** Generar un único archivo `SCHEMA_PROD_2026.sql` usando el comando `supabase db pull` o exportando todo el esquema desde el SQL Editor. Esto te servirá como punto de restauración rápido si algo falla.
*   **Limpieza:** Una vez tengas el Snapshot, puedes archivar los 160 archivos antiguos para que la carpeta `database/` deje de ser un caos y sea manejable.

**4. ¿Cuándo pasar a 2 proyectos?**
Este enfoque de proyecto único es válido mientras seas el único desarrollador o el equipo sea muy pequeño. Debes migrar a dos proyectos (Dev y Prod) cuando:
*   Tengas más de 2 personas tocando la base de datos simultáneamente.
*   El costo de una caída sea superior a unas pocas horas de "doble trabajo" de sincronización.
*   Implementes un flujo de migraciones formal (Supabase CLI / Prisma).

#### FASE 3: Despliegue del Código (Paso a Paso Detallado para Vercel o Netlify)

Dado que es una app estática de mantenimiento cero, los pasos en Vercel o Netlify son casi idénticos.

1.  **Crear cuenta y Conectar:**
    *   Entra a [Vercel.com](https://vercel.com) o [Netlify.com](https://netlify.com).
    *   Regístrate eligiendo "Continue with GitHub".
2.  **Importar el Proyecto:**
    *   Clic en **"Add New Project"** (Vercel) o **"Import from Git"** (Netlify).
    *   Dale permiso para leer tus repositorios de GitHub.
    *   Selecciona el repositorio de tu proyecto (`celestial-skylab` o el nombre que le hayas puesto).
3.  **Configuración de Construcción (Build Settings):**
    *   **Framework Preset:** La plataforma detectará `Next.js` automáticamente.
    *   **Build Command:** Déjalo por defecto en `npm run build` o `next build`.
    *   **Output Directory:** La plataforma sabrá que es la carpeta `out` al leer tu `next.config.ts`.
4.  **⚡ VARIABLES DE ENTORNO (El paso más crítico):**
    *   Abre la sección "Environment Variables".
    *   Debes copiar los valores exactos (sin comillas dobles, solo el texto) de tu archivo `.env.local`:
        *   `NEXT_PUBLIC_SUPABASE_URL` = [URL de tu Supabase]
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY` = [Clave anon pública de tu Supabase]
    *   *Si te equivocas aquí, la pantalla quedará en blanco al abrir la app.*
5.  **Desplegar:**
    *   Clic en **"Deploy"**.
    *   Verás una terminal mostrando cómo descarga tu código y ejecuta el build. Tomará 1 o 2 minutos. Si sale verde, la app ya está viva en internet (en una URL aleatoria que ellos te dan temporalmente).

#### FASE 4: Riesgos a Largo Plazo del "Mantenimiento Cero" (Planes Gratuitos)

Si decides usar dominios gratuitos (ej. `tu-erp.vercel.app`), te enfrentas a la obsolescencia del ecosistema de terceros. Estos son los verdaderos riesgos y sus **Contingencias Oficiales**:

**Contingencia 1: Obsolescencia de la API y la librería supabase-js (El problema de los 18 meses)**
Las plataformas DBaaS evolucionan. Si en un año y medio Supabase deprecia la versión de la API que usa tu aplicación, las inserciones de nuevas órdenes Make to Order fallarán en silencio. Tu sistema simplemente dejará de registrar datos.

*El Protocolo de Actualización Rigurosa:*
1.  **Automatización de Alertas (Dependabot):** No dependas de tu memoria para saber cuándo actualizar. Activa "Dependabot" (o una herramienta similar) en tu repositorio de GitHub. Este bot escaneará tu `package.json` diariamente y te avisará cuando haya actualizaciones críticas de seguridad o de versiones mayores de `@supabase/supabase-js`.
2.  **Aislamiento en Entorno de Pruebas (Staging):** Cuando llegue el momento de actualizar, **jamás** ejecutes el comando en la rama de producción (`main`). Crea una rama `update-supabase-vX`.
3.  **Actualización Controlada:** En tu terminal, ejecuta `npm update @supabase/supabase-js`. Lee exhaustivamente el *Changelog* (registro de cambios) publicado por Supabase. Busca la palabra *"Breaking Changes"* (Cambios que rompen compatibilidad).
4.  **Pruebas de Regresión Transaccional:** El código compilará, pero eso no significa que funcione. Debes simular el flujo crítico *localmente* antes de subir nada:
    *   Generar una cotización con despiece de ingeniería completo.
    *   Mover una tarjeta en el Kanban (verificando que el JSONB del historial se guarde bien).
    *   Descontar stock valorizado.
5.  **Pase a Producción:** Solo cuando el flujo transaccional esté validado en tu máquina local, haces el *merge* a la rama principal para que Vercel regenere los archivos estáticos.

**Contingencia 2: Políticas Estrictas de Navegadores (CORS y Cookies de 3ros)**
*   **El Escenario:** Navegadores anunciando bloqueos duros a peticiones "Cross-Origin" o ignorando *cookies/localStorage* de dominios diferentes a la URL visible (`erp.vercel.app` vs `xyz.supabase.co`).
*   **¿Basta con un botón de "Aceptar Cookies"?** Físicamente **NO**. Un botón o banner de cookies (cumplimiento GDPR) es solo un acuerdo legal (UI), no tiene poder técnico para sobrescribir las reglas del motor del navegador si este decide bloquear llamadas a terceros a nivel de red (Network Layer).
*   **La Solución a futuro (Si ocurre):** Si el bloqueo se vuelve inviolable, la única forma oficial de evitar que te detecten como "Cross-Origin" es usar **Custom Domains de Supabase** (ej. `api.tu-erp.com`). Lamentablemente, esta función es exclusiva del plan Pro ($25/mes) de Supabase.

**Contingencia 3: Inactividad de Proyectos Gratuitos (Keep-Alive)**
*   A Supabase le cuesta mantener encendidos servidores que nadie usa. Si no hay llamadas a la base de datos en X días, pausarán tu proyecto *Free*.
*   **Solución Activa:** Tu sistema ya cuenta con el script `.github/workflows/backup-base-datos.yml`. Este script no solo salva tus datos, sino que actúa como un "Latido del Corazón" (Keep-Alive) diario, engañando al robot de inactividad de Supabase.

#### FASE 5: Monitoreo Mínimo (Checkups periódicos de Supervivencia)
* [ ] **Supabase Dashboard:** Revisa visualmente si hay alertas de "Deprecación".
* [ ] **GitHub Dependabot:** Revisa alertas de seguridad o versiones mayores en tu repositorio.
* [ ] **Action Tab de GitHub:** Verifica que el Action de Backup (tu Keep-Alive) haya corrido exitosamente en los últimos 3 días.
### Resumen Conclusivo

Lograste tu objetivo: has diseñado una arquitectura de **Mantenimiento 0 para el Servidor**.

Al forzar la exportación estática (`output: 'export'`), te has liberado de gestionar Node.js. Vercel o Netlify actuarán únicamente como megáfonos que distribuyen tus archivos estáticos por el mundo. El único "mantenimiento" que esta arquitectura te exigirá por el resto de la década será: no olvidar pagar el recibo anual de tu dominio y vigilar las cuotas de tu base de datos en Supabase.

