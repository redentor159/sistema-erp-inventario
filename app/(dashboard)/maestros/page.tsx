"use client";

import { Suspense, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenericMasterDataClient } from "@/components/mst/generic-master-data-client";
import { Database, Package, Shield, Factory, Warehouse, Palette, Loader2 } from "lucide-react";

export default function MaestrosPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .single();
          
          setIsAdmin(roleData?.role === "ADMIN");
        }
      } catch (error) {
        console.error("Error checking role:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkRole();
  }, []);

  const sections = [
    {
      id: "familias",
      label: "Familias",
      icon: Package,
      config: {
        tableName: "mst_familias",
        idColumn: "id_familia",
        nameColumn: "nombre_familia",
        extraColumn: "categoria_odoo",
        labels: {
          title: "Familia",
          id: "ID Familia",
          name: "Nombre Familia",
          extra: "Categoría Odoo",
        },
      },
    },
    {
      id: "marcas",
      label: "Marcas",
      icon: Shield,
      config: {
        tableName: "mst_marcas",
        idColumn: "id_marca",
        nameColumn: "nombre_marca",
        extraColumn: "pais_origen",
        labels: {
          title: "Marca",
          id: "ID Marca",
          name: "Nombre Marca",
          extra: "País de Origen",
        },
      },
    },
    {
      id: "materiales",
      label: "Materiales",
      icon: Factory,
      config: {
        tableName: "mst_materiales",
        idColumn: "id_material",
        nameColumn: "nombre_material",
        extraColumn: "odoo_code",
        labels: {
          title: "Material",
          id: "ID Material",
          name: "Nombre Material",
          extra: "Código Odoo",
        },
      },
    },
    {
      id: "acabados",
      label: "Acabados/Colores",
      icon: Palette,
      config: {
        tableName: "mst_acabados_colores",
        idColumn: "id_acabado",
        nameColumn: "nombre_acabado",
        extraColumn: "sufijo_sku",
        labels: {
          title: "Acabado/Color",
          id: "ID Acabado",
          name: "Nombre Acabado",
          extra: "Sufijo SKU",
        },
      },
    },
    {
      id: "almacenes",
      label: "Almacenes",
      icon: Warehouse,
      config: {
        tableName: "mst_almacenes",
        idColumn: "id_almacen",
        nameColumn: "nombre_almacen",
        labels: {
          title: "Almacén",
          id: "ID Almacén",
          name: "Nombre Almacén",
        },
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-[70vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-slate-500" />
        <p className="text-slate-500 font-medium">Cargando módulo de maestros...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-6 w-6 text-slate-600" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Datos Maestros
            </h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Gestión centralizada de entidades paramétricas y configuraciones base.
          </p>
        </div>
      </div>

      <Tabs defaultValue="familias" className="w-full space-y-4">
        <div className="bg-white p-1 rounded-md ring-1 ring-slate-900/5 shadow-sm inline-flex w-full md:w-auto overflow-hidden pointer-events-auto">
          <TabsList className="bg-transparent border-none w-full overflow-x-auto flex-nowrap h-9 p-0">
            {sections.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all px-4 font-medium text-sm gap-2 border-none rounded-sm text-slate-600 hover:text-slate-900"
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="focus-visible:outline-none">
            <Suspense
              fallback={
                <div className="bg-white border rounded-lg p-12 text-center text-slate-400">
                  Cargando {section.label.toLowerCase()}...
                </div>
              }
            >
              <GenericMasterDataClient {...section.config} isAdmin={isAdmin} />
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
