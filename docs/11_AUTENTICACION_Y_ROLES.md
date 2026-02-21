# 11 — Autenticación, Usuarios y Roles

> **Sistema de Seguridad de Acceso — ERP Vidriería**  
> Última actualización: Febrero 2026

---

## 1. Arquitectura de Autenticación

El sistema usa **Supabase Auth** para gestionar identidades de usuarios y **Row Level Security (RLS)** de PostgreSQL para controlar el acceso a los datos. La autenticación funciona en el cliente mediante el SDK de Supabase.

```
Usuario ingresa credenciales
        ↓
   app/login/page.tsx  (Client Component)
        ↓
   supabase.auth.signInWithPassword()
        ↓
   Supabase devuelve JWT + Session cookie
        ↓
   AuthGuard detecta sesión activa
        ↓
   Usuario ve el Dashboard
```

### Archivos Clave

| Archivo | Rol |
|---|---|
| `lib/supabase/client.ts` | Cliente Supabase para el navegador |
| `lib/supabase/server.ts` | Cliente Supabase para el servidor (SSR) |
| `components/auth-guard.tsx` | Protege todas las rutas del dashboard |
| `app/login/page.tsx` | Formulario de inicio de sesión |
| `app/login/actions.ts` | Funciones de login / signup / logout |
| `components/dashboard/user-nav.tsx` | Barra de usuario con rol y botón Logout |

---

## 2. Roles del Sistema

El sistema tiene **3 roles** definidos en la tabla `public.user_roles`:

| Rol | Permisos |
|---|---|
| **ADMIN** | Acceso total. Puede leer y escribir en todas las tablas. Gestiona roles de usuarios. |
| **SECRETARIA** | Puede gestionar cotizaciones, clientes, proveedores. Solo lectura en inventario y recetas. |
| **OPERARIO** | Solo lectura en tablas de catálogo y cotizaciones. Acceso completo a Kanban. |

> **Regla Raíz:** Si un usuario no tiene asignado un rol, el sistema le asigna `OPERARIO` por defecto (mínimo privilegio).

---

## 3. Cómo Crear un Nuevo Usuario

### Paso 1: Crear el usuario en Supabase

