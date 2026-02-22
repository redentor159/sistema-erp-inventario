
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

import { clienteSchema, ClienteForm } from "@/lib/validators/mst"
import { mstApi } from "@/lib/api/mst"

interface ClientFormProps {
    onSuccess?: () => void
    initialData?: ClienteForm
}

export function ClientFormCmp({ onSuccess, initialData }: ClientFormProps) {
    const queryClient = useQueryClient()
    const isEditing = !!initialData

    const form = useForm<ClienteForm>({
        resolver: zodResolver(clienteSchema) as any,
        defaultValues: initialData || {
            id_cliente: "",
            nombre_completo: "",
            ruc: "",
            tipo_cliente: "EMPRESA",
            telefono: "",
            direccion_obra_principal: ""
        }
    })

    const mutation = useMutation({
        mutationFn: isEditing ? mstApi.updateCliente : mstApi.createCliente,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mstClientes"] })
            alert(isEditing ? "¡Cliente actualizado exitosamente!" : "¡Cliente creado exitosamente!")
            form.reset()
            onSuccess?.()
        },
        onError: (error) => {
            console.error(error)
            alert(isEditing ? "Error al actualizar cliente" : "Error al crear cliente")
        }
    })

    function onSubmit(data: ClienteForm) {
        mutation.mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="id_cliente"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID (Código)</FormLabel>
                                <FormControl>
                                    <Input placeholder="CLI_XYZ" {...field} disabled={isEditing} />
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
                    name="nombre_completo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre Completo / Razón Social</FormLabel>
                            <FormControl>
                                <Input placeholder="Empresa SAC" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="tipo_cliente"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="EMPRESA">Empresa</SelectItem>
                                        <SelectItem value="PERSONA">Persona</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="telefono"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="direccion_obra_principal"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dirección Principal</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? "Actualizar Cliente" : "Crear Cliente"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
