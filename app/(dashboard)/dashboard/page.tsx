"use client";

import { useState } from "react";
import { LayoutDashboard, BarChart3, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import dynamic from "next/dynamic";

const SheetExecutive = dynamic(
  () => import("@/components/dashboard/sheet-executive").then((mod) => mod.SheetExecutive),
  { ssr: false, loading: () => <div className="p-8 text-center text-muted-foreground">Cargando métricas...</div> }
);
const SheetAnalytics = dynamic(
  () => import("@/components/dashboard/sheet-analytics").then((mod) => mod.SheetAnalytics),
  { ssr: false, loading: () => <div className="p-8 text-center text-muted-foreground">Cargando gráficos...</div> }
);
const SheetCommercial = dynamic(
  () => import("@/components/dashboard/sheet-commercial").then((mod) => mod.SheetCommercial),
  { ssr: false, loading: () => <div className="p-8 text-center text-muted-foreground">Cargando embudo...</div> }
);

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<
    "executive" | "analytics" | "commercial"
  >("executive");

  const navItems = [
    {
      id: "executive",
      label: "Vista Ejecutiva",
      icon: LayoutDashboard,
      description: "Valorización & KPIs",
    },
    {
      id: "commercial",
      label: "Inteligencia Comercial",
      icon: TrendingUp,
      description: "Ventas & Márgenes",
    },
    {
      id: "analytics",
      label: "Analítica Inventarios",
      icon: BarChart3,
      description: "Quiebres & Pareto",
    },
  ] as const;

  return (
    <div className="flex flex-col flex-1 space-y-6 p-6 min-h-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="h-6 w-6 text-slate-600" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Panel Principal
            </h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Tablero de Inteligencia Operativa y Control de Producción.
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
        {/* Sidebar Navigation */}
        <aside className="w-64 flex-none hidden md:block border-r pr-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors text-left group",
                activeView === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              <div>
                <div className="font-semibold">{item.label}</div>
                <div className="text-xs font-normal opacity-70">
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pr-2">
          {activeView === "executive" && <SheetExecutive />}
          {activeView === "commercial" && <SheetCommercial />}
          {activeView === "analytics" && <SheetAnalytics />}
        </main>
      </div>
    </div>
  );
}
