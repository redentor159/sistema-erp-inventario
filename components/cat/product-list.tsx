"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catApi } from "@/lib/api/cat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  X,
  Edit2,
  Pencil,
  Trash2,
  Save,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { format, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const PriceFreshnessBadge = ({ dateString }: { dateString?: string }) => {
  if (!dateString) {
    return (
      <div className="flex items-center gap-1 mt-0.5 justify-end">
        <span className="w-2 h-2 rounded-full bg-red-500" title="Sin fecha de actualización" />
        <span className="text-[9px] text-muted-foreground whitespace-nowrap">Sin actualizar</span>
      </div>
    );
  }

  const date = parseISO(dateString);
  const days = differenceInDays(new Date(), date);

  let colorClass = "bg-green-500";
  if (days > 30) colorClass = "bg-red-500";
  else if (days > 15) colorClass = "bg-orange-500";

  return (
    <div className="flex items-center gap-1 mt-0.5 justify-end" title={`Actualizado hace ${days} días`}>
      <span className={`w-2 h-2 rounded-full ${colorClass}`} />
      <span className="text-[9px] text-muted-foreground whitespace-nowrap">{format(date, "dd MMM", { locale: es })}</span>
    </div>
  );
};
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ProductFormCmp } from "./product-form";
import { ProductDetailSheet } from "./product-detail-sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockAdjustmentDialog } from "./stock-adjustment-dialog";
import { MarketCostDialog } from "./market-cost-dialog";
import { useToast } from "@/components/ui/use-toast";

