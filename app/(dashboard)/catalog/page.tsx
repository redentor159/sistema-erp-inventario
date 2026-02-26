"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ProductList } from "@/components/cat/product-list";
import { PlantillaList } from "@/components/cat/plantilla-list";

export default function CatalogPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Catálogo de Productos
          </h2>
          <p className="text-muted-foreground">
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
