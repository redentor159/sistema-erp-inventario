# Plan de Migración Masiva (1000+ Items)

Dado que tiens más de 1000 filas y datos potencialmente irregulares, **copiar y pegar a ChatGPT no es viable** para todo (se perderá, alucinará o se cortará).

Esta es la estrategia profesional híbrida:

---

## 1. Estrategia Híbrida (La Mejor Opción)

| Categoría | Característica detectada | Herramienta Recomendada | Por qué |
| :--- | :--- | :--- | :--- |
| **Perfiles de Aluminio** | Estructurados (Tiene Serie, Código, Color A/B/M) | **Python Script (Colab)** | Son reglas matemáticas fijas. Python procesa 1000 filas en 1 segundo sin errores. |
| **Cristales** | Semi-Estructurados (Tipo + Espesor + Color) | **Python Script** | Se puede estandarizar fácil (ej. "CRU" + "6" + "INC"). |
| **Accesorios** | **Irregulares** (Nombres variados, códigos raros) | **IA (ChatGPT/Claude)** | Aquí la IA brilla. Entiende que "Garrucha doble" y "Roda Doble" son lo mismo. Hazlo en lotes de 50. |

---

## 2. Flujo de Trabajo Recomendado

1.  **Limpia tu Excel mínimamente:**
    *   Asegúrate que la columna `Serie`, `Color` y `Perfil Codigo` tengan nombres claros en la primera fila.
    *   Guárdalo como `inventario_limpio.csv`.

