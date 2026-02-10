"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Download, Copy } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface AuditSku {
    id_receta: string
    id_modelo: string
    id_sistema: string
    id_plantilla: string
    nombre_componente: string
    tipo: string
    sku_generado: string
    estado: string
    nombre_producto_existente?: string
    costo_existente?: number
}

interface AuditResumen {
    id_sistema: string
    id_modelo: string
    total_componentes: number
    skus_ok: number
    skus_faltantes: number
    porcentaje_completado: number
}

interface PlantillaFaltante {
    id_plantilla: string
    nombre_componente: string
    id_sistema: string
    tipo: string
}

export default function AuditRecetasPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [skusFaltantes, setSkusFaltantes] = useState<AuditSku[]>([])
    const [resumenSistema, setResumenSistema] = useState<AuditResumen[]>([])
    const [plantillasFaltantes, setPlantillasFaltantes] = useState<PlantillaFaltante[]>([])
    const [filtroSistema, setFiltroSistema] = useState<string>("ALL")
    const [filtroTipo, setFiltroTipo] = useState<string>("ALL")

    const sistemas = [...new Set(skusFaltantes.map(s => s.id_sistema))].sort()

    async function cargarAuditoria() {
        setLoading(true)
        try {
            // 1. Cargar SKUs faltantes (solo accesorios/servicios)
            const { data: skus, error: e1 } = await supabase
                .from('vw_audit_skus_faltantes')
                .select('*')
                .order('id_sistema')

            if (e1) throw e1
            setSkusFaltantes(skus || [])

            // 2. Cargar resumen por sistema
            const { data: resumen, error: e2 } = await supabase
                .from('vw_audit_resumen_sistema')
                .select('*')
                .order('porcentaje_completado')

            if (e2) throw e2
            setResumenSistema(resumen || [])

            // 3. Cargar plantillas faltantes
            const { data: plantillas, error: e3 } = await supabase
                .from('vw_audit_plantillas_faltantes')
                .select('*')

            if (e3) throw e3
            setPlantillasFaltantes(plantillas || [])

        } catch (error: any) {
            console.error("Error cargando auditoría:", error)
            alert(`Error: ${error.message}. ¿Ejecutaste el script audit_recetas_skus.sql en Supabase?`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarAuditoria()
    }, [])

    // Filtrar SKUs
    const skusFiltrados = skusFaltantes.filter(s => {
        if (filtroSistema !== "ALL" && s.id_sistema !== filtroSistema) return false
        if (filtroTipo !== "ALL" && s.tipo !== filtroTipo) return false
        return true
    })

    const soloFaltantes = skusFiltrados.filter(s => s.estado === '❌ FALTA')
    const soloExistentes = skusFiltrados.filter(s => s.estado === '✅ EXISTE')

    // Generar SQL de INSERT para los faltantes
    async function generarInsertSQL() {
        // Escapar comillas simples para evitar romper el SQL
        const escapeSQLString = (str: string) => str.replace(/'/g, "''")

        const inserts = soloFaltantes.map(s =>
            `INSERT INTO cat_productos_variantes (id_sku, id_plantilla, nombre_completo, unidad_medida, costo_mercado_unit, moneda_reposicion) VALUES ('${escapeSQLString(s.sku_generado)}', '${escapeSQLString(s.id_plantilla)}', '${escapeSQLString(s.nombre_componente)}', 'UND', 10.00, 'PEN') ON CONFLICT DO NOTHING;`
        ).join('\n')

        try {
            await navigator.clipboard.writeText(inserts)
            toast({
                title: "✅ SQL copiado",
                description: `${soloFaltantes.length} sentencias INSERT listas para ejecutar en Supabase`,
                duration: 3000
            })
        } catch (clipboardError) {
            console.error('Clipboard error:', clipboardError)
            toast({
                variant: "destructive",
                title: "❌ Error de portapapeles",
                description: "No se pudo copiar automáticamente. Intenta nuevamente o usa Ctrl+C manualmente.",
                duration: 5000
            })
        }
    }

    // Stats
    const totalFaltantes = skusFaltantes.filter(s => s.estado === '❌ FALTA').length
    const totalOk = skusFaltantes.filter(s => s.estado === '✅ EXISTE').length
    const porcentajeTotal = skusFaltantes.length > 0
        ? Math.round(100 * totalOk / skusFaltantes.length)
        : 0

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2">Cargando auditoría...</span>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">🔍 Auditoría de Recetas vs SKUs</h1>
                    <p className="text-muted-foreground">
                        Identifica qué productos (SKUs) faltan para que las recetas funcionen correctamente.
                    </p>
                </div>
                <Button onClick={cargarAuditoria} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Recargar
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className={totalFaltantes === 0 ? "border-green-500" : "border-red-500"}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Estado General
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {porcentajeTotal}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Completado
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            SKUs Existentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{totalOk}</div>
                    </CardContent>
                </Card>

                <Card className={totalFaltantes > 0 ? "border-red-500 bg-red-50" : ""}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            SKUs Faltantes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{totalFaltantes}</div>
                    </CardContent>
                </Card>

                <Card className={plantillasFaltantes.length > 0 ? "border-orange-500 bg-orange-50" : ""}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            Plantillas Faltantes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">{plantillasFaltantes.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="faltantes" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="faltantes" className="gap-2">
                        <XCircle className="h-4 w-4" />
                        SKUs Faltantes ({totalFaltantes})
                    </TabsTrigger>
                    <TabsTrigger value="resumen">
                        Resumen por Modelo
                    </TabsTrigger>
                    <TabsTrigger value="plantillas" className="gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Plantillas Faltantes ({plantillasFaltantes.length})
                    </TabsTrigger>
                    <TabsTrigger value="todos">
                        Todos los SKUs
                    </TabsTrigger>
                </TabsList>

                {/* Tab: SKUs Faltantes */}
                <TabsContent value="faltantes" className="space-y-4">
                    {/* Filtros */}
                    <div className="flex gap-4 items-center">
                        <Select value={filtroSistema} onValueChange={setFiltroSistema}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filtrar Sistema" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los Sistemas</SelectItem>
                                {sistemas.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos</SelectItem>
                                <SelectItem value="Accesorio">Accesorio</SelectItem>
                                <SelectItem value="Servicio">Servicio</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex-1" />

                        <Button onClick={generarInsertSQL} variant="outline" disabled={soloFaltantes.length === 0}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar INSERTs ({soloFaltantes.length})
                        </Button>
                    </div>

                    {/* Tabla de Faltantes */}
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-red-50">
                                    <TableHead>Sistema</TableHead>
                                    <TableHead>Modelo</TableHead>
                                    <TableHead>Plantilla</TableHead>
                                    <TableHead>Componente</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>SKU Requerido</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {soloFaltantes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-green-600">
                                            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                                            ¡Todos los SKUs están creados!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    soloFaltantes.map((row, i) => (
                                        <TableRow key={i} className="bg-red-50/50">
                                            <TableCell className="font-mono text-xs">{row.id_sistema}</TableCell>
                                            <TableCell className="font-mono text-xs">{row.id_modelo}</TableCell>
                                            <TableCell className="font-mono font-bold">{row.id_plantilla}</TableCell>
                                            <TableCell>{row.nombre_componente}</TableCell>
                                            <TableCell>
                                                <Badge variant={row.tipo === 'Accesorio' ? 'secondary' : 'outline'}>
                                                    {row.tipo}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-red-600">
                                                {row.sku_generado}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">FALTA</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* Tab: Resumen */}
                <TabsContent value="resumen">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sistema</TableHead>
                                    <TableHead>Modelo</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right text-green-600">OK</TableHead>
                                    <TableHead className="text-right text-red-600">Faltantes</TableHead>
                                    <TableHead className="text-right">% Completado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {resumenSistema.map((row, i) => (
                                    <TableRow key={i} className={row.skus_faltantes > 0 ? 'bg-red-50/30' : 'bg-green-50/30'}>
                                        <TableCell className="font-mono">{row.id_sistema}</TableCell>
                                        <TableCell className="font-mono font-bold">{row.id_modelo}</TableCell>
                                        <TableCell className="text-right">{row.total_componentes}</TableCell>
                                        <TableCell className="text-right text-green-600 font-bold">{row.skus_ok}</TableCell>
                                        <TableCell className="text-right text-red-600 font-bold">{row.skus_faltantes}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={row.porcentaje_completado === 100 ? 'default' : 'secondary'}>
                                                {row.porcentaje_completado}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* Tab: Plantillas Faltantes */}
                <TabsContent value="plantillas">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-orange-600">
                                <AlertTriangle className="inline mr-2 h-5 w-5" />
                                Plantillas que no existen en cat_plantillas
                            </CardTitle>
                            <CardDescription>
                                Estas plantillas están referenciadas en recetas pero no existen en la tabla de plantillas.
                            </CardDescription>
                        </CardHeader>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID Plantilla</TableHead>
                                    <TableHead>Componente</TableHead>
                                    <TableHead>Sistema</TableHead>
                                    <TableHead>Tipo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plantillasFaltantes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-green-600">
                                            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                                            ¡Todas las plantillas están creadas!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    plantillasFaltantes.map((row, i) => (
                                        <TableRow key={i} className="bg-orange-50/50">
                                            <TableCell className="font-mono font-bold text-orange-600">{row.id_plantilla}</TableCell>
                                            <TableCell>{row.nombre_componente}</TableCell>
                                            <TableCell>{row.id_sistema}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{row.tipo}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* Tab: Todos */}
                <TabsContent value="todos">
                    <div className="flex gap-4 items-center mb-4">
                        <Select value={filtroSistema} onValueChange={setFiltroSistema}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filtrar Sistema" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los Sistemas</SelectItem>
                                {sistemas.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Sistema</TableHead>
                                    <TableHead>Plantilla</TableHead>
                                    <TableHead>Componente</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>SKU</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {skusFiltrados.map((row, i) => (
                                    <TableRow key={i} className={row.estado === '❌ FALTA' ? 'bg-red-50/50' : ''}>
                                        <TableCell>
                                            {row.estado === '✅ EXISTE' ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500" />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{row.id_sistema}</TableCell>
                                        <TableCell className="font-mono font-bold">{row.id_plantilla}</TableCell>
                                        <TableCell>{row.nombre_componente}</TableCell>
                                        <TableCell>
                                            <Badge variant={row.tipo === 'Accesorio' ? 'secondary' : 'outline'}>
                                                {row.tipo}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{row.sku_generado}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
