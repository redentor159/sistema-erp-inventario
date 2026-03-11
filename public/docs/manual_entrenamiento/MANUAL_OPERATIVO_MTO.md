# MANUAL OPERATIVO DEL SISTEMA ERP (MTO)
**"Guía de Entrenamiento para el Personal"**

Este manual contiene 24 ejercicios prácticos para aprender a usar el sistema ERP, desde crear un producto hasta revisar el almacén.

---

## 📦 Módulo 1: Catálogo y Maestro de Materiales
> **"Tus Productos"**

---

🧪 Reto Práctico #1: Crear la Plantilla Base
🎯 Misión Comercial: > Acabamos de firmar con una nueva marca. Tu misión es crear la plantilla base en el sistema para poder registrar sus productos.

📦 Datos a Ingresar (Input):
- ID Plantilla: NOVA-001
- Nombre Genérico: Perfil Nova Test-001
- Familia: Selecciona "Perfilería Aluminio" (o alguna parecida).
- Largo Estándar: 6000

🧭 Pistas de Navegación (Solo si te pierdes):
Tip: El botón nuevo es negro, dice "+ Nueva Plantilla" y está arriba a la derecha en la vista de Catálogo. El botón final para guardar dice "Crear Plantilla" y también es negro.

❓ Pregunta de Verificación:
¿Aparece tu nuevo registro en la lista con su medida correcta?

✅ CLAVE DE CORRECCIÓN (Lo que debes ver en el sistema):
- Tabla de Catálogo: Una fila nueva con el nombre "Perfil Nova Test-001".
- Columna "Largo Estándar": Debe mostrar de forma clara 6,000 mm.

---

🧪 Reto Práctico #2: Dar de Alta el Producto
🎯 Misión Comercial: > Llegó mercadería de prueba al almacén. Necesitas crear su código real (SKU) para poder meterlo al sistema hoy mismo.

📦 Datos a Ingresar (Input):
- Nombre del Producto: Perfil Nova Negro Test
- Plantilla: Busca el "Perfil Nova Test-001" que creaste antes.
- Material Base: Selecciona "Aluminio" u otro lógico.
- Marca: Elige una marca común en la lista.
- Acabado/Color: Negro
- Almacén: Selecciona "Almacén Perfiles".

🧭 Pistas de Navegación (Solo si te pierdes):
Tip: Ve arriba a la pestaña "Items (Insumos/SKUs)". El botón negro "+ Nuevo SKU" está arriba a la derecha. Rellena los datos y usa el botón negro "Crear Producto" al terminar.

❓ Pregunta de Verificación:
¿Qué valor de stock y qué color muestra esa columna ahora mismo?

✅ CLAVE DE CORRECCIÓN (Lo que debes ver en el sistema):
- Tabla de Catálogo: Una fila nueva con tu producto.
- Columna "Stock Actual": Debe decir 0.00 en nro gris/plomo.
- Columna "Costo Mercado": Puede mostrar una etiqueta pequeña diciendo "Sin actualizar".

---

🧪 Reto Práctico #3: Cuadrar el Almacén Físico
🎯 Misión Comercial: > El jefe de taller cuenta cajas y halla 15 perfiles "Nova Negro" sueltos. Suma esas varillas en pantalla rápido para cuadrar el número físico.

📦 Datos a Ingresar (Input):
- Tipo de Ajuste: Ingreso (+)
- Cantidad: 15
- Motivos (Notas): Ingreso de prueba por ajuste físico.

🧭 Pistas de Navegación (Solo si te pierdes):
Tip: Sigue en la pestaña "Items". En la fila de tu producto a la derecha, busca un botoncito de color gris claro o azulado con el símbolo "±" y presiónalo. Elige Ingreso de botón verde.

❓ Pregunta de Verificación:
¿Cuántas varillas marca la tabla luego de guardar tu trabajo?

✅ CLAVE DE CORRECCIÓN (Lo que debes ver en el sistema):
- Tabla de Catálogo: Los números se actualizan solos al instante.
- Columna "Stock Actual": Ahora dice 16.00 (si ya tenías 1) o 15.00 y pasa a color verde fuerte.

---

