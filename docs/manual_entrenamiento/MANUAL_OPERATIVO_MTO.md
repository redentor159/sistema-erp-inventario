# MANUAL OPERATIVO DEL SISTEMA ERP (MTO)
**"Guía de Entrenamiento para el Personal de Vidriería y Metalmecánica"**

Este manual contiene **24 ejercicios prácticos** organizados en 6 módulos. Cada ejercicio refleja una situación real del día a día en una planta de carpintería de aluminio y vidrio.

> **Menú de Navegación Real (barra lateral oscura izquierda):**
>
> | Icono | Nombre en el menú | Ruta |
> |-------|------------------|------|
> | 📊 | Panel Principal | `/dashboard` |
> | 📄 | Cotizaciones | `/cotizaciones` |
> | 🗂️ | Producción | `/production` |
> | 📦 | Inventario (Kardex) | `/inventory` |
> | 📖 | Catálogo | `/catalog` |
> | — | **Sección Maestros** | — |
> | 👥 | Clientes | `/clients` |
> | 🛒 | Proveedores | `/suppliers` |
> | 📁 | Sistemas y Series | `/maestros/series` |
> | 📄 | Recetas | `/recetas` |
> | 🗄️ | Datos Maestros | `/maestros` |
> | — | **Sección Reportes** | — |
> | 📋 | Hojas de Conteo | `/hojas-conteo` |
> | 📊 | Exportar Datos | `/export` |
> | — | **Sección Sistema** | — |
> | ⚙️ | Configuración | `/configuracion` |

---

## 📦 Módulo 1: Catálogo y Maestro de Materiales
> **"Tus Productos"**
>
> Ruta: Menú lateral → **Catálogo**
> Pestañas disponibles: **Plantillas (Modelos)** | **Items (Insumos/SKUs)**

---

### 🧪 Ejercicio #1: Crear una Plantilla Base

🎯 **Situación Real:**
La empresa acaba de firmar distribución exclusiva de la serie Nova de un proveedor nuevo. Antes de registrar cada perfil individualmente, necesitas crear la plantilla base que agrupa todos los perfiles de esa serie.

📦 **Datos a Ingresar:**
| Campo | Valor |
|-------|-------|
| ID Plantilla | `NOVA-001` |
| Nombre Genérico | Perfil Nova Test-001 |
| Familia | Selecciona "Perfilería Aluminio" |
| Largo Estándar (mm) | 6000 |

🖱️ **Paso a Paso:**
1. En el menú lateral oscuro, haz clic en **Catálogo**.
2. Haz clic en la pestaña **"Plantillas (Modelos)"** (está arriba, al lado de "Items").
3. Arriba a la derecha, haz clic en el botón oscuro **"+ Nueva Plantilla"**.
4. Completa los campos de la tabla de arriba.
5. Haz clic en el botón oscuro **"Crear Plantilla"** en la parte inferior del formulario.

✅ **Resultado Esperado:**
- Una **fila nueva** aparece en la tabla con el nombre "Perfil Nova Test-001".
- La columna **"Largo Estándar"** muestra `6,000` mm.

---

### 🧪 Ejercicio #2: Dar de Alta un SKU (Producto Específico)

🎯 **Situación Real:**
Llegaron al almacén los primeros perfiles Nova en color negro. Necesitas crear el código real (SKU) del producto para poder registrar entradas y salidas en el sistema.

📦 **Datos a Ingresar:**
| Campo | Valor |
|-------|-------|
| Plantilla | Busca "Perfil Nova Test-001" (la que creaste) |
| Material Base | Aluminio |
| Marca | Elige una marca de la lista (ej. Corrales) |
| Acabado/Color | Negro |
| Almacén | Seleccciona uno (ej. Almacén Principal) |

