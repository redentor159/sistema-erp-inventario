"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { MAIN_NAVIGATION } from "@/config/navigation";
import { HelpPanel } from "@/components/dashboard/help-panel";
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

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto w-full">
          {MAIN_NAVIGATION.map((group, index) => (
            <div key={index}>
              {group.label && (
                <div className="pt-4 pb-2">
                  <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {group.label}
                  </p>
                </div>
              )}
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={
                    item.matchPrefix
                      ? pathname?.startsWith(item.href)
                      : pathname === item.href
                  }
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <HelpPanel collapsed={false} />
        </div>

        <div className="p-4 border-t border-border flex items-center gap-3">
          <UserNav collapsed={false} />
          <span className="text-sm font-medium">Mi Cuenta</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
