# Guía de Migraciones y Orden de los Scripts SQL

¡IMPORTANTE! Este proyecto cuenta con más de 150 scripts guardados en la carpeta `/database`. 
Actualmente **no existe un sistema automatizado de migraciones** (como Prisma o Flyway). 

Si en algún momento se necesita levantar la base de datos de Supabase desde cero, este es el orden estricto en el que deben ejecutarse los scripts para no romper las llaves foráneas.

## Orden de Ejecución para Restauración desde Cero

1. **Tablas Base (Maestros):** `00_...` hasta `04_...` (familias, marcas, etc.)
2. **Plantillas y SKUs:** `05_...` y `06_...` (cat_plantillas, cat_productos_variantes)
3. **Tablas Transaccionales Generales:** `07_...` hasta `09_...` (entradas, salidas, kardex)
4. **Módulos Especializados:** 
   - Cotizaciones (`10_...`)
   - Producción Kanban (`11_...` y relacionados)
   - Log de Sesiones (`12_...`)
5. **Políticas de Seguridad (RLS):** 
   - IMPORTANTE: Las políticas antiguas fueron consolidadas. Se debe saltar las antiguas y ejecutar **directamente el script `024_audit_remediation_rls_performance.sql`** que contiene la versión óptima P0 de las políticas universales.
6. **Vistas de Base de Datos:**
   - Para el Dashboard (KPIs, ABC, etc.)
   - Para el Kardex y Entradas/Salidas
7. **Vista Materializada Crítica:**
   - **`025_materialized_stock_view.sql`** (Obligatorio para el inventario, reemplaza la vista regular).
8. **Triggers y Funciones RPC:** (El resto de scripts).

## Mantenimiento

Se recomienda en un futuro consolidar estos archivos mediante el CLI de Supabase `supabase db pull` para generar una única migración consolidada que reemplace los >150 archivos sueltos.
