"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // State for the custom Plantilla dropdown
  const [openPlantilla, setOpenPlantilla] = useState(false);
  const [plantillaSearch, setPlantillaSearch] = useState("");
  const plantillaContainerRef = useRef<HTMLDivElement>(null);
  const plantillaInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!openPlantilla) return;
    function handleClick(e: MouseEvent) {
      if (plantillaContainerRef.current && !plantillaContainerRef.current.contains(e.target as Node)) {
        setOpenPlantilla(false);
        setPlantillaSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openPlantilla]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (openPlantilla) {
      setTimeout(() => plantillaInputRef.current?.focus(), 0);
    }
  }, [openPlantilla]);

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

  // Filtered plantillas for the dropdown
  const filteredPlantillas = useMemo(() => {
    if (!plantillas) return [];
    if (!plantillaSearch.trim()) return plantillas as any[];
    const s = plantillaSearch.toLowerCase();
    return (plantillas as any[]).filter(
      (p: any) =>
        p.id_plantilla?.toLowerCase().includes(s) ||
        p.nombre_generico?.toLowerCase().includes(s)
    );
  }, [plantillas, plantillaSearch]);

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
                const selectedPlantilla = (plantillas as any[])?.find(
                  (p: any) => p.id_plantilla === field.value
                );
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Plantilla *</FormLabel>
                    <FormControl>
                      <div ref={plantillaContainerRef} className="relative">
                        {/* Trigger button */}
                        <button
                          type="button"
                          onClick={() => setOpenPlantilla((v) => !v)}
                          className={cn(
                            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
                            "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <span className="truncate">
                            {field.value && selectedPlantilla
                              ? `${selectedPlantilla.nombre_generico} (${selectedPlantilla.id_plantilla})`
                              : "Seleccionar"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </button>

                        {/* Dropdown */}
                        {openPlantilla && (
                          <div
                            className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md flex flex-col overflow-hidden"
                            style={{ maxHeight: "280px" }}
                          >
                            {/* Search */}
                            <div className="flex items-center border-b px-3 py-2 flex-shrink-0">
                              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                              <input
                                ref={plantillaInputRef}
                                value={plantillaSearch}
                                onChange={(e) => setPlantillaSearch(e.target.value)}
                                placeholder="Buscar por SKU o nombre..."
                                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                              />
                            </div>
                            {/* List */}
                            <div className="overflow-y-auto flex-1">
                              {filteredPlantillas.length === 0 ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  No se encontró plantilla.
                                </div>
                              ) : (
                                filteredPlantillas.map((p: any) => (
                                  <div
                                    key={p.id_plantilla}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      form.setValue("id_plantilla", p.id_plantilla, { shouldValidate: true });
                                      setOpenPlantilla(false);
                                      setPlantillaSearch("");
                                    }}
                                    className={cn(
                                      "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm",
                                      "hover:bg-accent hover:text-accent-foreground",
                                      p.id_plantilla === field.value && "bg-accent/60 font-medium"
                                    )}
                                  >
                                    <Check
                                      className={cn(
                                        "h-4 w-4 flex-shrink-0",
                                        p.id_plantilla === field.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col min-w-0">
                                      <span className="truncate">{p.nombre_generico}</span>
                                      <span className="text-xs text-muted-foreground font-mono">
                                        {p.id_plantilla}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
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
