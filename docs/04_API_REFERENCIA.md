# 04 — Referencia de API (Client-Side)

> **Ubicación:** `lib/api/`  
> **Patrón:** Todas las APIs son objetos exportados con métodos `async` que llaman directamente a Supabase desde el navegador.  
> **Última actualización:** 2026-03-23

## Documentos Relacionados

- [02_ESQUEMA_BASE_DATOS.md](./02_ESQUEMA_BASE_DATOS.md) — Tablas y vistas consultadas
- [03_MODULOS_Y_FUNCIONALIDADES.md](./03_MODULOS_Y_FUNCIONALIDADES.md) — Módulos que consumen estas APIs
- [09_DICCIONARIO_DATOS.md](./09_DICCIONARIO_DATOS.md) — Estructura de datos retornados

---

## Índice de Servicios API

| Archivo | Objeto Exportado | Módulo | Métodos |
|---------|-----------------|--------|---------|
| `cat.ts` | `catApi` | Catálogo | 14 |
| `trx.ts` | `trxApi` | Inventario/Kardex | 9 |
| `cotizaciones.ts` | `cotizacionesApi` | Cotizaciones | 19 |
| `recetas.ts` | `recetasApi` | Recetas Ingeniería | 16 |
| `kanban.ts` | `kanbanApi` | Producción | ~8 |
| `dashboard.ts` | `dashboardApi` | Dashboard KPI | ~4 |
| `config.ts` | `configApi` | Configuración | 2 |
| `mst.ts` | `mstApi` | Maestros (Clientes/Prov) | ~6 |
| `mto.ts` | `mtoApi` | Cotización auxiliar | ~4 |
| `retazos.ts` | `retazosApi` | Retazos | ~4 |

---

## 1. `catApi` — Catálogo de Productos

**Archivo:** [`lib/api/cat.ts`](../lib/api/cat.ts)

### Plantillas

| Método | Parámetros | Retorno | Descripción |
|--------|-----------|---------|-------------|
| `getPlantillas()` | — | `CatPlantilla[]` | Lista todas las plantillas con familia y sistema |
| `createPlantilla(data)` | `PlantillaForm` | `CatPlantilla` | Crea una plantilla genérica |
| `updatePlantilla(id, data)` | `string, Partial<PlantillaForm>` | `CatPlantilla` | Actualiza una plantilla |
| `deletePlantilla(id)` | `string` | `void` | Elimina una plantilla |

### Productos / SKUs

| Método | Parámetros | Retorno | Descripción |
|--------|-----------|---------|-------------|
| `getProductos(filters?)` | `{page, pageSize, search, familia, marca, material, sistema, acabado}` | `{data, count}` | Lista paginada con filtros |
| `getProductoBySku(id)` | `string` | `CatProductoVariante` | Detalle completo de un SKU |
| `createProducto(data)` | `ProductoVarianteForm` | `CatProductoVariante` | Crea un SKU nuevo |
| `updateProducto(old_sku, data)` | `string, Partial` | `CatProductoVariante` | Actualiza (puede cambiar SKU) |
| `deleteProducto(id)` | `string` | `void` | Elimina un SKU |
| `updatePrecioMercado(id, precio)` | `string, number` | `void` | Actualiza costo unitario de mercado |
| `updatePreciosMasivos(updates)` | `{id_sku, costo}[]` | `void` | Actualización masiva de precios |

### Auxiliares

| Método | Retorno | Descripción |
|--------|---------|-------------|
| `getFamilias()` | `MstFamilia[]` | Lista de familias |
| `getMarcas()` | `MstMarca[]` | Lista de marcas |
| `getMateriales()` | `MstMaterial[]` | Lista de materiales |
| `getAcabados()` | `MstAcabado[]` | Lista de acabados/colores |
| `getSistemas()` | `MstSerieEquivalencia[]` | Lista de series/sistemas |

---

## 2. `trxApi` — Transacciones e Inventario

**Archivo:** [`lib/api/trx.ts`](../lib/api/trx.ts)

| Método | Parámetros | Retorno | Descripción |
|--------|-----------|---------|-------------|
| `getMovimientos(filters?)` | `{search, tipo, from, to, limit, offset}` | `{data, count}` | Kardex paginado con filtros |
| `getStockRealtime()` | — | `StockRow[]` | Consulta `vw_stock_realtime` |
| `createEntrada(data)` | `EntradaForm` | `Header` | Crea compra (cabecera + líneas). **Trigger auto-Kardex** |
| `getEntradas(filters?)` | `{search}` | `Entrada[]` | Lista de compras con proveedor |
| `createSalida(data)` | `SalidaForm` | `Header` | Crea despacho (cabecera + líneas). **Trigger auto-Kardex** |
| `getSalidas(filters?)` | `{search, fecha}` | `Salida[]` | Lista de salidas |
| `getEntradaDetalles(id)` | `string` | `Detalle[]` | Líneas de una compra |
| `getSalidaDetalles(id)` | `string` | `Detalle[]` | Líneas de una salida |

