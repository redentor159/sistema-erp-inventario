# Módulo 4: Producción (Tablero Kanban)
**"El Corazón de la Planta: Eficiencia y Calidad"**

En este módulo aprenderás a gestionar el trabajo real en el taller. El Tablero Kanban no es solo una lista de tareas; es una herramienta de **Eficiencia Operativa** que nos dice qué se está fabricando, quién lo tiene y dónde están los retrasos.

---

### Ejercicio #1: Nacimiento de la Orden de Trabajo (Importación)

**Objetivo Práctico:** Transformar un compromiso comercial en una instrucción de fabricación real.

**Datos de Preparación (Set-up):**
- Usaremos la cotización **`COT-0041`** (Empresa SAC) que aprobamos en el módulo anterior.
- Asegúrate de estar en la vista de **"Producción"** o **"Tablero Kanban"**.

**Ejecución en Interfaz (Paso a Paso):**
1. Dentro del Tablero Kanban, haz clic en el botón **"Importar Cotización"** o **"+ Nueva Orden"**.
2. Busca el código **`COT-0041`** en la lista de presupuestos listos para fabricar.
3. Haz clic en **"Confirmar Importación"**.
4. Observa cómo aparece una nueva "Tarjeta de Fabricación" en la columna **BACKLOG** (Por Planificar).

**Auditoría del Sistema (Trazabilidad):**
El sistema ha tomado todos los datos de la ventana (medidas, marca, color) y los ha puesto en una tarjeta visual. Ahora, cualquier operario puede ver qué se necesita hacer sin tener que leer contratos o correos. La orden nace en el "Backlog" porque primero debe ser revisada por el Jefe de Planta antes de empezar a cortar.

**Prueba de Estrés (Destrucción/Excepción):**
Intenta buscar una cotización que aún esté en estado **"Borrador"** para importarla. Verás que el sistema no te la muestra. **Reflexiona:** ¿Por qué es vital este bloqueo? Porque si empezamos a fabricar algo que el cliente aún no ha aceptado legalmente, corremos el riesgo de perder material valioso en un pedido que nunca se pagará.

---

### Ejercicio #2: El Flujo de Valor (Movimiento por Estaciones)

**Objetivo Práctico:** Supervisar el avance real del producto a través de la planta.

**Ejecución en Interfaz (Paso a Paso):**
1. Toma la tarjeta de la **COT-0041** con el ratón (clic sostenido).
2. Arrástrala de la columna **BACKLOG** a la columna **CORTE**.
3. Imagina que el operario ya terminó de cortar los perfiles: ahora mueve la tarjeta a **ARMADO**.
4. Observa los indicadores de tiempo (si están visibles) o el historial de la tarjeta.

**Auditoría del Sistema (Trazabilidad):**
Cada vez que mueves la tarjeta, el sistema anota en secreto: *"El usuario [Tu Nombre] movió la orden a ARMADO el día X a las Y horas"*. Esto no es para vigilar personas, sino para medir la **Eficiencia**: si las tarjetas pasan 3 días en "Corte" y solo 1 hora en "Armado", tenemos un "Cuello de Botella" en las sierras que debemos resolver.

---

### Ejercicio #3: Control de Calidad y Reprocesos

**Objetivo Práctico:** Gestionar errores de fabricación sin perder el control de la orden.

**Situación de Crisis:**
La ventana está en la estación de **ACABADO** (limpieza y empaque), pero el supervisor detecta que el vidrio tiene un rayón profundo. ¡No puede entregarse así!

**Ejecución en Interfaz (Paso a Paso):**
1. Arrastra la tarjeta de la **COT-0041** hacia atrás: de **ACABADO** de regreso a **ARMADO** (donde se cambian los vidrios).
2. El sistema podría pedirte un motivo: escribe **"Vidrio rayado - Cambio necesario"**.
3. Observa si la tarjeta ahora tiene una marca o un contador que aumentó (Reprocesos).

**Auditoría del Sistema (Trazabilidad):**
Mover una tarjeta hacia atrás se llama **"Reproceso"**. Para el sistema, esto es una alerta roja de calidad. El Gerente podrá ver a fin de mes un reporte detallado: *"Tuvimos 5 reprocesos por vidrios rayados"*. Esto ayuda a tomar decisiones, como cambiar de proveedor de vidrio o mejorar el cuidado en el transporte interno.

---

### Ejercicio #4: Cierre, Archivo e Integridad

**Objetivo Práctico:** Limpiar el tablero y entender que la fabricación y el inventario son dos mundos que deben hablarse.

**Ejecución en Interfaz (Paso a Paso):**
1. Mueve la tarjeta finalizada a la columna **ENTREGADO**.
2. Una vez allí, busca la opción de **"Archivar"** (icono de caja o menú de la tarjeta).
3. Confirma la acción. La tarjeta desaparecerá de la vista principal.

**Auditoría del Sistema (Trazabilidad):**
Archivar no significa borrar. La información se mueve al **"Historial de Producción"**. Es como guardar el expediente en un archivador de acero: siempre estará disponible para consultas futuras, reclamaciones de garantía o para saber quién fabricó esa ventana hace 2 años.

**Prueba de Estrés (Destrucción/Excepción):**
**Pregunta Crítica:** Acabas de archivar la orden como "Terminada"... pero ¿ya descontaste los 15 metros de aluminio de la bodega?
**Reflexión:** Recuerda que el Tablero Kanban organiza el **movimiento del personal**, pero no adivina cuántos tornillos se usaron realmente. Si no vas al módulo de **Inventario (Salidas)** a registrar que ese material ya no está físicamente en el estante, tu stock seguirá diciendo que tienes material que ya se convirtió en ventana. ¡La coordinación entre oficina y taller es la clave!
