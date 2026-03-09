"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { catApi } from "@/lib/api/cat";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const PriceFreshnessBadge = ({ dateString }: { dateString?: string }) => {
  if (!dateString) {
    return (
      <div className="flex items-center gap-1 mt-0.5" title="Sin fecha de actualización">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">Sin actualizar</span>
      </div>
    );
  }

  const date = parseISO(dateString);
  const days = differenceInDays(new Date(), date);

  let colorClass = "bg-green-500";
  if (days > 30) colorClass = "bg-red-500";
  else if (days > 15) colorClass = "bg-orange-500";

  return (
    <div className="flex items-center gap-1 mt-0.5" title={`Actualizado hace ${days} días`}>
      <span className={`w-2 h-2 rounded-full ${colorClass}`} />
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{format(date, "dd MMM yyyy", { locale: es })}</span>
    </div>
  );
};

export function ProductDetailSheet({
  product,
  children,
}: {
  product: any;
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState("general");

  const stock = Number(product?.stock_actual) || 0;
  const inversion = Number(product?.inversion_total) || 0;
  const pmp = Number(product?.costo_promedio) || 0;
  const mercado = Number(product?.costo_mercado_unit) || 0;
  const isNegative = stock < 0;

  // Lazy queries MOVED BEFORE EARLY RETURN
  const { data: ultimasCompras, isLoading: loadingCompras } = useQuery({
    queryKey: ["ultimas_compras_sku", product?.id_sku],
    queryFn: () => catApi.getUltimasComprasDeSKU(product?.id_sku || ""),
    enabled: activeTab === "proveedores" && !!product,
  });

  const { data: retazos, isLoading: loadingRetazos } = useQuery({
    queryKey: ["retazos_disponibles_sku", product?.id_sku],
    queryFn: () => catApi.getRetazosDisponiblesDeSKU(product?.id_sku || ""),
    enabled: activeTab === "costos" && !!product,
  });

  if (!product) return <>{children}</>;

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full max-w-[95vw] sm:max-w-[540px] flex flex-col p-0 h-full overflow-hidden">
        <div className="p-6 pb-2">
          <SheetHeader>
            <SheetTitle className="text-xl">{product.id_sku}</SheetTitle>
            <SheetDescription className="break-words">
              {product.nombre_completo}
            </SheetDescription>
          </SheetHeader>

          {/* Quick tags */}
          <div className="flex gap-2 flex-wrap mt-2 mb-4">
            <Badge variant="outline" className="text-xs bg-muted/30 border-muted">{product.nombre_marca || "Genérico"}</Badge>
            {product.id_sistema && <Badge variant="outline" className="text-xs bg-muted/30 border-muted">{product.id_sistema}</Badge>}
            <Badge variant="outline" className="text-xs bg-muted/30 border-muted">{product.nombre_almacen || product.id_almacen || "Almacén Principal"}</Badge>
          </div>

          {/* STATUS CARD (Siempre visible) */}
          <div
            className={`mt-4 p-4 rounded-lg border ${isNegative ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
          >
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Stock Actual
                </p>
                <p
                  className={`text-2xl font-bold ${isNegative ? "text-red-700" : "text-green-700"}`}
                >
                  {stock.toLocaleString("es-PE")}{" "}
                  <span className="text-sm font-normal">
                    {product.unidad_medida}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Valorizado ({product.moneda_reposicion || "PEN"})
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {(inversion || (stock * pmp)).toLocaleString("es-PE", {
                    style: "currency",
                    currency: product.moneda_reposicion || "PEN",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 relative">
            <TabsList className="flex w-full overflow-x-auto whitespace-nowrap scrollbar-hide bg-transparent border-b rounded-none h-10 p-0 mb-4">
              <TabsTrigger
                value="general"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none!"
              >
                Ficha
              </TabsTrigger>
              <TabsTrigger
                value="costos"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none!"
              >
                Costos
              </TabsTrigger>
              <TabsTrigger
                value="ingenieria"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none!"
              >
                Series
              </TabsTrigger>
              <TabsTrigger
                value="proveedores"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none!"
              >
                Historial
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 pb-6 mt-2">

            {/* 1. GENERAL PESTAÑA */}
            <TabsContent value="general" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 text-sm mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Familia</p>
                  <p className="font-medium">{product.nombre_familia || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Material</p>
                  <p className="font-medium">{product.nombre_material || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Acabado / Color</p>
                  <p className="font-medium">{product.nombre_acabado || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Unidad de Medida</p>
                  <p className="font-medium">{product.unidad_medida}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Largo Estándar</p>
                  <p className="font-medium">
                    {product.largo_estandar_mm
                      ? `${Number(product.largo_estandar_mm).toLocaleString("es-PE")} mm`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Peso Teórico</p>
                  <p className="font-medium">
                    {product.peso_teorico_kg
                      ? `${Number(product.peso_teorico_kg).toFixed(3)} Kg/m`
                      : "-"}
                  </p>
                </div>
              </div>

              {product.imagen_ref && (
                <div className="mt-6 pt-4 border-t border-dashed">
                  <p className="text-xs text-muted-foreground mb-4">Referencia Visual</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imagen_ref}
                    alt="Referencia"
                    className="w-full h-auto max-h-[250px] object-contain rounded-md border bg-slate-50"
                  />
                </div>
              )}
            </TabsContent>

            {/* 2. COSTOS PESTAÑA */}
            <TabsContent value="costos" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 border rounded-md">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Costo Mercado</p>
                  <p className="text-xl font-bold">
                    {mercado.toLocaleString("es-PE", { style: "currency", currency: product.moneda_reposicion || "PEN" })}
                  </p>
                  <PriceFreshnessBadge dateString={product.fecha_act_precio} />
                </div>
                <div className="p-3 border rounded-md bg-muted/10 relative overflow-hidden group">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Costo PMP</p>
                  <p className="text-xl font-semibold text-muted-foreground">
                    {pmp.toLocaleString("es-PE", { style: "currency", currency: "PEN" })}
                  </p>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-muted group-hover:bg-slate-300 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-y-4 text-sm mt-4 border-t border-dashed pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Stock Mínimo</p>
                  <p className="font-medium">{product.stock_minimo || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Punto Pedido</p>
                  <p className="font-medium">{product.punto_pedido || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tiempo Rep.</p>
                  <p className="font-medium">
                    {product.tiempo_reposicion_dias ? `${product.tiempo_reposicion_dias} días` : "7 días"}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-dashed pt-5">
                <h4 className="text-sm font-semibold mb-3 flex items-center justify-between">
                  Retazos Disponibles
                  <Badge variant="secondary" className="text-[10px]">
                    {retazos ? retazos.length : 0}
                  </Badge>
                </h4>

                {loadingRetazos ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : retazos && retazos.length > 0 ? (
                  <div className="space-y-2">
                    {retazos.map((r: any) => (
                      <div key={r.id_retazo} className="flex justify-between items-center p-2 rounded-md border text-xs">
                        <div>
                          <span className="font-mono font-medium">{Number(r.longitud_mm).toLocaleString("es-PE")} mm</span>
                          <span className="block text-[10px] text-muted-foreground">Ubicación: {r.ubicacion || 'General'}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-medium">{r.orden_trabajo || 'OT No vinculada'}</span>
                          <span className="block text-muted-foreground text-[10px]">{format(parseISO(r.fecha_creacion), "dd/MM/yyyy")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center p-4 bg-muted/20 border border-dashed rounded-md">
                    No hay retazos para este artículo.
                  </p>
                )}
              </div>
            </TabsContent>

            {/* 3. INGENIERIA E SERIES */}
            <TabsContent value="ingenieria" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Sistema Maestro</p>
                  <p className="font-medium text-sm">{product.sistema_nombre || product.id_sistema || "No aplica a un sistema de perfiles"}</p>
                </div>

                {product.id_sistema && (
                  <div className="border rounded-md p-4 bg-muted/5 mt-2 shadow-sm">
                    <p className="text-xs font-semibold mb-4 border-b pb-2">
                      Equivalencias del Sistema ({product.id_sistema})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block mb-1 uppercase tracking-wider font-semibold">
                          Corrales
                        </span>
                        <span className="font-mono bg-white px-2 py-1 rounded-md border text-[11px] shadow-sm inline-block">
                          {product.cod_corrales || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block mb-1 uppercase tracking-wider font-semibold">
                          Eduholding
                        </span>
                        <span className="font-mono bg-white px-2 py-1 rounded-md border text-[11px] shadow-sm inline-block">
                          {product.cod_eduholding || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block mb-1 uppercase tracking-wider font-semibold">
                          HPD
                        </span>
                        <span className="font-mono bg-white px-2 py-1 rounded-md border text-[11px] shadow-sm inline-block">
                          {product.cod_hpd || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block mb-1 uppercase tracking-wider font-semibold">
                          Limatambo
                        </span>
                        <span className="font-mono bg-white px-2 py-1 rounded-md border text-[11px] shadow-sm inline-block">
                          {product.cod_limatambo || "N/A"}
                        </span>
                      </div>
                    </div>
                    {product.sistema_uso && (
                      <div className="mt-4 pt-3 border-t text-xs italic text-muted-foreground">
                        Uso principal: {product.sistema_uso}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 4. PROVEEDORES E HISTORIAL */}
            <TabsContent value="proveedores" className="mt-0 space-y-6">
              <div className="bg-muted/10 p-3 rounded border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Cód. Abastecimiento Estandar</p>
                <p className="font-mono font-medium">{product.cod_proveedor || "-"}</p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3 border-b pb-2">Últimos Ingresos Reales</h4>

                {loadingCompras ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : ultimasCompras && ultimasCompras.length > 0 ? (
                  <div className="space-y-3">
                    {ultimasCompras.map((compra: any) => {
                      const head = compra.trx_entradas_cabecera;
                      return (
                        <div key={compra.id_linea_entrada} className="p-3 text-sm border rounded-md shadow-sm relative overflow-hidden group">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary/50 transition-colors" />
                          <div className="flex justify-between items-start mb-2 pl-2">
                            <span className="font-medium line-clamp-1 flex-1 pr-2 text-xs">
                              {head?.mst_proveedores?.razon_social || "Proveedor Desconocido"}
                            </span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted px-1.5 py-0.5 rounded">
                              {format(parseISO(head?.fecha_registro), "dd/MM/yyyy HH:mm")}
                            </span>
                          </div>
                          <div className="flex justify-between items-end pl-2">
                            <div>
                              <p className="text-[10px] text-muted-foreground">N° Doc: <span className="font-mono text-foreground">{head?.nro_documento_fisico || "N/A"}</span></p>
                              <p className="text-xs mt-0.5">
                                <span className="font-bold">{compra.cantidad}</span> {product.unidad_medida}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-700 text-sm">
                                {Number(compra.costo_unitario).toLocaleString("es-PE", { style: "currency", currency: head?.moneda || "PEN" })}
                              </p>
                              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Precio Compra</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center p-6 bg-muted/20 border border-dashed rounded-md">
                    No se encontraron registros de compras (Ingresos al almacén) históricos directos para este material.
                  </p>
                )}
              </div>
            </TabsContent>

          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
