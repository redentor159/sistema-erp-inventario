"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Building2,
  Calculator,
  DollarSign,
  Landmark,
  FileText,
  Palette,
  Save,
} from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { configGeneralSchema, ConfigGeneralForm } from "@/lib/validators/mst";
import { mstApi } from "@/lib/api/mst";

export function ConfigGeneralFormCmp() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["mstConfig"],
    queryFn: mstApi.getConfig,
  });

  const form = useForm<ConfigGeneralForm>({
    resolver: zodResolver(configGeneralSchema) as any,
    defaultValues: {
      id_config: "CONFIG_MAIN",
      margen_ganancia_default: 0.3,
      igv: 0.18,
      markup_cotizaciones_default: 0.1,
      costo_mo_m2_default: 50,
      tipo_cambio_referencial: 3.8,
      validez_cotizacion_dias: 15,
      descuento_maximo_pct: 0.15,
      moneda_default: "PEN",
      color_primario: "#2563eb",
    },
    values: config
      ? {
          ...config,
          // Ensure optional fields are handled safely
          cuenta_bcp_soles: config.cuenta_bcp_soles || "",
          cuenta_bcp_dolares: config.cuenta_bcp_dolares || "",
          cci_soles: config.cci_soles || "",
          cci_dolares: config.cci_dolares || "",
          // BBVA
          cuenta_bbva_soles: config.cuenta_bbva_soles || "",
          cuenta_bbva_dolares: config.cuenta_bbva_dolares || "",
          cci_bbva_soles: config.cci_bbva_soles || "",
          cci_bbva_dolares: config.cci_bbva_dolares || "",
          nombre_titular_cuenta: config.nombre_titular_cuenta || "",
          texto_condiciones_base: config.texto_condiciones_base || "",
          texto_garantia: config.texto_garantia || "",
          texto_forma_pago: config.texto_forma_pago || "",
          notas_pie_cotizacion: config.notas_pie_cotizacion || "",
          nombre_empresa: config.nombre_empresa || "",
          ruc: config.ruc || "",
          direccion_fiscal: config.direccion_fiscal || "",
          telefono_contacto: config.telefono_contacto || "",
          email_empresa: config.email_empresa || "",
          logo_url: config.logo_url || "",
          firma_digital_url: config.firma_digital_url || "",
          nombre_representante: config.nombre_representante || "",
          cargo_representante: config.cargo_representante || "",
          color_primario: config.color_primario || "#2563eb",
          moneda_default: config.moneda_default || "PEN",
          validez_cotizacion_dias: config.validez_cotizacion_dias || 15,
          descuento_maximo_pct: config.descuento_maximo_pct || 0.15,
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: mstApi.updateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mstConfig"] });
      alert("¡Configuración guardada!");
    },
    onError: (error) => {
      console.error(error);
      alert("Error al guardar la configuración");
    },
  });

  function onSubmit(data: ConfigGeneralForm) {
    mutation.mutate(data);
  }

  // Helper for number inputs
  const handleNumberChange =
    (field: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
      field.onChange(isNaN(val) ? 0 : val);
    };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="empresa" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="empresa" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="cotizacion" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Cotización</span>
            </TabsTrigger>
            <TabsTrigger value="finanzas" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Finanzas</span>
            </TabsTrigger>
            <TabsTrigger value="bancos" className="flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              <span className="hidden sm:inline">Bancos</span>
            </TabsTrigger>
            <TabsTrigger value="textos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Textos</span>
            </TabsTrigger>
            <TabsTrigger
              value="personalizacion"
              className="flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Marca</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB: EMPRESA */}
          <TabsContent value="empresa">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Datos de la Empresa
                </CardTitle>
                <CardDescription>
                  Información que aparecerá en el encabezado de cotizaciones y
                  documentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nombre_empresa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Empresa</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Mi Empresa S.A.C."
                            {...field}
                            value={field.value || ""}
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
                        <FormLabel>RUC</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="20123456789"
                            maxLength={11}
                            {...field}
                            value={field.value || ""}
                          />
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
                        <Input
                          placeholder="Av. Industrial 123, Lima"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="telefono_contacto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+51 999 999 999"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email_empresa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Corporativo</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ventas@empresa.com"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="logo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL del Logo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        URL de una imagen para el logo (recomendado: PNG
                        transparente)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: COTIZACIÓN */}
          <TabsContent value="cotizacion">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Parámetros de Cotización
                </CardTitle>
                <CardDescription>
                  Valores por defecto para cálculo de precios y márgenes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="margen_ganancia_default"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Margen de Ganancia</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              {...field}
                              onChange={handleNumberChange(field)}
                            />
                            <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                              {((field.value || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Ej: 0.30 = 30% de ganancia
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="markup_cotizaciones_default"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Markup de Seguridad</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                              onChange={handleNumberChange(field)}
                            />
                            <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                              {((field.value || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Buffer adicional para imprevistos
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="costo_mo_m2_default"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo Mano de Obra (S/. por m²)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            {...field}
                            onChange={handleNumberChange(field)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="validez_cotizacion_dias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Validez de Cotización (días)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            min="1"
                            {...field}
                            onChange={handleNumberChange(field)}
                          />
                        </FormControl>
                        <FormDescription>
                          Días que la cotización permanece vigente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descuento_maximo_pct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descuento Máximo Permitido</FormLabel>
                      <FormControl>
                        <div className="relative max-w-xs">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            {...field}
                            onChange={handleNumberChange(field)}
                          />
                          <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                            {((field.value || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Límite de descuento para proteger márgenes (ej: 0.15 =
                        15%)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: FINANZAS */}
          <TabsContent value="finanzas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Configuración Financiera
                </CardTitle>
                <CardDescription>
                  Impuestos, tipo de cambio y moneda por defecto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="igv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IGV</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              {...field}
                              onChange={handleNumberChange(field)}
                            />
                            <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                              {((field.value || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </FormControl>
                        <FormDescription>0.18 = 18%</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipo_cambio_referencial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Cambio (PEN/USD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            {...field}
                            onChange={handleNumberChange(field)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="moneda_default"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moneda por Defecto</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || "PEN"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PEN">🇵🇪 Soles (PEN)</SelectItem>
                            <SelectItem value="USD">
                              🇺🇸 Dólares (USD)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: BANCOS */}
          <TabsContent value="bancos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Landmark className="h-5 w-5" />
                  Datos Bancarios
                </CardTitle>
                <CardDescription>
                  Cuentas para recibir pagos (aparecen en pie de cotización)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre_titular_cuenta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titular de la Cuenta</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="EMPRESA S.A.C."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4 p-6 rounded-md shadow-sm ring-1 ring-slate-900/5 bg-slate-50/50">
                    <h4 className="font-medium flex items-center gap-2">
                      🇵🇪 Cuentas en Soles
                    </h4>
                    <FormField
                      control={form.control}
                      name="cuenta_bcp_soles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cuenta BCP Soles</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="191-12345678-0-12"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cci_soles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CCI Soles</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="00219112345678012345"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Código Interbancario (20 dígitos)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4 mt-4 border-t border-slate-200/60">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Landmark className="h-3 w-3" /> BBVA Soles
                      </h4>
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="cuenta_bbva_soles"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cuenta BBVA Soles</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="0011-..."
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cci_bbva_soles"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CCI BBVA Soles</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="0011-..."
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-6 rounded-md shadow-sm ring-1 ring-slate-900/5 bg-slate-50/50">
                    <h4 className="font-medium flex items-center gap-2">
                      🇺🇸 Cuentas en Dólares
                    </h4>
                    <FormField
                      control={form.control}
                      name="cuenta_bcp_dolares"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cuenta BCP USD</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="191-12345678-1-12"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cci_dolares"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CCI Dólares</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="00219112345678112345"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Código Interbancario (20 dígitos)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4 mt-4 border-t border-slate-200/60">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Landmark className="h-3 w-3" /> BBVA Dólares
                      </h4>
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="cuenta_bbva_dolares"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cuenta BBVA USD</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="0011-..."
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cci_bbva_dolares"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CCI BBVA Dólares</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="0011-..."
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: TEXTOS */}
          <TabsContent value="textos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Textos y Condiciones
                </CardTitle>
                <CardDescription>
                  Textos predeterminados que aparecerán en las cotizaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="texto_condiciones_base"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condiciones Comerciales</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="1. Validez de la cotización: 15 días&#10;2. Forma de pago: 50% adelanto, 50% contra entrega&#10;3. Tiempo de entrega: 15 días hábiles"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="texto_forma_pago"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formas de Pago</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Transferencia bancaria, Yape, Plin, Efectivo"
                          className="min-h-[60px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="texto_garantia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto de Garantía</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Garantía de 1 año en materiales y mano de obra. Excluye daños por mal uso o fenómenos naturales."
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notas_pie_cotizacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Notas Adicionales (Pie de Cotización)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Gracias por su preferencia. Para más información contactar a..."
                          className="min-h-[60px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: PERSONALIZACIÓN */}
          <TabsContent value="personalizacion">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Personalización y Firma
                </CardTitle>
                <CardDescription>
                  Datos del representante y estilo visual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nombre_representante"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Representante</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Juan Pérez García"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Persona que firma las cotizaciones
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cargo_representante"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Gerente Comercial"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="firma_digital_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Firma Digital</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Imagen de firma escaneada (PNG transparente recomendado)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color_primario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color de Marca</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <Input
                            type="color"
                            className="w-16 h-10 p-1 cursor-pointer"
                            {...field}
                            value={field.value || "#2563eb"}
                          />
                          <Input
                            placeholder="#2563eb"
                            className="max-w-[150px]"
                            {...field}
                            value={field.value || "#2563eb"}
                          />
                          <div
                            className="h-10 w-24 rounded border"
                            style={{
                              backgroundColor: field.value || "#2563eb",
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Color principal para encabezados de documentos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" size="lg" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            Guardar Configuración
          </Button>
        </div>
      </form>
    </Form>
  );
}