---

## 3. `cotizacionesApi` — Motor de Cotizaciones

**Archivo:** [`lib/api/cotizaciones.ts`](../lib/api/cotizaciones.ts)

### CRUD Principal

| Método | Descripción |
|--------|-------------|
| `getCotizaciones()` | Lista todas con cliente y totales calculados |
| `getCotizacionById(id)` | Detalle completo con líneas enriquecidas y desglose |
| `createCotizacion(data)` | Crea cabecera con config default |
| `updateCotizacion(id, updates)` | Actualiza campos de cabecera |
| `deleteCotizacion(id)` | Elimina cotización y cascada |

### Gestión de Ítems

| Método | Descripción |
|--------|-------------|
| `addLineItem(idCot, item)` | Agrega ventana/ítem a la cotización |
| `updateLineItems(ids, updates)` | Actualización masiva de ítems |
| `deleteLineItem(id)` | Elimina un ítem |
| `clonarItem(id)` | Clona un ítem dentro de la misma cotización |
| `clonarCotizacion(id)` | Clona toda la cotización |

### Motor de Despiece (BOM)

| Método | Descripción |
|--------|-------------|
| `triggerDespiece(idLinea)` | **Ejecuta el motor de ingeniería** vía RPC para generar el BOM |
| `getDesgloseMateriales(idLinea)` | Obtiene el desglose de una línea |
| `getReporteDesglose(idCot)` | Reporte completo de ingeniería |
| `addDesgloseItem(item)` | Agrega componente manual |
| `updateDesgloseItem(id, updates)` | Edita un componente del despiece |
| `deleteDesgloseItem(id)` | Elimina un componente |
| `setManualFlag(idLinea, bool)` | Marca línea como despiece manual |

### Estado y Workflow

| Método | Descripción |
|--------|-------------|
| `updateEstado(id, estado, motivo?)` | Cambia estado con auditoría de fechas |

---

## 4. `recetasApi` — Recetas de Ingeniería

**Archivo:** [`lib/api/recetas.ts`](../lib/api/recetas.ts)

### Modelos

| Método | Descripción |
|--------|-------------|
| `getModelos()` | Lista todos los modelos con sistema |
| `getModeloById(id)` | Detalle de un modelo |
| `createModelo(data)` | Crea nuevo modelo |
| `updateModelo(id, updates)` | Actualiza modelo |
| `deleteModelo(id)` | Elimina modelo y sus recetas |
| `clonarModelo(id, nuevo_id, nombre)` | Clona modelo con todas sus líneas |

### Líneas de Receta (BOM)

| Método | Descripción |
|--------|-------------|
| `getRecetasByModelo(id)` | Obtiene las líneas de receta de un modelo |
| `createRecetaLinea(data)` | Crea line de receta con fórmulas |
| `updateRecetaLinea(id, updates)` | Actualiza componente |
| `deleteRecetaLinea(id)` | Elimina componente |
| `getAllRecetasConCatalogInfo()` | **Auditoría masiva**: Todas las recetas con precios |
| `getAccesoriosConPrecio(id)` | Accesorios con precios de catálogo |

---

## 5. Patrón de Uso con TanStack Query

Todas las APIs se consumen en los componentes mediante `useQuery` y `useMutation`:

```typescript
// Ejemplo: Obtener stock en tiempo real
const { data: stock, isLoading } = useQuery({
    queryKey: ['stock-realtime'],
    queryFn: () => trxApi.getStockRealtime()
})

// Ejemplo: Crear una entrada (compra)
const mutation = useMutation({
    mutationFn: (data: EntradaForm) => trxApi.createEntrada(data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['stock-realtime'] })
        queryClient.invalidateQueries({ queryKey: ['movimientos'] })
    }
})
```

---

## 6. `kanbanApi` — Producción Kanban

**Archivo:** [`lib/api/kanban.ts`](../lib/api/kanban.ts)

> **⚠️ Aislamiento:** Todas las operaciones Kanban son independientes del ERP. No hay FK a `mst_clientes` ni `trx_cotizaciones_cabecera`.

