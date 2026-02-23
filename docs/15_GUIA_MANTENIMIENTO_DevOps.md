# 15 — Guía de Mantenimiento Asistido (DevOps Enterprise)

> **Regla de Oro:** Este documento está diseñado para garantizar **Cero Interrupciones** en Producción y requerir el menor esfuerzo humano posible. La computadora trabaja, tú solo apruebas.
> **Última actualización:** Febrero 2026

---

## 1. La Arquitectura de Mantenimiento ("Lo que el sistema hace solo")

Tu repositorio de GitHub ha sido transformado en un Centro de Operaciones DevOps. Mientras no estés mirando, ocurren las siguientes automatizaciones:

| Robot / Acción | Qué hace automáticamente | Frecuencia |
| :--- | :--- | :--- |
| **Backup Diario** | Extrae un volcado completo de tu BD (`.sql`) y lo guarda. | Cada 24h (2 AM) |
| **Keep-Alive** | Evita que Supabase pause tu base de datos por inactividad. | Cada 4 días |
| **Sincronizador Tipos** | Lee la BD y actualiza TypeScript si detecta nuevas columnas. | Domingos (4 AM) |
| **Dependabot** | Revisa si hay nuevas versiones o parches de seguridad de librerías. Agrupa todo (Next.js, React) en un solo paquete. | Lunes (9 AM) |
| **Guardián de Integridad (CI)** | Cada vez que se intenta subir código, ejecuta: *Linter, Verificación TypeScript, Pruebas Unitarias Matemáticas (Vitest), Pruebas E2E Simulando Humanos (Playwright) y Compilación Estática*. | Al recibir un PR |

---

## 2. Tu Rutina Mensual de 5 Minutos (El Triaje)

Cuando recibas un correo de GitHub avisando de un **Pull Request de Dependabot**, **NUNCA le des al botón verde de "Merge" directamente en la web.** 

Sigue esta receta exacta e implacable:

### Paso 1: Bajar los cambios a tu PC
Abre Windsurf/VSCode en tu terminal:
```bash
git fetch origin
```
Verás la rama que creó el bot (ej. `dependabot/npm_and_yarn/next-react-ecosystem`). Cámbiate a esa rama:
```bash
git checkout dependabot/npm_and_yarn/next-react-ecosystem
```

### Paso 2: Limpieza Quirúrgica
Dado que las librerías cambiaron, debes borrar las viejas e instalar las nuevas tal como las configuró el bot:
```bash
# En Windows (PowerShell)
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Instalar
npm install
```

### Paso 3: La Prueba Corta Local (Sanity Check)
No confíes ciegamente en los bots. Abre la app en vivo:
```bash
npm run dev
```
1. Entra a `http://localhost:3000`.
2. Ve al Módulo de Cotizaciones. Abre una. ¿Se ve bien el total?
3. Ve al Kanban. Mueve una tarjeta. ¿Funcionó?

### Paso 4: Aprobar el Pase a Producción
Si todo funcionó en el Paso 3, aprueba y sube a `main`:
```bash
git checkout main
git merge dependabot/npm_and_yarn/next-react-ecosystem
git push origin main
```
*Vercel detectará el cambio en `main`, compilará la nueva versión limpia y la distribuirá mundialmente.* ¡Mantenimiento terminado!

---

## 3. Entornos de Staging (Vercel Previews) — CONFIGURACIÓN MANUAL OBLIGATORIA

Para habilitar un despliegue seguro antes de producción, debes activar Vercel Previews. Esto hará que Vercel genere una URL temporal de prueba cada vez que haya un Pull Request (sea tuyo o de Dependabot).

### Qué debes hacer tú en la web de Vercel (Solo una vez):
1. Entra al dashboard de [Vercel](https://vercel.com) y selecciona tu proyecto.
2. Ve a **Settings** > **Git**.
3. Asegúrate de que **GitHub Integration** esté conectado a tu repositorio.
4. En **Deployments** > **Preview Deployments**, actívalo para que se genere en "Pull Requests".
5. **¡OJO CLAVES!** Vercel necesita saber a qué BD conectarse en las pruebas. Ve a **Settings > Environment Variables**. Copia tus variables (`NEXT_PUBLIC_SUPABASE_URL` y la `ANON_KEY`) y asegúrate de que estén marcadas tanto para el entorno **Production** como para **Preview**.

---

## 4. Bloqueo de Código Defectuoso — CONFIGURACIÓN MANUAL EN GITHUB

Para que el Guardián de Integridad realmente proteja el servidor, debes prohibir legalmente que alguien salte las pruebas.

### Qué debes hacer tú en la web de GitHub (Solo una vez):
1. Entra a tu repositorio en GitHub > **Settings** > **Branches**.
2. Haz clic en **"Add branch protection rule"**.
3. **Branch name pattern:** Escribe `main`.
4. Marca **"Require a pull request before merging"** (Nadie puede hacer `git push` directo).
5. Marca **"Require status checks to pass before merging"**. 
   * En la barra de búsqueda que aparece, busca "build-and-test" (El nombre de nuestro Guardián) y selecciónalo. Esto bloquea el botón verde si Vitest o Playwright fallan.
6. Dale a **Save changes**.

---

## 5. Prevención de Riesgos Extremos del "Mantenimiento Cero"

| Si ocurriera esto... | Solución Oficial Inmediata |
| :--- | :--- |
| El ERP muestra pantalla en blanco aleatoriamente. | Posible problema de navegador estricto bloqueando CORS. Ve a Supabase, sube al plan Pro ($25) y activa **Custom Domains** (`api.tu-erp.com`). |
| No deja registrar ni leer nada en la BD. La terminal dice "401" o "Deprecated". | Supabase v3 mató a la v2. Espera al Pull Request salvador de Dependabot de la semana y ejecuta la "Rutina de 5 minutos" del Paso 2. |
| Sale un cartel rojo de "Vercel Build Failed". | Alguien introdujo un error en el código y el Guardián abortó el despliegue. Lee los logs de GitHub Actions (`npm run lint` o `vitest` falló). Corrige el código localmente. |
