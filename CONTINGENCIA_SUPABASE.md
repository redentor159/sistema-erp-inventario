# CÓMO RECUPERAR ESTE SISTEMA SI SUPABASE CLOUD DESAPARECE

Supabase es una plataforma Open-Source. Si en el futuro su servicio en la nube (app.supabase.com) cambia de políticas de pago asfixiantes, o simplemente desaparece, su ERP estructurado aquí en Next.js **no morirá**. Usted puede alojar todo el backend de forma local en su propia oficina o en cualquier proveedor de nube (AWS, DigitalOcean, etc.).

A continuación los pasos de emergencia documentados para el equipo de IT que herede el sistema en esos escenarios.

## 1. Requisitos Previos (En la Servidora de Rescate)
*   Debe instalar Docker y Docker Compose en la PC o Servidor (Windows/Linux/Mac).
*   Git instalado.

## 2. Puesta en Marcha del Contenedor de Rescate
1. Clonar el repositorio oficial de Supabase Docker Versionado (Recomendación: Descargue el ZIP de la v0.x o v1.x compatible con la fecha de este manual si las APIs en futuras versiones cambian radicalmente).
   ```bash
   # Clonemos el repositorio
   git clone https://github.com/supabase/supabase
   cd supabase/docker
   ```

2. Generar el archivo de configuración.
   ```bash
   cp .env.example .env
   ```
   > **Importante:** Abra el archivo `.env` que se acaba de crear y configure las contraseñas base (como `POSTGRES_PASSWORD`). Todo lo demás puede quedar por defecto.

3. Arrancar la Base de Datos y APIs asociadas.
   ```bash
   docker compose up -d
   ```
   Este comando descargará todas las arquitecturas y se encenderá. Al terminar, usted tendrá un Dashboard de Supabase local idéntico al de la nube entrando a `http://localhost:8000` (o la IP local del Servidor, como `http://192.168.1.100:8000`).

## 3. Restauración de los Datos
Para que su ERP local tenga los datos históricos correspondientes:
1. Necesitará un Dump SQL de su base de datos Supabase en la nube. **(Realice un volcado/backup de sus datos Cloud regularmente y protéjalos).**
2. Para restaurarlo, diríjase al Dashboard local, navegue al editor SQL o utilice la herramienta de terminal de Postgres y corra el script volcado.

## 4. Re-Anclar el ERP al "Nuevo Servidor"
En el código fuente de su ERP (esta misma carpeta), diríjase al archivo escondido `.env.local` (o si ya estaba empaquetada y la recompila, cambie las variables base en los secretos del Hosting):

**Antes (Cloud):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzdsadwa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...
```

**Después (Local Rescate):**
```env
# Reemplace la IP o dominio local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
# El ANON_KEY local se lo dará el dashboard local de docker al arrancar, póngalo aquí:
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Una vez con las nuevas llaves, repita el proceso de construcción indicado en el **HANDOFF_MAESTRO.md** y sirva sus estáticos. ¡El ERP estará vivo y hablando con su servidor físico local!
