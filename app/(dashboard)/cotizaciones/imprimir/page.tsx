"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import PrintClient from "./client"

function PrintInner() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    if (!id) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                No se especificó una cotización para imprimir.
            </div>
        )
    }

    return <PrintClient cotizacionId={id} />
}

export default function CotizacionImprimirPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64">Cargando editor de impresión...</div>}>
            <PrintInner />
        </Suspense>
    )
}
