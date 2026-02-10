# Arquitectura del Sistema

## 1. Resumen del Stack Tecnológico
| Capa | Tecnología | Razón de la Elección |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** | Estándar de la industria, basado en componentes, alto rendimiento. |
| **Herramienta de Build** | **Vite** | HMR (Hot Module Replacement) extremadamente rápido y builds de producción optimizados. |
| **Lenguaje** | **TypeScript** | El tipado estático previene errores en tiempo de ejecución (ej. uso de `any` estrictamente controlado). |
| **Backend / BD** | **Firebase** | Serverless, Base de datos en tiempo real (Firestore), Autenticación (Identity Platform). |
| **Estilos** | **Tailwind CSS** | CSS "Utility-first" para desarrollo rápido de UI y sistema de diseño consistente. |
| **Gestión de Estado** | **Custom Hooks + Context** | No se necesitan librerías externas (Redux); React Context + suscripciones de Firebase son suficientes. |

## 2. Arquitectura de Alto Nivel
```mermaid
graph TD
    User[Navegador Web] <-->|HTTPS| CDN[Contenido Vite/Netlify/Vercel]
    User <-->|WebSocket/HTTP| Firestore[Firebase Firestore DB]
    User <-->|Token Auth| Auth[Firebase Auth]
    
    subgraph "Lado del Cliente (App React)"
        Hooks[Hook useKanbanState]
        UI[Componentes (App, KanbanColumn)]
        Filters[Hook useKanbanFilters]
    end
    
    Hooks <-->|Actualizaciones Optimistas| UI
    Hooks <-->|Sincronización| Firestore
```

## 3. Modelo de Datos (Firestore)
**Colección:** `kanban_boards/shared_board`  
**Razón:** Diseño de documento único (`Fuente Única de Verdad`) evita joins complejos y asegura actualizaciones atómicas para todas las tarjetas activas.

### Estructura del Documento (`KanbanData`)
```typescript
{
  "companyName": "Vidriería Ejemplo",
  "wipLimits": { "column-en-corte": 4 },
  "column-pedidos-confirmados": [ { ...OrdenDeTrabajo... } ],
  "column-en-corte": [ ... ],
  // ... otras columnas
  "allProjectsHistory": [
    // Registro inmutable de todas las órdenes creadas
    { "id": "OT-1", "status": "Finalizado", "movementHistory": [...] }
  ]
}
```

## 4. Estrategia de Gestión de Estado
1.  **Fuente Única de Verdad:** El hook `useKanbanState` mantiene el estado maestro.
2.  **Inmutabilidad:** Todas las actualizaciones de estado usan sintaxis spread (`...`) y métodos de array (`map`, `filter`) para asegurar que React renderice correctamente. **NO se permite mutación directa** (ej. `array.push`).
3.  **UI Optimista:**
    *   **Acción:** Usuario arrastra tarjeta.
    *   **Inmediato:** `setState` actualiza la UI local al instante.
    *   **Fondo:** `updateFirestore` sincroniza los cambios a la nube.
    *   **Beneficio:** La app se siente nativa y rápida incluso en conexiones 3G.

## 5. Estructura de Carpetas
```
/src
  /components    # Componentes UI (Presentacionales)
  /hooks         # Lógica y Estado (useKanbanState, useKanbanFilters)
  /firebase      # Configuración e inicialización de servicios
  /types         # Interfaces TypeScript compartidas (Modelo de Dominio)
  /docs          # Documentación de Arquitectura y Requisitos
  App.tsx        # Layout Principal e Integración
```
