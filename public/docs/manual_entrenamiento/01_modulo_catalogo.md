# Módulo 1: Catálogo y Maestro de Materiales
**"El Corazón de tus Existencias"**

Este módulo te enseñará a gestionar la biblioteca de materiales. Aquí es donde nacen los productos que luego comprarás y venderás.

---

### Ejercicio #1: Crear la Plantilla Maestra (El Molde)

**Objetivo Práctico:** Definir un modelo genérico de producto. Sin esto, no puedes crear materiales específicos. Es como definir que existe un "Panel de Aluminio" antes de decir de qué color es.

**Datos de Preparación (Setup):**
- **Nombre genérico:** Perfil Serie 25 - Riel Superior
- **Familia:** Perfiles de Aluminio
- **Sistema:** Serie 25
- **Medida Estándar:** 6000 mm

**Ejecución en Interfaz (Paso a Paso):**
1. Ve a la sección principal donde se listan todos los productos y el stock.
2. Busca y haz clic en el botón superior que dice **"+ Nueva Plantilla"**.
3. En la ventana que aparece, escribe el nombre: "Perfil Serie 25 - Riel Superior".
4. Selecciona la familia "Perfiles de Aluminio" y el sistema "Serie 25".
5. Escribe "6000" en el espacio de medida y deja el peso en 0 por ahora.
6. Haz clic en **"Guardar Plantilla"**.

**Auditoría del Sistema (Trazabilidad):**
El sistema crea una "Identidad Maestra" que servirá de base. Aún no tienes stock físico porque este es solo el diseño del producto, no el producto real que compras.

**Prueba de Estrés (Destrucción/Excepción):**
Intenta crear otra plantilla con el nombre **exactamente igual** a la anterior. Observa si el sistema te permite duplicar el "molde" o si te advierte que ya existe. Un catálogo ordenado no debe tener moldes repetidos.

---

### Ejercicio #2: Generación de Identidades (Creación de SKU)

**Objetivo Práctico:** Crear el producto real que vas a comprar al proveedor. Aquí es donde la plantilla se combina con una marca y un acabado para tener una identidad única.

**Datos de Preparación (Setup):**
- **Plantilla:** (Usa la creada en el Ejercicio #1)
- **Marca:** GENÉRICO
- **Acabado:** Natural (Mate)
- **Stock Mínimo:** 10 unidades

**Ejecución en Interfaz (Paso a Paso):**
1. Haz clic en el botón **"+ Nueva SKU"** (o Nuevo Producto Específico).
2. En el primer buscador, escribe "Perfil Serie 25" y selecciona el molde que creaste en el ejercicio anterior.
3. Elige la Marca "GENÉRICO" y el Acabado "Natural".
4. Verás que el sistema genera automáticamente un nombre largo: "Perfil Serie 25 - Riel Superior - Natural".
5. En la sección de inventario, escribe **"10"** en el campo **Stock Mínimo**.
6. Haz clic en **"Guardar SKU"**.

**Auditoría del Sistema (Trazabilidad):**
El sistema fabrica una "Identidad Única" (un código de barras interno). A partir de ahora, este producto aparecerá en tu lista con "Stock: 0". El sistema ya sabe que cuando el stock baje de 10, debe avisarte con un color de alerta.

**Prueba de Estrés (Destrucción/Excepción):**
Intenta crear **exactamente la misma combinación** (Mismo molde + Misma marca + Mismo acabado). El sistema debería arrojar un error de "Identidad Duplicada". No puedes tener dos productos iguales con códigos distintos.

---

### Ejercicio #3: Sincronización del Mundo Real (Ajuste de Stock)

**Objetivo Práctico:** Corregir la cantidad física. Se usa cuando cuentas lo que hay en el almacén y no coincide con lo que dice la pantalla (ej: por mermas o hallazgos).

**Datos de Preparación (Setup):**
- **Producto:** El que creaste en el Ejercicio #2.
- **Cantidad a ingresar:** 50 unidades.
- **Motivo:** Primer Inventario.

**Ejecución en Interfaz (Paso a Paso):**
1. Busca tu producto en la lista principal (puedes usar el buscador escribiendo "Natural").
2. Haz clic sobre el nombre del producto para que se abra su **Panel Lateral de Detalles**.
3. Busca el botón que dice **"📦 Ajustar Stock"**.
4. En la ventana, selecciona el tipo **"Ingreso"** (o signo +).
5. Escribe la cantidad **"50"** y en el motivo escribe "Carga inicial de prueba".
6. Presiona **"Confirmar Ajuste"**.

**Auditoría del Sistema (Trazabilidad):**
El sistema escribe una página en el **Libro Contable del Almacén (Kardex)** anotando tu nombre, la hora exacta y el motivo. Instantáneamente, la pantalla principal cambia de "0" a "50" y el color de alerta desaparece porque ya superaste el mínimo de 10.

**Prueba de Estrés (Destrucción/Excepción):**
Intenta hacer un ajuste de **salida** (signo -) por **60 unidades**. Como solo tienes 50, el sistema debería mostrarte un error o quedar en negativo (según la configuración). Intenta forzarlo para ver qué pasa con el "Saldo Final".

---

### Ejercicio #4: La Prueba de Resistencia (Integridad del Sistema)

**Objetivo Práctico:** Entender por qué el sistema "bloquea" ciertas acciones para proteger tu historial contable.

**Objetivo del Ejercicio:** Intentar borrar el producto que acabas de crear.

**Ejecución en Interfaz (Paso a Paso):**
1. Abre nuevamente el **Panel Lateral** de tu producto (el que ahora tiene 50 unidades).
2. Busca el botón de **"Eliminar"** (puede estar dentro de "Editar" o representado por un tacho de basura).
3. Confirma que sí quieres borrarlo.

**Auditoría del Sistema (Trazabilidad):**
El sistema consultará el **Libro Contable (Kardex)**. Como detecta que hubo un movimiento de "50 unidades" (el ajuste que hiciste en el Ejercicio #3), el sistema **prohibirá la eliminación**. Esto es para evitar "huecos" en la historia: si el producto desaparece, ¿de dónde salieron esas 50 unidades?

**Prueba de Estrés (Destrucción/Excepción):**
Para poder borrarlo "a la fuerza", tendrías que primero borrar todos sus movimientos en el historial (lo cual no es posible desde la interfaz normal). Intenta buscar alguna forma de "anular" el producto sin borrar su historia (cambiando su estado a Inactivo).
