
"use client"

import { useQuery } from "@tanstack/react-query"
import { catApi } from "@/lib/api/cat"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PlantillaFormCmp } from "./plantilla-form"

export function PlantillaList({ active }: { active: boolean }) {
    const { data: plantillas, isLoading } = useQuery({
        queryKey: ["catPlantillas"],
        queryFn: catApi.getPlantillas,
        enabled: active
    })

    const [search, setSearch] = useState("")
    const [open, setOpen] = useState(false)

    if (isLoading && active) return <div>Cargando plantillas...</div>

    const filteredPlantillas = plantillas?.filter((p: any) =>
        p.nombre_generico.toLowerCase().includes(search.toLowerCase()) ||
        p.id_plantilla.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar modelo..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Plantilla
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Crear Nueva Plantilla</DialogTitle>
                            <DialogDescription>
                                Defina un modelo base para productos terminados (ej. Ventana Mod. 20).
                            </DialogDescription>
                        </DialogHeader>
                        <PlantillaFormCmp onSuccess={() => setOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Modelo</TableHead>
                            <TableHead>Familia</TableHead>
                            <TableHead>Sistema</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPlantillas?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No se encontraron plantillas.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredPlantillas?.map((p: any) => (
                            <TableRow key={p.id_plantilla}>
                                <TableCell className="font-medium">{p.id_plantilla}</TableCell>
                                <TableCell>{p.nombre_generico}</TableCell>
                                <TableCell>{p.mst_familias?.nombre_familia || "-"}</TableCell>
                                <TableCell>{p.mst_series_equivalencias?.nombre_comercial || "-"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
