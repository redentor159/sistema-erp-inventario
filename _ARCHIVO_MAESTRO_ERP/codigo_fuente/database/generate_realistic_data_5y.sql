-- =================================================================================================
-- SCRIPT: GENERACIÓN DE DATA EXTENSIVA Y REALISTA (5 AÑOS) - MTO (Make To Order) - V3 (FINAL)
-- =================================================================================================
-- OBJETIVO: Poblar la base de datos con cotizaciones, detalles y movimientos históricos coherentes.
-- CORRECCIONES V3: 
-- 1. Usa `id_modelo` en cotizaciones_detalle (no id_sku).
-- 2. Genera movimientos de inventario independientes (simulando explosión de materiales).
-- 3. Usa `costo_mercado_unit` para precios.

DO $$
DECLARE
    -- Fechas
    v_fecha_inicio DATE := CURRENT_DATE - INTERVAL '5 years';
    v_fecha_actual DATE;
    v_dias_offset INT;
    
    -- Variables de Bucle
    v_cotizaciones_diarias INT;
    v_i INT;
    v_j INT;
    v_k INT;
    
    -- Datos Aleatorios
    v_cliente_id TEXT;
    v_vendedor_id UUID;
    v_sku_id TEXT;
    v_modelo_id TEXT;
    v_costo_base NUMERIC;
    v_precio_aprox NUMERIC;
    
    -- IDs Generados
    v_cotizacion_id UUID;
    
    -- Lógica de Negocio
    v_tipo_proyecto TEXT; -- 'PEQUENO', 'MEDIANO', 'GRANDE'
    v_probabilidad NUMERIC;
    v_estado_final TEXT;
    v_items_count INT;
    v_materiales_count INT;
    v_monto_total NUMERIC := 0;
    v_fecha_aprobacion TIMESTAMP;
    v_fecha_prometida DATE;
    v_fecha_entrega_real TIMESTAMP;
    
