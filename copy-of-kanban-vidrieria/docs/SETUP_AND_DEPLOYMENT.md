# Guía de Configuración y Despliegue

Esta guía explica los pasos para configurar y desplegar la aplicación Kanban colaborativa.

## Introducción

La aplicación está construida con un frontend React y un backend de Firebase. Para que funcione la colaboración en tiempo real y la persistencia de datos, la configuración de Firebase es **obligatoria**.

## Prerrequisitos

- Una cuenta de Google (para Firebase).
- Una cuenta en un servicio de hosting estático (se recomienda [Netlify](https://www.netlify.com/)).

## Paso 1: Configuración de Firebase

1.  **Crear un Proyecto en Firebase:**
    -   Ve a la [Consola de Firebase](https://console.firebase.google.com/).
    -   Haz clic en **"Agregar proyecto"** y sigue los pasos. Desactiva Google Analytics para mantenerlo simple.
2.  **Registrar una Aplicación Web:**
    -   Dentro de tu nuevo proyecto, haz clic en el ícono de la web (`</>`) para "Agregar una app a tu proyecto".
    -   Dale un apodo (ej: "kanban-web") y haz clic en "Registrar app".
3.  **Obtener la Configuración:**
    -   Firebase te mostrará un objeto de configuración `firebaseConfig`. **Copia este objeto completo.**
4.  **Actualizar el Archivo de Configuración:**
    -   Abre el archivo `firebase/config.ts` en el código fuente.
    -   Reemplaza el objeto `firebaseConfig` de ejemplo con el que copiaste de tu consola de Firebase.
5.  **Habilitar Autenticación:**
    -   En la consola de Firebase, ve a la sección **Authentication**.
    -   Ve a la pestaña **"Sign-in method"** (Método de inicio de sesión).
    -   Busca **"Correo electrónico/Contraseña"** en la lista, haz clic, habilítalo y guarda.
6.  **Crear la Base de Datos Firestore (¡Paso Crucial!):**
    -   En el menú de la izquierda en la consola de Firebase, ve a **Firestore Database**.
    -   Haz clic en **"Crear base de datos"**.
    -   Selecciona iniciar en **Modo de producción** y haz clic en "Siguiente".
    -   Elige una ubicación para tus servidores (puedes dejar la que viene por defecto) y haz clic en **"Habilitar"**.
    -   Una vez creada, ve a la pestaña **"Reglas" (Rules)**.
    -   Reemplaza las reglas existentes por estas para permitir el acceso solo a usuarios autenticados:
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Permite leer y escribir en el tablero compartido solo si el usuario ha iniciado sesión.
            match /kanban_boards/shared_board {
              allow read, write: if request.auth != null;
            }
          }
        }
        ```
    -   Haz clic en **"Publicar"** para guardar las nuevas reglas.

## Paso 2: Generar los Archivos de Producción (`dist`)

El código fuente en React/TypeScript necesita ser "compilado" a archivos estáticos que los navegadores puedan entender. Este proceso genera una carpeta llamada `dist`.

Si estás trabajando en un entorno de desarrollo con Node.js, normalmente ejecutarías un comando como `npm run build`. Sin embargo, en el contexto actual, la plataforma de desarrollo genera esta carpeta por ti al exportar el proyecto.

**Asegúrate de tener la carpeta `dist` lista antes de continuar.**

## Paso 3: Desplegar en Netlify (Método Recomendado)

1.  **Crear una Cuenta:**
    -   Regístrate en [https://www.netlify.com/](https://www.netlify.com/).
2.  **Desplegar mediante Arrastrar y Soltar (Drag and Drop):**
    -   Una vez en tu panel de control, navega a la sección **"Sites"** (Sitios).
    -   Busca el área que dice **"Drag and drop your site output folder here"**.
    -   **Arrastra tu carpeta `dist`** completa y suéltala en esa área.
3.  **¡Listo!**
    -   Netlify tomará unos segundos para subir y desplegar tu sitio.
    -   Una vez finalizado, te proporcionará una URL pública donde tu aplicación estará en vivo y funcionando.

## Paso 4: Actualizar la Aplicación

Cuando se realizan cambios en el código, el proceso para actualizar la versión en vivo es muy sencillo:

1.  Obtén la nueva carpeta `dist` actualizada con los cambios.
2.  Ve a tu sitio en Netlify y busca la pestaña **"Deploys"**.
3.  Vuelve a arrastrar la nueva carpeta `dist` al área de "Drag and drop".
4.  Netlify desplegará la nueva versión sin tiempo de inactividad, reemplazando la anterior.
