
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { plantillaSchema, PlantillaForm as PlantillaFormType } from "@/lib/validators/cat"
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { catApi } from "@/lib/api/cat"
import { useToast } from "@/components/ui/use-toast"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface PlantillaFormProps {
    onSuccess: () => void
    initialData?: any
}

export function PlantillaForm({ onSuccess, initialData }: PlantillaFormProps) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    // Queries for selectors
    const { data: familias } = useQuery({ queryKey: ["mstFamilias"], queryFn: catApi.getFamilias })
    const { data: sistemas } = useQuery({ queryKey: ["mstSistemas"], queryFn: catApi.getSistemas })

    const form = useForm<PlantillaFormType>({
        resolver: zodResolver(plantillaSchema) as any,
        defaultValues: {
            id_plantilla: initialData?.id_plantilla || "",
            nombre_generico: initialData?.nombre_generico || "",
            id_familia: initialData?.id_familia || "",
            id_sistema: initialData?.id_sistema || "",
            largo_estandar_mm: initialData?.largo_estandar_mm ? Number(initialData.largo_estandar_mm) : 0,
            peso_teorico_kg: initialData?.peso_teorico_kg ? Number(initialData.peso_teorico_kg) : 0,
            imagen_ref: initialData?.imagen_ref || "",
        },
    })

    const createMutation = useMutation({
        mutationFn: catApi.createPlantilla,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["catPlantillas"] })
            toast({ title: "Plantilla creada correctamente", variant: "default" })
            onSuccess()
        },
        onError: (error) => {
            toast({ title: "Error al crear plantilla: " + error.message, variant: "destructive" })
        },
    })

    const updateMutation = useMutation({
        mutationFn: (data: PlantillaFormType) => catApi.updatePlantilla(initialData.id_plantilla, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["catPlantillas"] })
            toast({ title: "Plantilla actualizada correctamente", variant: "default" })
            onSuccess()
        },
        onError: (error) => {
            toast({ title: "Error al actualizar plantilla: " + error.message, variant: "destructive" })
        },
    })

    const onSubmit = (data: PlantillaFormType) => {
        if (initialData) {
            updateMutation.mutate(data)
        } else {
            createMutation.mutate(data)
        }
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                {/* ID Plantilla — Solo editable al crear, read-only al editar */}
                <FormField
                    control={form.control}
                    name="id_plantilla"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ID Plantilla (Código Único)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ej. FE80, 2020, PVNT"
                                    {...field}
                                    value={field.value || ""}
                                    disabled={!!initialData}
                                    className={initialData ? "bg-muted font-mono" : "font-mono"}
                                />
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
                            <FormLabel>Nombre Genérico</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Felpa 80, Perfil Vertical Nave Top" {...field} />
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
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione familia" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="null">-- Ninguna --</SelectItem>
                                        {familias?.map((f: any) => (
                                            <SelectItem key={f.id_familia} value={f.id_familia}>
                                                {f.nombre_familia} ({f.id_familia})
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
                                <FormLabel>Sistema (Opcional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione sistema" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="null">-- Ninguno --</SelectItem>
                                        {sistemas?.map((s: any) => (
                                            <SelectItem key={s.id_sistema} value={s.id_sistema}>
                                                {s.nombre_comercial} ({s.id_sistema})
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
                                <FormLabel>Largo Estándar (mm)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        value={field.value ?? 0}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                    />
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
                                <FormLabel>Peso Teórico (Kg/m)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.001"
                                        {...field}
                                        value={field.value ?? 0}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                    />
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
                                <Input placeholder="https://..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Actualizar Plantilla" : "Crear Plantilla"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