🖱️ **Paso a Paso:**
1. Sigue en **Catálogo**, pero ahora haz clic en la pestaña **"Items (Insumos/SKUs)"**.
2. Arriba a la derecha, haz clic en el botón oscuro **"+ Nuevo SKU"**.
3. En la ventana emergente, rellena los campos de la tabla.
4. Haz clic en el botón oscuro **"Crear Producto"**.

✅ **Resultado Esperado:**
- Una fila nueva aparece en la tabla de Items con tu producto.
- La columna **"Stock Actual"** dice **0.00** en color gris/plomo (porque aún no has ingresado mercadería).

---

### 🧪 Ejercicio #3: Ajuste de Inventario Físico

🎯 **Situación Real:**
El jefe de almacén acaba de contar 15 barras de perfil Nova Negro sueltas. Esas barras ya estaban en la estantería pero no en el sistema. Necesitas cuadrar el número del sistema con la cantidad física real.

📦 **Datos a Ingresar:**
| Campo | Valor |
|-------|-------|
| Tipo de Ajuste | Ingreso (+) |
| Cantidad | 15 |
| Motivo / Notas | Ajuste por conteo físico inicial |

🖱️ **Paso a Paso:**
1. Sigue en **Catálogo**, pestaña **"Items (Insumos/SKUs)"**.
2. Busca tu producto "Perfil Nova Negro" en la tabla.
3. En la fila de ese producto, a la derecha, busca el botoncito gris con el símbolo **"±"** (Ajuste de Stock).
4. Haz clic en **"±"**. Se abre un diálogo.
5. Selecciona **Ingreso (+)** (botón verde).
6. Escribe **15** en Cantidad y escribe el motivo.
7. Haz clic en **"Guardar"**.

✅ **Resultado Esperado:**
- La columna **"Stock Actual"** ahora dice **15.00** en color verde.
- Si vas a **Inventario (Kardex)** verás una línea de movimiento tipo "AJUSTE +" con la fecha de hoy.

---

### 🧪 Ejercicio #4: Probar la Protección contra Borrado

🎯 **Situación Real:**
Un empleado nuevo quiere borrar un producto que ya tiene historial de movimientos. Tu misión es verificar que el sistema lo bloquea.

🖱️ **Paso a Paso:**
1. Sigue en **Catálogo** → pestaña **"Items"**.
2. Busca el producto que tiene stock (el perfil con 15 unidades).
3. A la derecha de la fila, busca el ícono rojo de **papelera** 🗑️.
4. Haz clic en la papelera y confirma.

✅ **Resultado Esperado:**
- El sistema **bloquea la eliminación** mostrando un error.
- El producto **NO se borra** porque ya tiene movimientos en el Kardex.
- **Lección:** Los productos con historial de transacciones son intocables. Solo se pueden borrar productos nuevos sin ningún movimiento registrado.

---

## 🚛 Módulo 2: Movimientos de Almacén
> **"Control de la Mercadería"**
>
> Ruta: Menú lateral → **Inventario (Kardex)**
> Pestañas disponibles: **Kardex (Movimientos)** | **Entradas (Compras)** | **Salidas (Consumos/Ventas)** | **Retazos (Offcuts)**

---

### 🧪 Ejercicio #5: Registrar una Compra al Proveedor

🎯 **Situación Real:**
El camión de Corporación Limatambo descargó 100 barras de perfil Nova Negro con factura F001-9876. Necesitas ingresar esa compra al sistema para que el stock suba automáticamente.

📦 **Datos a Ingresar:**
| Campo | Valor |
|-------|-------|
| Proveedor | Corporación Limatambo (búscalo en la lista) |
| Ref. / Documento | F001-9876 |
| Producto | Perfil Nova Negro (u otro con stock) |
| Cantidad | 100 |
| Costo Unitario (S/) | 15.50 |

