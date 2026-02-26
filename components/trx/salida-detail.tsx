"use client";

import { useQuery } from "@tanstack/react-query";
import { trxApi } from "@/lib/api/trx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface SalidaDetailProps {
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headerInfo: any; // Pass header info to avoid re-fetching or fetch if needed
}

export function SalidaDetail({
  id,
  open,
  onOpenChange,
  headerInfo,
}: SalidaDetailProps) {
  const { data: detalles, isLoading } = useQuery({
    queryKey: ["trxSalidaDetalle", id],
    queryFn: () => trxApi.getSalidaDetalles(id!),
    enabled: !!id && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de Salida</DialogTitle>
          <DialogDescription>
            ID: {headerInfo?.id_salida?.slice(0, 8)}... | Tipo:{" "}
            {headerInfo?.tipo_salida}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-sm">
          <div>
            <span className="font-semibold text-muted-foreground">Fecha:</span>
            <div className="font-medium">
              {headerInfo?.fecha
                ? format(new Date(headerInfo.fecha), "dd/MM/yyyy HH:mm")
                : "-"}
            </div>
          </div>
          <div>
            <span className="font-semibold text-muted-foreground">
              Cliente/Destino:
            </span>
            <div className="font-medium">
              {headerInfo?.mst_clientes?.nombre_completo ||
                headerInfo?.id_destinatario ||
                "-"}
            </div>
          </div>
          <div>
            <span className="font-semibold text-muted-foreground">
              Responsable:
            </span>
            <div className="font-medium">
              {headerInfo?.responsable_interno || "-"}
            </div>
          </div>
          <div>
            <span className="font-semibold text-muted-foreground">Total:</span>
            <div className="font-bold text-lg">
              S/ {Number(headerInfo?.total_dinero || 0).toFixed(2)}
            </div>
          </div>
          <div className="col-span-2">
            <span className="font-semibold text-muted-foreground">
              Comentarios:
            </span>
            <div>{headerInfo?.comentario || "-"}</div>
          </div>
          <div>
            <span className="font-semibold text-muted-foreground">Estado:</span>
            <div>{headerInfo?.estado}</div>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : detalles?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No hay items registrados.
                  </TableCell>
                </TableRow>
              ) : (
                detalles?.map((item: any) => (
                  <TableRow key={item.id_linea_salida}>
                    <TableCell>
                      <div className="font-medium">
                        {item.cat_productos_variantes?.nombre_completo}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.cat_productos_variantes?.unidad_medida}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(item.cantidad).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      S/ {Number(item.precio_unitario).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      S/ {Number(item.subtotal).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
