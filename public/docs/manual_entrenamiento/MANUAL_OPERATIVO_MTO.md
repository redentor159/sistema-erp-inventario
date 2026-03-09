# MANUAL OPERATIVO DEL SISTEMA ERP (MTO)
**"Guía de Entrenamiento para el Personal Administrativo y Operativo"**

Este manual contiene la ruta de aprendizaje completa para dominar el sistema ERP. A través de 24 ejercicios prácticos, aprenderás desde cómo crear un material hasta cómo auditar estratégicamente el almacén.

---

## 📦 Módulo 1: Catálogo y Maestro de Materiales
> **"El Corazón de tus Existencias"**

---

📝 Ejercicio #1: Crear la Plantilla Maestra (El Molde)
🎯 OBJETIVO PRÁCTICO:
Definir un modelo genérico de producto. Sin esto, no puedes crear materiales específicos. Es como definir que existe un "Panel de Aluminio" antes de decir de qué color es.

🛠️ Datos de Preparación (Setup)
Dato 1: **Perfil Serie 25 - Riel Superior** (Nombre)

Dato 2: **Perfiles de Aluminio** (Familia)

Dato 3: **Serie 25** (Sistema)

Dato 4: **6000 mm** (Medida Estándar)

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Ve a la sección principal de **Catálogo / Inventario**.
2. Haz clic en el botón superior que dice **"+ Nueva Plantilla"**.
3. En la ventana que aparece, escribe el nombre: **"Perfil Serie 25 - Riel Superior"**.
4. Selecciona la familia **"Perfiles de Aluminio"** y el sistema **"Serie 25"**.
5. Escribe **"6000"** en el espacio de medida y deja el peso en **"0"** por ahora.
6. Haz clic en el botón **"Guardar Plantilla"**.

🧠 La Verdad del Sistema (Trazabilidad)
El sistema crea una "Identidad Maestra" que servirá de base. Aún no tienes stock físico porque este es solo el diseño del producto, no el producto real que compras.

🚨 PRUEBA DE ESTRÉS:
Acción: Intenta crear otra plantilla con el nombre **exactamente igual** a la anterior.
Lección: El sistema te advertirá o bloqueará el duplicado; un catálogo ordenado no debe tener moldes repetidos.

---

📝 Ejercicio #2: Generación de Identidades (Creación de SKU)
🎯 OBJETIVO PRÁCTICO:
Crear el producto real que vas a comprar al proveedor combinando la plantilla con una marca y un acabado.

🛠️ Datos de Preparación (Setup)
Dato 1: **Perfil Serie 25 - Riel Superior** (Plantilla)

Dato 2: **GENÉRICO** (Marca)

Dato 3: **Natural (Mate)** (Acabado)

Dato 4: **10 unidades** (Stock Mínimo)

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Haz clic en el botón **"+ Nueva SKU"**.
2. En el buscador, busca y selecciona: **"Perfil Serie 25 - Riel Superior"**.
3. Elige la Marca **"GENÉRICO"** y el Acabado **"Natural"**.
4. En la sección de inventario, escribe **"10"** en el campo **Stock Mínimo**.
5. Haz clic en el botón **"Guardar SKU"**.

🧠 La Verdad del Sistema (Trazabilidad)
El sistema fabrica una "Identidad Única" (código interno). El producto aparecerá con **Stock: 0** y el sistema marcará alertará cuando baje de 10.

🚨 PRUEBA DE ESTRÉS:
Acción: Intenta crear **exactamente la misma combinación** (Mismo molde + Marca + Acabado).
Lección: El sistema arrojará un error de "Identidad Duplicada" para evitar confusión en los códigos.

---

📝 Ejercicio #3: Sincronización del Mundo Real (Ajuste de Stock)
🎯 OBJETIVO PRÁCTICO:
Corregir la cantidad física cuando lo que hay en el almacén no coincide con la pantalla.

🛠️ Datos de Preparación (Setup)
Dato 1: **Perfil Serie 25 - Riel Superior - Natural** (Producto)

