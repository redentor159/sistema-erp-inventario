import { Suspense } from "react"
import { CotizacionDetail } from "@/components/trx/cotizacion-detail"

interface PageProps {
    params: {
        id: string
    }
}

export default async function CotizacionDetailPage({ params }: PageProps) {
    const { id } = await params
    return (
        <div className="flex flex-col gap-6 p-6 h-screen overflow-hidden">
            <CotizacionDetail id={id} />
        </div>
    )
}