🧪 Reto Práctico #4: Probar la Seguridad del Sistema
🎯 Misión Comercial: > Un usuario nuevo quiere borrar productos que ya usaron dinero u historial. Tu misión es probar si el sistema lo deja hacer eso o lo bloquea.

📦 Datos a Ingresar (Input):
- Ninguno. Tu tarea es tratar de borrar todo el producto con 15 líneas que recién subiste para ver qué pasa.

🧭 Pistas de Navegación (Solo si te pierdes):
Tip: Busca el tacho de basura rojo a la derecha extrema de la fila de tu producto en la vista de "Items".

❓ Pregunta de Verificación:
¿Qué hace la ventana después de oprimir el tacho de basura?

✅ CLAVE DE CORRECCIÓN (Lo que debes ver en el sistema):
- El producto se queda ahí y no se borra.
- Alerta: El sistema da error o traba el borrado, dejando claro que cosas con historia en el Kardex son sagradas.

---

## 🚛 Módulo 2: Movimientos de Almacén (Entradas y Salidas)
> **"Control de la Mercadería"**

---

🧪 Reto Práctico #5: Ingreso de Factura
🎯 Misión Comercial: > El camión del proveedor acaba de dejar cajas de material. Tu misión es registrar la factura de compra y meter esa mercadería al almacén del sistema.

📦 Datos a Ingresar (Input):
- Proveedor: Elige uno común de la lista (ej. Corporación Limatambo).
- Ref. / Documento: F001-9876
- Agrega un ítem: Busca el "Perfil Nova Test-001" (o cualquier producto real).
- Cantidad: 100
- Costo Unitario: 15.50

🧭 Pistas de Navegación (Solo si te pierdes):
Tip: En el panel izquierdo ve a "Inventario". Ve a la pestaña de arriba que diga "Entradas". Arriba a la derecha usa el botón oscuro "+ Nueva Entrada". Al terminar de llenar todo, haz clic en el botón negro de abajo "Registrar Entrada".

❓ Pregunta de Verificación:
¿Qué dice la columna de "Estado" en tu nuevo papel de entrada?

✅ CLAVE DE CORRECCIÓN (Lo que debes ver en el sistema):
- Tabla de Entradas: Saldrá tu nuevo documento de compra.
- Columna Estado: Debe decir "INGRESADO" (normalmente en color verde).
- Si revisas el producto en catálogo, su cantidad debió sumar esas 100 piezas solita.

---

🧪 Reto Práctico #6: Despachar a la Obra
🎯 Misión Comercial: > Los chicos del taller necesitan llevarse unas cosas de urgencia para el cliente. Tu misión es sacar esos perfiles del sistema pero indicando claramente para qué cliente u obra se usarán.

📦 Datos a Ingresar (Input):
- Tipo de Salida: Consumo Producción (o parecido).
- Comentarios / Referencia: Para Proyecto de Pruebas VIP.
- Agregar Ítem: Elige el mismo producto de antes.
- Cantidad: 10 unidades.

🧭 Pistas de Navegación (Solo si te pierdes):
Tip: Sigue en "Inventario", pero ahora dale a la pestaña superior "Salidas". El botón nuevo es color rojo "+ Nueva Salida". Llénalo y luego aprieta el botón rojo final "Registrar Salida".

❓ Pregunta de Verificación:
Si metiste 100 varillas y sacas 10, ¿se restó automáticamente del stock central?

✅ CLAVE DE CORRECCIÓN (Lo que debes ver en el sistema):
- Tabla de Salidas: Aparece tu registro nuevo con la fecha.
- El almacén se vació en 10 varillas exactas, asegurando que nadie mienta o se lleve cosas sin que sepan.

---

🧪 Reto Práctico #7: Auditoría de Historial
🎯 Misión Comercial: > Alguien malogró un ingreso gigante. Quiere abrir el historial y borrar unas filas o alterar números de compras pasadas a escondidas del dueño. Tu misión es intentar borrar la entrada de compras de las 100 varillas.

📦 Datos a Ingresar (Input):
- Ninguno (Se trata de borrar lo ya hecho).

🧭 Pistas de Navegación (Solo si te pierdes):
Tip: Pásate a la primera pestaña "Kardex (Movimientos)". Busca la fila exacta donde metiste las 100 varillas y mira sus botones derechos en "Acciones".