Dato 2: **50 unidades** (Cantidad)

Dato 3: **Primer Inventario** (Motivo)

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Busca tu producto en la lista principal y haz clic sobre su nombre para abrir el **Panel Lateral**.
2. Haz clic en el botón que dice **"📦 Ajustar Stock"**.
3. Selecciona el tipo **"Ingreso"** (signo +).
4. Escribe la cantidad **"50"** y en el motivo escribe **"Carga inicial de prueba"**.
5. Presiona el botón **"Confirmar Ajuste"**.

🧠 La Verdad del Sistema (Trazabilidad)
El sistema escribe en el **Libro Contable (Kardex)** tu nombre, hora y motivo. El stock cambia a **50** y la alerta de stock mínimo desaparece.

🚨 PRUEBA DE ESTRÉS:
Acción: Intenta hacer una **Salida** por **60 unidades**.
Lección: El sistema te avisará que no tienes suficiente material o quedará en negativo, evidenciando el error.

---

📝 Ejercicio #4: La Prueba de Resistencia (Integridad)
🎯 OBJETIVO PRÁCTICO:
Entender por qué el sistema "bloquea" acciones para proteger tu historial contable.

🛠️ Datos de Preparación (Setup)
Dato 1: **Cualquier producto con historial de movimientos**.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Abre el **Panel Lateral** de tu producto con stock.
2. Busca y haz clic en el botón de **"Eliminar"** (icono de tacho).
3. Confirma que quieres borrarlo.

🧠 La Verdad del Sistema (Trazabilidad)
El sistema detecta que hubo un movimiento en el **Libro Contable (Kardex)** y **prohibirá la eliminación**. No se puede borrar el producto si hay una historia que lo respalda.

🚨 PRUEBA DE ESTRÉS:
Acción: Intenta borrarlo a la fuerza.
Lección: Descubrirás que solo puedes cambiar su estado a **Inactivo** para que no estorbe, pero su historia permanece intacta.

---

## 🚛 Módulo 2: Movimientos de Almacén (Entradas y Salidas)
> **"El Registro de la Realidad"**

---

📝 Ejercicio #5: Ingreso de Mercadería (Entrada por Compra)
🎯 OBJETIVO PRÁCTICO:
Registrar la llegada de material comprado y actualizar el costo promedio (PMP).

🛠️ Datos de Preparación (Setup)
Dato 1: **Corporación Limatambo** (Proveedor)

Dato 2: **S80 Hoja - Mate/Natural** (Material)

Dato 3: **50 unidades** y **S/ 150.00** (Costo)

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Ve a la sección de **"Entradas"**.
2. Haz clic en el botón **"+ Nueva Entrada"**.
3. Selecciona al proveedor **"Corporación Limatambo"**.
4. Ingresa el documento: **"F001-9876"**.
5. Busca el material **"S80 Hoja"**, escribe **"50"** en cantidad y **"150.00"** en costo.
6. Haz clic en el botón **"Finalizar Ingreso"**.

🧠 La Verdad del Sistema (Trazabilidad)
El stock sube de inmediato y el sistema recalcula el **"Costo Promedio"**, mezclando el precio anterior con el nuevo automáticamente.

🚨 PRUEBA DE ESTRÉS:
Acción: Intenta registrar una entrada con cantidad **"0"** o costo **"0"**.
Lección: El sistema te exigirá valores reales para no arruinar tus reportes financieros.

---

📝 Ejercicio #6: Salida por Producción (Referencia a Cotización)
🎯 OBJETIVO PRÁCTICO:
Descontar material para un trabajo específico vinculándolo a un cliente.

🛠️ Datos de Preparación (Setup)
Dato 1: **COT-0041** (Código de Presupuesto)

Dato 2: **10 unidades** (Cantidad de Salida)

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Ve a la sección de **"Salidas"**.
2. Haz clic en el botón **"+ Nueva Salida"**.
3. En el campo Referencia, escribe: **"COT-0041"**.
4. Busca el material y escribe **"10"** en la cantidad.
5. Haz clic en el botón **"Confirmar Despacho"**.

