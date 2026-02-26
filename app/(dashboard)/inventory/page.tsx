"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trxApi } from "@/lib/api/trx";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntradaList } from "@/components/trx/entrada-list";
import { SalidaList } from "@/components/trx/salida-list";
import { StockList } from "@/components/trx/stock-list";
import { KardexList } from "@/components/trx/kardex-list";
import { RetazosList } from "@/components/dat/retazo-list";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("kardex");

  // Kardex Query moved to KardexList component

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 border-b pb-2">
        <h2 className="text-xl font-bold tracking-tight">
          Gestión de Inventario
        </h2>
        <p className="text-sm text-muted-foreground">
          Control de stock, registro de compras y salidas de material.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="kardex">Kardex (Movimientos)</TabsTrigger>
          <TabsTrigger value="entradas">Entradas (Compras)</TabsTrigger>
          <TabsTrigger value="salidas">Salidas (Consumos/Ventas)</TabsTrigger>
          <TabsTrigger value="retazos" className="flex items-center gap-2">
            Retazos (Offcuts)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kardex" className="space-y-4">
          <KardexList active={activeTab === "kardex"} />
        </TabsContent>

        <TabsContent value="entradas" className="space-y-4">
          <EntradaList active={activeTab === "entradas"} />
        </TabsContent>

        <TabsContent value="salidas" className="space-y-4">
          <SalidaList active={activeTab === "salidas"} />
        </TabsContent>

        <TabsContent value="retazos" className="space-y-4">
          <RetazosList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