❓ Pregunta de Verificación:
¿Encuentras allí botones típicos de editar con lápiz azul o papeleras rojas?

✅ CLAVE DE CORRECCIÓN (Lo que debes ver en el sistema):
- Acciones: Está súper vacío de botones destructivos. Solo dice "Ver Detalle".
- Lección al Alumno: Es impensable e imposible alterar nada ahí. El Kardex o Libro Contable es sagrado y no tolera cambios humanos; los errores allí se corrigen asumiendo nueva nota de salida o extorno.

---

🧪 Reto Práctico #8: Desaparecer las Roturas
🎯 Misión Comercial: > Al trabajar la sierra, un operario malogró 2 perfiles que acaban en la basura. Saca rápido esas barras del almacén como pérdida declarada.

📦 Datos a Ingresar (Input):
- Producto: El mismo perfil u otro que tenga cantidad.
- Tipo de Movimiento: Salida (-).
- Cantidad: 2.
- Motivos/Anotaciones: Merma o pedazos mal cortados.

🧭 Pistas de Navegación (Solo si te pierdes):
Tip: Dirígete al "Catálogo" de toda la vida, pestaña "Items". Presiona la lupa para buscar tu vara. Luego a la derecha aprieta el botoncito chiquito gris "±". Elige el botón de ajuste negativo rojo claro y guárdalo.

❓ Pregunta de Verificación:
¿Por qué haces esto en vez de meter una boleta de venta ficticia?

✅ CLAVE DE CORRECCIÓN (Lo que debes ver en el sistema):
- Al usar ajuste de merma, el stock total baja en el Kardex etiquetado como "Ajuste/Pérdida".
- Si metieras ventas en S/ 0 soles por estas roturas ensuciarías toda la ganancia neta en tu gráfica analítica.

---

## 💰 Módulo 3: Cotizaciones (Presupuestos a Clientes)
> **"Presupuestos y Ventas"**

---

📝 Ejercicio #9: Crear el Primer Presupuesto
🎯 OBJETIVO PRÁCTICO:
Hacer una cotización rápida poniendo las medidas.

🛠️ Datos de Preparación (Setup)
Dato 1: **Constructora ABC** (Cliente)
Dato 2: **Corrales** (Marca)
Dato 3: **S25_2H** (Modelo de ventana)
Dato 4: **Ancho 1500 / Alto 1200** (Medidas en milímetros)

🖱️ Ejecución en el Sistema (Paso a Paso)
1. En el menú lateral oscuro, haz clic en **Cotizaciones** (icono de libreta).
2. Arriba a la derecha, haz clic en el botón azul **"+ Nueva Cotización"**.
3. Busca "Constructora" en cliente y elige **"Corrales"** en marca.
4. Más abajo, haz clic en **"+ Agregar Ítem"** (icono con la cruz).
5. Elige el modelo **"S25_2H"** y escribe: Ancho **1500** y Alto **1200**.
6. Haz clic en **Calcular/Guardar** en la parte de abajo de la ventana.

🧠 La Verdad del Sistema (Trazabilidad)
El sistema calcula todo por su cuenta (aluminio, vidrio y precios) usando los costos de tu almacén.

🚨 PRUEBA DE ESTRÉS:
Acción: Poner las medidas en centímetros (ej. 150 en vez de 1500).
Lección: El sistema calculará muy mal el precio. Trabaja siempre en medidas de milímetros.

---

📝 Ejercicio #10: Ganancia y Fletes
🎯 OBJETIVO PRÁCTICO:
Definir cuánto vas a ganar y el servicio de entrega.

🛠️ Datos de Preparación (Setup)
Dato 1: **45%** (Margen de ganancia)
Dato 2: **S/ 250.00** (Instalación y traslado)

🖱️ Ejecución en el Sistema (Paso a Paso)
1. En la misma pantalla del presupuesto, mira el **Panel de Totales** a la derecha.
2. En la casilla **"Margen (%)"**, escribe **"45"**.
3. En la sección de Costos Adicionales, escribe **"250"**.
4. Verás que el gran **Precio Total** aumenta y cambia solo.

🧠 La Verdad del Sistema (Trazabilidad)
Aumentas el precio para el cliente sin que cambien los precios internos y secretos del almacén.