1. Ve a tu proyecto en **[supabase.com/dashboard](https://supabase.com/dashboard)**
2. Menú izquierdo → **Authentication** → **Users**
3. Haz clic en **"Add user"** → **"Create new user"**
4. Completa:
   - **Email:** correo del nuevo usuario
   - **Password:** contraseña provisional (mínimo 6 caracteres)
   - ✅ Activa **"Auto confirm user"** para que no necesite verificar correo
5. Haz clic en **"Create User"**
6. Copia el **User UID** que aparece en la lista (formato UUID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Paso 2: Asignar rol al usuario

Ejecuta este SQL en **Supabase → SQL Editor**:

```sql
INSERT INTO public.user_roles (user_id, role, display_name)
VALUES 
  ('PEGA-EL-UUID-AQUI', 'ADMIN', 'Nombre del Administrador');
  -- O usa 'SECRETARIA' o 'OPERARIO' según corresponda
```

**Ejemplo real:**
```sql
INSERT INTO public.user_roles (user_id, role, display_name)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SECRETARIA', 'María López');
```

---

## 4. Cómo Cambiar el Rol de un Usuario Existente

```sql
UPDATE public.user_roles
SET role = 'ADMIN'   -- Cambia al rol que necesites
WHERE user_id = 'UUID-DEL-USUARIO';
```

---

## 5. Cómo Eliminar el Acceso de un Usuario

### Opción A — Quitar el rol (el usuario queda como OPERARIO por defecto):
```sql
DELETE FROM public.user_roles
WHERE user_id = 'UUID-DEL-USUARIO';
```

### Opción B — Desactivar completamente la cuenta (recomendado):
1. Ve a **Supabase → Authentication → Users**
2. Encuentra el usuario → haz clic en los 3 puntos `...`
3. Selecciona **"Ban user"** — el usuario no podrá iniciar sesión

---

## 6. Ver Todos los Usuarios y Sus Roles

```sql
-- Ver todos los usuarios con sus datos y roles asignados
SELECT 
    u.email,
    r.display_name AS nombre,
    r.role AS rol,
    r.created_at AS fecha_asignacion
FROM auth.users u
LEFT JOIN public.user_roles r ON u.id = r.user_id
ORDER BY r.role, u.email;
```

---

## 7. Flujo de Login

```
1. Usuario abre la app → AuthGuard verifica sesión activa
2. NO hay sesión → redirige a /login
3. Usuario ingresa email + contraseña
4. Supabase valida → genera JWT de sesión
5. AuthGuard detecta sesión → redirige a /cotizaciones
6. UserNav (sidebar) muestra email, rol y botón Logout
7. Al hacer Logout → supabase.auth.signOut() → redirige a /login
```

---

## 8. Flujo de Registro (Crear Cuenta desde la App)

El formulario de Login tiene un botón **"Registrar cuenta"** para crear nuevas cuentas:

1. Haz clic en **"Registrar cuenta"** en `/login`
2. Ingresa email y contraseña
3. Supabase crea el usuario
4. **IMPORTANTE:** Sin un rol asignado, el usuario verá el dashboard pero con acceso mínimo (OPERARIO). Un ADMIN debe asignarle el rol manualmente (ver Sección 3, Paso 2).

> [!IMPORTANT]  
> Para que el botón de Registro funcione, en Supabase → Authentication → Providers → Email debes tener **"Enable Email Signup"** activado. Si solo quieres crear usuarios desde el panel de Supabase y no desde la app, puedes desactivar esto.

---

## 9. Configuración de Seguridad en Supabase

Para revisar o ajustar configuraciones:

| Configuración | Ruta en Supabase |
|---|---|
| Habilitar/deshabilitar registro de nuevos usuarios | Authentication → Providers → Email → "Enable Email Signup" |
| Confirmar email al registrarse | Authentication → Providers → Email → "Confirm email" |
| Ver sesiones activas de todos los usuarios | Authentication → Users → clic en un usuario → Sessions |
| Cambiar tiempo de expiración de sesiones | Authentication → Configuration → JWT expiry |

---

## 10. Recuperación de Contraseña

Para que un usuario pueda recuperar su contraseña por email:

1. El usuario hace clic en **"¿Olvidé mi contraseña?"** (botón pendiente de implementar en `/login`)
2. Supabase envía un email de recuperación **siempre que tengas configurado un proveedor de Email** (SendGrid, Resend, etc.) en:
   - **Supabase → Project Settings → Auth → SMTP Settings**

> Si no tienes SMTP configurado, el reset de contraseña se hace desde el panel de Supabase:
> **Authentication → Users → [clic en el usuario] → "Send password recovery"**

---

## 11. Tabla de Referencia Rápida — Acceso por Módulo

| Módulo | ADMIN | SECRETARIA | OPERARIO |
|---|:---:|:---:|:---:|
| **Configuración General** | ✅ Escritura | 👁 Solo Lectura | ❌ Sin acceso |
| **Catálogo (SKUs, Plantillas)** | ✅ Escritura | 👁 Solo Lectura | 👁 Solo Lectura |
| **Clientes y Proveedores** | ✅ Escritura | ✅ Escritura | 👁 Solo Lectura |
| **Cotizaciones** | ✅ Escritura | ✅ Escritura | ❌ Sin acceso |
| **Entradas y Salidas** | ✅ Escritura | ✅ Escritura | 👁 Solo Lectura |
| **Movimientos (Kardex)** | ✅ Escritura | 👁 Solo Lectura | 👁 Solo Lectura |
| **Recetas e Ingeniería** | ✅ Escritura | 👁 Solo Lectura | ❌ Sin acceso |
| **Kanban Producción** | ✅ Escritura | 👁 Solo Lectura | ✅ Escritura |
| **Retazos** | ✅ Escritura | 👁 Solo Lectura | ✅ Escritura |
| **Gestión de Roles** | ✅ Pleno | ❌ Sin acceso | ❌ Sin acceso |
