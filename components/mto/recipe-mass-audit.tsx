"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { recetasApi } from "@/lib/api/recetas"
import { validateFormula } from "@/lib/utils/formula-engine"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Loader2, ExternalLink, RefreshCw, FileWarning } from "lucide-react"

export function RecipeMassAudit({ onNavigate }: { onNavigate: (modelId: string) => void }) {
    const [open, setOpen] = useState(false)

    // Only fetch when dialog is open
    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ["recipeMassAudit"],
        queryFn: recetasApi.getAllRecetasConCatalogInfo,
        enabled: open,
    })

    const errors = useMemo(() => {
        if (!data) return []

        const found: any[] = []

        data.forEach(r => {
            // Check only active models
            if (r.modelo_activo === false) return

            const isPerfil = r.tipo === 'Perfil' || r.tipo === 'Vidrio'
            const isAccesorio = r.tipo === 'Accesorio' || r.tipo === 'Servicio'

            // 1. Missing SKU / Plantilla
            if (isPerfil && !r.id_plantilla) {
                found.push({ ...r, _errorType: 'MISSING_PLANTILLA', _errorMsg: 'Falta ID Plantilla' })
            }
            if (isAccesorio && !r.id_sku_catalogo) {
                found.push({ ...r, _errorType: 'MISSING_SKU', _errorMsg: 'Falta SKU' })
            }

            // 2. Pricing Warnings (Only for accessories mapped to SKU)
            if (isAccesorio && r.id_sku_catalogo) {
                const precio = r.precio_catalogo ?? r.precio_unitario_manual ?? 0
                if (precio <= 0) {
                    found.push({ ...r, _errorType: 'ZERO_PRICE', _errorMsg: 'Costo = S/ 0.00' })
                }
            }

            // 3. Formula Errors
            if (r.formula_cantidad) {
                const val = validateFormula(r.formula_cantidad)
                if (!val.valid) {
                    found.push({ ...r, _errorType: 'FORMULA_ERROR', _errorMsg: `Form. Cantidad: ${val.error}` })
                }
            }
            if (r.formula_perfil) {
                const val = validateFormula(r.formula_perfil)
                if (!val.valid) {
                    found.push({ ...r, _errorType: 'FORMULA_ERROR', _errorMsg: `Form. Perfil: ${val.error}` })
                }
            }
        })

        return found
    }, [data])

    // Sort alphabetically by model id
    const sortedErrors = useMemo(() => {
        return [...errors].sort((a, b) => a.modelo_nombre?.localeCompare(b.modelo_nombre) || 0)
    }, [errors])

    const totalAudited = new Set(data?.filter(r => r.modelo_activo !== false).map(r => r.id_modelo)).size || 0
    const totalLines = data?.filter(r => r.modelo_activo !== false).length || 0

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2 bg-red-600 hover:bg-red-700">
                    <ShieldAlert className="h-4 w-4" />
                    Auditar Sistema ({errors.length || '?'})
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-4">
                <DialogHeader className="flex flex-row items-center justify-between pb-2 shrink-0 border-b">
                    <div>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <FileWarning className="h-5 w-5 text-red-600" />
                            Auditoría de Integridad MTO
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            El sistema ha cargado {totalLines} registros de {totalAudited} modelos activos.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                        Re-Escanear
                    </Button>
                </DialogHeader>

                <div className="flex-1 overflow-auto border rounded-md bg-white relative mt-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 absolute inset-0">
                            <Loader2 className="h-8 w-8 animate-spin mb-4" />
                            <p>Procesando reglas matemáticas del sistema...</p>
                        </div>
                    ) : sortedErrors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-green-600 bg-green-50/50 absolute inset-0">
                            <ShieldAlert className="h-16 w-16 mb-4 opacity-30" />
                            <h3 className="text-xl font-semibold">¡Auditoría Perfecta!</h3>
                            <p className="text-sm text-green-700 mt-2">No se encontraron errores de configuración ni costos nulos.</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <Table>
                                <TableHeader className="sticky top-0 bg-slate-50 shadow-sm z-10">
                                    <TableRow>
                                        <TableHead className="w-[200px]">Modelo Afectado</TableHead>
                                        <TableHead className="w-[120px]">Tipo</TableHead>
                                        <TableHead>Componente</TableHead>
                                        <TableHead className="w-[250px]">Descripción del Error</TableHead>
                                        <TableHead className="w-[80px] text-right">Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedErrors.map((err, i) => {
                                        let bgClass = "bg-orange-50 text-orange-700 border-orange-200"
                                        if (err._errorType === 'FORMULA_ERROR') bgClass = "bg-red-50 text-red-700 border-red-200"
                                        if (err._errorType === 'ZERO_PRICE') bgClass = "bg-amber-50 text-amber-700 border-amber-200"

                                        return (
                                            <TableRow key={`${err.id_receta}-${i}`} className="hover:bg-slate-50">
                                                <TableCell className="font-medium">
                                                    <div className="text-sm text-slate-900">{err.modelo_nombre}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{err.id_modelo}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="text-[10px] font-normal">
                                                        {err.tipo}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-700">
                                                    {err.nombre_componente || '(Sin Nombre)'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className={`text-xs px-2.5 py-1 rounded-md border font-medium ${bgClass}`}>
                                                        {err._errorMsg}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => {
                                                            setOpen(false)
                                                            onNavigate(err.id_modelo)
                                                        }}
                                                        title="Solucionar"
                                                    >
                                                        <ExternalLink className="h-4 w-4 text-primary" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <div className="mt-3 text-xs flex items-center justify-between shrink-0 bg-slate-50 border rounded-md px-4 py-2">
                    <span className="text-slate-600 font-medium tracking-wide uppercase">Diagnóstico FInal</span>
                    {isLoading ? (
                        <div className="animate-pulse w-24 h-4 bg-slate-200 rounded"></div>
                    ) : sortedErrors.length > 0 ? (
                        <span className="font-bold text-red-600">
                            {sortedErrors.length} Riesgo(s) Detectado(s) en {new Set(sortedErrors.map(e => e.id_modelo)).size} modelo(s)
                        </span>
                    ) : (
                        <span className="font-bold text-green-600">Sistema Limpio</span>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
