'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<'login' | 'signup'>('login')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        const supabase = createClient()

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
            } else {
                const { error } = await supabase.auth.signUp({ email, password })
                if (error) throw error
            }
            router.push('/cotizaciones')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Error de autenticación')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            {/* Background glow effects */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none -z-10" />

            <Card className="w-full max-w-md bg-zinc-900/80 border-zinc-800 shadow-2xl backdrop-blur-sm">
                <CardHeader className="space-y-1 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            E
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">ERP Vidriería</CardTitle>
                    </div>
                    <CardDescription className="text-zinc-400">
                        {mode === 'login'
                            ? 'Ingresa tus credenciales para acceder al sistema'
                            : 'Crea una nueva cuenta de administrador'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-300 text-sm">Correo Electrónico</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="usuario@empresa.com"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="bg-zinc-950/80 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-300 text-sm">Contraseña</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="bg-zinc-950/80 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                            />
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg">
                                ⚠ {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors disabled:opacity-50"
                        >
                            {loading
                                ? (mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...')
                                : (mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')
                            }
                        </Button>

                        <div className="pt-2 text-center text-sm text-zinc-500">
                            {mode === 'login' ? (
                                <>
                                    ¿Primera vez?{' '}
                                    <button
                                        type="button"
                                        onClick={() => { setMode('signup'); setError(null) }}
                                        className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
                                    >
                                        Registrar cuenta
                                    </button>
                                </>
                            ) : (
                                <>
                                    ¿Ya tienes cuenta?{' '}
                                    <button
                                        type="button"
                                        onClick={() => { setMode('login'); setError(null) }}
                                        className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
                                    >
                                        Iniciar sesión
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
