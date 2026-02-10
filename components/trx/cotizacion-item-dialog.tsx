"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { cotizacionesApi } from "@/lib/api/cotizaciones"
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
import { Plus, Truck } from "lucide-react"
import { useToastHelper } from "@/lib/hooks/useToastHelper"

interface CotizacionItemDialogProps {
    idCotizacion: string
    onItemAdded: (item: any) => Promise<void>
    triggerButton?: React.ReactNode
}

export function CotizacionItemDialog({ idCotizacion, onItemAdded, triggerButton }: CotizacionItemDialogProps) {
    const toast = useToastHelper()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Data Fetching
    const { data: sistemas } = useQuery({ queryKey: ["mstSistemas"], queryFn: cotizacionesApi.getSistemas })
    const { data: allModelos } = useQuery({ queryKey: [" mstRecetasIDs"], queryFn: cotizacionesApi.getRecetasIDs })
    const { data: vidrios } = useQuery({ queryKey: ["catVidrios"], queryFn: cotizacionesApi.getVidrios })
    const { data: acabados } = useQuery({ queryKey: ["mstAcabados"], queryFn: cotizacionesApi.getAcabados })
    const { data: marcas } = useQuery({ queryKey: ["mstMarcas"], queryFn: cotizacionesApi.getMarcas })

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
        costo_fijo_instalacion: 0
    })

    // Filtrar modelos según sistema seleccionado
    const filteredModelos = item.id_sistema
        ? allModelos?.filter((m: any) => m.id_sistema === item.id_sistema)
        : allModelos

    // Reset modelo cuando cambia el sistema
    useEffect(() => {
        if (item.id_sistema) {
            setItem(prev => ({ ...prev, id_modelo: "" }))
        }
    }, [item.id_sistema])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validaciones básicas
        if (!item.id_modelo) {
            toast.warning("Modelo requerido", "Debes seleccionar un modelo antes de continuar")
            return
        }
        if (!item.color_perfiles) {
            toast.warning("Color requerido", "Debes seleccionar un color de perfil")
            return
        }

        setLoading(true)
        try {
            await onItemAdded(item)
            toast.success("Ítem agregado", "El ítem se agregó correctamente a la cotización")
            setOpen(false)
            // Reset form
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
                costo_fijo_instalacion: 0
            })
        } catch (error: any) {
            console.error("Error al agregar ítem:", error)
            toast.error("Error al agregar ítem", error.message || 'No se pudo agregar el ítem')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Agregar Ítem
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Agregar Ventana / Puerta</DialogTitle>
                        <DialogDescription>
                            Configure las dimensiones y acabados del producto.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Fila 1: Sistema y Modelo */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Sistema / Serie *</Label>
                                <Select
                                    value={item.id_sistema}
                                    onValueChange={(v) => setItem({ ...item, id_sistema: v, id_modelo: "" })}
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
                                    value={item.tipo_vidrio}
                                    onValueChange={(v) => setItem({ ...item, tipo_vidrio: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Vidrio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vidrios?.map((v: any) => (
                                            <SelectItem key={v.id_sku} value={v.id_sku}>
                                                {v.nombre_completo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Procesando..." : "Agregar a Cotización"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
