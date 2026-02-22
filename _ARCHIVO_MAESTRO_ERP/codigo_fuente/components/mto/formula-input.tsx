"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { evaluateFormula, validateFormula, FORMULA_VARIABLES, FORMULA_FUNCTIONS, type FormulaVariables } from "@/lib/utils/formula-engine"
import { cn } from "@/lib/utils"

interface FormulaInputProps {
    value: string
    onChange: (value: string) => void
    previewVars?: FormulaVariables
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function FormulaInput({
    value,
    onChange,
    previewVars = { ancho: 2000, alto: 1500, hojas: 2, crucesH: 0, crucesV: 0 },
    placeholder = "Ej: (ancho/2)+4",
    className,
    disabled
}: FormulaInputProps) {
    const [focused, setFocused] = useState(false)

    const validation = useMemo(() => validateFormula(value), [value])
    const preview = useMemo(() => {
        if (!value || value.trim() === '') return null
        return evaluateFormula(value, previewVars)
    }, [value, previewVars])

    const isEmpty = !value || value.trim() === ''

    return (
        <div className={cn("relative group", className)}>
            <Input
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "font-mono text-sm pr-20 transition-colors",
                    !isEmpty && validation.valid && "border-emerald-300 focus-visible:ring-emerald-400",
                    !isEmpty && !validation.valid && "border-red-300 focus-visible:ring-red-400"
                )}
            />

            {/* Preview badge */}
            {!isEmpty && (
                <div className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono px-2 py-0.5 rounded",
                    validation.valid
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                )}>
                    {validation.valid
                        ? `= ${parseFloat(preview!.value.toFixed(2))}`
                        : "⚠ Error"
                    }
                </div>
            )}

            {/* Validation error */}
            {!isEmpty && !validation.valid && (
                <p className="text-xs text-red-500 mt-1">{validation.error}</p>
            )}

            {/* Tooltip with available variables (on focus) */}
            {focused && (
                <div className="absolute z-50 top-full left-0 mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-semibold text-slate-700 mb-2">Variables disponibles:</p>
                    <div className="grid grid-cols-2 gap-1 mb-2">
                        {FORMULA_VARIABLES.map(v => (
                            <div key={v.name} className="flex items-center gap-1">
                                <code className="bg-slate-100 px-1 rounded text-blue-700">{v.name}</code>
                                <span className="text-slate-500">{v.desc}</span>
                            </div>
                        ))}
                    </div>
                    <p className="font-semibold text-slate-700 mb-1 mt-2">Funciones:</p>
                    <div className="grid grid-cols-2 gap-1">
                        {FORMULA_FUNCTIONS.map(f => (
                            <div key={f.name} className="flex items-center gap-1">
                                <code className="bg-slate-100 px-1 rounded text-purple-700">{f.name}</code>
                            </div>
                        ))}
                    </div>
                    <p className="text-slate-400 mt-2">Ejemplo: <code>(ancho/2)+4</code> → {previewVars.ancho / 2 + 4}</p>
                </div>
            )}
        </div>
    )
}
