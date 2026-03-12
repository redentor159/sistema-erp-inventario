"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type UserRole = "ADMIN" | "SECRETARIA" | "OPERARIO" | "SIN ROL" | "ERROR ROL";

export function useRole() {
  const supabase = createClient();
  const [role, setRole] = useState<UserRole>("OPERARIO"); // Fallback a OPERARIO como dice la guía
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchRole() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && isMounted) {
          const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .single();

          if (error) throw error;

          if (data && isMounted) {
            setRole(data.role as UserRole);
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        if (isMounted) setRole("ERROR ROL");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRole();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const isAdmin = role === "ADMIN";

  return { role, isAdmin, loading };
}
