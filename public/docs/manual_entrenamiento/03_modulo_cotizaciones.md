# Módulo 3: Cotizaciones (Presupuestos a Clientes)
**"El Arte de Valorar tu Trabajo"**

En este módulo aprenderás a transformar las medidas de una ventana en un presupuesto formal. Verás cómo el sistema hace el trabajo pesado de cálculo para que tú te enfoques en cerrar la venta.

---

### Ejercicio #1: El Primer Presupuesto (Creación Básica)

**Objetivo Práctico:** Crear una cotización desde cero para un cliente real, agregando un modelo de ventana estándar y dejando que el sistema haga los cálculos.

**Datos de Preparación (Setup):**
- **Cliente:** Constructora Inmobiliaria ABC (o busca uno en tu lista de "Clientes").
- **Marca de Aluminio:** Corrales.
- **Modelo de Ventana:** Ventana Serie 25 - 2 hojas correderas (`S25_2H`).
- **Medidas:** Ancho 1500 mm / Alto 1200 mm.

**Ejecución en Interfaz (Paso a Paso):**
1. Ingresa a la sección de **"Cotizaciones"**.
2. Haz clic en **"+ Nueva Cotización"**.
3. Selecciona al cliente "Constructora Inmobiliaria ABC".
4. El sistema te pedirá una "Marca". Elige **"Corrales"**.
5. Guarda la cabecera. Ahora verás el panel para agregar productos.
6. Haz clic en **"+ Agregar Ítem"**.
7. En el buscador de modelos, elige **"Ventana Serie 25 - 2h"** (`S25_2H`).
8. Ingresa las medidas: **Ancho: 1500** y **Alto: 1200** (recuerda que siempre usamos milímetros).
9. Haz clic en **"Guardar y Calcular"**.

**Auditoría del Sistema (Trazabilidad):**
¡Magia! Sin que hicieras nada, el sistema realizó lo que llamamos **"Despiece Automático"**. Consultó el "molde" de la Serie 25, calculó cuántos metros de perfil se necesitan cortar y cuántos metros cuadrados de vidrio pedir. Si haces clic en el icono del "Ojo" (Ver Desglose), verás la lista completa de materiales con sus costos individuales.

**Prueba de Estrés (Destrucción/Excepción):**
Intenta poner medidas extremas, como un **Ancho de 10 mm**. El sistema probablemente te deje hacerlo, pero observa el precio. ¿Tiene sentido vender una ventana de 1 centímetro? Esta es una prueba para que veas que el sistema confía en tu criterio humano para las medidas.

---

### Ejercicio #2: El Ajuste del Negocio (Ganancias y Fletes)

**Objetivo Práctico:** Aprender a ajustar cuánto quieres ganar en este proyecto específico sin cambiar los costos de los materiales.

**Datos de Preparación (Setup):**
- Usaremos la misma cotización del Ejercicio #1.
- **Margen de Ganancia (Markup):** Cámbialo a **45%**.
- **Costo de Instalación Global:** S/ 250.00.

**Ejecución en Interfaz (Paso a Paso):**
1. Dentro de tu cotización, busca la pestaña o sección de **"Configuración de Ganancia"** (o "Totales").
2. Cambia el porcentaje de ganancia (Markup) de su valor actual a **45%**.
3. Busca el campo **"Costo Global de Instalación/Flete"** e ingresa **250.00**.
4. Observa cómo cambia el **"Precio de Venta Final"** en la parte inferior derecha.

**Auditoría del Sistema (Trazabilidad):**
El sistema recalculó el precio de venta al instante. Lo importante aquí es que el **Costo Directo** (lo que te cuesta a ti el material) se mantiene igual. Solo has ajustado tu margen administrativo y los gastos de envío. Esto te permite negociar con el cliente en tiempo real.

**Prueba de Estrés (Destrucción/Excepción):**
Intenta poner un **Margen de Ganancia de -10%** (negativo). ¿El sistema te avisa que estás perdiendo dinero o te deja proceder? Un administrador debe tener cuidado de no regalar el trabajo por error de dedo.

---

### Ejercicio #3: El Trámite de Aprobación (Paso a Producción)

**Objetivo Práctico:** Formalizar el trato. Aprenderás el paso burocrático más importante que conecta la oficina con el taller.

**Ejecución en Interfaz (Paso a Paso):**
1. En la parte superior de tu cotización, busca el botón **"Cambiar Estado"**.
2. Selecciona la opción **"Aprobada"**.
3. El sistema te pedirá confirmar. Acepta.
4. Observa cómo el color del estado cambia a **Verde**.

**Auditoría del Sistema (Trazabilidad):**
Este paso es un "Puente de Cristal". Al aprobar, el sistema envía una señal al tablero de **Producción (Kanban)**. Ahora los operarios en el taller podrán ver que hay un nuevo trabajo que fabricar. Además, el sistema "congela" los precios: lo que le prometiste al cliente en este momento es lo que se respeta.

**Prueba de Estrés (Destrucción/Excepción):**
Intenta buscar el botón de **"Eliminar"** la cotización ahora que está aprobada. Probablemente verás que ya no es tan fácil o que el sistema te exige primero "Anularla". Una cotización aprobada es un compromiso legal y el sistema la protege.

---

### Ejercicio #4: El Blindaje Comercial (Integridad de la Venta)

**Objetivo Práctico:** Entender por qué un trato cerrado no se puede "manosear" libremente.

**Ejecución en Interfaz (Paso a Paso):**
1. Intenta editar las medidas de la ventana que agregaste en el Ejercicio #1 (Ancho/Alto).
2. Intenta agregar un descuento extra o cambiar el modelo de la ventana.
3. Observa los mensajes de advertencia o si los campos están bloqueados (en gris).

**Auditoría del Sistema (Trazabilidad):**
El sistema aplica un **Blindaje Comercial**. Una vez que el cliente dijo "Sí" y la cotización pasó a estado **Aprobada**, el sistema prohíbe cambios accidentales. ¿Por qué? Porque si cambias las medidas ahora, el taller cortará mal el aluminio y la empresa perderá dinero.

**Prueba de Estrés (Destrucción/Excepción):**
**Reflexiona:** Si realmente necesitas cambiar algo porque el cliente se arrepintió a último minuto... ¿Qué deberías hacer según la lógica del sistema? La respuesta correcta suele ser **"Clonar"** la cotización (hacer una copia), editar la copia y anular la anterior. Nunca intentes "forzar" un cambio en un documento ya aprobado; la seguridad del sistema está ahí para evitar errores costosos.
