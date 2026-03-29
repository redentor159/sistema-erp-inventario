"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function UserNav({ collapsed }: { collapsed?: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const { data: authData, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role, display_name")
          .eq("user_id", user.id)
          .single();

        return {
          user,
          role: data ? data.role : "SIN ROL",
          name: data?.display_name || user.email?.split("@")[0] || "Unknown",
        };
      } catch {
        return {
          user,
          role: "ERROR ROL",
          name: user.email?.split("@")[0] || "Unknown",
        };
      }
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className={cn("p-3 border-t bg-gray-50 flex", collapsed ? "justify-center" : "justify-between")}>
        <span className="text-xs text-muted-foreground truncate">Cargando...</span>
      </div>
    );
  }

  if (!authData) return null;

  async function handleSignOut() {
    await supabase.auth.signOut();
    queryClient.clear();
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      className={cn(
        "p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 flex items-center justify-between",
        collapsed ? "justify-center" : "",
      )}
    >
      {!collapsed && (
        <div className="flex flex-col truncate pr-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {authData.name}
          </span>
          <span className="text-xs text-emerald-600 font-bold truncate">
            {authData.role}
          </span>
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        title="Cerrar Sesión"
        onClick={handleSignOut}
        className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
