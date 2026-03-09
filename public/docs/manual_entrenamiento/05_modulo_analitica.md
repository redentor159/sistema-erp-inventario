# Módulo 5: El Cockpit MTO (Dashboard y Analítica)
**"De Operario a Estratega: El Control Total"**

En este último módulo aprenderás a leer la "mente" de la empresa. El Tablero de Control (Cockpit) te permitirá ver dónde estás perdiendo dinero, qué materiales son vitales y cómo tomar decisiones basadas en datos reales, no en corazonadas.

---

### Ejercicio #1: Curva ABC (El Principio de Pareto)

**Objetivo Práctico:** Identificar qué productos mantienen viva a la empresa y cuáles son solo "acompañantes".

**Datos de Preparación (Set-up):**
- Ingresa a la sección de **"Dashboard"** y busca la pestaña de **"Analítica de Inventarios"**.
- Busca el gráfico interactivo de **"Curva ABC (Pareto)"**.

**Ejecución en Interfaz (Paso a Paso):**
1. Filtra los datos por el periodo de **"Últimos 90 días"**.
2. Observa la lista de materiales clasificados como **"Clase A"** (los más importantes).
3. Identifica un producto real, como el **"S80 Hoja - Mate/Natural"** (`AL-80503-MAT-LIM`).
4. Ahora busca un producto clasificado como **"Clase C"**, por ejemplo, el **"Cierre Caracol Negro"** (`ACC-CIERRE`).

**Auditoría del Sistema (Trazabilidad):**
El sistema ha analizado miles de movimientos de tus módulos anteriores. Te está diciendo que el aluminio (Clase A) representa casi el 80% de tu inversión y movimiento. Si te quedas sin "Clase A", la planta se detiene por completo. El "Clase C" (los accesorios) son importantes, pero no deben quitarle el sueño al comprador tanto como los perfiles principales.

**Prueba de Estrés (Destrucción/Excepción):**
**Reflexión Estratégica:** Si solo tienes presupuesto para comprar UN material hoy... ¿A cuál le darías prioridad? El Dashboard te obliga a ser eficiente: siempre protege el stock de los Clase A primero.

---

### Ejercicio #2: El Capital Estancado (Stock Zombie)

**Objetivo Práctico:** Descubrir dinero "dormido" en los estantes que nadie está usando.

**Ejecución en Interfaz (Paso a Paso):**
1. En el mismo panel de analítica, busca la sección dedicada al **"Inventario Zombie"**.
2. Revisa la lista de productos que tienen stock físico mayor a cero pero **cero ventas** en los últimos 90 días.
3. Observa el valor en Soles (S/) que aparece al lado de productos como el **"Vidrio Laminado 6mm"** (`VID-LAM-6MM`).

**Auditoría del Sistema (Trazabilidad):**
Cada producto "Zombie" es dinero que la empresa tiene "secuestrado" en forma de material que no se mueve. El sistema calcula esto multiplicando la cantidad guardada por su costo promedio (PMP). Este panel sirve para que el Gerente decida: *"¡Hagamos una oferta de este vidrio para sacarlo del almacén y recuperar el efectivo!"*.

**Prueba de Estrés (Destrucción/Excepción):**
Intenta encontrar un producto que creías que se vendía mucho (como un accesorio popular) y descubre si aparece en la lista Zombie. A veces, nuestras "ganas de vender" nos engañan, pero el Dashboard no miente: si no ha salido de la bodega en 3 meses, es un Zombie.

---

### Ejercicio #3: El Tesoro Oculto (Valoración de Retazos)

**Objetivo Práctico:** Valorar económicamente los retazos (despuntes) de aluminio que suelen considerarse "basura".

**Ejecución en Interfaz (Paso a Paso):**
1. Busca el indicador llamado **"Tesoro Oculto"** o **"Retazos Valorizados"**.
2. Observa el monto total en Soles que el sistema asigna a los trozos de perfilería guardados en el taller.
3. Haz clic en **"Ver Detalle"** para ver cuántos metros lineales de aluminio "recuperable" tienes disponibles.

**Auditoría del Sistema (Trazabilidad):**
Esta es la función más avanzada de ahorro. Mientras otras empresas tiran el aluminio sobrante al reciclaje por kilo, tu sistema sabe que esos despuntes valen dinero real. Al valorarlos al costo promedio, el Dashboard te muestra que podrías tener miles de Soles "escondidos" en el taller esperando ser usados en una nueva cotización.

---

### Ejercicio #4: Toma de Decisiones (La Alerta Roja)

**Objetivo Práctico:** Aprender a confiar en la disciplina del dato por encima de la "vista rápida".

**Situación de Estrés:**
El Dashboard muestra una **Alerta Roja** (Material Crítico): Dice que tienes **0 metros** de Riel Inferior Serie 20 (`AL-2025-INF`). Sin embargo, el operario del taller pasa y te dice: *"No te preocupes, yo veo 2 barras allá arrimadas"*.

**Prueba de Estrés:**
¿Lanzas la orden de compra basándote en lo que dice el Dashboard o en lo que dice el operario?

**Auditoría y Reflexión Final:**
Si el Dashboard dice **0**, pero hay **2** barras físicas, significa que alguien en el Módulo 2 **olvidó registrar una entrada** o alguien en el Módulo 4 **registró una salida de más**.
**Lección de Oro:** El Dashboard es un espejo de tu trabajo. Si alimentas el sistema con datos sucios, el espejo te devolverá decisiones sucias. Para que el "Cockpit" sea un avión seguro, todo el equipo debe registrar sus entradas y salidas con disciplina militar. ¡Felicidades, has completado tu entrenamiento!