🖱️ **Paso a Paso:**
1. En el menú lateral oscuro, haz clic en **Inventario (Kardex)**.
2. Haz clic en la pestaña superior **"Entradas (Compras)"**.
3. Arriba a la derecha, haz clic en el botón oscuro **"+ Nueva Entrada"**.
4. Selecciona el proveedor, escribe la referencia del documento.
5. Haz clic en **"+ Agregar Línea"** para agregar el producto, cantidad y costo.
6. Haz clic en el botón oscuro **"Registrar Entrada"**.

✅ **Resultado Esperado:**
- Aparece tu documento de compra en la lista de Entradas.
- Si revisas el producto en **Catálogo → Items**, su stock subió automáticamente en +100 unidades (de 15 a 115).
- En la pestaña **Kardex (Movimientos)** aparece una línea automática tipo "ENTRADA" con la fecha de hoy.

---

### 🧪 Ejercicio #6: Despachar Material al Taller

🎯 **Situación Real:**
El jefe de taller necesita 10 barras de perfil Nova Negro para la obra del cliente "Constructora ABC". Necesitas registrar la salida en el sistema para que el stock se descuente.

📦 **Datos a Ingresar:**
| Campo | Valor |
|-------|-------|
| Referencia / Comentario | Consumo para Proyecto Constructora ABC |
| Producto | Perfil Nova Negro |
| Cantidad | 10 |

🖱️ **Paso a Paso:**
1. Sigue en **Inventario (Kardex)**, haz clic en la pestaña **"Salidas (Consumos/Ventas)"**.
2. Arriba a la derecha, haz clic en el botón **"+ Nueva Salida"**.
3. Escribe la referencia y agrega el producto con la cantidad.
4. Haz clic en **"Registrar Salida"**.

✅ **Resultado Esperado:**
- Aparece tu registro en la lista de Salidas con la fecha.
- El stock bajó automáticamente: de 115 a **105** unidades.
- En el **Kardex** aparece una nueva línea tipo "SALIDA".

---

### 🧪 Ejercicio #7: Verificar que el Kardex es Inalterable

🎯 **Situación Real:**
Un empleado quiere borrar o editar un movimiento pasado del Kardex para tapar un error. Tu misión es verificar que el sistema **no lo permite**.

🖱️ **Paso a Paso:**
1. En **Inventario (Kardex)**, quédate en la primera pestaña **"Kardex (Movimientos)"**.
2. Busca la fila de la compra de 100 barras que registraste en el Ejercicio #5.
3. Mira la columna de **Acciones** a la derecha.

✅ **Resultado Esperado:**
- **No hay botones de editar ni borrar.** Solo aparece "Ver Detalle".
- **Lección:** El Kardex es un libro contable sagrado. Los errores se corrigen creando un nuevo movimiento de ajuste (entrada o salida), nunca borrando registros.

---

### 🧪 Ejercicio #8: Registrar una Merma (Material Dañado)

🎯 **Situación Real:**
Un operario malogró 2 barras de perfil al cortarlas mal con la sierra. Esas barras van a la basura. Necesitas sacarlas del sistema como pérdida declarada.

📦 **Datos a Ingresar:**
| Campo | Valor |
|-------|-------|
| Tipo de Ajuste | Salida (-) |
| Cantidad | 2 |
| Motivo | Merma: barras mal cortadas en sierra |

🖱️ **Paso a Paso:**
1. Ve a **Catálogo** → pestaña **"Items (Insumos/SKUs)"**.
2. Busca el perfil afectado en la tabla.
3. Haz clic en el botón **"±"** (Ajuste de Stock) a la derecha de la fila.
4. Selecciona **Salida (-)** (botón rojo).
5. Escribe la cantidad (2) y el motivo de la merma.
6. Haz clic en **"Guardar"**.

✅ **Resultado Esperado:**
- El stock baja de 105 a **103** unidades.
- En el **Kardex** aparece una línea tipo "AJUSTE -" con el motivo que escribiste.
- **Lección:** Las mermas se registran como ajustes negativos, **nunca** como ventas ficticias a S/ 0.00, porque eso contaminaría los reportes de rentabilidad.

