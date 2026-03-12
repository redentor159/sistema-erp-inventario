import { ConfigGeneralFormCmp } from "@/components/mst/config-general-form";
import { Settings } from "lucide-react";
import { SecretDangerZone } from "@/components/mst/secret-danger-zone";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="h-6 w-6 text-slate-600" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Configuración General
            </h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Gestione la identidad de su empresa, parámetros financieros y
            variables globales.
          </p>
        </div>
      </div>
      <ConfigGeneralFormCmp />
      <SecretDangerZone />
    </div>
  );
}
