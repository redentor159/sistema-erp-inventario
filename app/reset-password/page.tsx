"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Lock, AlertCircle, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
    const router = useRouter();
    const supabase = createClient();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Opcional: Verificar que el usuario tenga un "Recovery Token" activo
    // Supabase en la versión con PKCE loguea al usuario silenciosamente al intercambiar el código
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Redirigir al login si accedió a esta vista directamente sin un link de reseteo o la sesión ya caducó
                router.push("/login?error=Invalid_or_expired_recovery_link");
            }
        };
        checkSession();
    }, [router, supabase.auth]);

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        // Validación básica de completitud
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password: password });

            if (error) {
                throw new Error(error.message);
            }

            // Contraseña actualizada con éxito
            setSuccess(true);

            // Auto redireccionar tras 3 segundos
            setTimeout(() => {
                router.push("/cotizaciones");
                router.refresh(); // Para refrescar layouts server-side
            }, 3000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Panel Centrado - Formulario (Reusando diseño corporativo del ERP) */}
            <div className="w-full flex items-center justify-center p-8">
                <div className="w-full max-w-sm space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">

                    <div className="text-center">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-4 shadow-sm">
                            <span className="text-white font-bold text-xl">E</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ERP/WMS</h1>
                        <h2 className="text-xl font-semibold text-gray-800 mt-6">
                            Restablecer Contraseña
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Ingresa tu nueva contraseña para acceder al sistema.
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center space-y-6 pt-4">
                            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-7 w-7 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">¡Contraseña Actualizada!</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Redirigiéndote automáticamente al panel principal...
                                </p>
                            </div>
                            <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="space-y-1">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Nueva contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Escribe la nueva contraseña"
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Confirmar contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repite la nueva contraseña"
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 mt-4"
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {loading ? "Guardando..." : "Actualizar Contraseña"}
                            </button>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}