| Método | Parámetros | Descripción |
|--------|-----------|-------------|
| `getBoard()` | — | Todas las órdenes activas (`trx_kanban_orders`) |
| `createOrder(order)` | `KanbanOrder` | Crea nueva orden en `column-pedidos-confirmados` |
| `updateOrder(id, updates)` | `string, Partial` | Edita campos de una orden |
| `moveCard(id, col, idx)` | `string, string, number` | Mueve a columna. Detecta rework automáticamente si va hacia atrás |
| `archiveOrder(id, status, col)` | `string, string, string` | Archiva vía `fn_archive_kanban_order` RPC |
| `archiveAllFinished()` | — | Archiva batch vía `fn_archive_kanban_batch` RPC |
| `getHistory()` | — | Historial archivado (`trx_kanban_history`) |
| `getConfig()` | — | Configuración (`mst_kanban_config.main_config`) |
| `updateConfig(settings)` | `{wip_limits}` | Actualiza límites WIP |
| `generateDemoData()` | — | Genera 500 registros históricos de prueba |

---

## 7. `dashboardApi` — Dashboard KPI

**Archivo:** [`lib/api/dashboard.ts`](../lib/api/dashboard.ts)

| Método | Vista/Fuente | Descripción |
|--------|-------------|-------------|
| `getKPIs()` | Múltiples `vw_kpi_*` | Obtiene todos los KPIs: conversión, ticket, margen, OTIF |
| `getTopProductos()` | `vw_kpi_top_productos` | Top 10 productos vendidos |
| `getStockValorizado()` | `vw_kpi_valorizacion` | Valor total de inventario PEN/USD |
| `getStockZombie()` | `vw_kpi_stock_zombie` | Stock inmovilizado 90+ días |

---

## 8. `configApi` — Configuración General

**Archivo:** [`lib/api/config.ts`](../lib/api/config.ts)

| Método | Descripción |
|--------|-------------|
| `getConfig()` | Obtiene todos los parámetros de `mst_config_general` |
| `updateConfig(data)` | Actualiza parámetros globales (IGV, markup, tipo cambio, etc.) |

---

## 9. Funciones RPC (llamadas vía `supabase.rpc()`)

Estas funciones PostgreSQL se invocan directamente desde el frontend:

### Motor de Cotización

| Función | Llamada por | Propósito |
|---------|------------|--------|
| `fn_crear_cotizacion_mto()` | `cotizacionesApi.createCotizacion()` | Crea cabecera + detalles + despiece en 1 transacción |
| `fn_agregar_linea_cotizacion()` | `cotizacionesApi.addLineItem()` | Inserta línea + auto-despiece |
| `fn_generar_despiece_ingenieria()` | `cotizacionesApi.triggerDespiece()` | Motor BOM: evalúa fórmulas, resuelve SKUs, calcula costos |
| `fn_evaluar_formula()` | Interna (usada por despiece) | Evaluador seguro de fórmulas matemáticas |
| `fn_calcular_sku_real()` | Interna (usada por despiece) | Resolución dinámica de código SKU |
| `fn_clonar_cotizacion()` | `cotizacionesApi.clonarCotizacion()` | Duplica cotización completa |
| `fn_clonar_item_cotizacion()` | `cotizacionesApi.clonarItem()` | Duplica un ítem individual |

### Producción

| Función | Llamada por | Propósito |
|---------|------------|--------|
| `fn_archive_kanban_order()` | `kanbanApi.archiveOrder()` | Mueve orden a historial y elimina del tablero |
| `fn_archive_kanban_batch()` | `kanbanApi.archiveAllFinished()` | Archiva todas las órdenes de `column-finalizado` |

### Inventario

| Función | Propósito |
|---------|--------|
| `rename_sku()` | Renombra SKU con propagación cascada a movimientos, entradas, salidas, desglose, retazos |
| `update_costos_mercado_bulk()` | Actualización masiva de `costo_mercado_unit` desde JSON |
| `fn_refresh_stock_materializada()` | Refresh concurrente de `mvw_stock_realtime` |

### Análisis

| Función | Propósito |
|---------|--------|
| `get_abc_analysis_v2(p_dias)` | Análisis ABC parametrizado por ventana temporal |
| `get_abc_inventory_valuation()` | Clasificación ABC por valor de inventario actual |

### Administración

| Función | Propósito |
|---------|--------|
| `get_user_role()` | Retorna el rol del usuario autenticado (`SECURITY DEFINER`) |
| `fn_reset_erp_transactions()` | **Danger Zone:** Purga transacciones ERP |
| `fn_reset_kanban_data()` | **Danger Zone:** Purga datos Kanban |
