"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export function UserNav({ collapsed }: { collapsed?: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState("Cargando...");
  const [name, setName] = useState("Cargando...");

  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && isMounted) {
        setUser(user);
        try {
          const { data } = await supabase
            .from("user_roles")
            .select("role, display_name")
            .eq("user_id", user.id)
            .single();
          if (data && isMounted) {
            setRole(data.role);
            setName(
              data.display_name || user.email?.split("@")[0] || "Unknown",
            );
          } else {
            if (isMounted) setRole("SIN ROL");
            if (isMounted) setName(user.email?.split("@")[0] || "Unknown");
          }
        } catch {
          if (isMounted) setRole("ERROR ROL");
        }
      }
    }

    fetchUser();

    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  if (!user) return null;

  async function handleSignOut() {
    await supabase.auth.signOut();
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
            {name}
          </span>
          <span className="text-xs text-emerald-600 font-bold truncate">
            {role}
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
