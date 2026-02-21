"use client"

import { CotizacionDetail } from "@/components/trx/cotizacion-detail"

export default function CotizacionDetailClient({ cotizacionId }: { cotizacionId: string }) {
    return (
        <div className="flex flex-col gap-6 p-6">
            <CotizacionDetail id={cotizacionId} />
        </div>
    )
}
