# Guía de Migración Masiva de Datos (Excel/AppSheet -> Supabase)

Si ya tienes tus datos en Excel o AppSheet, la forma más rápida y "masiva" de pasarlos al nuevo sistema es mediante **Archivos CSV** y el importador de Supabase.

## Pasos Generales

1.  **Exportar** tus tablas de AppSheet a Excel.
2.  **Limpiar y Renombrar** las columnas en Excel para que coincidan con el nuevo sistema.
3.  **Guardar como CSV** (Delimitado por comas).
4.  **Importar en Supabase** usando el botón "Import Data".

---

## 1. Importar Clientes (`mst_clientes`)

Prepara tu Excel de Clientes con las siguientes columnas (el orden no importa, pero los nombres de cabecera SÍ):

| Encabezado Excel (Debe ser exacto) | Descripción | Obligatorio |
| :--- | :--- | :---: |
| `nombre_completo` | Nombre y Apellido o Razón Social | ✅ |
| `nro_documento` | DNI o RUC (Solo números) | ✅ |
| `tipo_documento` | Pon 'DNI' o 'RUC' para todos | ✅ |
| `telefono` | Celular o Fijo | ❌ |
| `email` | Correo electrónico | ❌ |
| `direccion` | Dirección fiscal o de entrega | ❌ |
| `categoria` | 'REGULAR', 'VIP', 'EMPRESA' | ❌ |

**Ejemplo de CSV:**
```csv
tipo_documento,nro_documento,nombre_completo,telefono,categoria
DNI,45000001,Juan Perez,999888777,VIP
RUC,20100020001,Constructora SAC,,EMPRESA
```

---

## 2. Importar Proveedores (`mst_proveedores`)

Similar a clientes, para tu tabla de proveedores:

| Encabezado Excel | Descripción |
| :--- | :--- |
| `razon_social` | Nombre de la empresa |
| `nro_documento` | RUC |
| `tipo_documento` | 'RUC' |
| `nombre_contacto` | Vendedor asignado (Opcional) |
| `telefono_contacto` | Celular del vendedor (Opcional) |

---

## 3. Importar Productos/Materiales (`cat_productos_variantes`)

**Nota Importante:** Para importar productos masivamente, primero asegúrate de que existen las **Familias** en el sistema (`PER`, `VID`, `ACC`). Necesitas el `id_familia` (UUID) para relacionarlos, PERO si usas el importador de Supabase es difícil saber los UUIDs de memoria.

**Estrategia Recomendada:**
1.  Crea primero las familias manualmente o con el script anterior.
2.  En tu Excel, añade una columna `id_familia`.
3.  Copia el UUID de la familia correspondiente desde Supabase y pégalo en el Excel para todos los productos de esa familia.

| Encabezado Excel | Descripción | Obligatorio |
| :--- | :--- | :---: |
| `sku` | Código único (ej. AL-2025) | ✅ |
| `nombre_completo` | Descripción del producto | ✅ |
| `unidad_medida` | 'UND', 'M2', 'VAR', 'GLB' | ✅ |
| `precio_base_venta` | Precio de venta (número) | ❌ |
| `costo_estandar` | Costo de compra (número) | ❌ |
| `stock_actual` | Cantidad física real | ❌ |
| `stock_minimo` | Alerta de reposición | ❌ |
| `id_familia` | UUID de la familia (ej. *a0eeb...*) | ✅ |

---

## ¿Cómo Importar en Supabase?

1.  Entra a tu Proyecto en Supabase.
2.  Ve al **Table Editor** (icono de tabla a la izquierda).
3.  Selecciona la tabla (ej. `mst_clientes`).
4.  Haz clic en el botón **"Insert"** (verde) -> **"Import Data from CSV"**.
5.  Arrastra tu archivo CSV corregido.
6.  Verifica que las columnas coincidan automáticamente.
7.  Dale a **Import**.

¡Listo! Tus datos estarán cargados en segundos.
