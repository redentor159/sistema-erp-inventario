"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Building2, UserCircle, Briefcase, Handshake } from "lucide-react"

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
            nombre_comercial: "",
            contacto_vendedor: "",
            telefono_pedidos: "",
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* SECCIÓN 1: Datos de la Empresa */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                            <Building2 className="w-4 h-4" />
                            Datos Principales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="id_proveedor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">ID (Código)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="PROV_XYZ" {...field} disabled={isEditing} className="h-8" />
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
                                        <FormLabel className="text-xs">RUC</FormLabel>
                                        <FormControl>
                                            <Input placeholder="20123456789" maxLength={11} {...field} className="h-8" />
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
                                    <FormLabel className="text-xs">Razón Social</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Razón social legal..." {...field} className="h-8" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nombre_comercial"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Nombre Comercial <span className="text-muted-foreground font-normal">(Opcional)</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nombre conocido..." {...field} value={field.value || ''} className="h-8" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* SECCIÓN 2: Contacto */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                            <UserCircle className="w-4 h-4" />
                            Datos de Contacto
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="contacto_vendedor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Nombre del Asesor / Vendedor <span className="text-muted-foreground font-normal">(Opcional)</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Juan Pérez" {...field} value={field.value || ''} className="h-8" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="telefono_pedidos"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Teléfono <span className="text-muted-foreground font-normal">(Opcional)</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: +51 999 888 777" {...field} value={field.value || ''} className="h-8" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email_pedidos"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Email para Pedidos <span className="text-muted-foreground font-normal">(Opcional)</span></FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="ventas@proveedor.com" {...field} value={field.value || ''} className="h-8" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* SECCIÓN 3: Condiciones Económicas */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                            <Handshake className="w-4 h-4" />
                            Condiciones Comerciales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="moneda_predeterminada"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Moneda</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-8">
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
                                        <FormLabel className="text-xs">Días de Crédito</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" placeholder="0 = Contado" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="h-8" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" type="button" onClick={() => onSuccess?.()} className="mr-2 h-9">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={mutation.isPending} className="h-9">
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? "Actualizar Proveedor" : "Registrar Proveedor"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