🚨 PRUEBA DE ESTRÉS:
Acción: Poner un número negativo como "-15" en la ganancia.
Lección: El sistema te avisará que estás perdiendo dinero y no te dejará avanzar.

---

📝 Ejercicio #11: Aprobar la Cotización
🎯 OBJETIVO PRÁCTICO:
Confirmar la venta para que el taller empiece a trabajar.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. En la ventana, arriba a la derecha dice **"BORRADOR"** en color gris.
2. Haz clic abajo en **Guardar** y cierra esa pantalla.
3. En la lista de **Cotizaciones**, haz clic en tu nueva cotización.
4. Usa los botones para cambiar el estado a **"APROBADA"**.
5. Listo. Verás que cambia del color gris al color **Verde o Azul oscuro**.

🧠 La Verdad del Sistema (Trazabilidad)
El presupuesto ya no es un borrador. Ahora el taller entero sabe que debe empezar con la obra.

🚨 PRUEBA DE ESTRÉS:
Acción: Intentar borrar la cotización con el tacho de basura rojo.
Lección: Como ya está aprobada, no se borra. Tienes que usar el botón de anular si el cliente cancela.

---

📝 Ejercicio #12: Proteger la Cotización
🎯 OBJETIVO PRÁCTICO:
Ver por qué no puedes cambiar números de un trabajo que ya está en fábrica.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Vuelve a abrir tu cotización verde (**"APROBADA"**) haciendo clic en el lápiz azul.
2. Intenta cambiar el ancho de 1500 a 1800.
3. Observa que las cajas de escribir están bloqueadas (pintadas de gris claro).

🧠 La Verdad del Sistema (Trazabilidad)
Si permitiera cambiar medidas ahora, el taller cortaría el material para la basura. 

🚨 PRUEBA DE ESTRÉS:
Acción: ¿Y si el cliente exige cambiar las medidas hoy?
Lección: Tienes que presionar el botón de **Hacer Copia / Clonar**, poner la medida nueva ahí y anular este papel viejo.

---

## 🏭 Módulo 4: Producción (Tablero Kanban)
> **"Pantalla de Trabajo"**

---

📝 Ejercicio #13: Empezar el Trabajo
🎯 OBJETIVO PRÁCTICO:
Pasar la orden de venta directamente a una orden para el operario.

🛠️ Datos de Preparación (Setup)
Dato 1: **COT-0041** (Presupuesto recién aprobado)

🖱️ Ejecución en el Sistema (Paso a Paso)
1. En el menú oscuro izquierdo, ve a Producción y haz clic en **Tablero Kanban**. Verás unas columnas grises anchas.
2. Arriba a la derecha, haz clic en el botón oscuro **"+ Nueva Orden"** (cruz blanca).
3. Selecciona tu presupuesto **COT-0041** en la lista.
4. Usa el calendario para elegir el día de "Entrega".
5. Aprieta el botón azul **"Guardar"** abajo.

🧠 La Verdad del Sistema (Trazabilidad)
Va a salirte una "tarjeta" cuadradita de color claro en la primera columna llamada (**"Pedidos Confirmados"**).

🚨 PRUEBA DE ESTRÉS:
Acción: Querer armar ordenes usando cotizaciones "Borrador".
Lección: Pon solo trabajos **Aprobados**, si no la planta hará trabajos innecesarios sin que el cliente pague.

---

📝 Ejercicio #14: Mover el Trabajo
🎯 OBJETIVO PRÁCTICO:
Indicar dónde está parado físicamente el trabajo en ese instante.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Mira el orden de las columnas grandes: **Pedidos Confirmados**, **En Corte**, **En Ensamblaje**, **Listo para Instalar** y **Finalizado**.
2. Haz un clic en tu tarjetita nueva de **Pedidos Confirmados** y no sueltes el botón del ratón.
3. Arrástrala moviendo la mano y suéltala encima de la columna **En Corte**.
4. Luego, haz lo mismo y arrástrala hacia la columna siguiente de **En Ensamblaje**.

🧠 La Verdad del Sistema (Trazabilidad)
El sistema cronometra cuánto demora una tarjeta en cada fila. Luego verás si alguna máquina o empleado retrasa todo el proceso.

---

