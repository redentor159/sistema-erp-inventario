
"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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

import { entradaCabeceraSchema, EntradaForm } from "@/lib/validators/trx"
import { trxApi } from "@/lib/api/trx"
import { mstApi } from "@/lib/api/mst"
import { catApi } from "@/lib/api/cat"

interface EntradaFormProps {
    onSuccess?: () => void
}

export function EntradaFormCmp({ onSuccess }: EntradaFormProps) {
    const queryClient = useQueryClient()

    // Data fetching
    const { data: proveedores } = useQuery({ queryKey: ["mstProveedores"], queryFn: () => mstApi.getProveedores() })

    // REMOVED BULK FETCHING OF PRODUCTS
    // const { data: productos } = useQuery(...)

    const form = useForm<EntradaForm>({
        resolver: zodResolver(entradaCabeceraSchema) as any,
        defaultValues: {
            tipo_entrada: "COMPRA",
            moneda: "PEN",
            tipo_cambio: 1.0,
            estado: "INGRESADO",
            nro_documento_fisico: "",
            comentarios: "",
            detalles: []
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "detalles"
    })

    // Watchers to calculate totals
    const detalles = form.watch("detalles")
    const subtotal = detalles?.reduce((acc, curr) => {
        const lineTotal = (Number(curr.cantidad) * Number(curr.costo_unitario)) - (Number(curr.descuento) || 0)
        return acc + (isNaN(lineTotal) ? 0 : lineTotal)
    }, 0) || 0

    const mutation = useMutation({
        mutationFn: trxApi.createEntrada,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trxMovimientos"] })
            queryClient.invalidateQueries({ queryKey: ["trxEntradas"] })
            alert("¡Entrada registrada correctamente!")
            form.reset()
            onSuccess?.()
        },
        onError: (error) => {
            console.error(error)
            alert("Error al registrar entrada: " + error.message)
        }
    })

    function onSubmit(data: EntradaForm) {
        if (data.detalles.length === 0) {
            alert("Debe agregar al menos un producto")
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
                        name="tipo_entrada"
                        render={({ field }) => (
                            <FormItem className="col-span-1">
                                <FormLabel>Tipo Entrada</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="COMPRA">Compra</SelectItem>
                                        <SelectItem value="AJUSTE_POSITIVO">Ajuste (+)</SelectItem>
                                        <SelectItem value="DEVOLUCION_CLIENTE">Devolución Cliente</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {form.watch("tipo_entrada") === "COMPRA" && (
                        <FormField
                            control={form.control}
                            name="id_proveedor"
                            render={({ field }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Proveedor</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar proveedor" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {proveedores?.map((p: any) => (
                                                <SelectItem key={p.id_proveedor} value={p.id_proveedor}>
                                                    {p.razon_social} ({p.ruc})
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
                        name="nro_documento_fisico"
                        render={({ field }) => (
                            <FormItem className={form.watch("tipo_entrada") !== "COMPRA" ? "col-span-2" : "col-span-1"}>
                                <FormLabel>Ref. / Documento</FormLabel>
                                <FormControl>
                                    <Input placeholder="F001-123, OP-001..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="fecha_registro"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha Emisión</FormLabel>
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
                        name="moneda"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Moneda Doc.</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Moneda" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="PEN">Soles (S/)</SelectItem>
                                        <SelectItem value="USD">Dólares ($)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {form.watch("moneda") !== "PEN" && (
                        <FormField
                            control={form.control}
                            name="tipo_cambio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo Cambio</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="comentarios"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Comentarios</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Observaciones de la recepción..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* DETALLE (ITEMS) */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Items de Compra</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ id_sku: "", cantidad: 1, costo_unitario: 0, descuento: 0 })}>
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
                                    <TableHead className="w-[120px]">Costo Unit.</TableHead>
                                    <TableHead className="w-[100px]">Desc.</TableHead>
                                    <TableHead className="w-[120px] text-right">Total Linea</TableHead>
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
                                                    <FormControl>
                                                        <InlineProductCombobox
                                                            value={field.value}
                                                            onChange={(val, product) => {
                                                                field.onChange(val)
                                                                // Auto-fill cost
                                                                if (product) {
                                                                    const currentCost = product.costo_estandar || 0
                                                                    form.setValue(`detalles.${index}.costo_unitario`, currentCost)
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
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
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`detalles.${index}.costo_unitario`}
                                                render={({ field }) => (
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} />
                                                    </FormControl>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`detalles.${index}.descuento`}
                                                render={({ field }) => (
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} />
                                                    </FormControl>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {((form.watch(`detalles.${index}.cantidad`) || 0) * (form.watch(`detalles.${index}.costo_unitario`) || 0)).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {fields.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No hay items en la orden de compra.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end items-center gap-4 p-4 bg-muted/20 rounded-lg">
                        <span className="text-lg font-bold">Total Documento:</span>
                        <span className="text-2xl font-bold">{subtotal.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={mutation.isPending} size="lg">
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Registrar Entrada (Kardex)
                    </Button>
                </div>
            </form>
        </Form>
    )
}
