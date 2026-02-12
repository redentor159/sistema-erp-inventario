# Guia de Versionado con Git

## Prerrequisitos
Tener instalado Git en tu sistema.

## Pasos para guardar cambios (Commit)

1.  **Verificar estado de los archivos**
    Abre una terminal en la carpeta del proyecto y ejecuta:
    ```bash
    git status
    ```
    Esto mostrará los archivos modificados, nuevos o eliminados.

2.  **Agregar archivos al área de preparación (staging)**
    Para agregar todos los cambios:
    ```bash
    git add .
    ```
    O para agregar archivos específicos:
    ```bash
    git add ruta/al/archivo
    ```

3.  **Crear el commit**
    Guarda los cambios con un mensaje descriptivo:
    ```bash
    git commit -m "Descripción de los cambios realizados"
    ```

4.  **Enviar a GitHub (Push)**
    Si ya tienes configurado un repositorio remoto:
    ```bash
    git push origin main
    ```
    *(Nota: Reemplaza `main` por la rama correcta si es diferente, e.g., `master`)*

## Comandos Útiles

-   `git log`: Ver historial de commits.
-   `git diff`: Ver diferencias en archivos no preparados.
-   `git checkout -b nombre-rama`: Crear y cambiar a una nueva rama.
