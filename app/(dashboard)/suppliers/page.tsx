import { SupplierList } from "@/components/mst/supplier-list";
import { ShoppingCart } from "lucide-react";

export default function SuppliersPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="h-6 w-6 text-slate-600" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Directorio de Proveedores
            </h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Gestione sus socios de cadena de suministro y detalles de contacto.
          </p>
        </div>
      </div>
      <SupplierList />
    </div>
  );
}
