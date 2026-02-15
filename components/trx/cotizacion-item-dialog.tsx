"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { cotizacionesApi } from "@/lib/api/cotizaciones"
import { recetasApi } from "@/lib/api/recetas"
import { CatalogSkuSelector } from "@/components/mto/catalog-sku-selector"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Truck } from "lucide-react"
import { useToastHelper } from "@/lib/hooks/useToastHelper"

interface CotizacionItemDialogProps {
    idCotizacion: string
    onItemAdded: (item: any) => Promise<void>
    triggerButton?: React.ReactNode
    itemToEdit?: any
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CotizacionItemDialog({ idCotizacion, onItemAdded, triggerButton, itemToEdit, open: controlledOpen, onOpenChange }: CotizacionItemDialogProps) {
    const toast = useToastHelper()
    const [internalOpen, setInternalOpen] = useState(false)

    // Manage open state (controlled vs uncontrolled)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = (newOpen: boolean) => {
        if (isControlled) {
            onOpenChange?.(newOpen)
        } else {
            setInternalOpen(newOpen)
        }
    }

    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("producto")

    // Data Fetching
    const { data: sistemas } = useQuery({ queryKey: ["mstSistemas"], queryFn: cotizacionesApi.getSistemas })
    const { data: allModelos } = useQuery({ queryKey: [" mstRecetasIDs"], queryFn: cotizacionesApi.getRecetasIDs })
    const { data: vidrios } = useQuery({ queryKey: ["catVidrios"], queryFn: cotizacionesApi.getVidrios })
    const { data: acabados } = useQuery({ queryKey: ["mstAcabados"], queryFn: cotizacionesApi.getAcabados })
    const { data: recetasOptions } = useQuery({ queryKey: ["recetasOptions"], queryFn: recetasApi.getRecetasOptions })

    // Compute options by model map
    const recipesOptionsByModel = recetasOptions?.reduce((acc: any, r: any) => {
        if (!acc[r.id_modelo]) acc[r.id_modelo] = {}
        if (!acc[r.id_modelo][r.grupo_opcion]) acc[r.id_modelo][r.grupo_opcion] = []
        acc[r.id_modelo][r.grupo_opcion].push(r)
        return acc
    }, {}) || {}

    // Form States
    const [item, setItem] = useState({
        id_sistema: "",
        id_modelo: "",
        color_perfiles: "",
        cantidad: 1,
        ancho_mm: 1000,
        alto_mm: 1000,
        tipo_vidrio: "",
        tipo_cierre: "Centro",
        etiqueta_item: "V-01",
        ubicacion: "Ambiente",
        costo_fijo_instalacion: 0,
        opciones_seleccionadas: {} as Record<string, string>
    })

    const [servicio, setServicio] = useState({
        descripcion: "",
        cantidad: 1,
        precio_unitario: 0
    })

    // Initialize form when itemToEdit changes or dialog opens
    useEffect(() => {
        if (open && itemToEdit) {
            if (itemToEdit.id_modelo === 'SERVICIO') {
                setActiveTab("servicio")
                // Need to fetch desglose to get price? Or is it passed in itemToEdit?
                // itemToEdit here is likely the enriched detail from the grid.
                // We need to approximation or pass more data.
                // For now assuming we can't easily edit services without fetching more data or simplifying.
                // Let's populate what we have from the view.
                setServicio({
                    descripcion: itemToEdit.etiqueta_item || "",
                    cantidad: itemToEdit.cantidad || 1,
                    precio_unitario: (itemToEdit._vc_price_unit_oferta_calc || 0) // Approximation
                })
            } else {
                setActiveTab("producto")
                // We need to find the system for the model if not present.
                // itemToEdit might not have id_sistema directly if it comes from view `vw_cotizaciones_detalladas`
                // But we can try to find it from allModelos if loaded.

                const foundModel = allModelos?.find((m: any) => m.id_modelo === itemToEdit.id_modelo)
                const sysId = foundModel?.id_sistema || ""

                setItem({
                    id_sistema: sysId,
                    id_modelo: itemToEdit.id_modelo || "",
                    color_perfiles: itemToEdit.color_perfiles || "",
                    cantidad: itemToEdit.cantidad || 1,
                    ancho_mm: itemToEdit.ancho_mm || 1000,
                    alto_mm: itemToEdit.alto_mm || 1000,
                    tipo_vidrio: itemToEdit.tipo_vidrio || "",
                    tipo_cierre: itemToEdit.tipo_cierre || "Centro",
                    etiqueta_item: itemToEdit.etiqueta_item || "",
                    ubicacion: itemToEdit.ubicacion || "",
                    costo_fijo_instalacion: 0,
                    opciones_seleccionadas: itemToEdit.opciones_seleccionadas || {}
                })
            }
        } else if (open && !itemToEdit) {
            // Reset to defaults for New Item
            setItem({
                id_sistema: "",
                id_modelo: "",
                color_perfiles: "",
                cantidad: 1,
                ancho_mm: 1000,
                alto_mm: 1000,
                tipo_vidrio: "",
                tipo_cierre: "Centro",
                etiqueta_item: "V-01",
                ubicacion: "Ambiente",
                costo_fijo_instalacion: 0,
                opciones_seleccionadas: {}
            })
            setServicio({ descripcion: "", cantidad: 1, precio_unitario: 0 })
            setActiveTab("producto")
        }
    }, [open, itemToEdit, allModelos])

