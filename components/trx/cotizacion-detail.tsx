"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { cotizacionesApi } from "@/lib/api/cotizaciones"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Trash2, Plus, ArrowLeft, Printer, RefreshCw, Save, Loader2, Calculator, Copy, Pencil, FileText, ChevronRight, ChevronDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { ClientCombobox } from "./client-combobox"
import { DespiecePreview } from "@/components/trx/despiece-preview"
import { CotizacionItemDialog } from "./cotizacion-item-dialog"
import { CatalogSkuSelector } from "@/components/mto/catalog-sku-selector"
import { recetasApi } from "@/lib/api/recetas"
import { CotizacionDetallada, CotizacionDetalleEnriquecido } from "@/types/cotizaciones"
import { MstCliente, MstMarca, MstAcabado, CatProductoVariante } from "@/types"
import { useToast } from "@/components/ui/use-toast"

import { CotizacionDespieceDialog } from "./cotizacion-despiece-dialog"

export function CotizacionDetail({ id }: { id: string }) {
    const router = useRouter()
    const { toast } = useToast()
    const [cotizacion, setCotizacion] = useState<CotizacionDetallada | null>(null)
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<CotizacionDetalleEnriquecido[]>([])

    // Header Data
    const [clientes, setClientes] = useState<MstCliente[]>([])
    const [marcas, setMarcas] = useState<MstMarca[]>([])
    const [acabados, setAcabados] = useState<any[]>([]) // Using any for simplicity or MstAcabado
    const [vidrios, setVidrios] = useState<any[]>([])

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)

    // Row Expansion State
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

    const toggleRow = (id: string) => {
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }))
    }

    // Bulk Actions & Selection
    const [selectedItems, setSelectedItems] = useState<string[]>([])

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(items.map(i => i.id_linea_cot))
        } else {
            setSelectedItems([])
        }
    }

    const handleToggleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedItems(prev => [...prev, id])
        } else {
            setSelectedItems(prev => prev.filter(i => i !== id))
        }
    }

    // Handlers
    async function handleCloneCotizacion() {
        if (!confirm("¿Duplicar esta cotización?")) return
        try {
            const newId = await cotizacionesApi.clonarCotizacion(id)
            toast({
                title: "Éxito",
                description: "Cotización duplicada correctamente"
            })
            router.push(`/cotizaciones/${newId}`)
        } catch (e) {
            console.error(e)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo duplicar la cotización"
            })
        }
    }

    async function handleCloneItem(idLinea: string) {
        try {
            await cotizacionesApi.clonarItem(idLinea)
            toast({
                title: "Ítem duplicado",
                description: "El ítem se ha duplicado correctamente"
            })
            load()
        } catch (e) {
            console.error(e)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo clonar el ítem"
            })
        }
    }

    async function handleBulkUpdate(updates: any) {
        if (!confirm(`¿Actualizar ${selectedItems.length} ítems?`)) return
        try {
            setLoading(true)
            await cotizacionesApi.updateLineItems(selectedItems, updates)
            // Refresh to update prices if needed (despiece might need regen? 
            // Update only updates columns. To regen despiece we might need to trigger it for all.
            // For now let's just reload. Despiece might use OLD values if not re-triggered.
            // Logic improvement: allow API to trigger despiece after update.
            // But for now color change doesn't always affect despiece price unless it's a different price?
            // Yes it does. "Color" implies different material SKU.
            // We should loop and trigger despiece? 
            // Or `updateLineItems` API could trigger it?
            // The API I wrote is just a simple update.
            // I'll stick to simple update for now, but warned user in prompt "Recalculando...".
            // Actually, color change REQUIRES despiece recalc to find new profiles.

            // Ejecutar despiece en paralelo para mejor performance
            await Promise.all(
                selectedItems.map(id => cotizacionesApi.triggerDespiece(id))
            )

            // Wait for DB propagation
            await new Promise(r => setTimeout(r, 800))

            await load()
            setSelectedItems([])
            toast({
                title: "Éxito",
                description: `${selectedItems.length} ítems actualizados correctamente`
            })
        } catch (e) {
            console.error(e)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron actualizar los ítems"
            })
        } finally {
            setLoading(false)
        }
    }


    // Reload function
    async function handleDeleteItem(idLinea: string) {
        if (!confirm("¿Seguro que desea eliminar este ítem?")) return
        try {
            await cotizacionesApi.deleteLineItem(idLinea)
            toast({ title: "Eliminado", description: "Ítem eliminado correctamente" })
            load()
        } catch (e) {
            console.error(e)
            toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el ítem" })
        }
    }

    async function handleItemSaved(itemData: any) {
        // Distinguish between Create and Update and Service
        try {
            if (itemData._type === 'SERVICE_DONE') {
                // Already handled in dialog
                load()
                return
            }

            if (itemData._isUpdate && editingItem) {
                // UPDATE PRODUCT
                // itemData contains all form fields. 
                // We need to map them to database columns if names match.
                // Dialog uses: id_modelo, color_perfiles, cantidad, ancho_mm, alto_mm, tipo_vidrio, etiqueta_item, ubicacion...

                await cotizacionesApi.updateLineItems([editingItem.id_linea_cot], {
                    id_modelo: itemData.id_modelo,
                    color_perfiles: itemData.color_perfiles,
                    cantidad: itemData.cantidad,
                    ancho_mm: itemData.ancho_mm,
                    alto_mm: itemData.alto_mm,
                    tipo_vidrio: itemData.tipo_vidrio,
                    etiqueta_item: itemData.etiqueta_item,
                    ubicacion: itemData.ubicacion,
                    tipo_cierre: itemData.tipo_cierre,
                    opciones_seleccionadas: itemData.opciones_seleccionadas
                })

                // Trigger despiece to recalc
                await cotizacionesApi.triggerDespiece(editingItem.id_linea_cot)

                // Brief delay to ensure DB propagation before fetch
                await new Promise(r => setTimeout(r, 800))

                toast({ title: "Actualizado", description: "Ítem actualizado correctamente" })
                load()

            } else {
                // CREATE PRODUCT
                const newLine = await cotizacionesApi.addLineItem(id, itemData)
                await cotizacionesApi.triggerDespiece(newLine.id_linea_cot)

                // Brief delay to ensure DB propagation
                await new Promise(r => setTimeout(r, 800))

                toast({ title: "Agregado", description: "Ítem agregado correctamente" })
                load()
            }
        } catch (e) {
            console.error(e)
            toast({ variant: "destructive", title: "Error", description: "Error al guardar ítem" })
        }
    }

    // Reload function
    async function load() {
        setLoading(true)
        try {
            console.log("Cargando datos cotización...", id)

            // 1. Fetch Cotizacion
            let quoteData = null
            try {
                quoteData = await cotizacionesApi.getCotizacionById(id)
            } catch (err: any) {
                console.error("Error fetching cotizacion:", err)
                // If it's a 406 or similar from single(), it means not found
                if (err.code === 'PGRST116') {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Cotización no encontrada o eliminada"
                    })
                    router.push('/cotizaciones')
                    return
                }
                throw err
            }

            setCotizacion(quoteData)
            setItems(quoteData.detalles || [])

            // 2. Fetch Master Data (Non-critical locally handled)
            try {
                const clientsData = await cotizacionesApi.getClientes()
                setClientes(clientsData || [])
            } catch (err) {
                console.error("Error fetching clients:", err)
            }

            try {
                const brandsData = await cotizacionesApi.getMarcas()
                setMarcas(brandsData || [])
            } catch (err) {
                console.error("Error fetching brands:", err)
            }

            try {
                const colorsData = await cotizacionesApi.getAcabados()
                setAcabados(colorsData || [])
            } catch (err) { console.error(err) }

            try {
                const vidriosData = await cotizacionesApi.getVidrios()
                setVidrios(vidriosData || [])
            } catch (err) { console.error(err) }

        } catch (e: any) {
            console.error("Error General Load:", e)
            toast({
                variant: "destructive",
                title: "Error",
                description: `Error cargando cotización: ${e.message || 'Error desconocido'}`
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        if (!cotizacion) return
        try {
            await cotizacionesApi.updateCotizacion(id, {
                nombre_proyecto: cotizacion.nombre_proyecto,
                id_cliente: cotizacion.id_cliente,
                id_marca: cotizacion.id_marca,
                costo_fijo_instalacion: cotizacion.costo_fijo_instalacion || 0,
                costo_mano_obra_m2: cotizacion.costo_mano_obra_m2 || 0,
                incluye_igv: cotizacion.incluye_igv,
                fecha_prometida: cotizacion.fecha_prometida,
                markup_aplicado: cotizacion.markup_aplicado ?? 0.35
            })

            // Al guardar el header, también debemos recalcular el despiece de las líneas para reflejar el nuevo markup
            if (items && items.length > 0) {
                toast({ title: "Recalculando...", description: "Actualizando todos los ítems con el nuevo margen" })
                await Promise.all(
                    items.map(i => cotizacionesApi.triggerDespiece(i.id_linea_cot))
                )
                // Brief delay to ensure DB propagation
                await new Promise(r => setTimeout(r, 800))
            }

            toast({
                title: "Guardado",
                description: "Los cambios se guardaron correctamente"
            })
            load() // Reload to get fresh view data
        } catch (e) {
            console.error(e)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron guardar los cambios"
            })
        }
    }

    useEffect(() => {
        load()
        load()
    }, [id])

    // --- Dynamic Options Logic (Brazo, etc) ---
    const { data: recetasOptions } = useQuery({
        queryKey: ["recetasOptions"],
        queryFn: recetasApi.getRecetasOptions
    })

    const recipesOptionsByModel = React.useMemo(() => {
        if (!recetasOptions) return {}
        const grouped: Record<string, Record<string, any[]>> = {}

        recetasOptions.forEach((r: any) => {
            if (!grouped[r.id_modelo]) grouped[r.id_modelo] = {}
            if (!grouped[r.id_modelo][r.grupo_opcion]) grouped[r.id_modelo][r.grupo_opcion] = []
            grouped[r.id_modelo][r.grupo_opcion].push(r)
        })
        return grouped
    }, [recetasOptions])

    const handleOptionChange = async (item: CotizacionDetalleEnriquecido, grupo: string, sku: string) => {
        try {
            const currentOptions = item.opciones_seleccionadas || {}
            const newOptions = { ...currentOptions, [grupo]: sku }

            // Optimistic update (optional, but load() refreshes anyway)
            // await cotizacionesApi.updateLineItemOption(item.id_linea_cot, newOptions) // Hypothetical

            await cotizacionesApi.updateLineItems([item.id_linea_cot], {
                opciones_seleccionadas: newOptions
            })

            toast({ title: "Opción Actualizada", description: "Se guardó la selección correctamente." })

            // Trigger despiece recalculation logic if needed? 
            // Usually options imply price change if they map to SKUs.
            // But despiece needs to know about it. 
            // The Despiece logic reads opciones_seleccionadas JSONB.

            await cotizacionesApi.triggerDespiece(item.id_linea_cot)
            load()

        } catch (e) {
            console.error(e)
            toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la opción" })
        }
    }

    async function handleRefreshCalculations(idLinea: string) {
        toast({ title: "Recalculando...", description: "Actualizando ingeniería del ítem." })
        await cotizacionesApi.triggerDespiece(idLinea)

        // Wait for DB propagation
        await new Promise(r => setTimeout(r, 800))

        await load()
        toast({ title: "Actualizado", description: "Precios actualizados." })
    }

    if (loading) return <div>Cargando detalle...</div>
    if (!cotizacion) return <div>No encontrado</div>

    return (
        <div className="flex flex-col gap-4 pb-12">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">{cotizacion.nombre_proyecto}</h2>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                            <span>{cotizacion.id_cotizacion}</span>
                        </div>

                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Select
                        value={cotizacion.estado}
                        onValueChange={async (newVal) => {
                            let confirmMsg = `¿Cambiar estado a ${newVal}?`
                            if (newVal === 'Finalizada') confirmMsg = "¿Confirmar ENTREGA FINAL y registrar fecha de hoy?"

                            if (!confirm(confirmMsg)) return

                            let motivo = undefined
                            if (newVal === 'Rechazada') {
                                motivo = prompt("Motivo del rechazo (Opcional):") || undefined
                            }

                            try {
                                await cotizacionesApi.updateEstado(id, newVal, motivo)
                                toast({ title: "Estado Actualizado", description: `La cotización ahora está ${newVal}` })
                                load()
                            } catch (e: any) {
                                console.error(e)
                                toast({ variant: "destructive", title: "Error", description: "No se pudo cambiar el estado" })
                            }
                        }}
                    >
                        <SelectTrigger className="w-[140px] h-9 bg-background border-input text-foreground font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Borrador">Borrador</SelectItem>
                            <SelectItem value="Aprobada">Aprobada</SelectItem>
                            <SelectItem value="Rechazada">Rechazada</SelectItem>
                            <SelectItem value="Finalizada">Finalizada (Entregada)</SelectItem>
                            <SelectItem value="Anulada">Anulada</SelectItem>
                        </SelectContent>
                    </Select>
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    <Button variant="outline" onClick={handleCloneCotizacion}>
                        <Copy className="mr-2 h-4 w-4" /> Duplicar Cotización
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/cotizaciones/${id}/print`)}>
                        <Printer className="mr-2 h-4 w-4" /> Imprimir
                    </Button>
                    <CotizacionDespieceDialog idCotizacion={id} />
                    <Button variant="outline" onClick={() => load()}>Refrescar</Button>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedItems.length > 0 && (
                <div className="bg-muted/50 p-2 rounded-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 flex-wrap">
                    <span className="text-sm font-medium ml-2">{selectedItems.length} seleccionados</span>
                    <Separator orientation="vertical" className="h-6" />

                    <Select onValueChange={(val) => handleBulkUpdate({ color_perfiles: val })}>
                        <SelectTrigger className="w-[180px] h-8">
                            <SelectValue placeholder="Cambiar Color" />
                        </SelectTrigger>
                        <SelectContent>
                            {acabados.map((a: any) => (
                                <SelectItem key={a.id_acabado} value={a.id_acabado}>{a.nombre_acabado}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select onValueChange={(val) => handleBulkUpdate({ tipo_vidrio: val })}>
                        <SelectTrigger className="w-[200px] h-8">
                            <SelectValue placeholder="Cambiar Vidrio" />
                        </SelectTrigger>
                        <SelectContent>
                            {vidrios.map((v: any) => (
                                <SelectItem key={v.id_sku} value={v.id_sku}>{v.nombre_completo}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button size="sm" variant="secondary" onClick={() => {
                        alert("La MARCA se define a nivel global de la cotización (panel izquierdo).\nNo es posible mezclar marcas en una misma cotización por ahora.")
                    }}>
                        Cambiar Marca
                    </Button>

                    <div className="flex-1" />
                    <Button size="sm" variant="ghost" onClick={() => setSelectedItems([])}>Cancelar</Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Panel: General Info */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Nombre del Proyecto</Label>
                            <Input
                                value={cotizacion.nombre_proyecto || ''}
                                onChange={(e) => setCotizacion({ ...cotizacion, nombre_proyecto: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Cliente</Label>
                            <ClientCombobox
                                value={cotizacion.id_cliente}
                                onChange={(val) => setCotizacion({ ...cotizacion, id_cliente: val })}
                                clientes={clientes}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Marca / Sistema</Label>
                            <Select
                                value={cotizacion.id_marca ?? undefined}
                                onValueChange={(val) => setCotizacion({ ...cotizacion, id_marca: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar Marca" />
                                </SelectTrigger>
                                <SelectContent>
                                    {marcas.map((m) => (
                                        <SelectItem key={m.id_marca} value={m.id_marca}>
                                            {m.nombre_marca}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Fecha Prometida de Entrega</Label>
                            <Input
                                type="date"
                                value={cotizacion.fecha_prometida ? new Date(cotizacion.fecha_prometida).toISOString().split('T')[0] : ''}
                                onChange={(e) => setCotizacion({ ...cotizacion, fecha_prometida: e.target.value ? new Date(e.target.value).toISOString() : null })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Costo Mano de Obra (S/ por m²)</Label>
                            <Input
                                type="number"
                                step="1"
                                min={0}
                                placeholder="Ej. 50"
                                value={cotizacion.costo_mano_obra_m2 ?? ""}
                                onChange={(e) => setCotizacion({ ...cotizacion, costo_mano_obra_m2: Number(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-muted-foreground">Costo aplicado por metro cuadrado de cada ítem.</p>
                        </div>
                        <div className="grid gap-2">
                            <Label>Servicios de Instalación (Opcional)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min={0}
                                placeholder="Monto fijo para todo el proyecto"
                                value={cotizacion.costo_fijo_instalacion ?? ""}
                                onChange={(e) => setCotizacion({ ...cotizacion, costo_fijo_instalacion: Number(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-muted-foreground">Incluye: Embalaje, Flete, Movilidad, Viáticos</p>
                        </div>
                        <div className="flex items-center gap-2 py-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="incluye_igv"
                                    checked={cotizacion.incluye_igv}
                                    onCheckedChange={(c) => setCotizacion({ ...cotizacion, incluye_igv: c as boolean })}
                                />
                                <Label htmlFor="incluye_igv">Incluye IGV en Precio Final</Label>
                            </div>
                        </div>
                        <Separator />

                        <div className="grid gap-2">
                            <Label>Margen de Ganancia (Markup %)</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={cotizacion.markup_aplicado ?? 0}
                                    onChange={(e) => setCotizacion({ ...cotizacion, markup_aplicado: parseFloat(e.target.value) || 0 })}
                                />
                                <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                                    {((cotizacion.markup_aplicado || 0) * 100).toFixed(0)}%
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Margen aplicado a los costos directos</p>
                        </div>

                        <div className="grid gap-2">
                            <Label>Subtotal (PEN)</Label>
                            <div className="text-xl font-mono text-slate-700">
                                {formatCurrency(cotizacion._vc_precio_final_cliente / 1.18)}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>IGV (18%)</Label>
                            <div className="text-xl font-mono text-slate-700">
                                {formatCurrency(cotizacion._vc_precio_final_cliente - (cotizacion._vc_precio_final_cliente / 1.18))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>
                                Precio Cliente ({cotizacion.incluye_igv ? 'Inc. IGV' : 'Sin IGV'})
                            </Label>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(cotizacion._vc_precio_final_cliente)}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Panel: Items & Engineering */}
                <Card className="md:col-span-2 flex flex-col h-auto">
                    <CardHeader className="flex flex-row items-center justify-between py-3">
                        <CardTitle>Ítems de Cotización</CardTitle>
                        <Button onClick={() => {
                            setEditingItem(null)
                            setIsDialogOpen(true)
                        }}>
                            <Plus className="mr-2 h-4 w-4" /> Agregar Ítem
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="bg-muted sticky top-0 z-10">
                                <tr className="text-left border-b">
                                    <th className="p-3 w-[40px]">
                                        <Checkbox
                                            checked={selectedItems.length === items.length && items.length > 0}
                                            onCheckedChange={(c) => handleSelectAll(c as boolean)}
                                        />
                                    </th>
                                    <th className="p-3">Item</th>
                                    <th className="p-3">Medidas</th>
                                    <th className="p-3">Cant</th>
                                    <th className="p-3 text-right">Unitario</th>
                                    <th className="p-3 text-right">Subtotal</th>
                                    <th className="p-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <React.Fragment key={item.id_linea_cot}>
                                        <tr className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="p-3">
                                                <Checkbox
                                                    checked={selectedItems.includes(item.id_linea_cot)}
                                                    onCheckedChange={(c) => handleToggleSelect(item.id_linea_cot, c as boolean)}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-start gap-2">
                                                    {item.id_modelo !== 'SERVICIO' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 mt-0.5 shrink-0"
                                                            onClick={() => toggleRow(item.id_linea_cot)}
                                                        >
                                                            {expandedItems[item.id_linea_cot] ? (
                                                                <ChevronDown className="h-4 w-4 text-slate-500" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4 text-slate-500" />
                                                            )}
                                                        </Button>
                                                    )}
                                                    <div>
                                                        <div className="font-bold">{item.etiqueta_item}</div>
                                                        {item.id_modelo !== 'SERVICIO' && (
                                                            <>
                                                                <div className="text-xs text-muted-foreground">{item.id_modelo}</div>
                                                                <div className="text-xs text-muted-foreground">Color: {item.color_perfiles}</div>

                                                                {/* Dynamic Options Render (Mini) - FIXED */}
                                                                {(() => {
                                                                    const itemOptions = recipesOptionsByModel[item.id_modelo || ""]
                                                                    if (!itemOptions) return null
                                                                    return Object.entries(itemOptions).map(([grupo, opts]) => {
                                                                        const currentVal = (item.opciones_seleccionadas as any)?.[grupo] || ""

                                                                        if (currentVal) {
                                                                            return <div key={grupo} className="text-xs text-blue-600 font-medium mt-1">
                                                                                {grupo}: <span className="font-mono text-slate-700">{currentVal}</span>
                                                                            </div>
                                                                        }

                                                                        // If required but missing
                                                                        return <div key={grupo} className="text-xs text-orange-600 font-bold mt-1">
                                                                            ⚠️ Falta {grupo}
                                                                        </div>
                                                                    })
                                                                })()}
                                                            </>
                                                        )}
                                                        {item.id_modelo === 'SERVICIO' && (
                                                            <div className="text-xs text-blue-600 font-medium">Servicio / Extra</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {item.id_modelo === 'SERVICIO' ? '-' : `${item.ancho_mm} x ${item.alto_mm}`}
                                            </td>
                                            <td className="p-3 text-center font-mono">{item.cantidad}</td>
                                            <td className="p-3 text-right font-mono text-muted-foreground">
                                                {formatCurrency(item._vc_subtotal_linea_calc / (item.cantidad || 1))}
                                            </td>
                                            <td className="p-3 text-right font-bold">
                                                {formatCurrency(item._vc_subtotal_linea_calc)}
                                            </td>
                                            <td className="p-3 text-center flex items-center justify-center gap-1">
                                                {item.id_modelo !== 'SERVICIO' && (
                                                    <Button size="icon" variant="ghost" title="Regenerar Ingeniería" onClick={() => handleRefreshCalculations(item.id_linea_cot)}>
                                                        <Calculator className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button size="icon" variant="ghost" title="Duplicar Ítem" onClick={() => handleCloneItem(item.id_linea_cot)}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                                <CotizacionDespieceDialog
                                                    idCotizacion={id}
                                                    idLineaCot={item.id_linea_cot}
                                                    trigger={
                                                        <Button size="icon" variant="ghost" title="Ver Despiece">
                                                            <FileText className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                    }
                                                />
                                                <Button size="icon" variant="ghost" title="Editar Ítem" onClick={() => {
                                                    setEditingItem(item)
                                                    setIsDialogOpen(true)
                                                }}>
                                                    <Pencil className="h-4 w-4 text-orange-600" />
                                                </Button>
                                                <Button size="icon" variant="ghost" title="Eliminar Ítem" onClick={() => handleDeleteItem(item.id_linea_cot)}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </td>
                                        </tr>
                                        {item.id_modelo !== 'SERVICIO' && expandedItems[item.id_linea_cot] && (
                                            <tr className="bg-slate-50 border-b animate-in fade-in zoom-in-95 duration-200">
                                                <td colSpan={7} className="p-2 pl-12 text-xs">
                                                    {/* Render Selectors Here - ONLY IF OPTIONS EXIST */}
                                                    {(() => {
                                                        const itemOptions = recipesOptionsByModel[item.id_modelo || ""]
                                                        if (!itemOptions) return null

                                                        return (
                                                            <div className="mb-2 grid grid-cols-2 gap-4 max-w-2xl bg-white p-2 rounded border border-blue-100">
                                                                {Object.entries(itemOptions).map(([grupo, opts]) => {
                                                                    const currentVal = (item.opciones_seleccionadas as any)?.[grupo] || ""

                                                                    return (
                                                                        <div key={grupo} className="grid gap-1">
                                                                            <Label className="text-xs font-semibold text-muted-foreground">
                                                                                {grupo === 'TIPO_BRAZO' ? 'Tipo de Brazo' : grupo}
                                                                            </Label>
                                                                            <CatalogSkuSelector
                                                                                value={currentVal}
                                                                                onChange={(sku) => handleOptionChange(item, grupo, sku)}
                                                                                placeholder={`Seleccionar ${grupo}`}
                                                                            />
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        )
                                                    })()}

                                                    <DespiecePreview idLinea={item.id_linea_cot} />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                {/* RENDERIZADO DE COSTO FIJO DE INSTALACIÓN COMO ÍTEM VIRTUAL */}
                                {(cotizacion.costo_fijo_instalacion ?? 0) > 0 && (
                                    <tr className="bg-blue-50/50 border-b border-blue-100">
                                        <td className="p-3 text-center text-blue-600 font-mono text-xs">+</td>
                                        <td className="p-3">
                                            <div className="font-bold text-blue-800">Servicios de Instalación</div>
                                            <div className="text-xs text-blue-600 font-medium">Incluye: Embalaje, Flete, Movilidad, Viáticos, SCTR</div>
                                        </td>
                                        <td className="p-3 text-center text-muted-foreground">-</td>
                                        <td className="p-3 text-center font-mono">1</td>
                                        <td className="p-3 text-right font-mono text-muted-foreground">
                                            {formatCurrency(cotizacion.costo_fijo_instalacion!)}
                                        </td>
                                        <td className="p-3 text-right font-bold text-blue-800">
                                            {formatCurrency(cotizacion.costo_fijo_instalacion!)}
                                        </td>
                                        <td className="p-3"></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
            <CotizacionItemDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                idCotizacion={id}
                itemToEdit={editingItem}
                onItemAdded={handleItemSaved}
                triggerButton={null}
            />
        </div>
    )
}
