import { Suspense } from "react";
import { Metadata } from "next";
import { CotizacionesList } from "@/components/trx/cotizaciones-list";

export const metadata: Metadata = {
  title: "Cotizaciones | ERP Vidriería",
  description: "Gestión de Cotizaciones y Despiece",
};

export default function CotizacionesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Cotizaciones
          </h2>
          <p className="text-muted-foreground">
            Gestiona presupuestos y genera despiece automático de materiales.
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Cargando cotizaciones...</div>}>
        <CotizacionesList />
      </Suspense>
    </div>
  );
}
