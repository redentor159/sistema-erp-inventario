"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Settings, User, Box, Users, ShoppingCart, FileText, Trello, ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    // Auto-collapse on production page
    useEffect(() => {
        if (pathname === '/production') {
            setCollapsed(true)
        } else {
            setCollapsed(false)
        }
    }, [pathname])

    return (
        <aside className={cn(
            "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col transition-all duration-300",
            collapsed ? "w-16" : "w-64"
        )}>
            <div className={cn(
                "h-16 border-b border-gray-200 dark:border-gray-700 flex items-center transition-all px-4",
                collapsed ? "justify-center" : "justify-between"
            )}>
                {!collapsed && <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate">ERP/WMS</h1>}
                <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8">
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                <NavItem href="/dashboard" icon={LayoutDashboard} label="Panel Principal" collapsed={collapsed} active={pathname === '/dashboard'} />
                <NavItem href="/catalog" icon={Box} label="Catálogo" collapsed={collapsed} active={pathname === '/catalog'} />
                <NavItem href="/inventory" icon={Box} label="Inventario (Kardex)" collapsed={collapsed} active={pathname === '/inventory'} />
                <NavItem href="/cotizaciones" icon={FileText} label="Cotizaciones" collapsed={collapsed} active={pathname?.startsWith('/cotizaciones')} />
                <NavItem href="/production" icon={Trello} label="Producción" collapsed={collapsed} active={pathname === '/production'} />

                <div className={cn("pt-4 pb-2", collapsed && "hidden")}>
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Maestros</p>
                </div>
                {collapsed && <div className="h-4" />}

                <NavItem href="/configuracion" icon={Settings} label="Configuración" collapsed={collapsed} active={pathname === '/configuracion'} />
                <NavItem href="/recetas" icon={FileText} label="📐 Recetas" collapsed={collapsed} active={pathname?.startsWith('/recetas')} />
                <NavItem href="/clients" icon={Users} label="Clientes" collapsed={collapsed} active={pathname === '/clients'} />
                <NavItem href="/suppliers" icon={ShoppingCart} label="Proveedores" collapsed={collapsed} active={pathname === '/suppliers'} />
                <NavItem href="/audit/recetas" icon={FileText} label="🔍 Auditoría Recetas" collapsed={collapsed} active={pathname?.startsWith('/audit')} />

                <div className={cn("pt-4 pb-2", collapsed && "hidden")}>
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reportes</p>
                </div>
                {collapsed && <div className="h-4" />}

                <NavItem href="/export" icon={FileSpreadsheet} label="Exportar Datos" collapsed={collapsed} active={pathname === '/export'} />
            </nav>
        </aside>
    )
}

function NavItem({ href, icon: Icon, label, collapsed, active }: { href: string, icon: any, label: string, collapsed: boolean, active: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                active
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700",
                collapsed ? "justify-center" : ""
            )}
            title={collapsed ? label : undefined}
        >
            <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
            {!collapsed && <span>{label}</span>}
        </Link>
    )
}
