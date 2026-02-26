"use client";

import { useQuery } from "@tanstack/react-query";
import { mtoApi } from "@/lib/api/mto";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QuoteFormCmp } from "@/components/mto/quote-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function QuotesPage() {
  const { data: quotes, isLoading } = useQuery({
    queryKey: ["trxCotizaciones"],
    queryFn: mtoApi.getCotizaciones,
  });

  const [open, setOpen] = useState(false);

  if (isLoading) return <div className="p-8">Cargando cotizaciones...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Presupuestos / Cotizaciones
          </h2>
          <p className="text-muted-foreground">
            Gestión de proyectos y valorización.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cotización
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Presupuesto</DialogTitle>
              <DialogDescription>
                Configure el proyecto y detale los elementos (ventanas, puertas)
                a cotizar.
              </DialogDescription>
            </DialogHeader>
            <QuoteFormCmp onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-white dark:bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Nro</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Importe</TableHead>
              <TableHead>Moneda</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center h-24 text-muted-foreground"
                >
                  No hay cotizaciones registradas. Crea una nueva.
                </TableCell>
              </TableRow>
            )}
            {quotes?.map((q: any) => (
              <TableRow key={q.id_cotizacion}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(q.fecha_emision), "dd/MM/yyyy", {
                    locale: es,
                  })}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {/* UUID suffix or real number if implemented */}
                  ...{q.id_cotizacion.slice(-4)}
                </TableCell>
                <TableCell className="font-medium">
                  {q.nombre_proyecto}
                </TableCell>
                <TableCell>{q.mst_clientes?.nombre_completo}</TableCell>
                <TableCell className="font-bold">
                  {q.total_precio_venta?.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>{q.moneda}</TableCell>
                <TableCell>
                  <Badge
                    variant={q.estado === "APROBADO" ? "default" : "secondary"}
                  >
                    {q.estado}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