    // Filtrar modelos según sistema seleccionado
    const filteredModelos = item.id_sistema
        ? allModelos?.filter((m: any) => m.id_sistema === item.id_sistema)
        : allModelos

    // Reset modelo cuando cambia el sistema (only if user interacts, not initial load)
    // Removed automatic reset to avoid clearing `id_modelo` when setting initial state from `itemToEdit`
    // We can handle this by checking if the current model belongs to the new system, if not, clear.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (activeTab === "producto") {
                // Validaciones básicas Producto
                if (!item.id_modelo || !item.color_perfiles) {
                    toast.warning("Datos incompletos", "Complete modelo y color")
                    setLoading(false)
                    return
                }

                // Validación de Opciones Mandatorias (Brazo Proyectante para S42/S3831)
                const currentModelOptions = recipesOptionsByModel[item.id_modelo]
                if (currentModelOptions) {
                    for (const [grupo, opts] of Object.entries(currentModelOptions)) {
                        // Check if ANY option in this group is mandatory (condicion='BASE') 
                        // Logic from DB: all in this group share condicion.
                        const isMandatory = (opts as any[])[0]?.condicion === 'BASE'

                        if (isMandatory) {
                            if (!item.opciones_seleccionadas[grupo]) {
                                toast.warning("Falta Opción", `Debe seleccionar: ${grupo}`)
                                setLoading(false)
                                return
                            }
                        }
                    }
                }