🧠 La Verdad del Sistema (Trazabilidad)
El material se resta del stock y queda anotado que fue para el proyecto **COT-0041**, permitiendo saber cuánto material gasta cada obra.

🚨 PRUEBA DE ESTRÉS:
Acción: Intenta registrar una salida hacia un código de presupuesto que **no existe**.
Lección: El sistema te obligará a usar un destino válido para no perder el rastro del material.

---

📝 Ejercicio #7: Inmutabilidad del Libro Contable (Kardex)
🎯 OBJETIVO PRÁCTICO:
Entender que no se puede alterar el pasado para garantizar la seguridad.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Ve a la sección de **"Libro Contable (Kardex)"**.
2. Busca el movimiento de **50 unidades** que hiciste anteriormente.
3. Intenta buscar un botón de **"Editar"** o **"Eliminar"** en esa fila.

🧠 La Verdad del Sistema (Trazabilidad)
Esos botones no existen. El Kardex es blindado. Si te equivocas, debes hacer un movimiento nuevo de corrección (ajuste), dejando rastro de quién y cuándo corrigió.

🚨 PRUEBA DE ESTRÉS:
Acción: Intenta borrar un registro histórico.
Lección: Verás que el historial es inalterable, protegiendo a la empresa de "pérdidas hormiga".

---

📝 Ejercicio #8: Corrección de Errores (Ajuste por Merma)
🎯 OBJETIVO PRÁCTICO:
Justificar pérdidas operativa (material roto) sin ensuciar los reportes de ventas.

🛠️ Datos de Preparación (Setup)
Dato 1: **Bisagra alta rotación** (Accesorio)

Dato 2: **2 unidades** (Rotas en instalación)

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Busca la bisagra en el **Catálogo**.
2. Abre el panel y haz clic en **"📦 Ajustar Stock"**.
3. Selecciona **"Salida"** (signo -).
4. Escribe la cantidad **"2"** y en motivo elige: **"Merma / Rotura en taller"**.
5. Haz clic en el botón **"Guardar"**.

🧠 La Verdad del Sistema (Trazabilidad)
Se descuentan 2 unidades y se etiquetan como "pérdida operativa", permitiendo al administrador ver cuánto dinero se pierde por errores de taller.

🚨 PRUEBA DE ESTRÉS:
Acción: Registra esto como una "Venta" a precio S/ 0 en lugar de un Ajuste.
Lección: Estarías bajando tu promedio de rentabilidad falsamente. Para pérdidas, siempre se usa **Ajustes**.

---

## 💰 Módulo 3: Cotizaciones (Presupuestos a Clientes)
> **"El Arte de Valorar tu Trabajo"**

---

📝 Ejercicio #9: El Primer Presupuesto (Creación Básica)
🎯 OBJETIVO PRÁCTICO:
Convertir medidas en un presupuesto formal usando el despiece automático.

🛠️ Datos de Preparación (Setup)
Dato 1: **Constructora Inmobiliaria ABC** (Cliente)

Dato 2: **Corrales** (Marca)

Dato 3: **S25_2H** (Modelo: Serie 25 - 2 hojas)

Dato 4: **Ancho 1500 / Alto 1200** (Medidas en mm)

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Ingresa a **"Cotizaciones"** y haz clic en **"+ Nueva Cotización"**.
2. Elige al Cliente y la Marca **"Corrales"**, luego **"Guardar"**.
3. Haz clic en el botón **"+ Agregar Ítem"**.
4. Elige el modelo **"Ventana Serie 25 - 2h"** e ingresa las medidas en milímetros.
5. Haz clic en el botón **"Guardar y Calcular"**.

🧠 La Verdad del Sistema (Trazabilidad)
El sistema realizó un **"Despiece Automático"**: calculó metros de perfil y m2 de vidrio consultando el costo actual de tu almacén.

🚨 PRUEBA DE ESTRÉS:
Acción: Pon un **Ancho de 10 mm**.
Lección: El sistema te dejará, pero el precio será ridículo; el sistema confía en el criterio lógico del usuario para las medidas reales.

