"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { catApi } from "@/lib/api/cat";
import { retazosApi } from "@/lib/api/retazos";

// Schema
const retazoSchema = z.object({
  id_sku_padre: z.string().min(1, "Debe seleccionar un perfil"),
  longitud_mm: z.coerce.number().min(1, "Longitud requerida"),
  ubicacion: z.string().optional(),
  estado: z.enum(["DISPONIBLE", "ASIGNADO", "USADO"]),
  orden_trabajo: z.string().optional(),
});

type RetazoFormValues = z.infer<typeof retazoSchema>;

interface RetazoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RetazoForm({ open, onOpenChange }: RetazoFormProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: productsResult } = useQuery({
    queryKey: ["catProductos"],
    queryFn: () => catApi.getProductos({ pageSize: 10000 }), // Get all products for selection
  });

  // Extract the products array from the result
  const products = productsResult?.data || [];

  // Filter only profiles (This is a heuristic, better if API supports filtering by Family Type or we filter by naming convention/family)
  // Assuming 'PERF' check logic mentioned by user is implicit in SKU choice or family.
  // Let's filter client side for now.
  const profiles =
    products?.filter(
      (p: any) =>
        // Try to identify profiles. User said: Valid_If: SELECT(..., [ID_Familia] = "PERF")
        // We assume we can access family data or joined data.
        // In local data 'familia_nombre' or similar?
        // Let's show all for now but prioritize visual filter or implement smarter combo later.
        // Or if 'nombre_familia' is available.
        p.nombre_familia?.toUpperCase().includes("PERFIL") ||
        p.nombre_familia?.toUpperCase().includes("TUBO") ||
        p.id_sku.startsWith("P-") || // Guess
        p.id_sku.startsWith("AL-"),
    ) || [];

  const form = useForm<RetazoFormValues>({
    resolver: zodResolver(retazoSchema) as any,
    defaultValues: {
      estado: "DISPONIBLE",
      longitud_mm: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: retazosApi.createRetazo,
    onSuccess: () => {
      alert("Retazo registrado correctamente");
      queryClient.invalidateQueries({ queryKey: ["retazos"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (err) => {
      console.error(err);
      alert("Error al registrar retazo");
    },
  });

  const onSubmit = (data: RetazoFormValues) => {
    mutation.mutate({
      ...data,
      // @ts-ignore
      id_retazo: crypto.randomUUID(),
      ubicacion: data.ubicacion || null,
      orden_trabajo: data.orden_trabajo || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Retazo</DialogTitle>
          <DialogDescription>
            Ingrese los detalles del sobrante reutilizable.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="id_sku_padre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil (SKU Padre)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un perfil..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[350px] w-[550px]">
                      <div className="p-2 sticky top-0 bg-background border-b z-50">
                        <Input
                          placeholder="Buscar por código o nombre..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="h-9"
                          autoFocus
                        />
                      </div>
                      <div className="pt-1">
                        {profiles
                          .filter(
                            (p: any) =>
                              p.id_sku
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              p.nombre_completo
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()),
                          )
                          .slice(0, 50)
                          .map((p: any) => (
                            <SelectItem
                              key={p.id_sku}
                              value={p.id_sku}
                              className="py-3"
                            >
                              <div className="flex items-center gap-3 w-full">
                                <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-sm min-w-[150px]">
                                  {p.id_sku}
                                </span>
                                <span className="text-sm text-muted-foreground truncate flex-1">
                                  {p.nombre_completo}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        {profiles.filter(
                          (p: any) =>
                            p.id_sku
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            p.nombre_completo
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()),
                        ).length === 0 && (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            No se encontraron perfiles
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="longitud_mm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitud (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                        <SelectItem value="ASIGNADO">Asignado</SelectItem>
                        <SelectItem value="USADO">Usado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ubicacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Estante A-3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orden_trabajo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden Trabajo (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. OT-2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Retazo
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
