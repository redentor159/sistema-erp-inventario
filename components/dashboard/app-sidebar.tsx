"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MAIN_NAVIGATION } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/dashboard/user-nav";
import { NavItem } from "@/components/dashboard/nav-item";
import { HelpPanel } from "@/components/dashboard/help-panel";

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(pathname === "/production");

  // Auto-collapse on production page
  useEffect(() => {
    setCollapsed(pathname === "/production");
  }, [pathname]);

  return (
    <aside
      className={cn(
        "bg-white dark:bg-slate-900 border-r border-slate-200/60 shadow-sm dark:border-slate-800 hidden md:flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "h-16 border-b border-slate-200/60 dark:border-slate-800 flex items-center transition-all px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed && (
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
            ERP/WMS
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {MAIN_NAVIGATION.map((group, index) => (
          <div key={index}>
            {group.label && (
              <>
                <div className={cn("pt-4 pb-2", collapsed && "hidden")}>
                  <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {group.label}
                  </p>
                </div>
                {collapsed && <div className="h-4" />}
              </>
            )}
            {group.items.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                collapsed={collapsed}
                active={
                  item.matchPrefix
                    ? pathname?.startsWith(item.href)
                    : pathname === item.href
                }
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="p-2 border-t border-slate-200/60 dark:border-slate-800">
        <HelpPanel collapsed={collapsed} />
      </div>

      <UserNav collapsed={collapsed} />
    </aside>
  );
}
