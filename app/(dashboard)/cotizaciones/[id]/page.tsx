import { Suspense } from "react"
import { CotizacionDetail } from "@/components/trx/cotizacion-detail"

export async function generateStaticParams() {
    return [{ id: '1' }];
}

interface PageProps {
    params: {
        id: string
    }
}

export default async function CotizacionDetailPage({ params }: PageProps) {
    const { id } = await params
    return (
        <div className="flex flex-col gap-6 p-6">
            <CotizacionDetail id={id} />
        </div>
    )
}
