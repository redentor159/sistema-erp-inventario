"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Layers, Info, Hash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { serieEquivalenciaSchema, SerieEquivalenciaForm } from "@/lib/validators/mst";
import { mstApi } from "@/lib/api/mst";

interface SeriesFormProps {
    onSuccess?: () => void;
    initialData?: SerieEquivalenciaForm;
}

export function SeriesFormCmp({ onSuccess, initialData }: SeriesFormProps) {
    const queryClient = useQueryClient();
    const isEditing = !!initialData;

    const form = useForm<SerieEquivalenciaForm>({
        resolver: zodResolver(serieEquivalenciaSchema) as any,
        defaultValues: initialData || {
            id_sistema: "",
            nombre_comercial: "",
            cod_corrales: "",
            cod_eduholding: "",
            cod_hpd: "",
            cod_limatambo: "",
            uso_principal: "",
        },
    });

    const mutation = useMutation({
        mutationFn: isEditing ? mstApi.updateSerieEquivalencia : mstApi.createSerieEquivalencia,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mstSeriesEquivalencias"] });
            alert(
                isEditing
                    ? "¡Sistema/Serie actualizado exitosamente!"
                    : "¡Sistema/Serie creado exitosamente!"
            );
            form.reset();
            onSuccess?.();
        },
        onError: (error) => {
            console.error(error);
            alert(
                isEditing
                    ? "Error al actualizar el sistema/serie"
                    : "Error al crear el sistema/serie"
            );
        },
    });

    function onSubmit(data: SerieEquivalenciaForm) {
        mutation.mutate(data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* SECCIÓN 1: Datos Principales */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                            <Layers className="w-4 h-4" />
                            Datos del Sistema
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="id_sistema"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">ID Sistema</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: SYS_20"
                                                {...field}
                                                disabled={isEditing}
                                                className="h-8"
                                            />
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
                                        <FormLabel className="text-xs">Nombre Comercial</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: Sistema 20"
                                                {...field}
                                                className="h-8"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="uso_principal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Uso Principal (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Ventana Corrediza"
                                            {...field}
                                            value={field.value || ""}
                                            className="h-8"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* SECCIÓN 2: Códigos de Proveedores */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                            <Hash className="w-4 h-4" />
                            Códigos por Proveedor
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="cod_corrales"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Cod. Corrales</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Opcional"
                                                {...field}
                                                value={field.value || ""}
                                                className="h-8"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cod_eduholding"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Cod. Eduholding</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Opcional"
                                                {...field}
                                                value={field.value || ""}
                                                className="h-8"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cod_limatambo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Cod. Limatambo</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Opcional"
                                                {...field}
                                                value={field.value || ""}
                                                className="h-8"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cod_hpd"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Cod. HPD</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Opcional"
                                                {...field}
                                                value={field.value || ""}
                                                className="h-8"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4 border-t">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => onSuccess?.()}
                        className="mr-2 h-9"
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={mutation.isPending} className="h-9">
                        {mutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isEditing ? "Actualizar" : "Registrar"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
