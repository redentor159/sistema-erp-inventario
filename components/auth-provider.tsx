"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

type AuthContextType = {
  user: any | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar sesión inicial
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        // Fetch rols
        const { data } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", currentUser.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    };

    initAuth();

    // Escuchar cambios (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser && event === "SIGNED_IN") {
        const { data } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", currentUser.id)
          .single();
        setProfile(data);
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Route protection
  useEffect(() => {
    if (loading) return;

    const isLoginRoute = pathname === "/login";

    // Si no hay user y no está en /login, redirigir a /login
    if (!user && !isLoginRoute) {
      router.push("/login");
    }

    // Si hay user y está en /login o /, redirigir al panel
    if (user && (isLoginRoute || pathname === "/")) {
      router.push("/cotizaciones"); // Dashboard main
    }
  }, [user, loading, pathname, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Loader global mientras verifica Firebase/Supabase Session
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-zinc-400">Verificando seguridad del sistema...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {/* Si no estamos logueados y NO es la ruta de login, no renderizamos hijos para evitar destellos (flickering) */}
      {!user && pathname !== "/login" ? null : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
