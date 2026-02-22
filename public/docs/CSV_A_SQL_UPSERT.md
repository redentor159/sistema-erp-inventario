
# HERRAMIENTA DE IMPORTACIÓN: CSV LIMPIO -> SQL (FORZAR SOBREESCRITURA)

**Usa esta opción SI YA TIENES tus archivos CSV con los nombres de columna correctos de la base de datos (id_plantilla, nombre_generico, etc.).**

Esta herramienta toma tu CSV y genera un archivo SQL que **OBLIGA** a la base de datos a actualizar los datos si ya existen, sin dar error de duplicado.

### Instrucciones para Google Colab

Copia y pega este código en una celda de Colab.

```python
import pandas as pd
import numpy as np

# ==========================================
# CONFIGURACIÓN
# ==========================================

# 1. Nombre de tu archivo CSV (Súbelo a Colab primero)
ARCHIVO_CSV = "plantillas_limpias.csv" 

# 2. Nombre de la Tabla en Base de Datos
NOMBRE_TABLA = "cat_plantillas" 

# 3. Nombre de la Llave Primaria (Columna ID que no debe duplicarse)
LLAVE_PRIMARIA = "id_plantilla"

# 4. Limitador de filas por archivo (para evitar error de tamaño en Supabase)
CHUNK_SIZE = 500 

# ==========================================
# CÓDIGO GENERADOR
# ==========================================

def generar_sql_upsert(csv_path, table_name, pk_col, chunk_size=500):
    try:
        # Leer CSV detectando encoding
        try:
            df = pd.read_csv(csv_path, encoding='utf-8')
        except:
            df = pd.read_csv(csv_path, encoding='latin-1')
            
        columns = list(df.columns)
        print(f"Columnas detectadas: {columns}")
        
        sql_statements = []
        
        for index, row in df.iterrows():
            # Construir valores
            vals = []
            for col in columns:
                val = row[col]
                if pd.isna(val) or str(val).strip() == '':
                    vals.append("NULL")
                elif isinstance(val, (int, float)):
                    vals.append(str(val))
                else:
                    # Escapar comillas simples
                    clean_val = str(val).replace("'", "''") 
                    vals.append(f"'{clean_val}'")
            
            # Construir UPDATE SET clause para el ON CONFLICT
            # Excluimos la llave primaria del Update
            update_cols = [c for c in columns if c != pk_col]
            if not update_cols:
                # Si solo tiene 1 columna (la llave), no hay nada que actualizar -> DO NOTHING
                conflict_action = "DO NOTHING"
            else:
                set_clauses = [f"{col} = EXCLUDED.{col}" for col in update_cols]
                conflict_action = f"DO UPDATE SET {', '.join(set_clauses)}"

            # Armar INSERT completo
            cols_str = ", ".join(columns)
            vals_str = ", ".join(vals)
            
            sql = f"INSERT INTO {table_name} ({cols_str}) VALUES ({vals_str}) ON CONFLICT ({pk_col}) {conflict_action};"
            sql_statements.append(sql)
            
        # Guardar en Archivos
        total_files = 0
        for i in range(0, len(sql_statements), chunk_size):
            chunk = sql_statements[i : i + chunk_size]
            part_num = (i // chunk_size) + 1
            out_name = f"upsert_{table_name}_parte_{part_num}.sql"
            
            with open(out_name, 'w', encoding='utf-8') as f:
                f.write("BEGIN;\n")
                f.write("\n".join(chunk))
                f.write("\nCOMMIT;")
                
            print(f"--> Archivo generado: {out_name} ({len(chunk)} filas)")
            total_files += 1
            
        print("-" * 30)
        print(f"¡ÉXITO! Generados {total_files} archivos SQL.")
        print("Descárgalos y ejecútalos en Supabase.")

    except Exception as e:
        print(f"ERROR: {e}")

# EJECUTAR
generar_sql_upsert(ARCHIVO_CSV, NOMBRE_TABLA, LLAVE_PRIMARIA, CHUNK_SIZE)
```
