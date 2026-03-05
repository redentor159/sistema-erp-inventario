import { ClientList } from "@/components/mst/client-list";
import { Users2 } from "lucide-react";

export default function ClientsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users2 className="h-6 w-6 text-slate-600" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Directorio de Clientes
            </h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Gestione la información de sus clientes y dueños de proyecto.
          </p>
        </div>
      </div>
      <ClientList />
    </div>
  );
}
