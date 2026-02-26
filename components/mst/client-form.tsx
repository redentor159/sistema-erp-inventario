"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Building2, MapPin } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { clienteSchema, ClienteForm } from "@/lib/validators/mst";
import { mstApi } from "@/lib/api/mst";

interface ClientFormProps {
  onSuccess?: () => void;
  initialData?: ClienteForm;
}

export function ClientFormCmp({ onSuccess, initialData }: ClientFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const form = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema) as any,
    defaultValues: initialData || {
      id_cliente: "",
      nombre_completo: "",
      ruc: "",
      tipo_cliente: "EMPRESA",
      telefono: "",
      direccion_obra_principal: "",
    },
  });

  const mutation = useMutation({
    mutationFn: isEditing ? mstApi.updateCliente : mstApi.createCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mstClientes"] });
      alert(
        isEditing
          ? "¡Cliente actualizado exitosamente!"
          : "¡Cliente creado exitosamente!",
      );
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      console.error(error);
      alert(
        isEditing ? "Error al actualizar cliente" : "Error al crear cliente",
      );
    },
  });

  function onSubmit(data: ClienteForm) {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* SECCIÓN 1: Datos Principales */}
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
                name="id_cliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">ID (Código)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="CLI_XYZ"
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
                name="ruc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">RUC</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="20123456789"
                        maxLength={11}
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
              name="nombre_completo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Nombre Completo / Razón Social
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Empresa SAC..."
                      {...field}
                      className="h-8"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo_cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Tipo de Cliente</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-8">
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
          </CardContent>
        </Card>

        {/* SECCIÓN 2: Contacto y Ubicación */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
              <MapPin className="w-4 h-4" />
              Contacto y Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Teléfono{" "}
                    <span className="text-muted-foreground font-normal">
                      (Opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: +51 999 888 777"
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
              name="direccion_obra_principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Dirección / Obra Principal{" "}
                    <span className="text-muted-foreground font-normal">
                      (Opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Av. Principal 123..."
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
            {isEditing ? "Actualizar Cliente" : "Registrar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
