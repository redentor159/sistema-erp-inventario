# Hoja de Ruta de Implementación (Roadmap)

## 📅 Fase 1: Configuración y Núcleo (Completado)
- [x] **Inicialización del Proyecto:** (Configuración de Vite + React + TS).
- [x] **Integración de Firebase:** Configuración de Firestore y Auth.
- [x] **UI de Autenticación:** Pantalla de login y protección simple.
- [x] **Layout del Tablero:** Diseño de 5 columnas con CSS Grid/Flexbox.
- [x] **Arrastrar y Soltar:** Lógica de Drag & Drop HTML5 / Librería.

## 📅 Fase 2: Lógica de Aplicación (Completado)
- [x] **Operaciones CRUD:** Agregar, Editar y Eliminar Órdenes de Trabajo.
- [x] **Límites WIP:** Lógica para resaltar columnas que exceden capacidad.
- [x] **Motor de Búsqueda:** Filtrar por ID, Cliente o atributos.
- [x] **Registros de Historial:** Rastreo de movimientos y eventos específicos de "Retrabajo".
- [x] **Sistema de Exportación:** Conversión de lógica JSON a Excel.

## 📅 Fase 3: Fiabilidad y Refactorización (Completado - Reciente)
- [x] **Refactorización de Estado:** Cambio de actualizaciones mutables a inmutables.
- [x] **UI Optimista:** Implementación de retroalimentación instantánea al arrastrar.
- [x] **Limpieza de Arquitectura:** Extracción del hook `useKanbanFilters`.
- [x] **Seguridad de Tipos:** Eliminación de tipos `any` y manejo de errores estrictamente tipado.

## 📅 Fase 4: Mejoras Futuras (Backlog)
- [ ] **Virtualización:** Implementar `react-window` para listas con >500 tarjetas para mantener rendimiento.
- [ ] **Funciones Backend:** Mover el log de historial a Firebase Cloud Functions para integridad de datos (seguridad).
- [ ] **Gestión de Roles:** Crear panel de "Admin" para gestión de usuarios.
- [ ] **Inventario:** Descontar stock genérico de "Vidrio" al mover a "Corte".
- [ ] **Modo Offline:** Habilitar persistencia offline de Firestore explícitamente.
