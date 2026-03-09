# Módulo 6: Reportes y Auditoría Física
**"La Verdad del Almacén: Cero Mermas, Cero Errores"**

Este módulo es el "examen final" de tu gestión. Aprenderás a usar las herramientas de auditoría para verificar que lo que dice la computadora coincida exactamente con lo que hay en los estantes. Aquí es donde descubrimos el éxito de la disciplina operativa.

---

### Ejercicio #1: La Fotografía del Almacén (Estado de Inventario)

**Objetivo Práctico:** Obtener una valoración exacta de cuánto dinero hay hoy mismo en materiales.

**Ejecución en Interfaz (Paso a Paso):**
1. Ve a la sección de **"Dashboard"** o busca el botón de **"Exportar Datos"**.
2. Selecciona el reporte llamado **"Estado de Inventario (Foto Actual)"**.
3. Descarga el archivo en formato Excel.

**Auditoría del Sistema (Trazabilidad):**
Nota algo muy importante: aunque cambies el filtro de fechas en la parte superior, este reporte **no cambia**. ¿Por qué? Porque es una **fotografía instantánea**. Te dice qué tienes "aquí y ahora" y cuánto vale cada gramo de material según el costo promedio (PMP). No es un historial, es la realidad presente.

**Prueba de Estrés (Excepción):**
Intenta comparar el total de este reporte con el "Valor Total de Inventario" que viste en el Cockpit (Módulo 5). Deben coincidir al centavo. Si no coinciden, es porque alguien acaba de registrar un movimiento mientras descargabas el archivo. ¡El sistema vive y respira en tiempo real!

---

### Ejercicio #2: El Rastro del Papel (Kardex en Excel)

**Objetivo Práctico:** Rastrear cada movimiento para encontrar errores de digitación o mermas ocultas.

**Ejecución en Interfaz (Paso a Paso):**
1. En la zona de exportación, busca el **"Kardex de Movimientos Lógicos"**.
2. Aplica el filtro para el **mes actual**.
3. Descarga la "sábana" de datos en Excel.

**Auditoría del Sistema (Trazabilidad):**
Este archivo es el "arma definitiva" de un administrador. Cada fila registra quién, cuándo y por qué se movió un material. Si encuentras que falta material en el taller, aquí podrás ver si alguien olvidó anotar una salida o si se registró una compra con un precio equivocado.

---

### Ejercicio #3: El Conteo Ciego (Honestidad en el Taller)

**Objetivo Práctico:** Realizar una auditoría física donde el operario NO sepa cuánto stock "debería" haber.

**Ejecución en Interfaz (Paso a Paso):**
1. Entra a la sección de **"Hojas de Conteo"**.
2. Usa el Modo Rápido **"Por Sistema / Serie"** y elige una serie real como la **"Serie 25"**.
3. En el campo "Nombre del Operario", escribe un nombre (ej. **"Juan Operario"**).
4. **IMPORTANTE:** Asegúrate de que el interruptor **"Modo Conteo Ciego"** esté **ACTIVADO**.
5. Haz clic en **"Generar PDF"**.

**Auditoría y Psicología del Control:**
Observa el PDF generado. Verás que la columna de "Stock de Sistema" está vacía o con guiones. Esto obliga al operario a contar pieza por pieza de la **Serie 25** sin la tentación de poner "50" solo porque la hoja dice que hay "50". El Conteo Ciego garantiza la honestidad total del inventario físico.

---

### Ejercicio #4: La Auditoría Quirúrgica (Inventario Cíclico Clase A)

**Objetivo Práctico:** Auditar solo lo más caro y valioso sin detener la planta.

**Ejecución en Interfaz (Paso a Paso):**
1. En "Hojas de Conteo", cambia al modo **"Filtros Personalizados"**.
2. En los filtros avanzados, selecciona la Marca **"Corrales"** (o **"Limatambo"**).
3. En el filtro de Rotación, marca únicamente la **"Clase A"** (los productos más caros).
4. **RETROALIMENTACIÓN CRÍTICA:** Configura el filtro de **"Stock Máximo = 0"**.
5. Genera la hoja de conteo.

**Auditoría y Reflexión Estratégica:**
¿Para qué sirve filtrar con Stock Máximo en Cero? ¡Para cazar material perdido! Le estás pidiendo al operario que busque físicamente productos que el sistema cree que se agotaron. Si el operario encuentra algo, habrás "recuperado" dinero que estaba invisible para la empresa.
Este es un **"Inventario Cíclico"**: en lugar de contar todo el almacén una vez al año (lo cual es lento y costoso), usas el sistema para contar "un poquito de lo más valioso" cada día. ¡Felicidades, has dominado el ERP!
