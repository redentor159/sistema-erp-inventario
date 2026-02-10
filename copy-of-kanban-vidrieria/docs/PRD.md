# Documento de Requisitos del Producto (PRD)

## 1. Resumen del Proyecto
**Nombre del Producto:** Sistema Kanban para Vidriería
**Objetivo:** Digitalizar el seguimiento de producción para un negocio de manufactura de vidrio/ventanas, migrando de procesos manuales a un tablero colaborativo en tiempo real que rastrea pedidos desde la confirmación hasta la instalación.
**Público Objetivo:** Gerentes de taller, cortadores, armadores e instaladores.

## 2. Objetivos Clave (MVP)
1.  **Eliminar Silos de Información:** Todos ven el mismo estado del pedido en tiempo real.
2.  **Reducir Errores:** Estandarizar datos del pedido (medidas, tipo de cristal, color) para prevenir errores de manufactura.
3.  **Optimizar el Flujo:** Visualizar cuellos de botella usando límites de Trabajo en Progreso (WIP).
4.  **Trazabilidad:** Mantener un registro histórico de todas las órdenes y sus estados finales.

## 3. Alcance (Scope)
### DENTRO DEL ALCANCE (MVP / Versión Actual)
*   **Autenticación:** Inicio de sesión simple con correo/contraseña vía Firebase Auth.
*   **Tablero Kanban:** 5 columnas fijas (Confirmados, En Corte, En Ensamblaje, Listo, Finalizado).
*   **Gestión de Órdenes:** Crear, Editar, Mover, Eliminar (Archivar) órdenes.
*   **Sincronización en Tiempo Real:** Actualizaciones instantáneas en todos los dispositivos usando Firebase Firestore.
*   **Búsqueda y Filtrado:** Filtrar por nombre de cliente, producto o ID de orden.
*   **Flujos de Trabajo:** Límites WIP, alertas visuales para cuellos de botella.
*   **Reportes:** Exportar historial a Excel (.xlsx) con rangos de fechas.
*   **Configuración:** Nombre de la empresa personalizado y límites WIP ajustables.

### FUERA DEL ALCANCE (Versiones Futuras)
*   **Control de Acceso Basado en Roles (RBAC):** Roles diferenciados de Admin vs. Visualizador.
*   **Notificaciones:** Alertas por Email/SMS al cambiar de estado.
*   **Integración de Inventario:** Descontar stock (vidrio/aluminio) automáticamente.
*   **App Móvil Nativa:** (Actualmente es una web app responsiva).

## 4. Historias de Usuario
| Rol | Quiero... | Para que... |
| :--- | :--- | :--- |
| **Gerente** | Crear órdenes de trabajo digitales con dimensiones y especificaciones | El taller sepa exactamente qué cortar y armar. |
| **Gerente** | Establecer límites WIP en la columna "En Corte" | Pueda ver cuándo el equipo está sobrecargado. |
| **Cortador** | Arrastrar una tarjeta a "En Ensamblaje" | Los armadores sepan que el vidrio está listo para enmarcar. |
| **Admin** | Exportar trabajos completados a Excel | Pueda calcular la producción semanal para la nómina. |
| **Personal** | Buscar por nombre de cliente específico | Pueda responder rápidamente a consultas de estado. |

## 5. Flujos de Usuario Clave
1.  **Entrada de Orden:** Clic en "Nueva Orden" -> Llenar Formulario (ID auto-generado) -> Tarjeta aparece en "Confirmados".
2.  **Flujo de Producción:** Arrastrar tarjeta -> Estado se actualiza localmente (UI Optimista) y en BD -> Historial registra movimiento.
3.  **Ciclo de Retrabajo:** Arrastrar tarjeta hacia atrás (ej. Ensamblaje -> Corte) -> Contador de retrabajo aumenta -> Historial registra "Retrabajo".
4.  **Finalización:** Arrastrar a "Finalizado" -> Se establece fecha de finalización -> La tarjeta permanece visible para referencia.