---

📝 Ejercicio #10: El Ajuste del Negocio (Margen y Fletes)
🎯 OBJETIVO PRÁCTICO:
Ajustar la rentabilidad del proyecto sin cambiar los costos base.

🛠️ Datos de Preparación (Setup)
Dato 1: **45%** (Nuevo Margen/Markup)

Dato 2: **S/ 250.00** (Costo de Instalación)

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Dentro de la cotización, ve a la pestaña **"Totales / Ganancia"**.
2. Cambia el porcentaje de ganancia a **"45%"**.
3. Ingresa **"250.00"** en el campo **Costo Global de Instalación/Flete**.
4. Observa el cambio inmediato en el **"Precio de Venta Final"**.

🧠 La Verdad del Sistema (Trazabilidad)
Has ajustado tu margen administrativo sin mover el **Costo Directo**. Esto te permite negociar precios sin perder de vista lo que te cuesta a ti el material.

🚨 PRUEBA DE ESTRÉS:
Acción: Pon un **Margen de -10%** (negativo).
Lección: El sistema te mostrará que estás regalando dinero; verifica siempre que el margen sea positivo.

---

📝 Ejercicio #11: El Trámite de Aprobación (Paso a Producción)
🎯 OBJETIVO PRÁCTICO:
Congelar el precio comercial y dar la orden de inicio al taller.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. En la parte superior, busca el botón **"Cambiar Estado"**.
2. Selecciona la opción **"Aprobada"**.
3. Confirma la acción y verás que el estado cambia a **Verde**.

🧠 La Verdad del Sistema (Trazabilidad)
Este paso "congela" la oferta y envía la señal al tablero de **Producción (Kanban)**. El taller ahora puede ver que este trabajo existe y está listo para fabricar.

🚨 PRUEBA DE ESTRÉS:
Acción: Intenta **Eliminar** la cotización ahora que está aprobada.
Lección: El sistema bloqueará el borrado para proteger el compromiso legal; primero tendrías que **Anularla**.

---

📝 Ejercicio #12: El Blindaje Comercial (Integridad)
🎯 OBJETIVO PRÁCTICO:
Entender por qué un trato cerrado no se puede "manosear" libremente.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Intenta editar las medidas o el modelo de la ventana aprobada.
2. Observa que los campos están bloqueados (gris).

🧠 La Verdad del Sistema (Trazabilidad)
El sistema aplica un **Blindaje Comercial**. Si cambias las medidas ahora, el taller cortará mal el aluminio y la empresa perderá todo el material.

🚨 PRUEBA DE ESTRÉS:
Acción: ¿Qué hacer si el cliente pide un cambio de último minuto?
Lección: No fuerces el cambio. Lo correcto es usar el botón **"Clonar"**, editar la copia y anular la versión anterior.

---

## 🏭 Módulo 4: Producción (Tablero Kanban)
> **"El Corazón de la Planta: Eficiencia y Calidad"**

---

📝 Ejercicio #13: Nacimiento de la Orden (Importación)
🎯 OBJETIVO PRÁCTICO:
Convertir una cotización aprobada en una instrucción visual para el taller.

🛠️ Datos de Preparación (Setup)
Dato 1: **COT-0041** (Presupuesto listo)

🖱️ Ejecución en el Sistema (Paso a Paso)
1. En el Tablero Kanban, haz clic en el botón **"Importar Cotización"**.
2. Busca y selecciona el código **"COT-0041"**.
3. Haz clic en el botón **"Confirmar Importación"**.
4. Verás aparecer la tarjeta en la columna **BACKLOG**.

🧠 La Verdad del Sistema (Trazabilidad)
Todos los datos técnicos viajan automáticamente. La orden se queda en "Backlog" esperando que el Jefe de Planta decida cuándo empezar a cortar.

🚨 PRUEBA DE ESTRÉS:
Acción: Busca una cotización en **"Borrador"** para fabricar.
Lección: El sistema las oculta; nunca se fabrica nada que no tenga aprobación legal y comercial.

