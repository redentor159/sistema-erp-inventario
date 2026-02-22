
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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

import { proveedorSchema, ProveedorForm } from "@/lib/validators/mst"
import { mstApi } from "@/lib/api/mst"

interface SupplierFormProps {
    onSuccess?: () => void
    initialData?: ProveedorForm
}

export function SupplierFormCmp({ onSuccess, initialData }: SupplierFormProps) {
    const queryClient = useQueryClient()
    const isEditing = !!initialData

    const form = useForm<ProveedorForm>({
        resolver: zodResolver(proveedorSchema) as any,
        defaultValues: initialData || {
            id_proveedor: "",
            razon_social: "",
            ruc: "",
            moneda_predeterminada: "PEN",
            dias_credito: 0,
            email_pedidos: ""
        }
    })

    const mutation = useMutation({
        mutationFn: isEditing ? mstApi.updateProveedor : mstApi.createProveedor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mstProveedores"] })
            alert(isEditing ? "¡Proveedor actualizado exitosamente!" : "¡Proveedor creado exitosamente!")
            form.reset()
            onSuccess?.()
        },
        onError: (error) => {
            console.error(error)
            alert(isEditing ? "Error al actualizar proveedor" : "Error al crear proveedor")
        }
    })

    function onSubmit(data: ProveedorForm) {
        mutation.mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="id_proveedor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID (Código)</FormLabel>
                                <FormControl>
                                    <Input placeholder="PROV_XYZ" {...field} disabled={isEditing} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="ruc"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>RUC</FormLabel>
                                <FormControl>
                                    <Input placeholder="20123456789" maxLength={11} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="razon_social"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Razón Social</FormLabel>
                            <FormControl>
                                <Input placeholder="Proveedor SAC" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="moneda_predeterminada"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Moneda</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar moneda" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="PEN">Soles (PEN)</SelectItem>
                                        <SelectItem value="USD">Dólares (USD)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dias_credito"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Días de Crédito</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="email_pedidos"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email (Pedidos)</FormLabel>
                            <FormControl>
                                <Input type="email" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? "Actualizar Proveedor" : "Crear Proveedor"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
