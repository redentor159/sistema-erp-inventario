import { ClientList } from "@/components/mst/client-list";

export default function ClientsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
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
