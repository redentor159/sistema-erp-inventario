import { SupplierList } from "@/components/mst/supplier-list";

export default function SuppliersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
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
