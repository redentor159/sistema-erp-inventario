"use client"

import { Info } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface SimpleTooltipProps {
    text: string
    className?: string
}

export function SimpleTooltip({ text, className }: SimpleTooltipProps) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div
            className="relative inline-flex items-center ml-2"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <Info className={cn("h-4 w-4 text-muted-foreground cursor-help hover:text-primary transition-colors", className)} />

            {isVisible && (
                <div className="absolute z-50 w-64 p-2 text-xs text-white bg-slate-900 rounded shadow-lg -top-2 left-6 animate-in fade-in zoom-in-95 duration-200">
                    {text}
                    {/* Tiny arrow */}
                    <div className="absolute top-3 -left-1 w-2 h-2 bg-slate-900 transform rotate-45" />
                </div>
            )}
        </div>
    )
}
