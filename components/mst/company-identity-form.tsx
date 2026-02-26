"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { configApi } from "@/lib/api/config"; // New API file
import { configGeneralSchema, ConfigGeneralForm } from "@/lib/validators/mst";
import { mstApi } from "@/lib/api/mst";

// We reuse the schema but only show Identity fields
export function CompanyIdentityForm() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["mstConfig"],
    queryFn: configApi.getConfig, // Uses the new API that might fetch more columns if updated
  });

  const form = useForm<ConfigGeneralForm>({
    resolver: zodResolver(configGeneralSchema) as any,
    defaultValues: {
      id_config: "CONFIG_MAIN",
      nombre_empresa: "",
      ruc: "",
      direccion_fiscal: "",
      telefono_contacto: "",
      logo_url: "",
      firma_digital_url: "",
      // other fields are not handled here but Zod might require them if not optional.
      // Since we made them optional in schema, it's fine.
      // But wait, the previous schema had some required fields.
      // We need to provide default values for hidden fields or use a partial schema?
      // Actually, we are updating the SAME record. We should probably fetch the record,
      // put it in form, and only expose identity fields.
      // When submitting, we send everything? Or `configApi.updateConfig` handles partial updates?
      // Supabase `update` handles partials.
    },
    values: config
      ? {
          ...config,
          nombre_empresa: config.nombre_empresa || "",
          ruc: config.ruc || "",
          direccion_fiscal: config.direccion_fiscal || "",
          telefono_contacto: config.telefono_contacto || "",
          logo_url: config.logo_url || "",
          firma_digital_url: config.firma_digital_url || "",
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: configApi.updateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mstConfig"] });
      alert("¡Identidad de Empresa actualizada!");
    },
    onError: (error) => {
      console.error(error);
      alert("Error al guardar");
    },
  });

  function onSubmit(data: ConfigGeneralForm) {
    // We only want to update Identity fields to avoid overwriting parameters if they are not in this form
    // But since we load `values: config`, `data` should contain everything including hidden fields?
    // No, `react-hook-form` only includes registered fields unless we use `shouldUnregister: false`.
    // Better safest way: Extract only identity fields.
    const identityUpdates = {
      nombre_empresa: data.nombre_empresa,
      ruc: data.ruc,
      direccion_fiscal: data.direccion_fiscal,
      telefono_contacto: data.telefono_contacto,
      logo_url: data.logo_url,
      firma_digital_url: data.firma_digital_url,
    };
    mutation.mutate(identityUpdates);
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ruc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RUC</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="20..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nombre_empresa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Comercial / Razón Social</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Mi Empresa S.A.C." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="direccion_fiscal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección Fiscal</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Av. Principal 123..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefono_contacto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono / Celular</FormLabel>
              <FormControl>
                <Input {...field} placeholder="999..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL del Logo</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://..." />
              </FormControl>
              <FormDescription>
                Enlace directo a la imagen del logo (PNG/JPG transparente).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Guardar Identidad
        </Button>
      </form>
    </Form>
  );
}