BEGIN
    -- Limpiar data generada previamente
    -- DELETE FROM trx_cotizaciones_cabecera WHERE observaciones LIKE '%[DATA-GEN]%';
    
    RAISE NOTICE 'Iniciando generación de datos MTO (V3)...';

    -- Bucle Principal: Día por día
    FOR v_dias_offset IN 0..1825 LOOP
        v_fecha_actual := v_fecha_inicio + v_dias_offset;
        
        -- Aleatoriedad de demanda diaria (0 a 3 proyectos)
        IF EXTRACT(MONTH FROM v_fecha_actual) IN (11, 12, 1) THEN
            v_cotizaciones_diarias := FLOOR(RANDOM() * 5); 
        ELSE
            v_cotizaciones_diarias := FLOOR(RANDOM() * 4); 
        END IF;

        IF v_cotizaciones_diarias > 0 THEN
            FOR v_i IN 1..v_cotizaciones_diarias LOOP
                
                -- 1. Determinar Tipo de Proyecto
                v_probabilidad := RANDOM();
                IF v_probabilidad < 0.60 THEN
                    v_tipo_proyecto := 'PEQUENO';
                    v_items_count := 1 + FLOOR(RANDOM() * 2);
                ELSIF v_probabilidad < 0.90 THEN
                    v_tipo_proyecto := 'MEDIANO'; 
                    v_items_count := 3 + FLOOR(RANDOM() * 5);
                ELSE
                    v_tipo_proyecto := 'GRANDE';
                    v_items_count := 8 + FLOOR(RANDOM() * 12);
                END IF;

                -- 2. Seleccionar Cliente Random
                SELECT id_cliente INTO v_cliente_id FROM mst_clientes ORDER BY RANDOM() LIMIT 1;
                SELECT id FROM auth.users LIMIT 1 INTO v_vendedor_id; 

                -- 3. Crear Cabecera Cotización
                v_cotizacion_id := uuid_generate_v4();
                
                -- Determinar Estado Final
                v_probabilidad := RANDOM();
                IF v_probabilidad < 0.10 THEN
                    v_estado_final := 'Borrador';
                    v_fecha_aprobacion := NULL;
                ELSIF v_probabilidad < 0.40 THEN
                    v_estado_final := 'Rechazada';
                    v_fecha_aprobacion := NULL;
                ELSE
                    v_estado_final := 'Finalizada';
                    v_fecha_aprobacion := v_fecha_actual + (FLOOR(RANDOM() * 5) || ' days')::INTERVAL;
                    
                    -- Plazos
                    IF v_tipo_proyecto = 'PEQUENO' THEN
                         v_fecha_prometida := (v_fecha_aprobacion + INTERVAL '6 days')::DATE;
                    ELSIF v_tipo_proyecto = 'MEDIANO' THEN
                         v_fecha_prometida := (v_fecha_aprobacion + INTERVAL '12 days')::DATE;
                    ELSE
                         v_fecha_prometida := (v_fecha_aprobacion + INTERVAL '25 days')::DATE;
                    END IF;
                    
                    -- Entrega Real (OTIF)
                    IF RANDOM() < 0.85 THEN
                        v_fecha_entrega_real := v_fecha_prometida - (FLOOR(RANDOM() * 2) || ' days')::INTERVAL; 
                    ELSE
                        v_fecha_entrega_real := v_fecha_prometida + (FLOOR(RANDOM() * 5) || ' days')::INTERVAL;
                    END IF;
                END IF;

                INSERT INTO trx_cotizaciones_cabecera (
                    id_cotizacion, fecha_emision, estado, id_cliente,
                    nombre_proyecto, moneda, validez_dias, 
                    plazo_entrega, condicion_pago,
                    fecha_aprobacion, fecha_prometida, fecha_entrega_real,
                    observaciones,
                    total_precio_venta, total_costo_directo
                ) VALUES (
                    v_cotizacion_id, v_fecha_actual, v_estado_final::estado_cotizacion, v_cliente_id,
                    CASE 
                        WHEN v_tipo_proyecto='PEQUENO' THEN 'Instalación Menor ' || v_i
                        WHEN v_tipo_proyecto='MEDIANO' THEN 'Remodelación ' || v_i
                        ELSE 'Proyecto Integral ' || v_i 
                    END,
                    'PEN', 15,
                    (v_fecha_prometida - v_fecha_aprobacion::DATE) || ' días hábiles',
                    '50% Anticipo, 50% Contraentega',
                    v_fecha_aprobacion, v_fecha_prometida, v_fecha_entrega_real,
                    '[DATA-GEN] Simulación Histórica',
                    0, 0
                );

                v_monto_total := 0;

                -- 4. Crear Detalles (Sistemas/Ventanas)
                FOR v_j IN 1..v_items_count LOOP
                    -- Seleccionar Modelo Random
                    v_modelo_id := (ARRAY['V-CORREDIZA-20', 'V-PROYECTANTE-38', 'V-FIJA-20', 'MAMPARA-25'])[FLOOR(RANDOM()*4)+1];
                    v_precio_aprox := 200 + FLOOR(RANDOM() * 800); -- Precio base del 'sistema'

                    INSERT INTO trx_cotizaciones_detalle (
                        id_cotizacion, 
                        id_modelo, -- OJO: No usamos id_sku aquí
                        cantidad,
                        ancho_mm, alto_mm,
                        costo_base_ref, subtotal_linea
                    ) VALUES (
                        v_cotizacion_id, 
                        v_modelo_id,
                        1 + FLOOR(RANDOM() * 5),
                        1000 + FLOOR(RANDOM() * 1000), 1000 + FLOOR(RANDOM() * 1000),
                        v_precio_aprox * 0.60, -- Costo ref
                        v_precio_aprox * (1 + FLOOR(RANDOM() * 5)) -- Subtotal
                    );
                    
                    v_monto_total := v_monto_total + (v_precio_aprox * (1 + FLOOR(RANDOM() * 5)));
                END LOOP;
                
                -- Actualizar Totales Cabecera
                UPDATE trx_cotizaciones_cabecera 
                SET total_precio_venta = v_monto_total,
                    total_costo_directo = v_monto_total * 0.65
                WHERE id_cotizacion = v_cotizacion_id;

                -- 5. SIMULAR Movimientos de Materiales (Solo si Finalizada)
                IF v_estado_final = 'Finalizada' THEN
                    
                    -- Decidimos cuántos materiales 'aleatorios' consumió este proyecto
                    v_materiales_count := v_items_count * 2; -- 2 materiales por items aprox

                    FOR v_k IN 1..v_materiales_count LOOP
                        -- Seleccionar SKU Real (Material)
                        SELECT id_sku, costo_mercado_unit 
                        INTO v_sku_id, v_costo_base 
                        FROM cat_productos_variantes 
                        ORDER BY RANDOM() LIMIT 1;

                        IF v_sku_id IS NOT NULL THEN
                             -- A. SALIDA DE ALMACÉN (Producción)
                            INSERT INTO trx_movimientos (
                                fecha_hora, tipo_movimiento, id_sku, cantidad, 
                                costo_unit_doc, costo_total_pen, comentarios, usuario_reg
                            ) VALUES (
                                v_fecha_aprobacion + INTERVAL '2 days',
                                'PRODUCCION',
                                v_sku_id,
                                (1 + FLOOR(RANDOM() * 5)) * -1, -- Cantidad Negativa
                                v_costo_base,
                                ((1 + FLOOR(RANDOM() * 5)) * -1) * v_costo_base,
                                '[DATA-GEN] Consumo Prod ' || v_cotizacion_id,
                                v_vendedor_id::text -- Cast UUID to text if needed, or likely text in schema
                            );

                            -- B. SIMULAR COMPRA PREVIA (Para que haya stock)
                            IF RANDOM() < 0.80 THEN
                                INSERT INTO trx_movimientos (
                                    fecha_hora, tipo_movimiento, id_sku, cantidad, 
                                    costo_unit_doc, costo_total_pen, comentarios, usuario_reg
                                ) VALUES (
                                    v_fecha_aprobacion - INTERVAL '10 days',
                                    'COMPRA', -- Fixed: ENTRADA does not exist in constraint
                                    v_sku_id,
                                    (5 + FLOOR(RANDOM() * 10)), -- Entrada positiva
                                    v_costo_base,
                                    (5 + FLOOR(RANDOM() * 10)) * v_costo_base,
                                    '[DATA-GEN] Compra Reposición',
                                    v_vendedor_id::text
                                );
                            END IF;
                        END IF;
                    END LOOP;
                END IF; -- Fin Finalizada

            END LOOP; -- Fin loop diario de cotizaciones
        END IF; 

    END LOOP; -- Fin loop 5 años

    RAISE NOTICE 'Generación V3 completada exitosamente.';
END $$;
