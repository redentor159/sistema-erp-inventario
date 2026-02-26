import { ClientList } from "@/components/mst/client-list";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Directorio de Clientes
          </h2>
          <p className="text-muted-foreground">
            Gestione la información de sus clientes y dueños de proyecto.
          </p>
        </div>
      </div>
      <ClientList />
    </div>
  );
}
