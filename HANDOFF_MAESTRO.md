# HANDOFF MAESTRO DE SUPERVIVENCIA (La "Cápsula del Tiempo")

Esta documentación representa las instrucciones inmutables de cómo reconstruir o modificar el sistema en 5, 10 o 15 años. Todo el código fuente es una **"Single Page App" (SPA)** Next.js.

## 1. El Peligro de NPM INSTALL y El Mandamiento `npm ci`
Usted dispone del archivo `package-lock.json` y un `package.json` **congelado exacto**.

> **🛑 ADVERTENCIA CRÍTICA A FUTUROS PROGRAMADORES:**
> JAMÁS ejecute el comando `npm install` (o `npm install X`) sobre este proyecto o destruirá la sinergia de los paquetes, pues NPM intentará bajar bibliotecas nuevas que corromperán la compilación debido a las APIs deprecadas en el paso del tiempo.

**Para instalar este proyecto para desarrollo local use SIEMPRE:**
```bash
npm ci
```
*`npm ci` (Clean Install) borrará lo existente y reproducirá la instalación bit-a-bit dictada en el `package-lock.json`.*

## 2. Generar el Producción Final (Vencer a la Entropía)
El objetivo de este software no es depender de un entorno intermedio como Vercel o de un servidor Node.js eternamente mantenido, sino **Archivos HTML + JS crudos (Estáticos)** interpretables universalmente por cualquier Navegador Web y servibles por cualquier Apache / Nginx / Amazon S3 sin coste alguno de cómputo.

1. Asegúrese que tenga el `.env.local` con sus claves correspondientes de Supabase antes del siguiente paso.
2. Ejecute el mandato definitivo de construcción:
   ```bash
   npm run build
   ```
3. Si la arquitectura no ha sido mancillada, el sistema procesará por unos minutos y generará una carpeta mágica en la raíz llamada: **`/out`**
4. Esa carpeta `/out` es su software final. Cópiela íntegramente hacia su Hosting de destino, suba los archivos a un bucket público o incluso úsela en contenedores en red interna usando un servidor simple (`python -m http.server`, Caddy o Nginx).
5. **Alojamiento Recomendado para Tolerancia a Fallos:** Súbalo a servicios CDN inmutables (ej: Netlify o Cloudflare Pages) o simplemente hospédeslo en el servidor principal de la oficina mediante IIS.

## 3. Preservación del Paquete Físico
Es su obligación asegurar el futuro de su inversión en desarrollo. Prepare una carpeta madre de respaldo.
Incluya:
1. Este proyecto de código integro.
2. Un descargable/instalador oficial de `.msi` (para Windows) de **Node.js LTS versión 20.x o 22.x**. Guárdelo y archívelo.
3. Este manual en PDF.
4. Su manual _CONTINGENCIA_SUPABASE_.

Cierre la llave bajo bóveda electrónica o en los discos físicos profundos de la compañía. El día del fallo estructural, usted tendrá el plan perfecto de restauración.
