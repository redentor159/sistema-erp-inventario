"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useMemo } from "react"; // Added useMemo
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Calculator } from "lucide-react";
import { format } from "date-fns";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cotizacionCabeceraSchema, CotizacionForm } from "@/lib/validators/mto";
import { mtoApi } from "@/lib/api/mto";
import { mstApi } from "@/lib/api/mst";
import { catApi } from "@/lib/api/cat";
import { recetasApi } from "@/lib/api/recetas"; // Added recetasApi
import { cotizacionesApi } from "@/lib/api/cotizaciones";
import { CatalogSkuSelector } from "@/components/mto/catalog-sku-selector";

interface QuoteFormProps {
  onSuccess?: () => void;
}

export function QuoteFormCmp({ onSuccess }: QuoteFormProps) {
  const queryClient = useQueryClient();

  // Master Data
  const { data: clientes } = useQuery({
    queryKey: ["mstClientes"],
    queryFn: mstApi.getClientes,
  });
  const { data: marcas } = useQuery({
    queryKey: ["mstMarcas"],
    queryFn: catApi.getMarcas,
  });
  // FIXED: Use Engineering Recipes IDs instead of Product Templates
  // const { data: plantillas } = useQuery({ queryKey: ["catPlantillas"], queryFn: catApi.getPlantillas })
  const { data: recetas } = useQuery({
    queryKey: ["mstRecetasIds"],
    queryFn: cotizacionesApi.getRecetasIDs,
  });

  // Options for dynamic selectors (e.g. Brazos)
  const { data: recetasOptions } = useQuery({
    queryKey: ["recetasOptions"],
    queryFn: recetasApi.getRecetasOptions,
  });

  const recipesOptionsByModel = useMemo(() => {
    if (!recetasOptions) return {};
    const grouped: Record<string, Record<string, any[]>> = {};

    recetasOptions.forEach((r: any) => {
      if (!grouped[r.id_modelo]) grouped[r.id_modelo] = {};
      if (!grouped[r.id_modelo][r.grupo_opcion])
        grouped[r.id_modelo][r.grupo_opcion] = [];
      grouped[r.id_modelo][r.grupo_opcion].push(r);
    });
    return grouped;
  }, [recetasOptions]);

  const form = useForm<CotizacionForm>({
    resolver: zodResolver(cotizacionCabeceraSchema) as any,
    defaultValues: {
      moneda: "PEN",
      validez_dias: 15,
      incluye_igv: true,
      detalles: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "detalles",
  });

  // Calculations
  const detalles = form.watch("detalles");
  const subtotalNeto =
    detalles?.reduce((acc, curr) => {
      const lineTotal = Number(curr.subtotal_linea || 0);
      return acc + (isNaN(lineTotal) ? 0 : lineTotal);
    }, 0) || 0;

  const incluyeIgv = form.watch("incluye_igv");
  const igvRate = 0.18;
  const impuestMonto = incluyeIgv ? subtotalNeto * igvRate : 0;
  const totalGeneral = subtotalNeto + impuestMonto;

  const mutation = useMutation({
    mutationFn: mtoApi.createCotizacion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trxCotizaciones"] });
      alert("¡Cotización creada exitosamente!");
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      console.error(error);
      alert("Error al crear cotización: " + error.message);
    },
  });

  function onSubmit(data: CotizacionForm) {
    if (data.detalles.length === 0) {
      alert("Agregue al menos un item a la cotización");
      return;
    }
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* SECTION 1: HEADER INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="id_cliente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar Cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clientes?.map((c: any) => (
                      <SelectItem key={c.id_cliente} value={c.id_cliente}>
                        {c.nombre_completo}
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
            name="nombre_proyecto"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Nombre del Proyecto</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. Residencia Familia Pérez"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha_emision"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Emisión</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="moneda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
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

          <FormField
            control={form.control}
            name="id_marca"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca Preferente</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {marcas?.map((m: any) => (
                      <SelectItem key={m.id_marca} value={m.id_marca}>
                        {m.nombre_marca}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* SECTION 2: ITEMS DETAIL */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Detalle de Cerramientos</h3>
            <Button
              type="button"
              onClick={() =>
                append({
                  id_modelo: "",
                  cantidad: 1,
                  ancho_mm: 1000,
                  alto_mm: 1000,
                  etiqueta_item: `V-${fields.length + 1}`,
                  subtotal_linea: 0,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar Ventana/Puerta
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="relative">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    #{index + 1} | Item
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <FormField
                    control={form.control}
                    name={`detalles.${index}.etiqueta_item`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Etiqueta (Ej. V-01)
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="h-8" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`detalles.${index}.id_modelo`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Modelo / Plantilla
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Modelo..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {recetas?.map((r: any) => (
                              <SelectItem key={r.id_modelo} value={r.id_modelo}>
                                {r.id_modelo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Dynamic Options Selector (e.g. Brazos) */}
                  {(() => {
                    const currentModelId = form.watch(
                      `detalles.${index}.id_modelo`,
                    );
                    if (!currentModelId || !recetasOptions) return null;

                    const itemOptions = recipesOptionsByModel[currentModelId];
                    if (!itemOptions) return null;

                    return Object.entries(itemOptions).map(
                      ([grupo, items]: [string, any[]]) => {
                        // 1. GENERIC SELECTION (Catalog Search)
                        // If group is 'TIPO_BRAZO', show Catalog Selector
                        if (grupo === "TIPO_BRAZO") {
                          return (
                            <div
                              key={grupo}
                              className="col-span-2 bg-blue-50 p-2 rounded border border-blue-100"
                            >
                              <FormLabel className="text-xs font-semibold text-blue-700 block mb-1">
                                {grupo === "TIPO_BRAZO"
                                  ? "Tipo de Brazo"
                                  : grupo}
                              </FormLabel>
                              <CatalogSkuSelector
                                value={form.watch(
                                  `detalles.${index}.opciones_seleccionadas.${grupo}`,
                                )}
                                initialSearch="Brazo"
                                placeholder="Buscar Brazo (Ej. 30cm)..."
                                onChange={(sku: string, product: any) => {
                                  const current =
                                    form.getValues(
                                      `detalles.${index}.opciones_seleccionadas`,
                                    ) || {};
                                  form.setValue(
                                    `detalles.${index}.opciones_seleccionadas`,
                                    { ...current, [grupo]: sku },
                                    { shouldDirty: true },
                                  );
                                }}
                              />
                            </div>
                          );
                        }

                        // 2. PRE-DEFINED RECIPE SELECTION (Standard Select)
                        return (
                          <div
                            key={grupo}
                            className="col-span-2 bg-blue-50 p-2 rounded border border-blue-100"
                          >
                            <FormLabel className="text-xs font-semibold text-blue-700 block mb-1">
                              {grupo === "TIPO_BRAZO" ? "Tipo de Brazo" : grupo}
                            </FormLabel>
                            <Select
                              value={form.watch(
                                `detalles.${index}.opciones_seleccionadas.${grupo}`,
                              )}
                              onValueChange={(val) => {
                                const current =
                                  form.getValues(
                                    `detalles.${index}.opciones_seleccionadas`,
                                  ) || {};
                                form.setValue(
                                  `detalles.${index}.opciones_seleccionadas`,
                                  { ...current, [grupo]: val },
                                  { shouldDirty: true },
                                );
                              }}
                            >
                              <SelectTrigger className="h-8 bg-white">
                                <SelectValue placeholder="Seleccionar opción..." />
                              </SelectTrigger>
                              <SelectContent>
                                {items.map((opt: any) => (
                                  <SelectItem
                                    key={opt.id_receta}
                                    value={
                                      opt.id_sku_catalogo || opt.id_plantilla
                                    }
                                  >
                                    {opt.nombre_componente || opt.id_plantilla}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      },
                    );
                  })()}

                  <FormField
                    control={form.control}
                    name={`detalles.${index}.cantidad`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Cantidad</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-8" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`detalles.${index}.ancho_mm`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Ancho (mm)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="h-8" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`detalles.${index}.alto_mm`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Alto (mm)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="h-8" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`detalles.${index}.ubicacion`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-xs">Ubicación</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej. Sala Comedor"
                            {...field}
                            className="h-8"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Manual Pricing Override for now */}
                  <FormField
                    control={form.control}
                    name={`detalles.${index}.subtotal_linea`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-xs font-bold text-green-600">
                          Precio Venta (Manual)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            className="h-8 border-green-200 bg-green-50"
                          />
                        </FormControl>
                        <FormDescription className="text-[10px]">
                          *Calculadora auto. pendiente
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {fields.length === 0 && (
            <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
              No hay items. Agrega ventanas o puertas para cotizar.
            </div>
          )}
        </div>

        <Separator />

        {/* SECTION 3: TOTALS */}
        <div className="flex flex-col items-end space-y-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Incluir IGV (18%)
            </span>
            <FormField
              control={form.control}
              name="incluye_igv"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="flex justify-between w-64 text-sm">
            <span>Subtotal:</span>
            <span>{subtotalNeto.toFixed(2)}</span>
          </div>
          {incluyeIgv && (
            <div className="flex justify-between w-64 text-sm">
              <span>IGV (18%):</span>
              <span>{impuestMonto.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between w-64 text-xl font-bold border-t pt-2">
            <span>Total:</span>
            <span>
              {totalGeneral.toFixed(2)} {form.getValues("moneda")}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending} size="lg">
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Guardar Cotización
          </Button>
        </div>
      </form>
    </Form>
  );
}