2.  **Usa Google Colab para Perfiles (El 80% del trabajo):**
    *   Copia el código Python que te dejo abajo.
    *   Pégalo en un [Google Colab](https://colab.research.google.com/).
    *   Sube tu archivo `csv`.
    *   Ejecuta. Te dará un archivo `migracion_perfiles.sql` perfecto.

3.  **Usa IA para las "Sobras" (Accesorios):**
    *   Filtra en tu Excel lo que *no* sean perfiles.
    *   Esos sí pásalos a la IA en grupos de 50 con el "Prompt Maestro" que creamos antes.

---

## 3. Código Python para Google Colab (Para Perfiles)

Copia este bloque en una celda de código de Colab:

## 1. Columnas Requeridas en tu CSV

**¡TU EXCEL TIENE 2 FILAS DE ENCABEZADO!** Eso no funcionará directamente.

**Antes de guardar como CSV, haz esto en Excel:**

1.  **Copia** los nombres de los proveedores de la Fila 2 (`Corrales ($)`, `Holding (S/)`, etc.).
2.  **Pégalos** en la Fila 1, reemplazando a las celdas que dicen "PRECIO POR UNIDAD".
3.  **Borra la Fila 2** completamente.
4.  Te debe quedar **UNA SOLA fila de encabezados** así:

| A | B | C | ... | P | Q | R |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Serie de perfil` | `Tipo de cristal` | `Perfil código` | ... | `Corrales ($)` | `Holding (S/)` | `Fourglass ($)` |
| 20 | | 2021 | ... | 9.083 | 28.035 | |

**Reglas de Nombres (Copia y Pega estos en tu Fila 1):**
*   `Serie de perfil`
*   `Perfil código`
*   `Color`
*   `Descripción`
*   `Corrales ($)`
*   `Holding (S/)`
*   `Limatambo(S/)`
*   `Santis (S/)`
*   `Muñoz (S/)`
*   `Farvisur (S/)`
*   `Fullglass (S/)`

---

## 2. Código Python para Google Colab (Para Perfiles)

Copia este bloque en una celda de código de Colab:

```python
# =============================================================================
# SCRIPT DE MIGRACIÓN MASIVA DE PERFILES - GOOGLE COLAB
# =============================================================================
# Instrucciones:
# 1. Sube tu archivo 'inventario_limpio.csv' a la carpeta de archivos de Colab (icono de carpeta a la izquierda).
# 2. Asegúrate de que el CSV tenga SOLO UNA FILA DE ENCABEZADOS (borra la fila extra de "PRECIO POR UNIDAD" si existe).
# 3. Ejecuta esta celda (Play).

import pandas as pd
import numpy as np

# -----------------------------------------------------------------------------
# 1. CONFIGURACIÓN
# -----------------------------------------------------------------------------
ARCHIVO_CSV = "inventario_limpio.csv" 
TIPO_CAMBIO = 3.80 # Ajustar según el día de carga (Dólar -> Soles)

# Mapeos de tu Empresa (Business Logic)
# Colores: Código Excel -> Código Base de Datos
MAP_COLORES = {
    'A': 'MAT',     # Mate / Natural
    'B': 'NEG',     # Negro
    'P': 'BLA',     # Blanco Pintura
    'M': 'MAD',     # Madera
    'C': 'CHA',     # Champagne
    'I': 'INC',     # Incoloro
    'PU': 'PUL',    # Pulido Brillante
    'ST': 'SAT',    # Satinado
    'BR': 'BRO',    # Bronce
    'AC': 'ACI'     # Al acido / Pavonado
}

# Sistemas: Serie Excel -> Código Base de Datos
MAP_SISTEMAS = {
    '20': 'SYS_20', 
    '25': 'SYS_25', 
    '3825': 'SYS_3825',
    '42': 'SYS_42', 
    '80': 'SYS_80', 
    '62': 'SYS_62',
    'GEN': 'SYS_GEN'
}

# Columnas de Precio Prioritarias (Orden de preferencia)
# El script buscará la primera de esta lista que tenga un valor > 0
COLS_PRECIO = [
    'Corrales ($)',   # Prioridad 1: Dólares
    'Holding (S/)',   # Prioridad 2: Soles
    'Limatambo(S/)',  # Prioridad 3...
    'Santis (S/)', 
    'Muñoz (S/)', 
    'Farvisur (S/)', 
    'Fullglass (S/)'
]

# -----------------------------------------------------------------------------
# 2. FUNCIONES DE LIMPIEZA
# -----------------------------------------------------------------------------

def limpiar_valor(v):
    """Limpia guiones, espacios y detecta nulos"""
    s = str(v).strip()
    if s == '-' or s.lower() == 'nan' or s == '':
        return None
    return s

def limpiar_moneda(valor):
    """Convierte texto con simbolos (S/ 10.5) a float (10.5)"""
    try:
        s = str(valor).replace('S/', '').replace('$', '').replace(',', '').strip()
        if s == '-' or s == '' or s.lower() == 'nan': return 0.0
        return float(s)
    except:
        return 0.0

def obtener_mejor_precio(row):
    """Itera columnas de precio, convierte USD a PEN si es necesario"""
    for col in COLS_PRECIO:
        # Verifica si la columna existe en el CSV
        if col in row:
            precio = limpiar_moneda(row[col])
            if precio > 0:
                # Si la columna tiene '($)', asumimos Dólares -> Convertir a Soles
                if '($)' in col:
                    return round(precio * TIPO_CAMBIO, 2)
                else:
                    return round(precio, 2)
    return 0.0 # Si no encuentra precio

def generar_sql_perfiles(row):
    """Genera INSERTs para una fila, devuelve string SQL o None"""
    
    # A. Leer y Limpiar Datos Básicos
    serie_raw = limpiar_valor(row.get('Serie de perfil', ''))
    codigo = limpiar_valor(row.get('Perfil código', ''))
    color_code = limpiar_valor(row.get('Color', ''))
    descripcion = str(row.get('Descripción', '')).replace("'", "").strip() # Escapar comillas simples
    
    # B. Validaciones Estrictas (Si falla, se salta la fila)
    if not codigo: return None # Sin código no hay producto
    if not serie_raw: return None # Sin serie no sabemos qué es
    
    # Limpiar ".0" si viene de excel numérico (ej: "20.0" -> "20")
    serie = serie_raw.replace('.0', '')
    
    # C. Lógica de Negocio (Mapeos)
    id_sistema = MAP_SISTEMAS.get(serie)
    if not id_sistema: return None # Si la serie no está en nuestro mapa, ignorar (quizás es accesorio)

    id_familia = 'PERF'
    
    # Mapeo de Color (Si no existe, usa 'GEN')
    id_acabado = MAP_COLORES.get(color_code, 'GEN') 

    # D. Identificadores Clave
    id_plantilla = codigo # Ej: "2021"

    # Generar SKU (Codigo + Color)
    if not color_code:
        id_sku = f"{codigo}GEN"
    else:
        id_sku = f"{codigo}{color_code}" # Ej: "2021A"
    
    # E. Obtener Precio Normalizado (Siempre en Soles)
    costo_unit = obtener_mejor_precio(row)

    # F. Generar SQL Strings
    
    # 1. Insertar Plantilla (El molde)
    #    USAMOS 'DO UPDATE' PARA SOBREESCRIBIR SI YA EXISTE (Corrección de datos maestros)
    #    Usamos la descripción del CSV para el nombre genérico también.
    nombre_generico = descripcion.split('-')[0].strip() # Simplificar nombre para la plantilla si se desea, o usar completo
    if not nombre_generico: nombre_generico = f"Perfil {id_plantilla}"

    sql_plantilla = f"""
    INSERT INTO cat_plantillas 
        (id_plantilla, nombre_generico, id_familia, id_sistema, largo_estandar_mm)
    VALUES 
        ('{id_plantilla}', '{nombre_generico}', '{id_familia}', '{id_sistema}', 6000)
    ON CONFLICT (id_plantilla) DO UPDATE SET
        nombre_generico = EXCLUDED.nombre_generico,
        id_sistema = EXCLUDED.id_sistema;
    """
    
    # 2. Insertar Variante (El producto con precio)
    #    También usamos DO UPDATE para actualizar precios/nombres si ya existen
    sql_variante = f"""
    INSERT INTO cat_productos_variantes (
        id_sku, id_plantilla, id_marca, id_material, id_acabado, 
        nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion
    ) VALUES (
        '{id_sku}', '{id_plantilla}', 'GEN', 'GEN', '{id_acabado}',
        '{descripcion}', 'Unidad', {costo_unit}, 'PEN'
    )
    ON CONFLICT (id_sku) DO UPDATE SET
        costo_mercado_unit = EXCLUDED.costo_mercado_unit,
        nombre_completo = EXCLUDED.nombre_completo;
    """
    
    return sql_plantilla + sql_variante

# -----------------------------------------------------------------------------
# 3. EJECUCIÓN PRINCIPAL
# -----------------------------------------------------------------------------
try:
    print(f"Leyendo '{ARCHIVO_CSV}'...")
    
    # Intentamos leer con 'latin-1' (común en Excel) o 'utf-8'
    try:
        df = pd.read_csv(ARCHIVO_CSV, encoding='latin-1')
    except:
        df = pd.read_csv(ARCHIVO_CSV, encoding='utf-8')

    print(f"Total filas en CSV: {len(df)}")
    print("Columnas detectadas:", list(df.columns))
    
    sql_output = []
    filas_procesadas = 0
    filas_ignoradas = 0

    # Iterar sobre cada fila
    for index, row in df.iterrows():
        try:
            sql = generar_sql_perfiles(row)
            if sql:
                sql_output.append(sql)
                filas_procesadas += 1
            else:
                filas_ignoradas += 1
        except Exception as e:
            print(f"Advertencia: Error procesando fila {index}: {e}")

    # Guardar archivo EN PARTES (Chunking) para evitar límite de SQL Editor
    CHUNK_SIZE = 500 # Reducido a 500 para asegurar que pase en Supabase Editor
    
    # Dividir lista en trozos
    for i in range(0, len(sql_output), CHUNK_SIZE):
        chunk = sql_output[i : i + CHUNK_SIZE]
        part_num = (i // CHUNK_SIZE) + 1
        file_name = f'migracion_perfiles_parte_{part_num}.sql'
        
        with open(file_name, 'w', encoding='utf-8') as f:
            f.write("BEGIN;\n")
            f.write("\n".join(chunk))
            f.write("\nCOMMIT;")
            
        print(f"--> Generado: {file_name} ({len(chunk)} instrucciones)")
        
    print("-" * 40)
    print(f"PROCESO COMPLETADO")
    print(f"Total SQL Generado: {filas_procesadas}")
    print(f"Filas Ignoradas: {filas_ignoradas}")
    print("-" * 40)
    print("DESCARGA LOS ARCHIVOS 'migracion_perfiles_parte_X.sql' Y EJECÚTALOS EN ORDEN.")

except FileNotFoundError:
    print(f"ERROR: No se encontró el archivo '{ARCHIVO_CSV}'. Súbelo primero.")
except Exception as e:
    print(f"ERROR FATAL: {e}")
```

## 4. ¿Por qué esto es mejor para 1000 filas?
*   **Velocidad:** Tarda 2 segundos en vez de horas copiando/pegando a la IA.
*   **Consistencia:** Si decides cambiar que la "Serie 20" ahora es `SYS_20_V2`, cambias una línea en el código y regeneras todo. La IA puede olvidar instrucciones a mitad de camino.
*   **Soporte a Errores:** El script simplemente salta las filas "raras" (accesorios) y te deja concentrarte en migrar el grueso de los datos (Perfiles) primero.