📝 Ejercicio #15: Material Mal Hecho
🎯 OBJETIVO PRÁCTICO:
Manejar el problema cuando toca volver a armar algo porque salió defectuoso.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Mueve tu tarjetita de trabajo hasta la columna de **Listo para Instalar**.
2. Suponte que el aluminio se rayó fiero.
3. Presiona la tarjeta y devuélvela (arrástrala para atrás) hasta dejarla de nuevo en **En Ensamblaje**.
4. Escribe un comentario usando el botoncito de lápiz diciendo qué falló exactamente.

🧠 La Verdad del Sistema (Trazabilidad)
Esa devolución se llama "Reproceso". Se anotan y guardan siempre para saber si vale la pena arreglar la máquina o jalarle las orejas al que malogra a diario.

---

📝 Ejercicio #16: Archivar y Terminar
🎯 OBJETIVO PRÁCTICO:
Desaparecer las cajas ya completadas para no marear a los chicos.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Arrastra y suelta la tarjetita tuya hasta el final de la pantalla en **Finalizado**.
2. Pon la flechita del ratón dentro de esa tarjeta; saldrá un icono chiquito de **"Cajita con Tapa"** (Archivar).
3. Haz clic allí y dale sí al mensaje que te salte. Desaparecerá solita.

🧠 La Verdad del Sistema (Trazabilidad)
No borraste su historia, solo limpiaste la columna de trabajo diario.

🚨 PRUEBA DE ESTRÉS:
Acción: Pensar que por archivar ahí, ya se restó el material en tu almacén.
Lección: ¡Ojo! Son cosas diferentes. Al terminar esto tú tienes que irte al tablero de Inventario (Módulo 2) para darle click normal a la **Nueva Salida** de ese material.

---

## 📊 Módulo 5: Resumen General (Dashboard)
> **"Reportes Rápidos"**

---

📝 Ejercicio #17: Qué vale más cuidar (Clase A)
🎯 OBJETIVO PRÁCTICO:
Encontrar los poquitos productos que más dinero de la empresa concentran.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. En el menú oscuro izquierdo principal, dale clic a la primera opción **Dashboard** (Panel de Control).
2. Luego dale clic al secundario de **"Analítica Inventarios"** (unas garritas o barras pequeñas).
3. Mira la rueda o gráfico mediano del medio llamado **Curva ABC / Análisis de Pareto**.
4. Ubica a los elementos con el texto **Clase A**.

🧠 La Verdad del Sistema (Trazabilidad)
Los que dicen "A" son vitales. Cuestan más. Si la planta frena por falta del grupo "A" hay desgracia comercial; de los tornillos "C" siempre habrá en la esquina ferretera.

🚨 PRUEBA DE ESTRÉS:
Acción: Tratar de comprar los faltantes de tornillería barata con el último billete disponible.
Lección: El jefe viendo esa rueda ABC destinará el único dinero para reponer primero la Clase A (perfiles), pase lo que pase.

---

📝 Ejercicio #18: Dinero Abandonado (Zombie)
🎯 OBJETIVO PRÁCTICO:
Verificar cuánto capital está perdiéndose en mercancía sin vender.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Sigue mirando igual la ventana de **"Analítica Inventarios"**.
2. Baja arrastrando normal tu pantalla.
3. Fíjate en el título rojo de bordes vistosos rotulado: **"Inventario Zombie"** (paralizado a más de 90 días).
4. Sorpréndete viendo el número gigante que dice la cantidad total de Soles (S/.)

🧠 La Verdad del Sistema (Trazabilidad)
Son soles congelados y perdiéndose en el rincón más triste de tu empresa. Hay que venderlos rápido como saldo para recuperar el capital urgente.

---

📝 Ejercicio #19: El Valor del Residuo (Retazos)
🎯 OBJETIVO PRÁCTICO:
Entender que los recortes sueltos de perfil deben valorarse porque sirven.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Sube de nuevo viendo otra vez arriba en tu **Dashboard**.
2. Reconoce una tarjeta verde que se titula **"Retazos Valorizados"**.
3. (Si existe el botoncito) Dale a "Ver Detalle" para ver cuánto hay disponible.

