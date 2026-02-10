
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

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

import { productoVarianteSchema, ProductoVarianteForm } from "@/lib/validators/cat"
import { catApi } from "@/lib/api/cat"

interface ProductFormProps {
    onSuccess?: () => void
}

export function ProductFormCmp({ onSuccess }: ProductFormProps) {
    const queryClient = useQueryClient()

    // Fetch auxiliaries
    const { data: familias } = useQuery({ queryKey: ["mstFamilias"], queryFn: catApi.getFamilias })
    const { data: marcas } = useQuery({ queryKey: ["mstMarcas"], queryFn: catApi.getMarcas })
    const { data: materiales } = useQuery({ queryKey: ["mstMateriales"], queryFn: catApi.getMateriales })
    const { data: acabados } = useQuery({ queryKey: ["mstAcabados"], queryFn: catApi.getAcabados })

    const form = useForm<ProductoVarianteForm>({
        resolver: zodResolver(productoVarianteSchema) as any,
        defaultValues: {
            id_sku: "",
            nombre_completo: "",
            costo_mercado_unit: 0,
            moneda_reposicion: "PEN",
            es_templado: false
        }
    })

    const mutation = useMutation({
        mutationFn: catApi.createProducto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["catProductos"] })
            alert("¡Producto creado exitosamente!")
            form.reset()
            onSuccess?.()
        },
        onError: (error) => {
            console.error(error)
            alert("Error al crear producto")
        }
    })

    function onSubmit(data: ProductoVarianteForm) {
        mutation.mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <FormField
                    control={form.control}
                    name="id_sku"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>SKU (Código Único)</FormLabel>
                            <FormControl>
                                <Input placeholder="ALU-2020-NEG" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="nombre_completo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Producto</FormLabel>
                            <FormControl>
                                <Input placeholder="Perfil Aluminio 2020 Negro Mate" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="id_marca"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Marca</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {marcas?.map((m: any) => (
                                            <SelectItem key={m.id_marca} value={m.id_marca}>
                                                {m.nombre_marca}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="id_material"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Material Base</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {materiales?.map((m: any) => (
                                            <SelectItem key={m.id_material} value={m.id_material}>
                                                {m.nombre_material}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="id_acabado"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Acabado/Color</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {acabados?.map((a: any) => (
                                            <SelectItem key={a.id_acabado} value={a.id_acabado}>
                                                {a.nombre_acabado}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="unidad_medida"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unidad Medida</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="UND">Unidad (Pza)</SelectItem>
                                        <SelectItem value="M">Metro Lineal (m)</SelectItem>
                                        <SelectItem value="M2">Metro Cuadrado (m²)</SelectItem>
                                        <SelectItem value="KG">Kilogramo (kg)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="costo_mercado_unit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Costo Mercado (Reposición)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="moneda_reposicion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Moneda Costo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar moneda" />
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
                </div>

                <FormField
                    control={form.control}
                    name="es_templado"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    ¿Es Vidrio Templado?
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Marque si este item requiere proceso de templado externo.
                                </p>
                            </div>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Crear SKU
                    </Button>
                </div>
            </form>
        </Form>
    )
}
