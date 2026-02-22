"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { recetasApi, type RecetaModelo } from "@/lib/api/recetas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Copy, Trash2, Search, ChevronRight, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToastHelper } from "@/lib/hooks/useToastHelper"

interface RecipeModelListProps {
    selectedModelId: string | null
    onSelectModel: (id: string) => void
}

export function RecipeModelList({ selectedModelId, onSelectModel }: RecipeModelListProps) {
    const toast = useToastHelper()
    const queryClient = useQueryClient()
    const [search, setSearch] = useState("")
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [cloneDialogOpen, setCloneDialogOpen] = useState(false)
    const [cloneSource, setCloneSource] = useState<RecetaModelo | null>(null)

    // New model form
    const [newModel, setNewModel] = useState({
        id_modelo: "",
        id_sistema: "",
        nombre_comercial: "",
        num_hojas: 2,
        descripcion: "",
    })

    // Clone form
    const [cloneData, setCloneData] = useState({
        id_modelo: "",
        nombre_comercial: "",
    })

    const { data: modelos, isLoading } = useQuery({
        queryKey: ["recetaModelos"],
        queryFn: recetasApi.getModelos,
    })

    const { data: sistemas } = useQuery({
        queryKey: ["mstSistemasRecetas"],
        queryFn: recetasApi.getSistemas,
    })

    // Group models by system
    const grouped = (modelos || []).reduce<Record<string, RecetaModelo[]>>((acc, m) => {
        const sysName = m.mst_series_equivalencias?.nombre_comercial || m.id_sistema || "Sin Sistema"
        if (!acc[sysName]) acc[sysName] = []
        acc[sysName].push(m)
        return acc
    }, {})

    // Filter by search
    const filteredGroups = Object.entries(grouped).reduce<Record<string, RecetaModelo[]>>((acc, [key, models]) => {
        const filtered = models.filter(m =>
            m.nombre_comercial.toLowerCase().includes(search.toLowerCase()) ||
            m.id_modelo.toLowerCase().includes(search.toLowerCase())
        )
        if (filtered.length > 0) acc[key] = filtered
        return acc
    }, {})

    async function handleCreateModel() {
        try {
            if (!newModel.id_modelo || !newModel.nombre_comercial) {
                toast.warning("Datos incompletos", "ID y nombre son obligatorios")
                return
            }
            await recetasApi.createModelo({
                ...newModel,
                id_sistema: newModel.id_sistema || null,
                descripcion: newModel.descripcion || null,
                activo: true,
            })
            queryClient.invalidateQueries({ queryKey: ["recetaModelos"] })
            toast.success("Modelo creado", `${newModel.nombre_comercial}`)
            setCreateDialogOpen(false)
            setNewModel({ id_modelo: "", id_sistema: "", nombre_comercial: "", num_hojas: 2, descripcion: "" })
            onSelectModel(newModel.id_modelo)
        } catch (e: any) {
            toast.error("Error", e.message || "No se pudo crear el modelo")
        }
    }

    async function handleCloneModel() {
        if (!cloneSource || !cloneData.id_modelo || !cloneData.nombre_comercial) {
            toast.warning("Datos incompletos", "ID y nombre son obligatorios")
            return
        }
        try {
            await recetasApi.clonarModelo(cloneSource.id_modelo, cloneData.id_modelo, cloneData.nombre_comercial)
            queryClient.invalidateQueries({ queryKey: ["recetaModelos"] })
            toast.success("Modelo duplicado", `${cloneData.nombre_comercial}`)
            setCloneDialogOpen(false)
            onSelectModel(cloneData.id_modelo)
        } catch (e: any) {
            toast.error("Error", e.message || "No se pudo clonar el modelo")
        }
    }

    async function handleDeleteModel(modelo: RecetaModelo) {
        if (!confirm(`¿Eliminar "${modelo.nombre_comercial}" y todas sus recetas?\n\nEsta acción NO se puede deshacer.`)) return
        try {
            await recetasApi.deleteModelo(modelo.id_modelo)
            queryClient.invalidateQueries({ queryKey: ["recetaModelos"] })
            toast.success("Eliminado", `Modelo ${modelo.nombre_comercial} eliminado`)
            if (selectedModelId === modelo.id_modelo) onSelectModel("")
        } catch (e: any) {
            toast.error("Error", e.message || "No se pudo eliminar")
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-700">Modelos</h3>
                    <Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Nuevo
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar modelo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-8 text-sm"
                    />
                </div>
            </div>

            {/* Model List */}
            <div className="flex-1 overflow-y-auto p-2">
                {isLoading && <p className="text-sm text-muted-foreground p-4 text-center">Cargando modelos...</p>}

                {Object.entries(filteredGroups).sort(([a], [b]) => a.localeCompare(b)).map(([systemName, models]) => (
                    <div key={systemName} className="mb-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-1.5">
                            {systemName}
                        </p>
                        <div className="space-y-0.5">
                            {models.map(m => (
                                <div
                                    key={m.id_modelo}
                                    className={cn(
                                        "group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all",
                                        selectedModelId === m.id_modelo
                                            ? "bg-blue-50 border border-blue-200 text-blue-900"
                                            : "hover:bg-slate-50"
                                    )}
                                    onClick={() => onSelectModel(m.id_modelo)}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Package className={cn(
                                            "h-4 w-4 flex-shrink-0",
                                            selectedModelId === m.id_modelo ? "text-blue-500" : "text-slate-400"
                                        )} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{m.nombre_comercial}</p>
                                            <p className="text-xs text-muted-foreground truncate">{m.id_modelo} · {m.num_hojas}H</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7"
                                            title="Duplicar"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setCloneSource(m)
                                                setCloneData({ id_modelo: `${m.id_modelo}_COPIA`, nombre_comercial: `${m.nombre_comercial} (Copia)` })
                                                setCloneDialogOpen(true)
                                            }}
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-red-500"
                                            title="Eliminar"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteModel(m)
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {!isLoading && Object.keys(filteredGroups).length === 0 && (
                    <p className="text-sm text-muted-foreground p-4 text-center">
                        {search ? "Sin resultados" : "No hay modelos"}
                    </p>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Modelo</DialogTitle>
                        <DialogDescription>Define el identificador y nombre del modelo de ventana/puerta.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="grid gap-1.5">
                            <Label className="text-xs">ID Modelo *</Label>
                            <Input
                                value={newModel.id_modelo}
                                onChange={(e) => setNewModel({ ...newModel, id_modelo: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                                placeholder="Ej: S25_3H"
                                className="font-mono"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-xs">Nombre Comercial *</Label>
                            <Input
                                value={newModel.nombre_comercial}
                                onChange={(e) => setNewModel({ ...newModel, nombre_comercial: e.target.value })}
                                placeholder="Ej: Serie 25 - 3 Hojas"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label className="text-xs">Sistema</Label>
                                <Select
                                    value={newModel.id_sistema || "NONE"}
                                    onValueChange={(v) => setNewModel({ ...newModel, id_sistema: v === "NONE" ? "" : v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NONE">Sin sistema</SelectItem>
                                        {sistemas?.map((s: any) => (
                                            <SelectItem key={s.id_sistema} value={s.id_sistema}>{s.nombre_comercial}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1.5">
                                <Label className="text-xs">Num. Hojas</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={10}
                                    value={newModel.num_hojas}
                                    onChange={(e) => setNewModel({ ...newModel, num_hojas: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-xs">Descripción</Label>
                            <Input
                                value={newModel.descripcion}
                                onChange={(e) => setNewModel({ ...newModel, descripcion: e.target.value })}
                                placeholder="Descripción opcional"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateModel}>Crear Modelo</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clone Dialog */}
            <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Duplicar Modelo</DialogTitle>
                        <DialogDescription>
                            Se copiarán todas las recetas de "{cloneSource?.nombre_comercial}" al nuevo modelo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="grid gap-1.5">
                            <Label className="text-xs">Nuevo ID *</Label>
                            <Input
                                value={cloneData.id_modelo}
                                onChange={(e) => setCloneData({ ...cloneData, id_modelo: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                                className="font-mono"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-xs">Nuevo Nombre *</Label>
                            <Input
                                value={cloneData.nombre_comercial}
                                onChange={(e) => setCloneData({ ...cloneData, nombre_comercial: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCloneDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCloneModel}>Duplicar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
