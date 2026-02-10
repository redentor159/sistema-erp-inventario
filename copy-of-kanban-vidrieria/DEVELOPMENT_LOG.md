# Registro de Desarrollo del Tablero Kanban

Este documento registra la evolución del proyecto y las decisiones clave tomadas en cada etapa, sirviendo como una hoja de ruta del desarrollo.

---

### **V0.1 - Creación del Tablero Kanban Básico**

- **Objetivo:** Establecer la estructura fundamental del tablero y las operaciones básicas.
- **Cambios Implementados:**
  - Creada la estructura de columnas estáticas: Pedidos Confirmados, En Corte, En Ensamblaje, Listo para Instalar, Finalizado.
  - Implementada la lógica para **Crear, Editar y Eliminar** Órdenes de Trabajo (`WorkOrder`).
  - Añadida la funcionalidad de **arrastrar y soltar (Drag and Drop)** para mover tarjetas entre columnas.
  - Establecida la persistencia de datos en `localStorage` para que el estado se guarde entre sesiones.
  - Creada la estructura inicial de componentes (Column, Card, Modal).

---

### **V0.2 - Funcionalidades Avanzadas y Mejoras de UX**

- **Objetivo:** Mejorar la eficiencia del usuario y añadir funcionalidades de conveniencia.
- **Cambios Implementados:**
  - **Añadido: Copiar y Pegar Tarjetas.** Se implementó la capacidad de duplicar una tarjeta existente para agilizar la creación de nuevas órdenes de trabajo con datos similares.
  - **Añadido: Notificaciones "Toast".** Se agregó un sistema de notificaciones no intrusivas para dar feedback al usuario sobre acciones completadas (ej: "¡Tarjeta copiada!").
  - **Expandido: Modelo de Datos `WorkOrder`.** Se añadieron los campos `width`, `height` y `additionalDescription` para capturar más detalles en cada orden.
  - **Mejora:** El formulario modal se actualizó para incluir los nuevos campos y para poder ser pre-rellenado con datos copiados.

---

### **V0.3 - Simplificación y Enfoque en el Flujo Principal**

- **Objetivo:** Centrar la aplicación en el flujo de producción principal y mejorar la claridad visual de la información más importante.
- **Cambios Implementados:**
  - **Eliminado: Tarjetas de Señal (Reorden).** Se eliminó por completo la funcionalidad de Kanban de Reorden. Esto implicó borrar los componentes (`SignalCard`, `SignalCardModal`), el estado asociado y la lógica de gestión del hook `useKanbanState`. La interfaz se volvió más limpia y enfocada.
  - **Rediseño Visual: Tarjetas de Trabajo.** Se ajustó el diseño del componente `WorkOrderCard` para dar mayor peso y tamaño de fuente a la información crítica: **Cliente, Producto, Medidas y Fecha de Entrega**. Los detalles secundarios se agruparon con un estilo más discreto.

---

### **V0.4 - Corrección de Visualización y Layout**

- **Objetivo:** Asegurar una experiencia de usuario consistente y sin errores de visualización en pantallas de escritorio.
- **Cambios Implementados:**
  - **Corregido: Alineación del Tablero.** Se modificó el contenedor principal de las columnas en `App.tsx` de `justify-center` a `justify-start`. Esto resolvió un problema donde la primera columna ("Pedidos Confirmados") podía aparecer cortada en ciertas resoluciones, garantizando que siempre esté completamente visible a la izquierda.

---

### **V0.5 - Creación de Documentación**

- **Objetivo:** Crear una base de conocimiento sólida para el proyecto que explique su propósito, arquitectura y funcionalidades.
- **Cambios Implementados:**
  - **Añadido:** Creada la carpeta `docs/` en la raíz del proyecto.
  - **Añadido:** Creados los siguientes documentos:
    - `README.md`: Resumen y punto de entrada a la documentación.
    - `ARCHITECTURE.md`: Explicación de las decisiones de diseño técnico.
    - `FEATURES.md`: Listado detallado de todas las funcionalidades.
    - `SETUP_AND_DEPLOYMENT.md`: Guía para la configuración y el despliegue.
  - **Añadido:** Creado este archivo, `DEVELOPMENT_LOG.md`, para mantener un registro histórico del progreso.
