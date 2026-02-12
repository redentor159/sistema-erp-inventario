"use client"

import { useState } from "react"
import { LayoutDashboard, BarChart3, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// Components (We will create these next)
import { SheetExecutive } from "@/components/dashboard/sheet-executive"
import { SheetAnalytics } from "@/components/dashboard/sheet-analytics"
import { SheetCommercial } from "@/components/dashboard/sheet-commercial"

export default function DashboardPage() {
    const [activeView, setActiveView] = useState<"executive" | "analytics" | "commercial">("executive")

    const navItems = [
        { id: "executive", label: "Vista Ejecutiva", icon: LayoutDashboard, description: "Valorización & KPIs" },
        { id: "commercial", label: "Inteligencia Comercial", icon: TrendingUp, description: "Ventas & Márgenes" },
        { id: "analytics", label: "Analítica Inventarios", icon: BarChart3, description: "Quiebres & Pareto" },
    ] as const

    return (
        <div className="flex flex-col space-y-4 h-[calc(100vh-100px)]">
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 border-b pb-2">
                <h2 className="text-xl font-bold tracking-tight">Cockpit MTO</h2>
                <p className="text-sm text-muted-foreground">
                    Tablero de Inteligencia Operativa y Control de Producción.
                </p>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
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
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="mr-3 h-4 w-4" />
                            <div>
                                <div className="font-semibold">{item.label}</div>
                                <div className="text-xs font-normal opacity-70">{item.description}</div>
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
    )
}
