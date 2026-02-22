# 11 — Autenticación, Usuarios y Roles

> **Guía Maestra de Seguridad y Control de Accesos**  
> **Sistema: ERP Vidriería**  
> **Última actualización:** Febrero 2026

---

## 1. Conceptos Fundamentales

El sistema de seguridad se basa en tres pilares de Supabase:
1.  **Supabase Auth:** Gestiona el inicio de sesión (correo/contraseña). Almacena los usuarios en el esquema interno `auth`.
2.  **Public User Roles:** Una tabla personalizada (`public.user_roles`) que vincula el ID del usuario de autenticación con un nivel de permiso específico (ADMIN, SECRETARIA, OPERARIO).
3.  **RLS (Row Level Security):** Reglas de base de datos que impiden que un usuario vea o modifique datos si su rol no lo permite.

---

## 2. Los 3 Roles del Sistema

| Rol | Nivel | Descripción del Alcance de Acceso |
| :--- | :--- | :--- |
| **ADMIN** | **Total** | Acceso sin restricciones. Puede insertar, editar y borrar en todos los módulos. Es el único que puede ver y editar la tabla de roles de otros usuarios. |
| **SECRETARIA** | **Gestión** | Acceso completo a Ventas (Cotizaciones), Clientes y Proveedores. Puede ver pero **no modificar** Recetas, Ingeniería ni el Inventario maestro (Kardex). |
| **OPERARIO** | **Ejecución** | Acceso completo a Producción (Kanban) y Retazos. Puede ver Catálogo y Cotizaciones pero **no editarlos**. No tiene acceso a Ingeniería ni Configuración. |

> [!CAUTION]  
> **Usuario sin Rol:** Si un usuario se registra y no se le asigna un rol en la tabla `user_roles`, el sistema lo tratará automáticamente como **OPERARIO** (acceso mínimo) por seguridad.

---

## 3. Guía Paso a Paso: Crear un Nuevo Usuario

La creación de un usuario es un proceso de dos etapas: **Identidad** y **Permisos**.

### Etapa 1: Crear la Identidad (Supabase Auth)

1.  Ingresa a tu [Dashboard de Supabase](https://supabase.com/dashboard).
2.  En la barra lateral izquierda, haz clic en el icono de **Authentication** (llave).
3.  Haz clic en el botón verde **"Add user"** y selecciona **"Create new user"**.
4.  **Correo Electrónico:** Escribe el email real del trabajador.
5.  **Contraseña:** Define una contraseña segura (mínimo 6 caracteres).
6.  ✅ **IMPORTANTE:** Asegúrate de que la casilla **"Auto confirm user"** esté marcada. Esto evita que el usuario tenga que confirmar su email para empezar a trabajar (útil para despliegues rápidos).
7.  Haz clic en **"Create User"**.
8.  En la lista de usuarios que aparece, busca el nuevo usuario y haz clic en el botón de **"Copy ID"** (el icono de portapapeles junto a la cadena larga de letras y números). *Lo necesitarás para el siguiente paso.*

---

### Etapa 2: Asignar el Rol (Existen 2 métodos)

Puedes asignar el rol usando la interfaz visual (**Table Editor**) o mediante código (**SQL Editor**).

#### MÉTODO A: Usando el Table Editor (Interfaz Visual - Recomendado)

Este método es el más intuitivo y no requiere escribir código.

1.  En la barra lateral de Supabase, entra a **Table Editor** (icono de rejilla).
2.  Busca y selecciona la tabla `user_roles` dentro del esquema `public`.
3.  Haz clic en el botón **"Insert row"** (o en el icono `+` al final de la tabla).
4.  Llena los campos:
    *   **user_id:** Pega aquí el UUID que copiaste en la Etapa 1.
    *   **role:** Haz clic y escribe exactamente en mayúsculas: `ADMIN`, `SECRETARIA` o `OPERARIO`.
    *   **display_name:** Escribe el nombre real de la persona (ej. "Carlos Torres").
5.  Haz clic en **"Save"**. ¡Listo! El usuario ya puede entrar con sus permisos activos.

#### MÉTODO B: Usando el SQL Editor (Código)

Ideal si quieres asignar varios roles a la vez o prefieres trabajar con scripts.

1.  Ve a **SQL Editor** en Supabase.
2.  Pega y adapta el siguiente comando:

```sql
INSERT INTO public.user_roles (user_id, role, display_name)
VALUES ('PEGA-EL-UUID-AQUI', 'SECRETARIA', 'Nombre de la Secretaria');
```

---

## 4. Gestión y Mantenimiento

### Cómo cambiar el rol de un usuario
*   **Vía Table Editor:** En la tabla `user_roles`, haz doble clic sobre el valor de la columna `role` del usuario, cámbialo (ej. de OPERARIO a ADMIN) y presiona Enter o haz clic fuera de la celda para guardar.
*   **Vía SQL Editor:**
    ```sql
    UPDATE public.user_roles 
    SET role = 'ADMIN' 
    WHERE user_id = 'UUID-DEL-USUARIO';
    ```

### Cómo desactivar el acceso de un empleado
Si un usuario ya no labora en la empresa, tienes dos niveles de seguridad:

1.  **Nivel Suave (Quitar Rol):** Borra la fila del usuario en la tabla `user_roles`. El usuario seguirá pudiendo entrar al login, pero verá todo vacío o con acceso mínimo de Operario.
2.  **Nivel Total (Banear Usuario):** 
    *   Ve a **Authentication** -> **Users**.
    *   Busca al usuario y haz clic en los tres puntos `...` al final de su fila.
    *   Selecciona **"Ban user"**. Esto impide que el usuario inicie sesión completamente, incluso si tiene la contraseña correcta.

---

## 5. Auditoría de Accesos (Logs)

Para saber quién ha entrado al sistema y a qué hora, puedes consultar la tabla `login_logs`.

*   **Vía Table Editor:** Entra a la tabla `login_logs` para ver la lista cronológica de accesos.
*   **Vía SQL Editor (Consulta de ejemplo):**
    ```sql
    -- Ver los últimos 20 inicios de sesión con nombre y rol
    SELECT email, role, logged_in_at, user_agent
    FROM public.login_logs
    ORDER BY logged_in_at DESC
    LIMIT 20;
    ```

---

## 6. Configuración de Seguridad Crítica

> [!WARNING]  
> **Seguridad del Registro Público:**  
> Por defecto, el sistema NO permite el registro libre. Solo un usuario creado por ti o por el administrador puede ingresar. Si deseas deshabilitar el registro de usuarios incluso desde la consola de la App (dejando solo la creación manual por el admin en Supabase):
> 1. Ve a **Authentication** -> **Providers**.
> 2. En el apartado de **Email**, desactiva la opción **"Enable signup"**.
> 3. Esto blindará el sistema para que nadie, ni por error, pueda crear una cuenta sin tu permiso directo.

---

## 7. Apéndice: Qué hacer si el Admin se queda sin acceso
Si por error te quitas el permiso de ADMIN a ti mismo y no puedes entrar al panel de configuración:
1.  Ve a **SQL Editor** en Supabase.
2.  Ejecuta:
    ```sql
    -- Busca tu propio correo para confirmar tu UUID
    SELECT id, email FROM auth.users WHERE email = 'tu-correo@ejemplo.com';
    
    -- Restablécete como ADMIN
    UPDATE public.user_roles SET role = 'ADMIN' WHERE user_id = 'TU-UUID-COPIADO';
    ```
