"use client"

import { LogOut, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function UserNav({ collapsed }: { collapsed?: boolean }) {
    const { user, profile, loading, signOut } = useAuth()

    if (loading || !user) return null

    return (
        <div className={cn("p-4 border-t border-gray-200 dark:border-gray-700", collapsed && "flex justify-center p-2")}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={cn("w-full flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800", collapsed ? "px-2 justify-center" : "px-2 justify-start")}>
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full">
                            <UserIcon className="h-4 w-4" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col items-start truncate overflow-hidden">
                                <span className="text-sm font-medium leading-none mb-1 truncate w-40 text-left">
                                    {profile?.display_name || user.email?.split('@')[0]}
                                </span>
                                <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    {profile?.role || 'OPERARIO'}
                                </span>
                            </div>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{profile?.display_name || 'Usuario'}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
