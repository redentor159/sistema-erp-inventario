import { SupplierList } from "@/components/mst/supplier-list";

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Directorio de Proveedores
          </h2>
          <p className="text-muted-foreground">
            Gestione sus socios de cadena de suministro y detalles de contacto.
          </p>
        </div>
      </div>
      <SupplierList />
    </div>
  );
}