---

## 💰 Módulo 3: Cotizaciones (Presupuestos a Clientes)
> **"Presupuestos y Ventas"**
>
> Ruta: Menú lateral → **Cotizaciones**

---

### 🧪 Ejercicio #9: Crear el Primer Presupuesto

🎯 **Situación Real:**
El cliente "Constructora ABC" necesita una ventana corrediza Nova de 1500 × 1200 mm para un departamento piloto. Debes cotizar con despiece automático.

📦 **Datos de Preparación:**
| Dato | Valor |
|------|-------|
| Cliente | Constructora ABC |
| Marca | Corrales |
| Modelo de ventana | S25_2H (o similar disponible) |
| Ancho (mm) | 1500 |
| Alto (mm) | 1200 |

🖱️ **Paso a Paso:**
1. En el menú lateral oscuro, haz clic en **Cotizaciones**.
2. Arriba a la derecha, haz clic en el botón **"+ Nueva Cotización"**.
3. En la ventana, busca y selecciona al cliente **"Constructora ABC"**.
4. Selecciona la marca **"Corrales"**.
5. Haz clic en **"+ Agregar Ítem"**.
6. Elige el modelo de ventana (ej. **S25_2H**), escribe Ancho **1500** y Alto **1200**.
7. Haz clic en **Guardar** en la parte inferior.

✅ **Resultado Esperado:**
- El sistema calcula automáticamente el despiece (aluminio, vidrio, accesorios) usando los costos del catálogo.
- Ves una tabla con todos los materiales, cantidades y precios unitarios desglosados.

🚨 **Prueba de Estrés:**
- **Acción:** Pon las medidas en centímetros (ej. 150 en vez de 1500).
- **Resultado:** El sistema calculará costos ridículamente bajos. **Trabaja siempre en milímetros.**

---

### 🧪 Ejercicio #10: Ajustar Margen de Ganancia

🎯 **Situación Real:**
El gerente quiere ganar un 45% sobre el costo y cobrar S/ 250.00 por instalación y transporte.

📦 **Datos:**
| Campo | Valor |
|-------|-------|
| Margen (%) | 45 |
| Costos Adicionales (S/) | 250.00 |

🖱️ **Paso a Paso:**
1. En la misma pantalla del presupuesto, mira el **Panel de Totales** (sección de resumen).
2. En la casilla **"Margen (%)"**, escribe **45**.
3. En la sección de costos adicionales, escribe **250**.
4. El **Precio Total** se recalcula automáticamente en tiempo real.

✅ **Resultado Esperado:**
- El precio final sube reflejando el 45% de margen y los S/ 250 adicionales.
- **Los costos internos del almacén no cambian.** Solo cambia el precio al cliente.

---

### 🧪 Ejercicio #11: Cambiar el Estado de la Cotización

🎯 **Situación Real:**
El cliente aceptó el presupuesto. Debes aprobar la cotización para que el taller sepa que puede comenzar a trabajar.

🖱️ **Paso a Paso:**
1. En la lista de **Cotizaciones**, haz clic en tu cotización para abrirla.
2. Arriba, verás una etiqueta de estado que dice **"BORRADOR"** (color gris).
3. Cambia el estado a **"APROBADA"** usando el selector o botón de estado.
4. La etiqueta cambiará de color gris a **verde** o **azul**.

✅ **Resultado Esperado:**
- La cotización pasa de Borrador a Aprobada.
- Todo el equipo sabe que la obra está confirmada.

🚨 **Prueba de Estrés:**
- **Acción:** Intentar borrar una cotización aprobada.
- **Resultado:** No se permite. Si el cliente cancela, debes cambiar el estado a **"ANULADA"** en lugar de borrar.

---

### 🧪 Ejercicio #12: Verificar la Protección de Datos Aprobados

