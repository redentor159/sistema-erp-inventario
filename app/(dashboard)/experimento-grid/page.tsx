import { Metadata } from "next";
import { GridPlayground } from "@/components/experimento-grid/GridPlayground";

export const metadata: Metadata = {
    title: "Experimento Grid Paramétrico",
    description: "Playground experimental para el motor CPQ de tipologías",
};

export default function ExperimentoGridPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Grid Paramétrico</h2>
                    <p className="text-muted-foreground mt-1">
                        Validación conceptual del Renderizador 2D y Despiece Inmutable
                    </p>
                </div>
            </div>

            {/* Contenedor principal del experimento */}
            <div className="border rounded-lg bg-background p-4 min-h-[700px]">
                <GridPlayground cotizacionId="test" />
            </div>
        </div>
    );
}
