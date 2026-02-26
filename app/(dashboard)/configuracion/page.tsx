import { ConfigGeneralFormCmp } from "@/components/mst/config-general-form";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Configuración General
          </h2>
          <p className="text-muted-foreground">
            Ajustes globales del sistema, impuestos y variables financieras.
          </p>
        </div>
      </div>
      <ConfigGeneralFormCmp />
    </div>
  );
}