🎯 **Situación Real:**
El cliente quiere cambiar el ancho de 1500 a 1800 mm, pero la cotización ya está aprobada y el taller ya cortó material.

🖱️ **Paso a Paso:**
1. Abre la cotización aprobada (color verde/azul).
2. Intenta cambiar el ancho de un ítem de 1500 a 1800.
3. Observa que los campos están bloqueados (color gris claro, no editables).

✅ **Resultado Esperado:**
- **No puedes editar medidas** en una cotización aprobada.
- **Solución correcta:** Usa el botón **"Clonar Cotización"** para crear una copia nueva con las medidas corregidas, y luego anula la cotización vieja.

---

## 🏭 Módulo 4: Producción (Tablero Kanban)
> **"Pantalla de Trabajo del Taller"**
>
> Ruta: Menú lateral → **Producción**
>
> **⚠️ Importante:** El módulo de Producción es **independiente** de las Cotizaciones. Las órdenes se crean manualmente con los datos del pedido confirmado. El Kanban no se conecta automáticamente con las cotizaciones.

---

### 🧪 Ejercicio #13: Crear una Orden de Trabajo

🎯 **Situación Real:**
El gerente confirmó que la Constructora ABC quiere su ventana Nova. Debes crear una orden de trabajo para que los operarios sepan qué fabricar.

📦 **Datos a Ingresar:**
| Campo | Valor |
|-------|-------|
| Cliente | Constructora ABC |
| Producto / Sistema | Selecciona el sistema (ej. S25 - Corrediza 2 Hojas) |
| Marca Perfil | Corrales |
| Color | Negro |
| Cristal | Cristal templado 6mm (o similar) |
| Ancho (mm) | 1500 |
| Alto (mm) | 1200 |
| Fecha Entrega | Selecciona una fecha próxima en el calendario |
| Notas Adicionales | Departamento piloto, segundo piso |

🖱️ **Paso a Paso:**
1. En el menú lateral oscuro, haz clic en **Producción**.
2. Verás el **Tablero Kanban** con 5 columnas anchas: **Pedidos Confirmados** → **En Corte** → **En Ensamblaje** → **Listo para Instalar** → **Finalizado**.
3. Arriba a la derecha, haz clic en el botón oscuro **"+ Nueva Orden"**.
4. Se abre el formulario **"Nueva Orden de Trabajo"**.
5. Completa los campos: Cliente, selecciona el Sistema en el desplegable, Marca, Color, Cristal, Ancho, Alto, Fecha de Entrega y Notas.
6. Haz clic en el botón **"Guardar"**.

✅ **Resultado Esperado:**
- Aparece una **tarjeta** nueva en la primera columna **"Pedidos Confirmados"**.
- La tarjeta muestra el cliente, el sistema, las medidas y la fecha de entrega.

---

### 🧪 Ejercicio #14: Mover el Trabajo por las Etapas

🎯 **Situación Real:**
El operario empezó a cortar los perfiles de la orden. Debes mover la tarjeta a la columna correcta para que todos vean el avance.

🖱️ **Paso a Paso:**
1. Las 5 columnas del tablero representan las etapas reales del taller:
   - **Pedidos Confirmados** → el pedido está aceptado y pendiente
   - **En Corte** → los perfiles se están cortando en la sierra
   - **En Ensamblaje** → se está armando el marco con escuadras
   - **Listo para Instalar** → el producto terminado espera transporte
   - **Finalizado** → entregado e instalado
2. Haz clic en tu tarjeta de **"Pedidos Confirmados"**, mantén presionado y **arrástrala** a la columna **"En Corte"**.
3. Suelta. La tarjeta se queda fija en "En Corte".
4. Repite: arrastra de **"En Corte"** a **"En Ensamblaje"**.

✅ **Resultado Esperado:**
- La tarjeta se mueve visualmente de columna.
- El sistema registra cuánto tiempo permanece en cada etapa (cronometraje automático).

---

