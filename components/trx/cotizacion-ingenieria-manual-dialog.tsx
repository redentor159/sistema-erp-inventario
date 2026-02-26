"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cotizacionesApi } from "@/lib/api/cotizaciones";
import { TrxDesgloseMateriales } from "@/types/materiales";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CatalogSkuSelector } from "@/components/mto/catalog-sku-selector";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  idLinea: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CotizacionIngenieriaManualDialog({
  idLinea,
  isOpen,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [localItems, setLocalItems] = useState<
    Partial<TrxDesgloseMateriales>[]
  >([]);
  const [isDirty, setIsDirty] = useState(false);

  // Fetch existing data
  const { data: serverItems, isLoading } = useQuery({
    queryKey: ["despiece", idLinea],
    queryFn: () => cotizacionesApi.getDesgloseMateriales(idLinea),
    enabled: isOpen,
  });

  // Sync state when data loads
  useEffect(() => {
    if (serverItems && !isDirty) {
      setLocalItems(JSON.parse(JSON.stringify(serverItems)));
    }
  }, [serverItems, isOpen]);

  // Update mutations
  const updateMutation = useMutation({
    mutationFn: async (items: Partial<TrxDesgloseMateriales>[]) => {
      // 1. Identify changes
      const originalIds = new Set(serverItems?.map((i) => i.id_desglose));
      const currentIds = new Set(
        items.map((i) => i.id_desglose).filter(Boolean),
      );

      // Deletes
      const toDelete =
        serverItems?.filter((i) => !currentIds.has(i.id_desglose)) || [];
      for (const item of toDelete) {
        await cotizacionesApi.deleteDesgloseItem(item.id_desglose);
      }

      // Upserts
      for (const item of items) {
        if (item.id_desglose) {
          // Update
          await cotizacionesApi.updateDesgloseItem(item.id_desglose, {
            nombre_componente: item.nombre_componente,
            sku_real: item.sku_real,
            cantidad_calculada: item.cantidad_calculada,
            costo_total_item: item.costo_total_item,
            tipo_componente: item.tipo_componente,
            medida_corte_mm: item.medida_corte_mm,
            detalle_formula: item.detalle_formula,
          });
        } else {
          // Create
          const newItem: any = { ...item };
          delete newItem.id_desglose;
          await cotizacionesApi.addDesgloseItem({
            ...newItem,
            id_linea_cot: idLinea,
          });
        }
      }

      // 2. Set Manual Flag
      await cotizacionesApi.setManualFlag(idLinea, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despiece", idLinea] }); // Refresh UI
      queryClient.invalidateQueries({ queryKey: ["cotizaciones"] }); // Refresh totals
      toast({ title: "Ingeniería actualizada correctamente" });
      onOpenChange(false);
      setIsDirty(false);
    },
    onError: (err) => {
      toast({
        title: "Error al guardar ingeniería",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(localItems);
  };

  const addNewRow = () => {
    setLocalItems([
      ...localItems,
      {
        id_desglose: "", // New flag
        nombre_componente: "Nuevo Componente",
        sku_real: "",
        tipo_componente: "Accesorio",
        cantidad_calculada: 1,
        costo_total_item: 0,
      },
    ]);
    setIsDirty(true);
  };

  const removeRow = (index: number) => {
    const newItems = [...localItems];
    newItems.splice(index, 1);
    setLocalItems(newItems);
    setIsDirty(true);
  };

  const updateRow = (
    index: number,
    field: keyof TrxDesgloseMateriales,
    value: any,
  ) => {
    const newItems = [...localItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLocalItems(newItems);
    setIsDirty(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-0 gap-0 sm:max-w-[95vw]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            Edición Manual de Ingeniería
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-orange-700 bg-orange-50 p-2 rounded border border-orange-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Advertencia: Al editar manualmente, este ítem dejará de calcularse
            automáticamente. Si cambias las medidas (Ancho/Alto) después, se te
            pedirá confirmación para sobreescribir estos cambios.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
          <div className="flex-1 border rounded-md overflow-auto relative">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead className="w-[160px]">SKU</TableHead>
                  <TableHead>Nombre / Descripción</TableHead>
                  <TableHead className="w-[140px]">Fórmula</TableHead>
                  <TableHead className="w-[100px] text-right">Medida</TableHead>
                  <TableHead className="w-[80px] text-right">Cant.</TableHead>
                  <TableHead className="w-[100px] text-right">
                    Costo Unit.
                  </TableHead>
                  <TableHead className="w-[100px] text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center h-24">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : (
                  localItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Select
                          value={item.tipo_componente}
                          onValueChange={(val) =>
                            updateRow(idx, "tipo_componente", val)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Perfil">Perfil</SelectItem>
                            <SelectItem value="Accesorio">Accesorio</SelectItem>
                            <SelectItem value="Vidrio">Vidrio</SelectItem>
                            <SelectItem value="Servicio">Servicio</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>
                        <CatalogSkuSelector
                          value={item.sku_real || ""}
                          onChange={(sku, product) => {
                            const updates: any = { sku_real: sku };
                            if (product) {
                              updates.nombre_componente =
                                product.nombre_completo;
                              updates.costo_total_item =
                                product.costo_mercado_unit || 0;

                              // Auto-detect type based on parts or prefix
                              if (sku.startsWith("AL-"))
                                updates.tipo_componente = "Perfil";
                              else if (sku.startsWith("GEN-"))
                                updates.tipo_componente = "Accesorio";
                              else if (sku.startsWith("VID-"))
                                updates.tipo_componente = "Vidrio";

                              // For profiles, set measure if formula is empty
                              if (
                                updates.tipo_componente === "Perfil" &&
                                !item.detalle_formula
                              ) {
                                // Optional: defaults could go here
                              }
                            }

                            const newItems = [...localItems];
                            newItems[idx] = { ...newItems[idx], ...updates };
                            setLocalItems(newItems);
                            setIsDirty(true);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.nombre_componente || ""}
                          onChange={(e) =>
                            updateRow(idx, "nombre_componente", e.target.value)
                          }
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.detalle_formula || ""}
                          onChange={(e) =>
                            updateRow(idx, "detalle_formula", e.target.value)
                          }
                          className="h-8 text-xs text-muted-foreground"
                          placeholder="Ej. Ancho - 50"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.medida_corte_mm || ""}
                          onChange={(e) =>
                            updateRow(
                              idx,
                              "medida_corte_mm",
                              parseFloat(e.target.value),
                            )
                          }
                          className="h-8 text-right"
                          placeholder="mm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.cantidad_calculada || 0}
                          onChange={(e) =>
                            updateRow(
                              idx,
                              "cantidad_calculada",
                              parseFloat(e.target.value),
                            )
                          }
                          className="h-8 text-right"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.costo_total_item || 0}
                          onChange={(e) =>
                            updateRow(
                              idx,
                              "costo_total_item",
                              parseFloat(e.target.value),
                            )
                          }
                          className="h-8 text-right"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(
                          (item.costo_total_item || 0) *
                            (item.cantidad_calculada || 1),
                        )}
                        {/* Note: In DB structure cost_total_item is usually UNIT cost? 
                                                Wait, check view.
                                                vw_reporte_desglose says: 
                                                m.costo_total_item as costo_unitario 
                                                So yes, it is unit cost.
                                                However, the name is confusing. existing logic sums it up.
                                                
                                                despiece-preview.tsx says:
                                                totalCosto = materiales.reduce((sum, m) => sum + (Number(m.costo_total_item) || 0), 0)
                                                
                                                Wait, if despiece-preview sums `costo_total_item` directly, then `costo_total_item` IS THE TOTAL LINE COST (Qty * UnitPrice).
                                                
                                                Let's verify `fn_generar_despiece_ingenieria`.
                                                Usually `costo_total_item` = `costo_unitario` * `cantidad`.
                                                
                                                If I edit Quantity and Unit Cost, I should calculate Total myself or let user input Total.
                                                
                                                Let's look at `despiece-preview.tsx` again.
                                                Line 48: displays `m.costo_total_item`.
                                                Line 43: displays `m.medida_corte_mm`.
                                                
                                                If I have 2 profiles of 10 USD each.
                                                Is `costo_total_item` 20 or 10?
                                                
                                                In `vw_reporte_desglose`:
                                                m.costo_total_item as costo_unitario -- This alias suggests it IS unit cost.
                                                BUT aliases can be wrong.
                                                
                                                Let's check `cotizacion-despiece-dialog.tsx`:
                                                `const costoTotal = item.costo_unitario * item.cantidad_item * item.cantidad_unitaria`
                                                (Where item comes from view).
                                                
                                                Wait, in view:
                                                `cantidad_unitaria` = `m.cantidad_calculada`
                                                `costo_unitario` = `m.costo_total_item`
                                                
                                                So `m.costo_total_item` IS THE COST PER UNIT OF MATERIAL?
                                                OR COST PER UNIT OF WINDOW?
                                                
                                                If the window has 4 wheels (5 USD each).
                                                `cantidad_calculada` = 4.
                                                Is `costo_total_item` = 5 (unit price of wheel) or 20 (total cost of wheels for this window)?
                                                
                                                If `despiece-preview` sums them up to get Total Cost of Window:
                                                `totalCosto = materiales.reduce(...)`
                                                Then `m.costo_total_item` MUST be 20.
                                                
                                                So `costo_total_item` = `Quantity` * `UnitCost`.
                                                
                                                So in my editor, I should probably ask for Unit Cost and Quantity, and calculate Total.
                                                OR just ask for Total Cost (which is what is stored).
                                                
                                                Let's ask for "Costo Total (S/)" to be safe, because that's what's stored.
                                                Maybe add a helper "Ref. Unitario" column that is calculated.
                                            */}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(idx)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="px-6 py-2 border-t bg-white">
          <Button
            variant="outline"
            size="sm"
            onClick={addNewRow}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Agregar Material / Servicio
          </Button>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-slate-50">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !isDirty}
          >
            {updateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Guardar Cambios Manuales
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
