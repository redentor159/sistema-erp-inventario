"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import {
  productoVarianteSchema,
  ProductoVarianteForm,
} from "@/lib/validators/cat";
import { catApi } from "@/lib/api/cat";
import { useToast } from "@/components/ui/use-toast";

interface ProductFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export function ProductFormCmp({ onSuccess, initialData }: ProductFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [openPlantilla, setOpenPlantilla] = useState(false);

  // Fetch auxiliaries
  const { data: plantillas } = useQuery({
    queryKey: ["catPlantillas"],
    queryFn: catApi.getPlantillas,
  });
  const { data: marcas } = useQuery({
    queryKey: ["mstMarcas"],
    queryFn: catApi.getMarcas,
  });
  const { data: materiales } = useQuery({
    queryKey: ["mstMateriales"],
    queryFn: catApi.getMateriales,
  });
  const { data: acabados } = useQuery({
    queryKey: ["mstAcabados"],
    queryFn: catApi.getAcabados,
  });
  const { data: almacenes } = useQuery({
    queryKey: ["mstAlmacenes"],
    queryFn: catApi.getAlmacenes,
  });

  const form = useForm<ProductoVarianteForm>({
    resolver: zodResolver(productoVarianteSchema) as any,
    defaultValues: {
      // === Identidad ===
      id_sku: initialData?.id_sku || "",
      id_plantilla: initialData?.id_plantilla || "",
      id_marca: initialData?.id_marca || "",
      id_material: initialData?.id_material || "",
      id_acabado: initialData?.id_acabado || "",
      id_almacen: initialData?.id_almacen || "",

      // === Datos Generales ===
      cod_proveedor: initialData?.cod_proveedor || "",
      nombre_completo: initialData?.nombre_completo || "",
      unidad_medida: initialData?.unidad_medida || "",

      // === Costos ===
      costo_mercado_unit: initialData?.costo_mercado_unit
        ? Number(initialData.costo_mercado_unit)
        : 0,
      moneda_reposicion: initialData?.moneda_reposicion || "PEN",

      // === Propiedades Vidrio ===
      es_templado: initialData?.es_templado || false,
      espesor_mm: initialData?.espesor_mm ? Number(initialData.espesor_mm) : 0,
      costo_flete_m2: initialData?.costo_flete_m2
        ? Number(initialData.costo_flete_m2)
        : 0,

      // === Parámetros Inventario ===
      stock_minimo: initialData?.stock_minimo
        ? Number(initialData.stock_minimo)
        : 0,
      punto_pedido: initialData?.punto_pedido
        ? Number(initialData.punto_pedido)
        : 0,
      tiempo_reposicion_dias: initialData?.tiempo_reposicion_dias
        ? Number(initialData.tiempo_reposicion_dias)
        : 7,
      lote_econ_compra: initialData?.lote_econ_compra
        ? Number(initialData.lote_econ_compra)
        : 1,
      demanda_promedio_diaria: initialData?.demanda_promedio_diaria
        ? Number(initialData.demanda_promedio_diaria)
        : 0,
    },
  });

  // Watch fields for Auto-SKU
  const [idMaterial, idPlantilla, idAcabado, idMarca] = form.watch([
    "id_material",
    "id_plantilla",
    "id_acabado",
    "id_marca",
  ]);

  // Glass Logic Detection
  const isGlass =
    idMaterial?.includes("CR") ||
    materiales
      ?.find((m: any) => m.id_material === idMaterial)
      ?.nombre_material?.toLowerCase()
      .includes("vidrio");

  // Auto-Generate SKU: MATERIAL-PLANTILLA-ACABADO-MARCA
  useEffect(() => {
    if (idMaterial && idPlantilla && idAcabado && idMarca) {
      const newSku = `${idMaterial}-${idPlantilla}-${idAcabado}-${idMarca}`;
      form.setValue("id_sku", newSku, { shouldValidate: true });
    }
  }, [idMaterial, idPlantilla, idAcabado, idMarca, form]);

  const createMutation = useMutation({
    mutationFn: catApi.createProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catProductos"] });
      toast({ title: "¡Producto creado exitosamente!", variant: "default" });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error al crear producto: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductoVarianteForm) =>
      catApi.updateProducto(initialData.id_sku, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catProductos"] });
      toast({
        title: "Producto actualizado correctamente",
        variant: "default",
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error al actualizar: " + error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: ProductoVarianteForm) {
    if (initialData) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 max-h-[70vh] overflow-y-auto pr-2"
      >
        {/* ═══════ SECCIÓN 1: SKU (auto-generado) ═══════ */}
        <FormField
          control={form.control}
          name="id_sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU (Código Único)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Se genera automáticamente"
                  {...field}
                  readOnly
                  className="bg-muted font-mono"
                />
              </FormControl>
              <FormDescription>
                Auto-generado: MATERIAL-PLANTILLA-ACABADO-MARCA
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ═══════ SECCIÓN 2: NOMBRE Y CÓDIGO PROVEEDOR ═══════ */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="nombre_completo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Felpa 80" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="cod_proveedor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cód. Proveedor</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Opcional"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ═══════ SECCIÓN 3: COMPONENTES SKU (4 selectores obligatorios) ═══════ */}
        <div className="p-6 bg-white rounded-md shadow-sm ring-1 ring-slate-900/5 space-y-3">
          <div className="text-sm font-semibold text-muted-foreground">
            Componentes del SKU (obligatorios)
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="id_material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Base *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materiales?.map((m: any) => (
                        <SelectItem key={m.id_material} value={m.id_material}>
                          {m.nombre_material} ({m.id_material})
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
              name="id_plantilla"
              render={({ field }) => {
                const selectedPlantilla = plantillas?.find(
                  (p: any) => p.id_plantilla === field.value
                );
                return (
                  <FormItem className="flex flex-col pt-[5px]">
                    <FormLabel>Plantilla *</FormLabel>
                    <Popover open={openPlantilla} onOpenChange={setOpenPlantilla}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between font-normal mt-0",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate">
                              {field.value && selectedPlantilla
                                ? `${selectedPlantilla.nombre_generico} (${selectedPlantilla.id_plantilla})`
                                : "Seleccionar"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] sm:w-[350px] p-0" align="start">
                        <Command
                          filter={(value, search) => {
                            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                            return 0;
                          }}
                        >
                          <CommandInput placeholder="Buscar por SKU o nombre..." />
                          <CommandList>
                            <CommandEmpty>No se encontró plantilla.</CommandEmpty>
                            <CommandGroup>
                              {plantillas?.map((p: any) => (
                                <CommandItem
                                  value={`${p.nombre_generico} ${p.id_plantilla}`}
                                  key={p.id_plantilla}
                                  onSelect={() => {
                                    form.setValue("id_plantilla", p.id_plantilla, {
                                      shouldValidate: true,
                                    });
                                    setOpenPlantilla(false);
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    form.setValue("id_plantilla", p.id_plantilla, {
                                      shouldValidate: true,
                                    });
                                    setOpenPlantilla(false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 flex-shrink-0",
                                      p.id_plantilla === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col truncate">
                                    <span className="truncate">{p.nombre_generico}</span>
                                    <span className="text-xs text-muted-foreground font-mono">
                                      {p.id_plantilla}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="id_acabado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acabado/Color *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {acabados?.map((a: any) => (
                        <SelectItem key={a.id_acabado} value={a.id_acabado}>
                          {a.nombre_acabado} ({a.id_acabado})
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
              name="id_marca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {marcas?.map((m: any) => (
                        <SelectItem key={m.id_marca} value={m.id_marca}>
                          {m.nombre_marca} ({m.id_marca})
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
              name="id_almacen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Almacén</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {almacenes?.map((a: any) => (
                        <SelectItem key={a.id_almacen} value={a.id_almacen}>
                          {a.nombre_almacen}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ═══════ SECCIÓN 4: UNIDAD Y COSTOS ═══════ */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="unidad_medida"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad Medida</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
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
                    <SelectItem value="L">Litro (L)</SelectItem>
                    <SelectItem value="GLB">Global</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="costo_mercado_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo Mercado (Reposición)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
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
                <FormLabel>Moneda</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || "PEN"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Moneda" />
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

        {/* ═══════ SECCIÓN 5: PROPIEDADES VIDRIO (condicional) ═══════ */}
        {isGlass && (
          <div className="grid grid-cols-3 gap-4 p-6 rounded-md shadow-sm ring-1 ring-blue-600/10 bg-blue-50/50">
            <div className="col-span-3 text-sm font-semibold text-blue-700 dark:text-blue-400">
              🪟 Propiedades de Vidrio
            </div>

            <FormField
              control={form.control}
              name="es_templado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>¿Templado?</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="espesor_mm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Espesor (mm)</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    defaultValue={field.value?.toString() || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 8, 10, 12, 15, 19].map((val) => (
                        <SelectItem key={val} value={val.toString()}>
                          {val} mm
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
              name="costo_flete_m2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo Flete x m²</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* ═══════ SECCIÓN 6: PARÁMETROS DE INVENTARIO ═══════ */}
        <div className="p-6 rounded-md shadow-sm ring-1 ring-slate-900/5 space-y-3 bg-slate-50/50">
          <div className="text-sm font-semibold text-muted-foreground">
            📦 Parámetros de Inventario
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="stock_minimo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Mínimo</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="punto_pedido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Punto de Pedido</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tiempo_reposicion_dias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Time (días)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      {...field}
                      value={field.value ?? 7}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lote_econ_compra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lote Económico</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? 1}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="demanda_promedio_diaria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Demanda Diaria Prom.</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ═══════ SUBMIT ═══════ */}
        <div className="flex justify-end pt-4 sticky bottom-0 bg-background pb-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Actualizar Producto" : "Crear Producto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
