
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ProductList } from "@/components/cat/product-list"
import { PlantillaList } from "@/components/cat/plantilla-list"

export default function CatalogPage() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 border-b pb-2">
                <h2 className="text-xl font-bold tracking-tight">Catálogo de Productos</h2>
                <p className="text-sm text-muted-foreground">
                    Gestione las plantillas de productos terminados (ventanas, puertas) y los SKUs de materiales.
                </p>
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
                            Listado de perfiles, vidrios, accesorios y otros materiales comprables.
                        </p>
                        <ProductList active={true} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
