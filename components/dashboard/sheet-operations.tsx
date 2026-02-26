"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { retazosApi } from "@/lib/api/retazos";

export function SheetOperations() {
  // We reuse retazos API
  const { data: retazos } = useQuery({
    queryKey: ["dashRetazos"],
    queryFn: () => retazosApi.getRetazos({ estado: "DISPONIBLE" }),
  });

  // Placeholder data for WIP (Work In Progress) until we connect to real production data
  const wipItems = [
    {
      id: "OT-001",
      cliente: "Constructora Las Torres",
      proyecto: "Edificio A",
      estado: "CORTE",
      avance: 25,
      items: "30 Ventanas S25",
    },
    {
      id: "OT-003",
      cliente: "Juan Pérez",
      proyecto: "Casa Playa",
      estado: "ARMADO",
      avance: 60,
      items: "5 Mamparas S3831",
    },
    {
      id: "OT-005",
      cliente: "Hospital Regional",
      proyecto: "Pabellón B",
      estado: "INSTALACION",
      avance: 90,
      items: "12 Puertas S20",
    },
  ];

  const totalRetazosLength =
    retazos?.reduce((acc, curr) => acc + Number(curr.longitud_mm), 0) ?? 0;
  const totalRetazosCount = retazos?.length ?? 0;

  return (
    <div className="space-y-6 h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
        <div>
          <h3 className="text-lg font-medium">
            Control de Planta y Operaciones
          </h3>
          <p className="text-sm text-muted-foreground">
            Flujo de trabajo (WIP) y recuperación de materiales.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 flex-1">
        {/* WIP Kanban-like View */}
        <Card className="col-span-1 lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Órdenes en Proceso (WIP)</CardTitle>
            <CardDescription>
              Seguimiento de Órdenes de Trabajo activas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 bg-slate-50 dark:bg-slate-900/20 p-4 rounded-md mx-4 mb-4 overflow-auto">
            <div className="space-y-4">
              {wipItems.map((ot) => (
                <div
                  key={ot.id}
                  className="bg-white dark:bg-card p-4 rounded shadow-sm border border-l-4 border-l-blue-500 flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-blue-600">{ot.id}</span>
                      <Badge variant="outline">{ot.estado}</Badge>
                    </div>
                    <div className="font-medium">
                      {ot.cliente} - {ot.proyecto}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ot.items}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                      {ot.avance}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avance Global
                    </div>
                    {/* Simple Progress Bar */}
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${ot.avance}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Retazos Efficiency */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eficiencia de Retazos</CardTitle>
              <CardDescription>Material Recuperado Disponible</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-green-600">
                  {totalRetazosCount}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Piezas Disponibles
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center px-4">
                  <span className="text-sm text-muted-foreground">
                    Longitud Total:
                  </span>
                  <span className="font-mono font-bold">
                    {(totalRetazosLength / 1000).toFixed(2)} m
                  </span>
                </div>
                <div className="mt-4 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-800 dark:text-green-300">
                  Ahorro estimado: S/{" "}
                  {((totalRetazosLength / 1000) * 25).toFixed(2)} (Ref. S/25/m)
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cuellos de Botella</CardTitle>
              <CardDescription>Top retrasos por modelo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Sistema 3831 (Mamparas)</span>
                  <Badge variant="destructive">4 días dem.</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div
                    className="bg-red-600 h-1.5 rounded-full"
                    style={{ width: "80%" }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-sm mt-4">
                  <span>Serie 20 (Ventanas)</span>
                  <Badge variant="secondary">1 día dem.</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div
                    className="bg-yellow-500 h-1.5 rounded-full"
                    style={{ width: "25%" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
