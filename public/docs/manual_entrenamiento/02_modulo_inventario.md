# Módulo 2: Movimientos de Almacén (Entradas y Salidas)
**"El Registro de la Realidad"**

En este módulo aprenderás a registrar el flujo físico de los materiales: desde que llegan del proveedor hasta que salen al taller para convertirse en ventanas.

---

### Ejercicio #1: Ingreso de Mercadería (Entrada por Compra)

**Objetivo Práctico:** Registrar la llegada de material comprado. Verás cómo el sistema actualiza el stock y recalcula los precios automáticamente sin que toques una calculadora.

**Datos de Preparación (Setup):**
- **Proveedor:** Corporación Limatambo
- **Material:** Perfil S80 Hoja - Mate/Natural (`AL-80503-MAT-LIM`)
- **Cantidad:** 50 unidades (barras)
- **Costo por unidad:** S/ 150.00
- **Documento:** Factura F001-9876

**Ejecución en Interfaz (Paso a Paso):**
1. Ve a la sección de **"Entradas"** (donde se registran las compras).
2. Haz clic en el botón **"+ Nueva Entrada"**.
3. Selecciona al proveedor "Corporación Limatambo".
4. Ingresa el número de documento: "F001-9876".
5. En la lista de productos, busca "AL-80503-MAT-LIM" o escribe "S80 Hoja".
6. Escribe **"50"** en cantidad y **"150.00"** en el precio de costo.
7. Haz clic en **"Finalizar Ingreso"**.

**Auditoría del Sistema (Trazabilidad):**
El sistema añade las 50 unidades a tu inventario visual de inmediato. Además, si antes tenías ese mismo producto con un costo diferente, el sistema mezcla ambos precios para darte un nuevo **"Costo Promedio"** actualizado.

**Prueba de Estrés (Destrucción/Excepción):**
Intenta registrar una entrada con cantidad **"0"** o con un precio de costo de **"0"**. Observa si el sistema te permite "regalarte" material o si te exige un valor real para no arruinar tus cálculos financieros.

---

### Ejercicio #2: Salida por Producción (Referencia a Cotización)

**Objetivo Práctico:** Descontar material para un trabajo específico. Usarás un código de presupuesto aprobado para que el sistema sepa para qué cliente va ese material.

**Datos de Preparación (Setup):**
- **Presupuesto (Código):** `COT-0041`
- **Material:** El mismo que ingresaste en el Ejercicio #1.
- **Cantidad a retirar:** 10 unidades.

**Ejecución en Interfaz (Paso a Paso):**
1. Ve a la sección de **"Salidas"** (donde se registra lo que sale de la empresa).
2. Haz clic en **"+ Nueva Salida"**.
3. En el campo de "Referencia", escribe el código del presupuesto: **COT-0041**.
4. Busca el material "S80 Hoja" y selecciona el SKU real.
5. Escribe **"10"** en la cantidad.
6. Haz clic en **"Confirmar Despacho"**.

**Auditoría del Sistema (Trazabilidad):**
El sistema restará las 10 unidades de tu stock. Lo más importante: el sistema vincula esta salida al proyecto de ese cliente. Así, al final del mes, el dueño sabrá exactamente cuánto material se gastó en esa obra específica.

**Prueba de Estrés (Destrucción/Excepción):**
Intenta registrar una salida de un código de presupuesto que **no existe** (inventa uno). Observa si el sistema te deja sacar material "hacia la nada" o si te obliga a tener un proyecto válido como destino.

---

### Ejercicio #3: Inmutabilidad del Libro Contable (Kardex)

**Objetivo Práctico:** Entender que en este sistema "lo escrito, escrito está". Aprenderás a rastrear tus acciones anteriores.

**Ejecución en Interfaz (Paso a Paso):**
1. Ve a la sección del **"Libro Contable del Almacén" (Kardex)**.
2. Usa el filtro de fecha para buscar los movimientos de hoy.
3. Localiza la entrada de **50 unidades** que hiciste en el Ejercicio #1.
4. Intenta buscar por toda la pantalla un botón que diga **"Eliminar"** o **"Editar"** sobre esa fila.

**Auditoría del Sistema (Trazabilidad):**
Verás que esos botones no existen. El Kardex es un registro de seguridad: no se puede borrar el pasado. Si te equivocaste, no "borras", sino que haces un movimiento nuevo de corrección (un ajuste). Esto garantiza que nadie pueda desaparecer material sin dejar rastro.

**Prueba de Estrés (Destrucción/Excepción):**
Intenta cambiar de usuario a uno con menos permisos (si tienes acceso) y trata de ver si alguien puede modificar estos registros. Descubrirás que el historial es "blindado" para proteger a la empresa de pérdidas hormiga.

---

### Ejercicio #4: Corrección de Errores (Ajuste por Merma)

**Objetivo Práctico:** Aprender a justificar pérdidas (material roto o fallado) de forma que no ensucie tus reportes de ventas.

**Datos de Preparación (Setup):**
- **Accesorio:** Bisagra alta rotación - Acero Negro (`AC-111-NEG-GEN`)
- **Situación:** Se rompieron 2 bisagras durante la instalación.
- **Tipo de Ajuste:** Salida por "Merma / Rotura".

**Ejecución en Interfaz (Paso a Paso):**
1. Ve a la lista de productos (Catálogo) y busca la bisagra por su nombre.
2. Abre su panel de detalles y haz clic en **"📦 Ajustar Stock"**.
3. Selecciona la opción de **"Salida"** (signo -).
4. Escribe la cantidad **"2"**.
5. En el motivo, elige **"Merma / Rotura en taller"**.
6. Guarda el ajuste.

**Auditoría del Sistema (Trazabilidad):**
El sistema descuenta las 2 unidades, pero las etiqueta como "pérdida operativa". Esto es vital para el Ingeniero Administrador: él podrá ver cuánta plata se está perdiendo en errores de taller al final del año.

**Prueba de Estrés (Destrucción/Excepción):**
**Reflexiona:** Si en lugar de un "Ajuste", hubieras registrado esto como una "Venta" de 2 unidades a precio S/ 0... ¿Qué pasaría con tus estadísticas? Estarías mintiendo al sistema diciendo que "vendiste" algo gratis, bajando tu promedio de rentabilidad. Por eso, para pérdidas, siempre usamos **Ajustes**.