export function ProductList({ active }: { active: boolean }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch filters data
  const { data: familias } = useQuery({
    queryKey: ["mstFamilias"],
    queryFn: catApi.getFamilias,
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
  const { data: sistemas } = useQuery({
    queryKey: ["mstSistemas"],
    queryFn: catApi.getSistemas,
  });
  const { data: almacenes } = useQuery({
    queryKey: ["mstAlmacenes"],
    queryFn: catApi.getAlmacenes,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [familiaFilter, setFamiliaFilter] = useState("ALL");
  const [marcaFilter, setMarcaFilter] = useState("ALL");
  const [materialFilter, setMaterialFilter] = useState("ALL");
  const [acabadoFilter, setAcabadoFilter] = useState("ALL");
  const [sistemaFilter, setSistemaFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);

  const [open, setOpen] = useState(false); // Create Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [selectAdjustProduct, setSelectAdjustProduct] = useState<any>(null);
  const [selectCostProduct, setSelectCostProduct] = useState<any>(null);

  // --- BULK EDIT STATE ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>(
    {},
  );
  const [pendingCurrencyChanges, setPendingCurrencyChanges] = useState<Record<string, string>>(
    {},
  );
  const [pendingAlmacenChanges, setPendingAlmacenChanges] = useState<Record<string, string>>(
    {},
  );

  const { data: result, isLoading } = useQuery({
    queryKey: [
      "catProductos",
      page,
      pageSize,
      search,
      familiaFilter,
      marcaFilter,
      materialFilter,
      sistemaFilter,
      acabadoFilter,
    ],
    queryFn: () =>
      catApi.getProductos({
        page,
        pageSize,
        search,
        familia: familiaFilter,
        marca: marcaFilter,
        material: materialFilter,
        sistema: sistemaFilter,
        acabado: acabadoFilter,
      }),
    enabled: active,
  });

  const products = result?.data || [];
  const totalCount = result?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // --- MUTATIONS ---
  const deleteMutation = useMutation({
    mutationFn: catApi.deleteProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catProductos"] });
      toast({ title: "Producto eliminado correctamente", variant: "default" });
      setDeletingId(null);
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar producto: " + error.message,
        variant: "destructive",
      });
      setDeletingId(null);
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: catApi.updatePreciosMasivos,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catProductos"] });
      toast({ title: "Precios actualizados masivamente", variant: "default" });
      setPendingChanges({});
      setPendingCurrencyChanges({});
      setPendingAlmacenChanges({});
      setIsEditMode(false);
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar precios: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveBulk = () => {
    // Merge price and currency changes into a unified update list
    const allSkus = new Set([
      ...Object.keys(pendingChanges),
      ...Object.keys(pendingCurrencyChanges),
      ...Object.keys(pendingAlmacenChanges),
    ]);
    const updates = Array.from(allSkus).map((id_sku) => {
      const upd: { id_sku: string; costo_mercado_unit?: number; moneda_reposicion?: string; id_almacen?: string } = { id_sku };
      if (pendingChanges[id_sku] !== undefined) {
        const parsed = parseFloat(pendingChanges[id_sku]);
        upd.costo_mercado_unit = isNaN(parsed) ? 0 : parsed;
      }
      if (pendingCurrencyChanges[id_sku] !== undefined) upd.moneda_reposicion = pendingCurrencyChanges[id_sku];
      if (pendingAlmacenChanges[id_sku] !== undefined) upd.id_almacen = pendingAlmacenChanges[id_sku];
      return upd;
    });
    if (updates.length === 0) {
      setIsEditMode(false);
      return;
    }
    bulkUpdateMutation.mutate(updates);
  };

  const clearFilters = () => {
    if (searchInputRef.current) searchInputRef.current.value = "";
    setSearch("");
    setFamiliaFilter("ALL");
    setMarcaFilter("ALL");
    setMaterialFilter("ALL");
    setAcabadoFilter("ALL");
    setSistemaFilter("ALL");
    setPage(0);
  };

  if (isLoading && active && !products.length)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Cargando catálogo...
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex w-full max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Buscar SKU o nombre..."
                className="pl-8"
                defaultValue={search}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearch(searchInputRef.current?.value ?? "");
                    setPage(0);
                  }
                }}
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setSearch(searchInputRef.current?.value ?? "");
                setPage(0);
              }}
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* BULK EDIT TOGGLE */}
            <div className="mr-2 flex items-center gap-2 border-r pr-4">
              {isEditMode ? (
                <>
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleSaveBulk}
                    disabled={
                      (Object.keys(pendingChanges).length === 0 &&
                        Object.keys(pendingCurrencyChanges).length === 0 &&
                        Object.keys(pendingAlmacenChanges).length === 0) ||
                      bulkUpdateMutation.isPending
                    }
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Guardar ({Object.keys(pendingChanges).length + Object.keys(pendingCurrencyChanges).length + Object.keys(pendingAlmacenChanges).length})
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsEditMode(false);
                      setPendingChanges({});
                      setPendingCurrencyChanges({});
                      setPendingAlmacenChanges({});
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditMode(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edición Rápida
                </Button>
              )}
            </div>

            <span className="text-sm text-muted-foreground hidden md:inline">
              Mostrar:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="500">500</SelectItem>
                <SelectItem value="1000">1000</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo SKU
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Item (SKU)</DialogTitle>
                  <DialogDescription>
                    Cree un nuevo material o insumo (Perfil, Vidrio, Accesorio).
                  </DialogDescription>
                </DialogHeader>
                <ProductFormCmp onSuccess={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select
            value={familiaFilter}
            onValueChange={(val) => {
              setFamiliaFilter(val);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Familia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas Familias</SelectItem>
              {familias?.map((f: any) => (
                <SelectItem key={f.id_familia} value={f.nombre_familia}>
                  {f.nombre_familia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={marcaFilter}
            onValueChange={(val) => {
              setMarcaFilter(val);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas Marcas</SelectItem>
              {marcas?.map((m: any) => (
                <SelectItem key={m.id_marca} value={m.nombre_marca}>
                  {m.nombre_marca}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={materialFilter}
            onValueChange={(val) => {
              setMaterialFilter(val);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos Materiales</SelectItem>
              {materiales?.map((m: any) => (
                <SelectItem key={m.id_material} value={m.nombre_material}>
                  {m.nombre_material}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sistemaFilter}
            onValueChange={(val) => {
              setSistemaFilter(val);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sistema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos Sistemas</SelectItem>
              {sistemas?.map((s: any) => (
                <SelectItem key={s.id_sistema} value={s.id_sistema}>
                  {s.nombre_comercial}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={acabadoFilter}
            onValueChange={(val) => {
              setAcabadoFilter(val);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Acabado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos Acabados</SelectItem>
              {acabados?.map((a: any) => (
                <SelectItem key={a.id_acabado} value={a.nombre_acabado}>
                  {a.nombre_acabado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(search ||
            familiaFilter !== "ALL" ||
            marcaFilter !== "ALL" ||
            materialFilter !== "ALL" ||
            acabadoFilter !== "ALL" ||
            sistemaFilter !== "ALL") && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 px-3"
              >
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            )}
        </div>
      </div>

      <div className="border rounded-md bg-white dark:bg-gray-800 flex flex-col">
        {/* Desktop Table View */}
        <div className="hidden md:block flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">SKU</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Familia / Marca</TableHead>
                <TableHead>Acabado</TableHead>
                <TableHead>Almacén</TableHead>
                <TableHead className="text-right w-[140px]">
                  {isEditMode ? "Costo (Edit)" : "Costo Mercado"}
                </TableHead>
                <TableHead className="text-right">Stock Actual</TableHead>
                <TableHead className="text-right">PMP (Unit)</TableHead>
                <TableHead className="text-right">Inversión (Total)</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center h-24">
                    No se encontraron productos.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: any) => {
                  const stock = Number(product.stock_actual || 0);
                  const pmp = Number(product.costo_promedio || 0);

                  // Use pending change if available, else standard cost
                  const costoMercado =
                    pendingChanges[product.id_sku] !== undefined
                      ? pendingChanges[product.id_sku]
                      : Number(product.costo_mercado_unit || 0);

                  const inversion = Number(product.inversion_total || 0);
                  const monedaBase =
                    product.moneda_reposicion === "USD" ? "USD" : "PEN";
                  const moneda =
                    pendingCurrencyChanges[product.id_sku] !== undefined
                      ? pendingCurrencyChanges[product.id_sku]
                      : monedaBase;

                  const isNegative = stock < 0;
                  const isPositive = stock > 0;
                  const rowClass = isNegative
                    ? "bg-red-50 dark:bg-red-900/10 hover:bg-red-100"
                    : "hover:bg-muted/50";
                  const stockClass = isNegative
                    ? "text-red-600 font-bold"
                    : isPositive
                      ? "text-green-600 font-bold"
                      : "text-gray-500";

                  const isDirty = pendingChanges[product.id_sku] !== undefined || pendingCurrencyChanges[product.id_sku] !== undefined;

                  return (
                    <TableRow key={product.id_sku} className={`${rowClass}`}>
                      <TableCell className="font-mono text-xs font-medium">
                        {product.id_sku}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {product.nombre_completo}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {product.unidad_medida}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span>{product.nombre_familia}</span>
                          <span className="text-muted-foreground">
                            {product.nombre_marca}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">
                          {product.nombre_acabado || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {isEditMode ? (
                          <select
                            className={`text-[10px] w-full bg-transparent border rounded px-1 py-1 cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400 ${pendingAlmacenChanges[product.id_sku] !== undefined ? "bg-yellow-50 border-yellow-400 font-bold" : "border-slate-200"}`}
                            value={pendingAlmacenChanges[product.id_sku] !== undefined ? pendingAlmacenChanges[product.id_sku] : (product.id_almacen || "")}
                            onChange={(e) => {
                              const newAlmacen = e.target.value;
                              if (newAlmacen !== (product.id_almacen || "")) {
                                setPendingAlmacenChanges((prev) => ({
                                  ...prev,
                                  [product.id_sku]: newAlmacen,
                                }));
                              } else {
                                setPendingAlmacenChanges((prev) => {
                                  const next = { ...prev };
                                  delete next[product.id_sku];
                                  return next;
                                });
                              }
                            }}
                          >
                            <option value="">Sin Asignar</option>
                            {almacenes?.map((a: any) => (
                              <option key={a.id_almacen} value={a.id_almacen}>{a.nombre_almacen}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {product.nombre_almacen || "Sin Asignar"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono p-1">
                        {isEditMode ? (
                          <div className="flex items-center gap-1">
                            <select
                              className={`text-[10px] bg-transparent border rounded px-0.5 py-1 cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400 ${pendingCurrencyChanges[product.id_sku] !== undefined ? "bg-yellow-50 border-yellow-400 font-bold" : "border-slate-200"
                                }`}
                              value={moneda}
                              onChange={(e) => {
                                const newMoneda = e.target.value;
                                if (newMoneda !== monedaBase) {
                                  setPendingCurrencyChanges((prev) => ({
                                    ...prev,
                                    [product.id_sku]: newMoneda,
                                  }));
                                } else {
                                  // Revert: remove from pending if same as original
                                  setPendingCurrencyChanges((prev) => {
                                    const next = { ...prev };
                                    delete next[product.id_sku];
                                    return next;
                                  });
                                }
                              }}
                            >
                              <option value="PEN">S/</option>
                              <option value="USD">US$</option>
                            </select>
                            <Input
                              type="number"
                              className={`h-8 text-right w-full ${pendingChanges[product.id_sku] !== undefined ? "bg-yellow-50 border-yellow-400" : ""}`}
                              value={pendingChanges[product.id_sku] !== undefined ? pendingChanges[product.id_sku] : costoMercado}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || val === String(costoMercado)) {
                                  // Revert or empty
                                  setPendingChanges((prev) => {
                                    const next = { ...prev };
                                    if (val === String(costoMercado)) {
                                      delete next[product.id_sku];
                                    } else {
                                      next[product.id_sku] = val; // Store empty string temporarily
                                    }
                                    return next;
                                  });
                                } else {
                                  setPendingChanges((prev) => ({
                                    ...prev,
                                    [product.id_sku]: val,
                                  }));
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span>
                              {costoMercado.toLocaleString("es-PE", {
                                style: "currency",
                                currency: moneda,
                              })}
                            </span>
                            <PriceFreshnessBadge dateString={product.fecha_act_precio} />
                          </div>
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right text-base ${stockClass}`}
                      >
                        {stock.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {pmp.toLocaleString("es-PE", {
                          style: "currency",
                          currency: "PEN",
                        })}
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs">
                        {inversion.toLocaleString("es-PE", {
                          style: "currency",
                          currency: "PEN",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Detail View */}
                          <ProductDetailSheet product={product}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <Search className="h-3 w-3" />
                            </Button>
                          </ProductDetailSheet>

                          {/* Quick Adjust */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setSelectAdjustProduct(product)}
                            title="Ajuste Stock"
                          >
                            <div className="text-[10px] font-bold border rounded px-1">
                              ±
                            </div>
                          </Button>

                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={async () => {
                              try {
                                // Fetch full product data (all columns)
                                const fullProduct =
                                  await catApi.getProductoBySku(product.id_sku);
                                setEditingProduct(fullProduct);
                                setEditDialogOpen(true);
                              } catch (err) {
                                // Fallback to view data if fetch fails
                                setEditingProduct(product);
                                setEditDialogOpen(true);
                              }
                            }}
                          >
                            <Pencil className="h-3 w-3 text-blue-500" />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setDeletingId(product.id_sku)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
          {products.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No se encontraron productos.
            </div>
          ) : (
            products.map((product: any) => {
              const stock = Number(product.stock_actual || 0);
              const costoMercado =
                pendingChanges[product.id_sku] !== undefined
                  ? pendingChanges[product.id_sku]
                  : Number(product.costo_mercado_unit || 0);
              const moneda =
                product.moneda_reposicion === "USD" ? "USD" : "PEN";
              const isNegative = stock < 0;
              const isPositive = stock > 0;
              const stockClass = isNegative
                ? "text-red-700 font-bold bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded"
                : isPositive
                  ? "text-green-700 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded"
                  : "text-gray-600 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded";

              return (
                <div
                  key={product.id_sku}
                  className="p-4 flex flex-col gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                        {product.nombre_completo}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-mono bg-white dark:bg-gray-900"
                        >
                          {product.id_sku}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {product.nombre_familia}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          • {product.nombre_marca}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <span
                        className={`text-base flex items-baseline gap-1 ${stockClass}`}
                      >
                        {stock.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                        <span className="text-[9px] uppercase font-medium bg-transparent px-0">
                          {product.unidad_medida}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 bg-slate-50 dark:bg-slate-900/50 rounded-md px-3 border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                        Acabado | Almacén
                      </span>
                      {isEditMode ? (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {product.nombre_acabado || "-"} |
                          </span>
                          <select
                            className={`text-[10px] w-24 bg-transparent border rounded px-1 py-1 cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400 ${pendingAlmacenChanges[product.id_sku] !== undefined ? "bg-yellow-50 border-yellow-400 font-bold" : "border-slate-200"}`}
                            value={pendingAlmacenChanges[product.id_sku] !== undefined ? pendingAlmacenChanges[product.id_sku] : (product.id_almacen || "")}
                            onChange={(e) => {
                              const newAlmacen = e.target.value;
                              if (newAlmacen !== (product.id_almacen || "")) {
                                setPendingAlmacenChanges((prev) => ({
                                  ...prev,
                                  [product.id_sku]: newAlmacen,
                                }));
                              } else {
                                setPendingAlmacenChanges((prev) => {
                                  const next = { ...prev };
                                  delete next[product.id_sku];
                                  return next;
                                });
                              }
                            }}
                          >
                            <option value="">Sin Asignar</option>
                            {almacenes?.map((a: any) => (
                              <option key={a.id_almacen} value={a.id_almacen}>{a.nombre_almacen}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {product.nombre_acabado || "-"} | {product.nombre_almacen || "N/A"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col text-right items-end">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                        Costo Merc.
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                        {isEditMode
                          ? "--"
                          : costoMercado.toLocaleString("es-PE", {
                            style: "currency",
                            currency: moneda,
                          })}
                      </span>
                      {!isEditMode && <PriceFreshnessBadge dateString={product.fecha_act_precio} />}
                    </div>
                  </div>

                  <div className="pt-1">
                    <ProductDetailSheet product={product}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-medium h-9 text-blue-600 border-blue-200 hover:text-blue-700 hover:bg-blue-50 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900 dark:text-blue-400"
                      >
                        <Search className="h-3.5 w-3.5 mr-2" />
                        Ficha Técnica y Detalle
                      </Button>
                    </ProductDetailSheet>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando {products.length > 0 ? page * pageSize + 1 : 0} a{" "}
            {Math.min((page + 1) * pageSize, totalCount)} de {totalCount}{" "}
            productos
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
            >
              Anterior
            </Button>
            <div className="text-sm font-medium">
              Página {page + 1} de {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <StockAdjustmentDialog
        open={!!selectAdjustProduct}
        onOpenChange={(open) => !open && setSelectAdjustProduct(null)}
        product={selectAdjustProduct}
      />

      <MarketCostDialog
        open={!!selectCostProduct}
        onOpenChange={(open) => !open && setSelectCostProduct(null)}
        product={selectCostProduct}
      />

      {/* EDIT DIALOG */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => !open && setEditDialogOpen(false)}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Modifique los datos del SKU.</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductFormCmp
              initialData={editingProduct}
              onSuccess={() => {
                setEditDialogOpen(false);
                setEditingProduct(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE ALERT */}
      {/* DELETE ALERT */}
      <Dialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>¿Está seguro?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente el SKU <b>{deletingId}</b>.
              Si tiene stock o movimientos, podría causar inconsistencias.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