🧠 La Verdad del Sistema (Trazabilidad)
Ese cuadrito te dice en soles que todo lo que cortaron chicos y lo que te sobra sigue valiendo muchísimo dinero y que con ese trozo verde puedes sacar toda una obra menor sacándole más plata que vendiéndolo como aluminio viejo por kilo.

---

## 🔍 Módulo 6: Reportes y Listas de Almacén
> **"Revisar números claros"**

---

📝 Ejercicio #21: Estado Actual
🎯 OBJETIVO PRÁCTICO:
Descargar una hoja para cuadrar todo con el contador hoy mismo.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Vete de vuelta dando clic al panel oscuro a tu parte de **Inventario**.
2. Por la zona derecha alta, verás dos botoncitos chiquitos, aprieta el de la hoja con cruz que significa bajar a Excel o bajar tu **Foto/Estado de Inventario**.

🧠 La Verdad del Sistema (Trazabilidad)
No importa si ayer pasaron ventas, ese documento le corta el hilo al sistema justo en tu tic exacto y solo te va a contar lo tuyo paralizado hoy, dando transparencia.

---

📝 Ejercicio #22: Exportar Kardex a Excel
🎯 OBJETIVO PRÁCTICO:
Revisar si todo tu equipo digitó bien durante el mes jalándolo a tu Excel usual.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Sigue en **Inventario**, pero parado firme usando su primera pestaña: la del gran **"Kardex"**.
2. Arriba de la grilla tienes el botoncito normal rojo para Excel. Púlsalo.
3. Ábrelo en Microsoft Excel y haz tus columnas dinámicas y filtros de siempre para inspeccionar qué tipeó mal.

🧠 La Verdad del Sistema (Trazabilidad)
Esto pasa todos los meses. Sacas de la página web tus miles de líneas y el Excel te dice solito cosas rápidas, por si acaso un chico puso salida de material a medianoche donde no hay gente operando.

---

📝 Ejercicio #23: El Conteo Físico Real
🎯 OBJETIVO PRÁCTICO:
Evitar que el operario adivine la cantidad, obligándolo a contar físicamente en el almacén.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. Baja con la ruedita o el ratón hasta llegar súper abajo en el menú oscuro (ERP/WMS) para pulsar la hoja que diga **"Hojas de Conteo"**.
2. Clickea a la primerita tarjeta color azul y blanca que diré **"Por Sistema / Serie"**.
3. A la derecha y al medio hay una perillita o **Interruptor 'Modo Conteo Ciego'**, púlsalo de frente.
4. Tienes que ver que oscurezca a color gris y bote un logo pequeñito de Ojo Tachado (Ojo Cerrado).
5. Abajo de todo y a la margen izquierda tienes tu botonazo negro y grande: **"Generar PDF"**. Imprime los papeles.

🧠 La Verdad del Sistema (Trazabilidad)
Imprime un papel para el guardián sin indicarle cuáles eran tus saldos anotados (los va a ver vacíos). Así, lo forces a revisar, doblar, mover y sudar contándote cuántas varillas enteras agarró con ambas manos reales. Mentirá menos.

---

📝 Ejercicio #24: Inventario Veloz de Alta Gama (Clase A)
🎯 OBJETIVO PRÁCTICO:
Contar por las mañanas nomás y rápido las varillas grandotas sin tener que detener todo tu galpón días y días enteros perdiendo tiempo valioso ganadero.

🖱️ Ejecución en el Sistema (Paso a Paso)
1. No te salgas de la página de **"Hojas de Conteo"**. Oprime el segundo cuadro grande color casi agua de nombre **"Filtros Personalizados"**.
2. Te despegará a la derecha nuevas listas cortitas para que de verdad busques en ellas.
3. Desplegar los cuadritos blancos al escoger solamente los productos llamados puramente que contengan valor clase **A**.
4. Haz igual e imprime ahora esa listita exclusiva y mándala a bodega.

🧠 La Verdad del Sistema (Trazabilidad)
Tu listita te dará tu veinte por ciento del total de varas en catálogo general. Las vas a contar sin apuros y le diste la extremaunción a esos temibles y carísimos inventarios generales donde detienes y espantas producciones semanales ininterrumpidas cerrando local innecesariamente total, siendo eficiente un breve momento en matinais.

---
**¡Felicitaciones! Has completado el entrenamiento base.**
*Buenos registros reales = Éxito para todos.*