### 🧪 Ejercicio #15: Manejar un Reproceso (Rework)

🎯 **Situación Real:**
Los perfiles ya ensamblados tienen el vidrio rayado. Hay que devolver la orden a ensamblaje para poner vidrio nuevo.

🖱️ **Paso a Paso:**
1. Ubica la tarjeta en la columna **"Listo para Instalar"**.
2. Arrástrala **hacia atrás** a la columna **"En Ensamblaje"**.
3. Haz clic en la tarjeta para abrirla y agregar una nota en **"Notas Adicionales"** describiendo el defecto: "Vidrio rayado, reemplazar cristal".
4. Haz clic en **"Guardar"**.

✅ **Resultado Esperado:**
- La tarjeta muestra una **etiqueta de Rework** (reproceso automático detectado por el sistema al moverla hacia atrás).
- **Lección:** El sistema contabiliza los reprocesos automáticamente. Si una orden tiene múltiples reworks, es señal de problemas de calidad que el gerente puede revisar en las estadísticas.

---

### 🧪 Ejercicio #16: Archivar una Orden Terminada

🎯 **Situación Real:**
La ventana fue entregada e instalada. Debes archivar la tarjeta para limpiar el tablero y que los operarios solo vean las órdenes activas.

🖱️ **Paso a Paso:**
1. Arrastra la tarjeta hasta la última columna **"Finalizado"**.
2. Haz clic en la tarjeta para abrirla.
3. Busca el botón de **Archivar** (ícono de cajita con tapa) y haz clic.
4. Confirma en el diálogo emergente.

✅ **Resultado Esperado:**
- La tarjeta desaparece del tablero activo.
- **No se pierde:** se mueve al **Historial** (accesible desde el botón "Historial" arriba).
- **⚠️ Importante:** Archivar en Kanban **NO** descuenta materiales del almacén. Para registrar el consumo de material, debes ir por separado a **Inventario (Kardex) → Salidas** y registrar la salida.

---

## 📊 Módulo 5: Dashboard (Panel Principal)
> **"Reportes y Análisis Gerencial"**
>
> Ruta: Menú lateral → **Panel Principal**
>
> El Dashboard tiene **3 vistas** accesibles desde un sub-menú vertical a la izquierda:
> - **Vista Ejecutiva** → Valorización y KPIs principales
> - **Inteligencia Comercial** → Ventas, márgenes y embudo
> - **Analítica Inventarios** → Clasificación ABC y stock zombie

---

### 🧪 Ejercicio #17: Identificar los Productos Clase A (más valiosos)

🎯 **Situación Real:**
El gerente quiere saber cuáles son los 20% de productos que concentran el 80% del valor del inventario, para priorizar la compra y protección de esos ítems.

🖱️ **Paso a Paso:**
1. En el menú lateral oscuro, haz clic en **Panel Principal**.
2. En el sub-menú izquierdo del Dashboard, haz clic en **"Analítica Inventarios"** (el que dice "Quiebres & Pareto").
3. Busca el gráfico de **Análisis ABC / Pareto**.
4. Ubica los productos marcados como **Clase A**.

✅ **Resultado Esperado:**
- Los productos **Clase A** son los más costosos y los que más dinero de la empresa concentran.
- **Lección:** Si la planta se queda sin un producto Clase A (ej. un perfil de aluminio costoso), la producción se detiene. Los productos Clase C (ej. tornillos) siempre se consiguen rápido en cualquier ferretería.

---

### 🧪 Ejercicio #18: Detectar Inventario Zombie

🎯 **Situación Real:**
Hay mercadería que lleva más de 90 días sin moverse. Eso es capital congelado que no genera ingresos.

🖱️ **Paso a Paso:**
1. Sigue en **Panel Principal** → **"Analítica Inventarios"**.
2. Baja por la pantalla hasta encontrar la sección de **"Inventario Zombie"** (stock inmovilizado +90 días).
3. Observa el monto total en soles (S/).

