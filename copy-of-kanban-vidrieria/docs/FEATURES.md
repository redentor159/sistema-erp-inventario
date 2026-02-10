# Funcionalidades de la Aplicación

Este documento describe en detalle todas las características implementadas en el Tablero Kanban.

## 1. Tablero Kanban Colaborativo en Tiempo Real

- **Sincronización Instantánea:** El tablero está conectado a una base de datos en la nube (Firebase Firestore). Cualquier cambio realizado por un usuario (crear una tarjeta, moverla, editarla) es visible para todos los demás usuarios conectados al instante, sin necesidad de recargar la página.
- **Visualización de Flujo:** El tablero presenta 5 columnas que representan el flujo de producción:
  1.  `Pedidos Confirmados`
  2.  `En Corte`
  3.  `En Ensamblaje`
  4.  `Listo para Instalar`
  5.  `Finalizado`
- **Arrastrar y Soltar (Drag and Drop):** Las órdenes de trabajo (tarjetas) se pueden mover fácilmente entre columnas para reflejar su progreso actual.
- **Retroalimentación Visual:** Las columnas y tarjetas tienen indicadores visuales para diferentes estados (por ejemplo, borde rojo cuando se excede el límite de WIP, resaltado al arrastrar sobre una columna).

## 2. Gestión de Órdenes de Trabajo (Tarjetas)

- **CRUD Completo:**
  - **Crear:** Añadir nuevas órdenes de trabajo a través de un formulario modal en la columna "Pedidos Confirmados".
  - **Leer:** Ver toda la información relevante de una orden directamente en la tarjeta.
  - **Actualizar:** Editar cualquier campo de una orden de trabajo existente.
  - **Eliminar:** Quitar tarjetas del tablero. La eliminación es "suave", ya que la tarjeta se marca como `Eliminada` o `Archivada` en el historial en lugar de borrarse permanentemente.
- **Campos Detallados:** Cada orden de trabajo contiene la siguiente información:
  - Cliente, Producto, Marca, Color, Tipo de Cristal.
  - Medidas (Ancho y Alto en cm).
  - Descripción Adicional (para notas específicas).
  - Fecha de Entrega (con código de colores para urgencia).
  - ID de Orden único y autoincremental.
  - Fechas de Creación y Finalización automáticas.
- **Autocompletado:** Los campos de Producto, Marca, Color y Cristal ofrecen sugerencias para agilizar y estandarizar la entrada de datos.
- **Copiar y Pegar:** Se puede "copiar" una tarjeta existente y "pegarla" para abrir el formulario de nueva orden con todos los datos pre-rellenados, ideal para trabajos similares.

## 3. Control de Flujo (WIP Limits)

- **Límites de Trabajo en Progreso (WIP):** Es posible establecer un número máximo de tarjetas permitidas en las columnas de proceso (`En Corte` y `En Ensamblaje`).
- **Alerta Visual:** Si el número de tarjetas en una columna excede su límite WIP, la columna se resalta con un color y borde rojo para señalar un posible cuello de botella en el flujo.

## 4. Historial y Exportación a Excel

- **Registro Persistente en la Nube:** Cada tarjeta creada, movida o eliminada se registra en un historial de proyectos (`allProjectsHistory`). Este historial mantiene el estado final de cada tarjeta (Activo, Finalizado, Eliminado, Archivado).
- **Exportación a .xlsx:**
  - Se puede exportar el historial completo a un archivo de Excel.
  - La exportación incluye dos hojas de cálculo:
    1.  **"Todos los Proyectos":** Un volcado completo de todos los datos de cada tarjeta que ha existido en el tablero.
    2.  **"Proyectos Finalizados":** Una vista limpia que solo contiene las órdenes que se completaron, ideal para informes de producción.
- **Filtrado por Fechas:** El modal de exportación permite seleccionar un rango de fechas (inicio y fin) para exportar solo los registros relevantes de ese período.

## 5. Configuración y Mantenimiento

- **Ajustes del Tablero:** Un modal de configuración permite:
  - Cambiar el **Nombre de la Empresa** que se muestra en el encabezado.
  - Ajustar los **límites WIP** para las columnas de proceso.
- **Restablecimiento del Tablero:** Para mantenimiento, existen dos opciones de reinicio:
  - **Borrar Solo Tarjetas (Reinicio Suave):** Elimina todas las tarjetas del tablero activo pero conserva todo el historial de proyectos y la configuración (nombre de la empresa, límites WIP). Las tarjetas activas se marcan como "Eliminadas" en el historial.
  - **Empezar de 0 (Reinicio Completo):** Restaura la aplicación a su estado inicial de fábrica. Se borran todas las tarjetas, todo el historial y toda la configuración. **Esta acción es irreversible.**
