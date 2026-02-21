
"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { InlineProductCombobox } from "@/components/trx/inline-product-combobox"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { salidaCabeceraSchema, SalidaForm } from "@/lib/validators/trx"
import { trxApi } from "@/lib/api/trx"
import { mstApi } from "@/lib/api/mst"
import { catApi } from "@/lib/api/cat"

interface SalidaFormProps {
    onSuccess?: () => void
}

export function SalidaFormCmp({ onSuccess }: SalidaFormProps) {
    const queryClient = useQueryClient()

    const { data: clientes } = useQuery({ queryKey: ["mstClientes"], queryFn: () => mstApi.getClientes() })

    // REMOVED BULK FETCHING OF PRODUCTS

    const form = useForm<SalidaForm>({
        resolver: zodResolver(salidaCabeceraSchema) as any,
        defaultValues: {
            tipo_salida: "VENTA",
            estado: "CONFIRMADO",
            detalles: []
        }
    })

    const [incluirIgv, setIncluirIgv] = React.useState(false)

    // Watch tipo_salida to conditionally show fields
    const tipoSalida = form.watch("tipo_salida")

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "detalles"
    })

    // Watchers to calculate totals
    const detalles = form.watch("detalles")
    const subtotal = detalles?.reduce((acc, curr) => {
        const lineTotal = (Number(curr.cantidad) * Number(curr.precio_unitario))
        return acc + (isNaN(lineTotal) ? 0 : lineTotal)
    }, 0) || 0

    // PRECIOS LOGIC
    const { data: config } = useQuery({ queryKey: ["mstConfig"], queryFn: mstApi.getConfiguracion })

    // Auto-recalculate prices when Toggle changes or Type changes
    React.useEffect(() => {
        // We need to use getValues to access the "producto" field which might not be watched deeply if not used in render
        // But 'detalles' watcher above should trigger this effect too if we depend on it?
        // Let's rely on form.getValues() inside the effect to be safe.
        const currentDetails = form.getValues("detalles")

        if (currentDetails.length > 0) {
            currentDetails.forEach((item, index) => {
                // We use the stored product object if available
                if (item.producto) {
                    const newPrice = calculatePrice(item.producto, tipoSalida)
                    // Only update if different to avoid infinite loops? 
                    // setValue should be fine.
                    form.setValue(`detalles.${index}.precio_unitario`, newPrice)
                }
            })
        }
    }, [incluirIgv, tipoSalida, config])

    const calculatePrice = (product: any, tipo: string) => {
        if (!product) return 0

        const pmp = Number(product.costo_promedio) || 0
        const mercado = Number(product.costo_mercado_unit) || 0

        // Defaults if config is loading or missing
        const margen = config ? (Number(config.margen_ganancia_default) || 0.30) : 0.30
        const igvInfo = config ? (Number(config.igv) || 0.18) : 0.18

        if (tipo === 'VENTA') {
            const base = Math.max(pmp, mercado)

            let finalPrice = base * (1 + margen)
            if (incluirIgv) {
                finalPrice = finalPrice * (1 + igvInfo)
            }

            return Number(finalPrice.toFixed(2))
        } else {
            // PRODUCCION, AJUSTE = Cost
            return Number(pmp.toFixed(2))
        }
    }

    const mutation = useMutation({
        mutationFn: trxApi.createSalida,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trxMovimientos"] })
            queryClient.invalidateQueries({ queryKey: ["trxSalidas"] })
            alert("¡Salida registrada correctamente!")
            form.reset()
            setIncluirIgv(false)
            onSuccess?.()
        },
        onError: (error) => {
            console.error(error)
            alert("Error al registrar salida: " + error.message)
        }
    })

    function onSubmit(data: SalidaForm) {
        if (data.detalles.length === 0) {
            alert("Debe agregar al menos un item")
            return
        }
        mutation.mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* CABECERA */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                    <FormField
                        control={form.control}
                        name="tipo_salida"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Salida</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="VENTA">Venta Directa</SelectItem>
                                        <SelectItem value="PRODUCCION">Consumo Producción</SelectItem>
                                        <SelectItem value="AJUSTE_NEGATIVO">Ajuste Inventario (-)</SelectItem>
                                        <SelectItem value="DEVOLUCION_PROOVEDOR">Devolución a Prov.</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {tipoSalida === 'VENTA' && (
                        <FormField
                            control={form.control}
                            name="id_cliente"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Cliente</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar cliente" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {clientes?.map((c: any) => (
                                                <SelectItem key={c.id_cliente} value={c.id_cliente}>
                                                    {c.nombre_completo}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="fecha"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha</FormLabel>
                                <FormControl>
                                    <Input type="date"
                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="comentario"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Comentarios / Referencia</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Ej. Para Proyecto X, Merma, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* DETALLE (ITEMS) */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Items de Salida</h3>

                        {tipoSalida === 'VENTA' && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="igv"
                                    checked={incluirIgv}
                                    onCheckedChange={(checked) => setIncluirIgv(checked as boolean)}
                                />
                                <label
                                    htmlFor="igv"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Incluir IGV (18%)
                                </label>
                            </div>
                        )}

                        <Button type="button" variant="outline" size="sm" onClick={() => append({ id_sku: "", cantidad: 1, precio_unitario: 0 })}>
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Item
                        </Button>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Producto (SKU)</TableHead>
                                    <TableHead className="w-[100px]">Cantidad</TableHead>
                                    {tipoSalida === 'VENTA' && (
                                        <TableHead className="w-[120px]">Precio Venta</TableHead>
                                    )}
                                    <TableHead className="w-[120px] text-right">Subtotal</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`detalles.${index}.id_sku`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormControl>
                                                            <InlineProductCombobox
                                                                value={field.value}
                                                                onChange={(newSku, product) => {
                                                                    field.onChange(newSku)
                                                                    // Store product for future recalculations
                                                                    form.setValue(`detalles.${index}.producto`, product)

                                                                    const price = calculatePrice(product, tipoSalida)
                                                                    form.setValue(`detalles.${index}.precio_unitario`, price)
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`detalles.${index}.cantidad`}
                                                render={({ field }) => (
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} />
                                                    </FormControl>
                                                )}
                                            />
                                        </TableCell>
                                        {tipoSalida === 'VENTA' && (
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`detalles.${index}.precio_unitario`}
                                                    render={({ field }) => (
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                {...field}
                                                                readOnly={true}
                                                                className="bg-gray-100 text-gray-500 cursor-not-allowed"
                                                            />
                                                        </FormControl>
                                                    )}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell className="text-right font-medium">
                                            {((form.watch(`detalles.${index}.cantidad`) || 0) * (form.watch(`detalles.${index}.precio_unitario`) || 0)).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {tipoSalida === 'VENTA' && (
                        <div className="flex justify-end items-center gap-4 p-4 bg-muted/20 rounded-lg">
                            <span className="text-lg font-bold">Total Venta:</span>
                            <span className="text-2xl font-bold">{subtotal.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={mutation.isPending} size="lg" variant="destructive">
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Registrar Salida
                    </Button>
                </div>
            </form>
        </Form>
    )
}