                await onItemAdded({ ...item, _isUpdate: !!itemToEdit })
            } else {
                // Lógica Servicio
                if (!servicio.descripcion || servicio.precio_unitario <= 0) {
                    toast.warning("Datos incompletos", "Ingrese descripción y precio válido")
                    setLoading(false)
                    return
                }

                if (itemToEdit) {
                    // Update Service Logic
                    toast.warning("Edición de servicios aún no implementada completamente", "Por favor elimine y vuelva a crear si necesita cambiar precios.")
                } else {
                    // 1. Crear Linea de Cotización Dummy
                    const linea = await cotizacionesApi.addLineItem(idCotizacion, {
                        id_modelo: "SERVICIO",
                        etiqueta_item: servicio.descripcion,
                        cantidad: servicio.cantidad,
                        ancho_mm: 0,
                        alto_mm: 0,
                        color_perfiles: "GEN", // Default,
                        tipo_vidrio: null,
                        opciones_seleccionadas: {}
                    })

                    // 2. Insertar Costo Manual en Desglose
                    await cotizacionesApi.addDesgloseItem({
                        id_linea_cot: linea.id_linea_cot,
                        tipo_componente: "Servicio",
                        nombre_componente: servicio.descripcion,
                        cantidad_calculada: servicio.cantidad,
                        costo_total_item: servicio.precio_unitario * servicio.cantidad, // Costo TOTAL
                        sku_real: "SERV-MANUAL"
                    })

                    await onItemAdded({ _type: "SERVICE_DONE" })
                }
            }

            if (!itemToEdit) toast.success("Ítem agregado", "El ítem se agregó correctamente")

            setOpen(false)

            // Reset forms
            setServicio({ descripcion: "", cantidad: 1, precio_unitario: 0 })
            // Reset item defaults handled by logic or not needed immediately
        } catch (error: any) {
            console.error(error)
            toast.error("Error", "No se pudo procesar el ítem")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {triggerButton !== null && (
                <DialogTrigger asChild>
                    {triggerButton || (
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Agregar Ítem
                        </Button>
                    )}
                </DialogTrigger>
            )}
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{itemToEdit ? "Editar Ítem" : "Agregar Ítem a Cotización"}</DialogTitle>
                    <DialogDescription>
                        {itemToEdit ? "Modifique los datos del ítem." : "Seleccione el tipo de ítem que desea agregar."}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="producto" disabled={!!itemToEdit && itemToEdit.id_modelo === 'SERVICIO'}>Producto (Ventana/Puerta)</TabsTrigger>
                        <TabsTrigger value="servicio" disabled={!!itemToEdit && itemToEdit.id_modelo !== 'SERVICIO'}>Servicio / Extra</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit}>
                        <TabsContent value="producto" className="space-y-4 py-4">
                            <div className="grid gap-4">
                                {/* Fila 1: Sistema y Modelo */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Sistema / Serie *</Label>
                                        <Select
                                            value={item.id_sistema}
                                            onValueChange={(v) => {
                                                setItem({ ...item, id_sistema: v, id_modelo: "" })
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar Sistema" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sistemas?.map((s: any) => (
                                                    <SelectItem key={s.id_sistema} value={s.id_sistema}>
                                                        {s.nombre_comercial}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Modelo (Receta) *</Label>
                                        <Select
                                            value={item.id_modelo}
                                            onValueChange={(v) => setItem({ ...item, id_modelo: v })}
                                            disabled={!item.id_sistema}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={item.id_sistema ? "Seleccionar Modelo" : "Primero seleccione sistema"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredModelos?.map((m: any) => (
                                                    <SelectItem key={m.id_modelo} value={m.id_modelo}>
                                                        {m.id_modelo}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Fila 1b: Etiqueta y Ubicacion */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Etiqueta / Nombre</Label>
                                        <Input
                                            value={item.etiqueta_item}
                                            onChange={(e) => setItem({ ...item, etiqueta_item: e.target.value })}
                                            placeholder="Ej: V-01"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Ubicación</Label>
                                        <Input
                                            value={item.ubicacion}
                                            onChange={(e) => setItem({ ...item, ubicacion: e.target.value })}
                                            placeholder="Ej: Dormitorio / Sala"
                                        />
                                    </div>
                                </div>

                                {/* Fila 2: Dimensiones */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Ancho (mm)</Label>
                                        <Input
                                            type="number"
                                            value={item.ancho_mm}
                                            onChange={(e) => setItem({ ...item, ancho_mm: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Alto (mm)</Label>
                                        <Input
                                            type="number"
                                            value={item.alto_mm}
                                            onChange={(e) => setItem({ ...item, alto_mm: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Cantidad</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={item.cantidad}
                                            onChange={(e) => setItem({ ...item, cantidad: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                {/* Fila 3: Acabados */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Color Aluminio *</Label>
                                        <Select
                                            value={item.color_perfiles}
                                            onValueChange={(v) => setItem({ ...item, color_perfiles: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar Color" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {acabados?.map((a: any) => (
                                                    <SelectItem key={a.id_acabado} value={a.id_acabado}>
                                                        {a.nombre_acabado}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Tipo Vidrio</Label>
                                        <Select
                                            value={item.tipo_vidrio || "SIN_VIDRIO"} // Handle null/empty
                                            onValueChange={(v) => setItem({ ...item, tipo_vidrio: v === "SIN_VIDRIO" ? "" : v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar Vidrio" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="SIN_VIDRIO">Sin Vidrio / No Aplica</SelectItem>
                                                {vidrios?.map((v: any) => (
                                                    <SelectItem key={v.id_sku} value={v.id_sku}>
                                                        {v.nombre_completo}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Dynamic Options (Brazos, etc) */}
                                {item.id_modelo && recipesOptionsByModel[item.id_modelo] && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                        {Object.entries(recipesOptionsByModel[item.id_modelo]).map(([grupo, opts]) => {
                                            const isMandatory = (opts as any[])[0]?.condicion === 'BASE'
                                            return (
                                                <div key={grupo} className="grid gap-2">
                                                    <Label>{grupo} {isMandatory && "*"}</Label>
                                                    <CatalogSkuSelector
                                                        value={item.opciones_seleccionadas[grupo] || ""}
                                                        onChange={(sku) => {
                                                            setItem(prev => ({
                                                                ...prev,
                                                                opciones_seleccionadas: {
                                                                    ...prev.opciones_seleccionadas,
                                                                    [grupo]: sku
                                                                }
                                                            }))
                                                        }}
                                                        placeholder={`Seleccionar ${grupo}`}
                                                    />
                                                    {isMandatory && <p className="text-[10px] text-orange-600 font-medium">Requerido para ingeniería</p>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="servicio" className="space-y-4 py-4">
                            <div className="p-4 bg-slate-50 rounded border border-slate-200">
                                <p className="text-sm text-slate-600 mb-4">
                                    Agregue servicios o ítems extras (instalación específica, accesorios adicionales, etc.) que no requieren cálculo de ingeniería.
                                </p>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label>Descripción del Servicio *</Label>
                                        <Input
                                            value={servicio.descripcion}
                                            onChange={(e) => setServicio({ ...servicio, descripcion: e.target.value })}
                                            placeholder="Ej: Instalación de Ventanas 2do Piso"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Cantidad</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={servicio.cantidad}
                                                onChange={(e) => setServicio({ ...servicio, cantidad: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Precio Unitario (Costo Directo)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                value={servicio.precio_unitario}
                                                onChange={(e) => setServicio({ ...servicio, precio_unitario: Number(e.target.value) })}
                                                disabled={!!itemToEdit}
                                            />
                                            {itemToEdit && <p className="text-xs text-red-500">Para cambiar precio, elimine y cree de nuevo.</p>}
                                            <p className="text-xs text-muted-foreground">El Markup se aplicará sobre este precio.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Procesando..." : (itemToEdit ? "Guardar Cambios" : "Agregar a Cotización")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