---

📝 Ejercicio #14: El Flujo de Valor (Movimiento)
🎯 OBJETIVO PRÁCTICO:
Supervisar el avance real del producto a través de las estaciones de servicio.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Arrastra la tarjeta **COT-0041** de la columna **BACKLOG** a **CORTE**.
2. Cuando se termine el corte, muévela a la columna **ARMADO**.

🧠 La Verdad del Sistema (Trazabilidad)
El sistema mide el tiempo que la tarjeta pasa en cada estación. Esto ayuda a detectar "Cuellos de Botella" y saber si falta personal en alguna área.

---

📝 Ejercicio #15: Control de Calidad y Reprocesos
🎯 OBJETIVO PRÁCTICO:
Gestionar errores de fabricación sin perder el control de la orden.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Arrastra la tarjeta de regreso: de **ACABADO** hacia **ARMADO**.
2. En el motivo, escribe: **"Vidrio rayado - Cambio necesario"**.
3. Observa la marca de alerta que aparece en la tarjeta.

🧠 La Verdad del Sistema (Trazabilidad)
Mover tarjetas hacia atrás se llama **"Reproceso"**. El sistema cuenta estos errores para que el Gerente decida si debe mejorar el cuidado de los materiales.

---

📝 Ejercicio #16: Cierre, Archivo e Integridad
🎯 OBJETIVO PRÁCTICO:
Finalizar el flujo de trabajo y mover el expediente al historial.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Mueve la tarjeta a la columna **ENTREGADO**.
2. Haz clic en el icono de **"Archivar"** (la caja) en la tarjeta.
3. Confirma la acción. La tarjeta desaparece pero su historia vive en el archivo.

🧠 La Verdad del Sistema (Trazabilidad)
Archivar protege el tablero de desorden pero mantiene el expediente listo para cualquier reclamo de garantía futuro.

🚨 PRUEBA DE ESTRÉS:
Acción: Pregúntate si al terminar la orden ya se descontó el material del almacén.
Lección: El Kanban mueve personas, el Inventario mueve materiales. ¡Debes ir a registrar la **Salida** en el almacén para que el stock esté al día!

---

## 📊 Módulo 5: El Cockpit MTO (Dashboard y Analítica)
> **"De Operario a Estratega: El Control Total"**

---

📝 Ejercicio #17: Curva ABC (El Principio de Pareto)
🎯 OBJETIVO PRÁCTICO:
Saber qué productos son vitales para la empresa y cuáles son secundarios.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Entra a **"Dashboard"** y busca la pestaña **"Analítica de Inventarios"**.
2. En el gráfico de **"Pareto / ABC"**, filtra por los **"Últimos 90 días"**.
3. Identifica tus materiales **Clase A** (Aluminio caro) y **Clase C** (Accesorios).

🧠 La Verdad del Sistema (Trazabilidad)
El sistema te dice que el "Clase A" es el 80% de tu dinero. Si te quedas sin aluminio, la empresa quiebra; si te quedas sin un tornillo (Clase C), puedes improvisar.

🚨 PRUEBA DE ESTRÉS:
Acción: Si solo tienes dinero para comprar un producto hoy...
Lección: El Dashboard te obliga a dar prioridad absoluta a los materiales de **Clase A**.

---

📝 Ejercicio #18: El Capital Estancado (Stock Zombie)
🎯 OBJETIVO PRÁCTICO:
Descubrir dinero "atrapado" en materiales que no se mueven.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Busca la sección de **"Inventario Zombie"**.
2. Revisa la lista de productos con stock pero **cero salidas** en 3 meses.
3. Observa el valor en Soles (S/) perdido en esos materiales.

🧠 La Verdad del Sistema (Trazabilidad)
Cada producto Zombie es efectivo que podrías estar usando para pagar sueldos o deudas. Este reporte sirve para liquidar esos productos y recuperar el dinero.

---

