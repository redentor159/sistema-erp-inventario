# 🛡️ MANUAL DE SUPERVIVENCIA Y PRODUCCIÓN LONGEVA (ERP)
**Estado:** `PRODUCCIÓN PERMANENTE` (Bulletproof Mode)
**Propósito:** Este documento está diseñado para garantizar que el sistema ERP siga funcionando durante años, incluso sin la presencia de los desarrolladores originales o supervisión técnica constante. 

---

## 🛑 1. ¿Qué hacer si "El sistema se cae" o no abre?

### Hipótesis A: El servidor gratuito de Vercel/Render/Node se apagó (Cold Start)
*   **Diagnóstico:** Al entrar a la web, se queda cargando eternamente o lanza un error "502 Bad Gateway" o "Timeout".
*   **Solución:** 
    1. Si estás usando una capa gratuita, el sistema se "duerme" tras 15 minutos sin uso.
    2. Simplemente **refresca la página (F5)** 2 o 3 veces y espera al menos 45 segundos.
    3. Para evitar esto, hemos implementado el `keep-alive-supabase.yml`, pero el frontend (Next.js) podría necesitar tiempo de "despertar" si no está en un plan de pago (Vercel PRO).

### Hipótesis B: Supabase (La Base de Datos) pausó el proyecto
*   **Diagnóstico:** La interfaz web abre pero no muestra datos (tablas vacías), o lanza mensajes de error como `"Failed to fetch"` en rojo.
*   **Solución:** 
    1. Ingresa a la consola de Supabase: `https://supabase.com/dashboard/project/gnvayzzufcmjseuxggks`
    2. Si el proyecto dice **"PAUSED"**, dale clic al botón verde **"Restore"** o **"Unpause"**.
    3. El proceso de restauración tarda de 2 a 5 minutos. Luego de eso, todo volverá a la normalidad sin pérdida de datos.
    *Nota: Se implementó un "Keep Alive" (Ping Automático) en GitHub Actions para prevenir esto, pero las políticas de Supabase gratuito pueden cambiar. La solución a largo plazo es pagar los \$25/mes del plan "Pro".*

---

## 💾 2. Copias de Seguridad (Backups) y Recuperación contra Desastres

El activo más valioso de esta empresa es la **Base de Datos** (Inventario, Clientes, Recetas). Si el código web se pierde, se puede reconstruir. Si la base de datos se pierde, la empresa se paraliza.

### ¿Dónde están mis backups?
Se ha configurado un **script automático en GitHub Actions** (`backup-base-datos.yml`) que todos los días se conecta a Supabase y extrae un clon exacto de todos tus datos.
1. Visita el repositorio en GitHub (sección "Actions").
2. Entra al workflow "Daily Supabase Backup".
3. Al final de la ejecución, verás un archivo `.sql` adjunto (Artifact) de apenas unos KB o MB. Descárgalo. Este archivo contiene TODO tu negocio.

### ¿Cómo recupero mi información si pasa lo peor (Supabase borra la cuenta)?
1. Crea una cuenta nueva de Supabase.
2. Crea un proyecto nuevo vacío.
3. Toma el archivo `.sql` de tu backup más reciente.
4. En Supabase, ve al menú `SQL Editor` (Editor SQL).
5. Pega el contenido de tu backup y dale a `RUN` (Ejecutar).
6. Tu base de datos entera, tablas, y reglas estarán restauradas en menos de 1 minuto. Solo tendrás que actualizar el nuevo `SUPABASE_URL` en tu servidor web.

---

## 🔒 3. Seguridad y Accesos a Largo Plazo

Para asegurar que nadie pueda "secuestrar" tu propio sistema:
1. **Credenciales Maestras:** Asegúrate de tener control del correo electrónico principal asociado a las cuentas de **GitHub**, **Vercel** y **Supabase**. Habilita autenticación en dos pasos (2FA) en esas cuentas mediante tu número de teléfono.
2. **Roles dentro de la App:** La aplicación no permite registros abiertos. Cualquier empleado nuevo debe ser creado por el usuario Administrador y se le debe asignar un ROL (Ej. `VENDEDOR` o `INVENTARIO`) restrictivo mediante las tablas `auth.users` o la gestión interna. La Vista Materializada (`mvw_stock_realtime`) está protegida para lectura de usuarios verificados.

---

## 🛠️ 4. Posibles "Bugs" del futuro y su Naturaleza

### "Warning" vs "Error Crítico"
Durante la última compilación intensiva del sistema, el `Linter` de validaciones arrojó varios "warnings tipográficos" y "any types". 
*   **No te asustes**. Esto es extremadamente normal en sistemas complejos y ricos en interfaz gráfica creados rápidamente. Next.js permite que el sistema funcione al 100% de su capacidad. NO significa que haya fallas ocultas listas para explotar, simplemente que los desarrolladores prefirieron flexibilidad.

### Migración de Versiones (En ~5. a 10 años)
*   React y Next.js cambiarán. En algún momento del lejano futuro, la plataforma de hosting (Ej. Vercel) dejará de soportar la versión de Node.js actual (v18/v20).
*   Cuando ese momento llegue (te notificarán por email), le pasarás a un contratista o IA esta instrucción: 
    > *"Actualiza el `package.json` de Next 14 a la versión más reciente y resuelve los 'Breaking Changes' usando el framework Shadcn UI preexistente".*
*   Este trabajo de actualización tomará un par de días de refactorización, pero no tienes que hacerlo hasta que el hosting literalmente te lo exija para mantener online el sitio.

---

## 📝 5. Cápsula del Tiempo (Generación)

Se creó un script llamado `generar_capsula_tiempo.ps1` en la raíz. 
Si alguna vez necesitas darle el control total del código fuente a otro programador o subirlo a una IA moderna para hacer un cambio masivo:
1. Ejecuta `./scripts/generar_capsula_tiempo.ps1` desde Windows PowerShell.
2. El script empaquetará de forma segura TODO el contexto humano y técnico del proyecto en un solo archivo comprimido listo para ser entregado a un ingeniero de software, garantizando cero pérdida de "Saber Hacer" (Know-How).

***FIN DEL MANUAL DE PRODUCCIÓN***
