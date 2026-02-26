"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trxApi } from "@/lib/api/trx";

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  product,
}: StockAdjustmentDialogProps) {
  const queryClient = useQueryClient();
  const [physicalCount, setPhysicalCount] = useState<string>("");
  const [comments, setComments] = useState("");

  const currentStock = Number(product?.stock_actual || 0);
  const count = Number(physicalCount);
  const diff = isNaN(count) ? 0 : count - currentStock;
  const isZeroDifference = diff === 0;
  const modificationType = diff > 0 ? "AJUSTE_POSITIVO" : "AJUSTE_NEGATIVO";

  const mutation = useMutation({
    mutationFn: async () => {
      if (isZeroDifference) return;

      // Prepare common data
      const today = new Date();
      const absDiff = Math.abs(diff);

      // We use 0 cost/price for adjustments usually, or we could use average cost if available.
      // For simplicity and safety in adjustments -> Cost 0 (revaluation would be separate).
      // Or better: Use current PMP if removing, 0 if adding?
      // Standard accounting:
      // In (Pos): @ Price? Usually 0 or Last Cost. Let's use 0 to avoid messing PMP or user logic. User can update cost later.
      // Out (Neg): @ 0 Price (Lost).

      // For this version: Cost/Price = 0.
      const costOrPrice = 0;

      if (diff > 0) {
        // Entrada
        await trxApi.createEntrada({
          tipo_entrada: "AJUSTE_POSITIVO",
          moneda: "PEN",
          tipo_cambio: 1,
          // @ts-ignore
          detalles: [
            {
              id_sku: product.id_sku,
              cantidad: absDiff,
              costo_unitario: costOrPrice,
            },
          ],
          comentarios: `Ajuste Inventario. Stock Sistema: ${currentStock}. Físico: ${count}. ${comments}`,
          estado: "INGRESADO",
        });
      } else {
        // Salida
        await trxApi.createSalida({
          tipo_salida: "AJUSTE_NEGATIVO",
          // @ts-ignore
          detalles: [
            {
              id_sku: product.id_sku,
              cantidad: absDiff,
              precio_unitario: costOrPrice,
            },
          ],
          comentario: `Ajuste Inventario. Stock Sistema: ${currentStock}. Físico: ${count}. ${comments}`,
          estado: "CONFIRMADO",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catProductos"] }); // Refresh stock
      queryClient.invalidateQueries({ queryKey: ["trxMovimientos"] });
      alert("Ajuste registrado correctamente.");
      onOpenChange(false);
      setPhysicalCount("");
      setComments("");
    },
    onError: (err) => {
      console.error(err);
      alert("Error al registrar ajuste.");
    },
  });

  const handleSave = () => {
    if (physicalCount === "") return;
    mutation.mutate();
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajuste Rápido de Stock</DialogTitle>
          <DialogDescription>
            Ingrese la cantidad física contada. El sistema calculará la
            diferencia.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Producto</Label>
            <div className="col-span-3 text-sm font-medium">
              {product.nombre_completo}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Stock Sistema</Label>
            <div className="col-span-3 text-sm font-mono">{currentStock}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="physical" className="text-right">
              Conteo Físico
            </Label>
            <Input
              id="physical"
              type="number"
              value={physicalCount}
              onChange={(e) => setPhysicalCount(e.target.value)}
              className="col-span-3"
              placeholder="Ej. 15"
              autoFocus
            />
          </div>

          {physicalCount !== "" && !isZeroDifference && (
            <div
              className={`text-center p-2 rounded text-sm font-bold ${diff > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              Diferencia: {diff > 0 ? "+" : ""}
              {diff}
              <span className="block text-xs font-normal opacity-80">
                ({diff > 0 ? "Entrada / Sobrante" : "Salida / Faltante"})
              </span>
            </div>
          )}
          {isZeroDifference && physicalCount !== "" && (
            <div className="text-center p-2 rounded bg-gray-100 text-gray-500 text-sm">
              Sin variaciones.
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comments" className="text-right">
              Notas
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="col-span-3"
              placeholder="Razón del ajuste..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              mutation.isPending || physicalCount === "" || isZeroDifference
            }
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Confirmar Ajuste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
