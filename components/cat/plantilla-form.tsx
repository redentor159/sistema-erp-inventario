
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

import { plantillaSchema, PlantillaForm } from "@/lib/validators/cat"
import { catApi } from "@/lib/api/cat"

interface PlantillaFormProps {
    onSuccess?: () => void
}

export function PlantillaFormCmp({ onSuccess }: PlantillaFormProps) {
    const queryClient = useQueryClient()

    // Fetch auxiliaries
    const { data: familias } = useQuery({ queryKey: ["mstFamilias"], queryFn: catApi.getFamilias })
    const { data: sistemas } = useQuery({ queryKey: ["mstSistemas"], queryFn: catApi.getSistemas })

    const form = useForm<PlantillaForm>({
        resolver: zodResolver(plantillaSchema) as any,
        defaultValues: {
            id_plantilla: "",
            nombre_generico: "",
            largo_estandar_mm: 0,
            peso_teorico_kg: 0,
            imagen_ref: ""
        }
    })

    const mutation = useMutation({
        mutationFn: catApi.createPlantilla,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["catPlantillas"] })
            alert("¡Plantilla creada exitosamente!")
            form.reset()
            onSuccess?.()
        },
        onError: (error) => {
            console.error(error)
            alert("Error al crear plantilla")
        }
    })

    function onSubmit(data: PlantillaForm) {
        mutation.mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <FormField
                    control={form.control}
                    name="id_plantilla"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Código Plantilla</FormLabel>
                            <FormControl>
                                <Input placeholder="V-CORREDIZA-20" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="nombre_generico"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Modelo</FormLabel>
                            <FormControl>
                                <Input placeholder="Ventana Corrediza Serie 20" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="id_familia"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Familia</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {familias?.map((f: any) => (
                                            <SelectItem key={f.id_familia} value={f.id_familia}>
                                                {f.nombre_familia}
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
                        name="id_sistema"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sistema / Serie</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sistemas?.map((s: any) => (
                                            <SelectItem key={s.id_sistema} value={s.id_sistema}>
                                                {s.nombre_comercial}
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
                        name="largo_estandar_mm"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Largo Estándar (mm) - Ref</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="peso_teorico_kg"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Peso Teórico (kg) - Ref</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="imagen_ref"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL Imagen Referencial</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Crear Plantilla
                    </Button>
                </div>
            </form>
        </Form>
    )
}