✅ **Resultado Esperado:**
- Ves un número grande en soles que indica cuánto dinero está "muerto" en el almacén.
- **Lección:** Esos productos deben venderse como saldo, liquidación o remate para recuperar capital. Un almacén con mucho "zombie" es un almacén que pierde dinero.

---

### 🧪 Ejercicio #19: Revisar la Valorización del Inventario

🎯 **Situación Real:**
El contador necesita saber cuánto vale todo el inventario actual para el balance mensual.

🖱️ **Paso a Paso:**
1. En **Panel Principal**, haz clic en la primera vista: **"Vista Ejecutiva"** (Valorización & KPIs).
2. Busca la tarjeta que muestra el **valor total del inventario** (en soles y/o dólares).
3. Revisa también los KPIs de conversión, ticket promedio y margen.

✅ **Resultado Esperado:**
- Ves el valor total del inventario actualizado al instante.
- **Lección:** Este número es lo que el contador usará para el balance general. Si difiere mucho del conteo físico, hay un problema de registro.

---

## 🔍 Módulo 6: Reportes Operativos
> **"Números Claros para el Día a Día"**

---

### 🧪 Ejercicio #20: Exportar el Estado Actual del Inventario

🎯 **Situación Real:**
El contador necesita un Excel con el stock de hoy para cruzar con el balance mensual.

🖱️ **Paso a Paso:**
1. En el menú lateral, sección **Reportes**, haz clic en **"Exportar Datos"**.
2. Selecciona el tipo de exportación **"Estado Actual de Inventario"** (tipo Snap_).
3. Haz clic en el botón **"Descargar"**.
4. Se descarga un archivo Excel con varias hojas: stock actual, catálogo, valorización.

✅ **Resultado Esperado:**
- Un archivo `.xlsx` con los datos exactos de este momento.
- **Lección:** Este reporte es "una foto" del inventario al instante exacto de descarga. No importa si ayer hubo ventas, lo que ves es el estado actual.

---

### 🧪 Ejercicio #21: Exportar Movimientos del Kardex

🎯 **Situación Real:**
El jefe quiere revisar si alguien registró salidas a horarios sospechosos (ej. a medianoche). Necesitas bajar el Kardex completo a Excel.

🖱️ **Paso a Paso:**
1. En **Exportar Datos**, selecciona el tipo de exportación **"Transacciones e Inventario"** (tipo Fact_).
2. Opcionalmente filtra por rango de fechas.
3. Haz clic en **"Descargar"**.
4. Abre el archivo en Microsoft Excel y usa filtros para buscar movimientos inusuales.

✅ **Resultado Esperado:**
- Un archivo con hojas: Fact_Entradas, Fact_Salidas, Fact_Kardex, y más.
- Puedes filtrar por fecha, usuario, y tipo de movimiento para detectar anomalías.

---

### 🧪 Ejercicio #22: Generar Hoja de Conteo Ciego

🎯 **Situación Real:**
El administrador necesita imprimir una hoja para que el almacenero cuente físicamente las barras **sin ver las cantidades del sistema** (para evitar que se copie el número en vez de contar).

🖱️ **Paso a Paso:**
1. En el menú lateral, sección **Reportes**, haz clic en **"Hojas de Conteo"**.
2. A la izquierda verás la sección **"Modos Rápidos"** con 6 tarjetas de colores:
   - 🔵 **Por Sistema / Serie** — todos los perfiles de una serie.
   - 🟢 **Por Familia** — solo una categoría (vidrios, accesorios…).
   - 🟣 **Por Rotación (ABC)** — conteo cíclico por clasificación.
   - 🟡 **Retazos Físicos** — verificar longitud de retazos.
   - 🔴 **Stock Crítico / Negativo** — productos con stock ≤ 0.
   - 🟦 **Filtros Personalizados** — combinación libre.
