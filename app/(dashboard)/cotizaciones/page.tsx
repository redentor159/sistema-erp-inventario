import { Suspense } from "react";
import { Metadata } from "next";
import { CotizacionesList } from "@/components/trx/cotizaciones-list";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Cotizaciones | ERP Vidriería",
  description: "Gestión de Cotizaciones y Despiece",
};

export default function CotizacionesPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-6 w-6 text-slate-600" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Cotizaciones
            </h2>
          </div>
          <p className="text-muted-foreground mt-1">
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