📝 Ejercicio #19: El Tesoro Oculto (Retazos)
🎯 OBJETIVO PRÁCTICO:
Valorar económicamente los sobrantes de aluminio útiles.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Busca el indicador de **"Retazos Valorizados"**.
2. Haz clic en **"Ver Detalle"** para ver cuántos metros lineales tienes disponibles en retazos útiles.

🧠 La Verdad del Sistema (Trazabilidad)
El sistema les da un valor económico. Mientras otros tiran el aluminio al reciclaje, tú sabes que esos trozos valen miles de Soles si los usas en obras pequeñas.

---

📝 Ejercicio #20: La Alerta Roja (Toma de Decisiones)
🎯 OBJETIVO PRÁCTICO:
Aprender a confiar en el dato por encima de la vista rápida.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Si el Dashboard muestra **STOCK 0** de un Riel, pero el operario dice que hay 2 barras tiradas allá...
2. No canceles la compra. Busca por qué el sistema no sabe de esas barras.

🧠 La Verdad del Sistema (Trazabilidad)
Alguien olvidó anotar una entrada o alguien duplicó una salida. Si alimentas el sistema con datos sucios, tomarás malas decisiones. ¡Disciplina militar en el registro!

---

## 🔍 Módulo 6: Reportes y Auditoría Física
> **"La Verdad del Almacén: Cero Mermas, Cero Errores"**

---

📝 Ejercicio #21: La Fotografía del Almacén (Estado)
🎯 OBJETIVO PRÁCTICO:
Saber exactamente cuánta mercadería tienes hoy mismo.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. En la zona de exportación, elige: **"Estado de Inventario (Foto Actual)"**.
2. Descarga el Excel y abre el archivo.

🧠 La Verdad del Sistema (Trazabilidad)
Es una **foto instantánea**. No importa qué fechas filtres, te dice qué hay "ahora". Su valor total debe coincidir con el Dashboard de la gerencia perfectamente.

---

📝 Ejercicio #22: El Rastro del Papel (Kardex en Excel)
🎯 OBJETIVO PRÁCTICO:
Analizar miles de movimientos para detectar errores de digitación.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Descarga el **"Kardex de Movimientos Lógicos"** filtrando por el **mes actual**.
2. Usa una tabla dinámica en Excel para resumir por operario o por tipo de movimiento.

🧠 La Verdad del Sistema (Trazabilidad)
Es la "caja negra" de la empresa. Aquí descubres quién cometió un error o si se están registrando demasiadas mermas sospechosas.

---

📝 Ejercicio #23: El Conteo Ciego (Honestidad)
🎯 OBJETIVO PRÁCTICO:
Garantizar que el personal cuente material real sin ser influenciado por la pantalla.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Ve a **"Hojas de Conteo"** y elige el modo **"Por Sistema"**.
2. Activa el interruptor de **"Modo Conteo Ciego"**.
3. Escribe el nombre del operario y selecciona la **Serie 25**.
4. Haz clic en el botón **"Generar PDF"**.

🧠 La Verdad del Sistema (Trazabilidad)
El PDF oculta la columna de stock esperado. El operario **tiene** que contar. Si la hoja dijera "Hay 50", muchos pondrían "50" por pereza. Esto garantiza la verdad física.

---

📝 Ejercicio #24: La Auditoría Quirúrgica (Cíclico Clase A)
🎯 OBJETIVO PRÁCTICO:
Auditar solo lo valioso rápidamente sin parar las operaciones de la planta.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. En "Hojas de Conteo", usa **"Filtros Personalizados"**.
2. Filtra por Marca: **"Limatambo / Corrales"** y Clase ABC: **"A"**.
3. (Opcional) Pon **"Stock Máximo = 0"** para buscar material que debería estar agotado.
4. Genera el documento y audita solo esos 10 o 20 productos críticos.

🧠 La Verdad del Sistema (Trazabilidad)
Se llama **"Inventario Cíclico"**. Contar todo el almacén tarda días. Contar lo más valioso cada mañana tarda 15 minutos y protege el 80% de tu inversión.

---
**¡Felicitaciones! Has completado el entrenamiento maestro.**
*Disciplina en el registro = Éxito en el negocio.*