3. Haz clic en la tarjeta **"Por Sistema / Serie"** (azul).
4. En el desplegable que aparece debajo, selecciona una serie (ej. "Nova").
5. A la derecha, en la sección **"A. Opciones Generales del Documento"**, busca el toggle **"Modo Conteo Ciego"**.
6. Actívalo: el toggle se pone oscuro y aparece un ícono de **Ojo Tachado** 👁️‍🗨️. Esto ocultará la columna "Stock Sistema" del PDF.
7. Abajo a la izquierda, haz clic en el botón oscuro **"Generar PDF"**.

✅ **Resultado Esperado:**
- Se descarga un PDF con la lista de productos de la serie seleccionada.
- La columna **"Stock Sistema"** está **vacía** (el operario solo ve el espacio para escribir su conteo físico).
- **Lección:** El conteo ciego obliga al almacenero a contar de verdad con las manos, no a copiar el número de la pantalla.

---

### 🧪 Ejercicio #23: Conteo Cíclico de Productos Clase A

🎯 **Situación Real:**
En vez de cerrar toda la planta para un inventario general (que dura 2 días), el gerente quiere contar **solo los productos más caros** (Clase A) una vez al mes, los B cada 2 meses, y los C cada 3 meses.

🖱️ **Paso a Paso:**
1. Sigue en **"Hojas de Conteo"**.
2. En **Modos Rápidos**, haz clic en la tarjeta **"Por Rotación (ABC)"** (color violeta).
3. Debajo se abren las opciones:
   - **Clase(s) ABC:** Selecciona solo **"Clase A"** (botón chip violeta).
   - **Período de análisis:** Selecciona **"Últimos 90 días"**.
4. Activa el **"Modo Conteo Ciego"** a la derecha.
5. Haz clic en **"Generar PDF"**.

✅ **Resultado Esperado:**
- El PDF contiene **solo** los productos clasificados como Clase A.
- Normalmente son el ~20% del total de productos, pero representan el ~80% del valor.
- **Lección:** Este método se llama "conteo cíclico" y es la forma profesional de controlar inventario sin paralizar la planta.

---

### 🧪 Ejercicio #24: Hoja de Conteo con Filtros Personalizados

🎯 **Situación Real:**
Mañana llega auditoría y solo quieren verificar los vidrios marca BLINDEX que el sistema dice que tienen stock mayor a 0. Necesitas una hoja muy específica.

🖱️ **Paso a Paso:**
1. En **"Hojas de Conteo"** → Modos Rápidos, haz clic en **"Filtros Personalizados"** (color teal/turquesa).
2. A la derecha se habilita la sección **"B. Filtros Avanzados (Modo Personalizado)"**.
3. Configura los filtros:
   - **Familia(s):** Selecciona "Vidrios".
   - **Marca(s):** Selecciona "BLINDEX".
   - **Stock mínimo (≥):** Escribe **1** (para excluir los que están en cero).
4. En la sección **"C. Ordenamiento y Agrupación"**, selecciona "Por Familia" en **Agrupar productos en el PDF**.
5. Haz clic en **"Generar PDF"** o **"Generar Excel"** según prefieras.

✅ **Resultado Esperado:**
- El documento contiene **solamente** vidrios BLINDEX con stock > 0.
- El panel izquierdo muestra el **"Resumen del Conteo"** con la cantidad estimada de productos y páginas antes de generar.
- **Lección:** Los filtros personalizados permiten crear hojas ultra-específicas para cualquier auditoría o verificación puntual.

---

**🎓 ¡Felicitaciones! Has completado el entrenamiento base del ERP.**

> **Regla de oro:** Buenos registros reales = Datos confiables = Mejores decisiones = Éxito para todos.
>
> Si necesitas ayuda, haz clic en **"Ayuda y Manuales"** (ícono ❓) en la parte inferior del menú lateral para acceder a los tutoriales completos dentro del sistema.
