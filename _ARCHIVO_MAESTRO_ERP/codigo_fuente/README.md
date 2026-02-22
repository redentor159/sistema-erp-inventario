# Sistema ERP y WMS para Vidriería

Sistema de gestión integral de inventario, cotizaciones y producción (Kanban) diseñado a medida.

## 🚀 Tecnologías

*   **Frontend:** Next.js 16 (App Router, Export Estático), React 19
*   **Estilos:** Tailwind CSS v4, Lucide Icons, Radix UI (shadcn/ui)
*   **Base de Datos y Auth:** Supabase (PostgreSQL, Row Level Security)
*   **Validaciones:** Zod, React Hook Form
*   **Peticiones y Caché:** TanStack React Query

## 📖 Documentación

La documentación completa de arquitectura, flujos de base de datos y guías de desarrollo se encuentra disponible en la carpeta `/docs` del repositorio.

Dentro del sistema, el **Panel de Ayuda** en la barra lateral permite consultar los manuales para operaciones cotidianas.

## 🛠 Entorno de Desarrollo Local

Si necesitas correr o extender el sistema localmente:

1.  **Clona el repositorio e instala las dependencias:**
    ```bash
    npm install
    ```

2.  **Configura las variables de entorno:**
    Crea un archivo `.env.local` en la raíz (este archivo está ignorado por Git por seguridad) y agrega las variables del proyecto de Supabase:
    ```
    NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
    ```

3.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

4.  Ingresa a `http://localhost:3000` en tu navegador.

## 🧪 Pruebas Automatizadas (Testing)

El sistema incluye una suite compleja de pruebas para evitar regresiones lógicas (especialmente en cálculos financieros/ingeniería).

*   **Tests de Unitarios y de Componentes (Vitest):**
    ```bash
    npm run test
    ```
*   **Tests End-to-End (Playwright):**
    ```bash
    npm run test:e2e
    ```

## 🏗 Despliegue en Producción

Este proyecto utiliza **Next.js Static Export** (`output: 'export'`), lo que significa que el comando `npm run build` generará puros archivos estáticos HTML/JS en la carpeta `/out`.

**Despliegue recomendado: Netlify o Vercel.**
Asegúrate de configurar las 2 variables de entorno (Supabase URL y Anon Key) en la plataforma en la que despliegues.
