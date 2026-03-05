"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ProductList } from "@/components/cat/product-list";
import { PlantillaList } from "@/components/cat/plantilla-list";
import { BookOpen } from "lucide-react";

export default function CatalogPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-6 w-6 text-slate-600" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Catálogo de Productos
            </h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Gestione las plantillas de productos terminados (ventanas, puertas) y
            los SKUs de materiales.
          </p>
        </div>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plantillas">Plantillas (Modelos)</TabsTrigger>
          <TabsTrigger value="items">Items (Insumos/SKUs)</TabsTrigger>
        </TabsList>
        <TabsContent value="plantillas" className="space-y-4">
          <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium">Gestión de Plantillas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Aquí definirá los "Recetarios" para ventanas, mamparas, etc.
            </p>
            <PlantillaList />
          </div>
        </TabsContent>
        <TabsContent value="items" className="space-y-4">
          <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium">Gestión de SKUs</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Listado de perfiles, vidrios, accesorios y otros materiales
              comprables.
            </p>
            <ProductList active={true} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
