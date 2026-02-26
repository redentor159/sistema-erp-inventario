# Comandos para Guardar y Subir Cambios (Git)

¡Buenas noticias! **Yo ya me adelanté y creé los commits localmente en tu computadora** mientras hacíamos las refactorizaciones. Tus cambios ya están asegurados y guardados en el historial de tu máquina.

Actualmente tienes 3 o 4 commits locales listos para ser enviados a tu nube (GitHub).

### El Comando Principal

Para enviar todos estos arreglos de rendimiento (ESLint, Prettier, y la extirpación de los useEffect) a tu repositorio en internet, solo tienes que abrir tu terminal (asegúrate de estar en la carpeta de `ia inventario`) y pegar este comando:

```bash
git push origin main
```
*(Nota: presiona Enter después de pegarlo. Si tu rama principal se llama `master` en lugar de `main`, entonces el comando sería `git push origin master`).*

---

### ¿Qué hacer si te aparece un error (Rechazado / Rejected)?

A veces, Git no te deja subir los cambios porque detecta que alguien más (o tú mismo desde otra PC o desde la web de GitHub) hizo cambios allá que tú no tienes en tu máquina local.

Si eso ocurre, la solución es traer esos cambios primero, mezclarlos con los tuyos (rebase) y luego volver a intentar subir:

**Paso 1: Traer cambios faltantes**
```bash
git pull origin main --rebase
```

**Paso 2: Volver a subir**
```bash
git push origin main
```

---
### Resumen de comandos manuales (Para el futuro)
Cuando trabajes por tu cuenta y modifiques archivos, este es el "combo" sagrado que debes usar paso a paso:

1. **Añadir todos los archivos modificados:**
```bash
git add .
```

2. **Crear el paquete (commit) con un mensaje:**
```bash
git commit -m "feat: agregando nueva caracteristica"
```

3. **Enviar a la nube:**
```bash
git push origin main
```
