"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

type Screen = "login" | "forgot" | "forgot-sent";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState<Screen>("login");

  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Correo o contraseña incorrectos.");
        }
        if (error.message.includes("Email not confirmed")) {
          throw new Error(
            "Debes confirmar tu correo antes de ingresar. Revisa tu bandeja de entrada.",
          );
        }
        throw new Error(error.message);
      }
      router.push("/cotizaciones");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw new Error(error.message);
      setScreen("forgot-sent");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Panel izquierdo — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-white border-r border-gray-200 flex-col items-center justify-center p-12">
        <div className="max-w-sm text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              ERP/WMS
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Sistema de Gestión para Vidriería
            </p>
          </div>
          <div className="space-y-3 text-left pt-4">
            {[
              "Gestión de inventario y Kardex",
              "Cotizaciones y despiece automático",
              "Control de producción Kanban",
              "Reportes y análisis en tiempo real",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 text-sm text-gray-600"
              >
                <CheckCircle className="h-4 w-4 text-gray-400 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-3">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ERP/WMS</h1>
          </div>

          {/* Login Form */}
          {screen === "login" && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Iniciar sesión
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Ingresa tus credenciales para acceder al sistema
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@empresa.com"
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setScreen("forgot");
                        setError(null);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-900 transition"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
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
                  className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Verificando..." : "Ingresar al sistema"}
                </button>
              </form>

              <p className="text-xs text-center text-gray-400">
                El acceso está restringido a usuarios autorizados.
                <br />
                Contacta al administrador para obtener una cuenta.
              </p>
            </>
          )}

          {/* Forgot Password Form */}
          {screen === "forgot" && (
            <>
              <div>
                <button
                  onClick={() => {
                    setScreen("login");
                    setError(null);
                  }}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio de sesión
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  Recuperar contraseña
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Ingresa tu correo y recibirás un enlace para restablecer tu
                  contraseña.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="space-y-1">
                  <label
                    htmlFor="reset-email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@empresa.com"
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
                  className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
              </form>
            </>
          )}

          {/* Confirmation Screen */}
          {screen === "forgot-sent" && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Correo enviado
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Si el correo <strong>{email}</strong> está registrado,
                  recibirás un enlace para restablecer tu contraseña en los
                  próximos minutos.
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Revisa también tu carpeta de spam.
                </p>
              </div>
              <button
                onClick={() => {
                  setScreen("login");
                  setError(null);
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline transition"
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
