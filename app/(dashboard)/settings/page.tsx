import { ConfigGeneralFormCmp } from "@/components/mst/config-general-form";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Configuración del Sistema
          </h2>
          <p className="text-muted-foreground">
            Gestione parámetros financieros globales, márgenes y valores
            predeterminados operativos.
          </p>
        </div>
      </div>
      <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
        <ConfigGeneralFormCmp />
      </div>
    </div>
  );
}
