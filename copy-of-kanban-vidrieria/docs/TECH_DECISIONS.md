# Registros de Decisiones de Arquitectura (ADR) / Decisiones Técnicas

## ADR 001: Uso de React + Vite
*   **Estado:** Aceptado
*   **Contexto:** Necesitamos un framework web moderno que ofrezca una experiencia de desarrollo de alto rendimiento y optimización para producción.
*   **Decisión:** Seleccionamos **React** por su modelo de componentes y **Vite** por su velocidad de compilación.
*   **Consecuencias:** Requiere Node.js para desarrollo. Ofrece HMR (Reemplazo de Módulos en Caliente) extremadamente rápido.

## ADR 002: Firebase como Backend-as-a-Service (BaaS)
*   **Estado:** Aceptado
*   **Contexto:** Necesitamos características de colaboración en tiempo real (tipo WebSocket) sin la carga de mantener un servidor WebSocket personalizado (Node/Socket.io).
*   **Decisión:** Usar **Firebase Firestore**.
*   **Consecuencias:** "Vendor Lock-in" (Dependencia del proveedor) con Google Cloud. Código simplificado (el cliente habla directamente con la BD vía listeners). Excelentes capacidades offline/tiempo real "out of the box".

## ADR 003: Estado de Documento Único (Patrón "Big Object")
*   **Estado:** Aceptado (con advertencias)
*   **Contexto:** El tablero Kanban está altamente interconectado. Mover una tarjeta requiere actualizar la columna, el historial y los conteos de retrabajo atómicamente.
*   **Decisión:** Almacenar el **estado completo del tablero** en un único documento de Firestore (`shared_board`).
*   **Pros:** Las actualizaciones atómicas son triviales. El estado del cliente siempre es consistente.
*   **Contras:** Los costos de escritura aumentan con el tamaño. No apto para 10,000+ tarjetas activas (consumo de ancho de banda).
*   **Mitigación:** Las tarjetas viejas se archivan. Futura refactorización podría dividir el tablero por mes si es necesario.

## ADR 004: Actualizaciones de UI Optimistas
*   **Estado:** Aceptado (Impl. Fase 3)
*   **Contexto:** Los usuarios percibían la app como "lenta" porque el drag-and-drop esperaba la respuesta del servidor.
*   **Decisión:** Actualizar el estado local de React **inmediatamente** tras la acción del usuario, luego sincronizar a Firebase en segundo plano.
*   **Consecuencias:** La app se siente nativa/instantánea. Requiere manejo de errores cuidadoso (rollback) si la escritura al servidor falla (actualmente implementado como "la última escritura gana", que es aceptable para este caso de uso).

## ADR 005: Modo Estricto de TypeScript
*   **Estado:** Aceptado
*   **Contexto:** El tipado dinámico de JavaScript llevaba a errores en tiempo de ejecución (ej. `undefined` is not a function) durante el desarrollo.
*   **Decisión:** Imponer **TypeScript** con verificación de tipos estricta. Se eliminó el uso de `any`.
*   **Consecuencias:** Desarrollo inicial más lento (escribir interfaces), pero estabilidad significativamente mayor y refactorización mucho más fácil.
