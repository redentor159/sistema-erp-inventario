"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  User,
  Box,
  Users,
  ShoppingCart,
  FileText,
  Trello,
  FileSpreadsheet,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserNav } from "@/components/dashboard/user-nav";
import { NavItem } from "@/components/dashboard/nav-item";

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 flex flex-col p-0">
        <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center px-6">
          <SheetTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            ERP/WMS
          </SheetTitle>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Panel Principal"
            active={pathname === "/dashboard"}
            onClick={() => setOpen(false)}
          />
          <NavItem
            href="/catalog"
            icon={Box}
            label="Catálogo"
            active={pathname === "/catalog"}
            onClick={() => setOpen(false)}
          />
          <NavItem
            href="/inventory"
            icon={Box}
            label="Inventario (Kardex)"
            active={pathname === "/inventory"}
            onClick={() => setOpen(false)}
          />
          <NavItem
            href="/cotizaciones"
            icon={FileText}
            label="Cotizaciones"
            active={pathname?.startsWith("/cotizaciones")}
            onClick={() => setOpen(false)}
          />
          <NavItem
            href="/production"
            icon={Trello}
            label="Producción"
            active={pathname === "/production"}
            onClick={() => setOpen(false)}
          />

          <div className="pt-4 pb-2">
            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Maestros
            </p>
          </div>

          <NavItem
            href="/configuracion"
            icon={Settings}
            label="Configuración"
            active={pathname === "/configuracion"}
            onClick={() => setOpen(false)}
          />
          <NavItem
            href="/maestros/series"
            icon={Box}
            label="Sistemas y Series"
            active={pathname === "/maestros/series"}
            onClick={() => setOpen(false)}
          />
          <NavItem
            href="/recetas"
            icon={FileText}
            label="Recetas"
            active={pathname?.startsWith("/recetas")}
            onClick={() => setOpen(false)}
          />
          <NavItem
            href="/clients"
            icon={Users}
            label="Clientes"
            active={pathname === "/clients"}
            onClick={() => setOpen(false)}
          />
          <NavItem
            href="/suppliers"
            icon={ShoppingCart}
            label="Proveedores"
            active={pathname === "/suppliers"}
            onClick={() => setOpen(false)}
          />

          <div className="pt-4 pb-2">
            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Reportes
            </p>
          </div>

          <NavItem
            href="/export"
            icon={FileSpreadsheet}
            label="Exportar Datos"
            active={pathname === "/export"}
            onClick={() => setOpen(false)}
          />
        </nav>

        <div className="p-4 border-t border-border flex items-center gap-3">
          <UserNav collapsed={false} />
          <span className="text-sm font-medium">Mi Cuenta</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
