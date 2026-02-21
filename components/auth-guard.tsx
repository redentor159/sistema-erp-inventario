'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        const supabase = createClient()

        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.replace('/login')
            } else {
                setChecked(true)
            }
        })

        // Listen for auth state changes (logout, token expire, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                router.replace('/login')
                setChecked(false)
            } else if (event === 'SIGNED_IN') {
                setChecked(true)
            }
        })

        return () => subscription.unsubscribe()
    }, [router, pathname])

    // While we check auth, show a loading state
    if (!checked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="flex flex-col items-center gap-4 text-zinc-400">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Verificando sesión...</span>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
