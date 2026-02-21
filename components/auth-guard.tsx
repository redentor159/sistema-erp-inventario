'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [checked, setChecked] = useState(false)
    const hasLoggedRef = useRef(false) // evitar registros duplicados

    useEffect(() => {
        const supabase = createClient()

        async function recordLogin(userId: string, email: string) {
            // Evitar log duplicado en el mismo montaje del componente
            if (hasLoggedRef.current) return
            hasLoggedRef.current = true

            // Obtener rol del usuario
            const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .single()

            await supabase.from('login_logs').insert({
                user_id: userId,
                email: email,
                user_agent: navigator.userAgent,
                ip_address: null, // No disponible en cliente sin API externa
                role: roleData?.role ?? 'OPERARIO',
            })
        }

        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.replace('/login')
            } else {
                setChecked(true)
            }
        })

        // Escuchar cambios de auth (login, logout, expiración)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                hasLoggedRef.current = false
                router.replace('/login')
                setChecked(false)
            } else if (event === 'SIGNED_IN' && session.user) {
                setChecked(true)
                // Registrar el acceso en la tabla log
                recordLogin(session.user.id, session.user.email ?? '')
            } else if (event === 'TOKEN_REFRESHED' && session) {
                setChecked(true)
            }
        })

        return () => subscription.unsubscribe()
    }, [router, pathname])

    if (!checked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Verificando acceso...</span>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
