# 04 — Referencia de API (Client-Side)

> **Ubicación:** `lib/api/`  
> **Patrón:** Todas las APIs son objetos exportados con métodos `async` que llaman directamente a Supabase desde el navegador.  
> **Última actualización:** 2026-02-21

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
