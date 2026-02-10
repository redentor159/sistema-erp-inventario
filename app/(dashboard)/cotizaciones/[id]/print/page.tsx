"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { cotizacionesApi } from "@/lib/api/cotizaciones"
import { configApi } from "@/lib/api/config"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, Printer } from "lucide-react"

export default function CotizacionPrintPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [cotizacion, setCotizacion] = useState<any>(null)
    const [config, setConfig] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            cotizacionesApi.getCotizacionById(id),
            configApi.getConfig()
        ])
            .then(([cotRes, configRes]) => {
                setCotizacion(cotRes)
                setConfig(configRes)
            })
            .catch(err => {
                console.error(err)
                alert("Error cargando datos")
            })
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <div className="p-8 text-center">Preparando vista de impresión...</div>
    if (!cotizacion) return <div className="p-8 text-center text-red-500">No se encontró la cotización.</div>

    return (
        <div className="min-h-screen bg-white">
            {/* Toolbar (Hidden when printing) */}
            <div className="print:hidden flex items-center justify-between p-4 bg-slate-100 border-b sticky top-0 z-50">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
                <div className="flex gap-2">
                    <Button onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Imprimir / Guardar PDF
                    </Button>
                </div>
            </div>

            {/* A4 Page Container */}
            <div className="max-w-[210mm] mx-auto bg-white p-[10mm] shadow-lg print:shadow-none print:p-0 print:max-w-none">

                {/* Header */}
                <header className="flex justify-between items-start mb-8 border-b pb-4">
                    <div>
                        {/* Company Logo / Name */}
                        {config?.logo_url ? (
                            <img src={config.logo_url} alt="Logo" className="h-16 mb-2 object-contain" />
                        ) : (
                            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tighter">
                                {config?.nombre_empresa || 'NOMBRE EMPRESA'}
                            </h1>
                        )}
                        {!config?.logo_url && config?.nombre_empresa && (
                            // If name shown above, don't repeat? Or show both?
                            // Usually if logo exists, name might be in logo.
                            // Let's show name if no logo, or if we want to force it.
                            // For now, I showed name if no logo.
                            // Add other details below.
                            null
                        )}
                        {config?.logo_url && config?.nombre_empresa && (
                            <h2 className="text-lg font-bold text-slate-900 uppercase">{config.nombre_empresa}</h2>
                        )}

                        <p className="text-sm text-slate-500">RUC: {config?.ruc || '---'}</p>
                        <p className="text-sm text-slate-500">{config?.direccion_fiscal || 'Dirección no registrada'}</p>
                        <p className="text-sm text-slate-500">Tel: {config?.telefono_contacto || '---'}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-slate-700">COTIZACIÓN</h2>
                        <p className="text-lg font-mono text-primary">{cotizacion.id_cotizacion}</p>
                        <div className="mt-2 text-sm">
                            <p><strong>Fecha:</strong> {new Date(cotizacion.fecha_emision).toLocaleDateString()}</p>
                            <p><strong>Validez:</strong> {cotizacion.validez_dias} días</p>
                        </div>
                    </div>
                </header>

                {/* Client Info */}
                <section className="mb-8 p-4 bg-slate-50 rounded border border-slate-200 print:bg-white print:border-none print:p-0">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-2 border-b pb-1">Datos del Cliente</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-slate-500">Señor(es):</p>
                            <p className="font-semibold text-lg">{cotizacion.mst_clientes?.nombre_completo || 'Cliente General'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Documento / RUC:</p>
                            <p className="font-semibold">{cotizacion.mst_clientes?.nro_doc || '---'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-slate-500">Proyecto:</p>
                            <p className="font-semibold">{cotizacion.nombre_proyecto || '---'}</p>
                        </div>
                    </div>
                </section>

                {/* Items Table */}
                <section className="mb-8">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-700 print:bg-slate-200">
                                <th className="border p-2 text-center w-12">#</th>
                                <th className="border p-2 text-left">Descripción</th>
                                <th className="border p-2 text-center w-24">Medidas (mm)</th>
                                <th className="border p-2 text-center w-16">Cant</th>
                                <th className="border p-2 text-right w-32">P. Unitario</th>
                                <th className="border p-2 text-right w-32">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cotizacion.detalles?.map((item: any, index: number) => (
                                <tr key={item.id_linea_cot} className="break-inside-avoid">
                                    <td className="border p-2 text-center">{index + 1}</td>
                                    <td className="border p-2">
                                        <div className="font-bold">{item.etiqueta_item}</div>
                                        <div className="text-xs text-slate-500">{item.id_modelo} - {item.tipo_vidrio} - {item.color_perfiles}</div>
                                        <div className="text-xs text-slate-400 italic">Ubicación: {item.ubicacion}</div>
                                    </td>
                                    <td className="border p-2 text-center">{item.ancho_mm} x {item.alto_mm}</td>
                                    <td className="border p-2 text-center">{item.cantidad}</td>
                                    <td className="border p-2 text-right">{formatCurrency(item._vc_precio_unit_oferta_calc / item.cantidad)}</td>
                                    <td className="border p-2 text-right font-medium">{formatCurrency(item._vc_subtotal_linea_calc)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-slate-300">
                                <td colSpan={5} className="p-2 text-right font-bold text-slate-600">Subtotal (Neto)</td>
                                <td className="p-2 text-right font-mono">{formatCurrency(cotizacion._vc_precio_final_cliente / 1.18)}</td>
                            </tr>
                            <tr>
                                <td colSpan={5} className="p-2 text-right font-bold text-slate-600">IGV (18%)</td>
                                <td className="p-2 text-right font-mono">{formatCurrency(cotizacion._vc_precio_final_cliente - (cotizacion._vc_precio_final_cliente / 1.18))}</td>
                            </tr>
                            <tr className="bg-slate-100 print:bg-slate-200 text-lg">
                                <td colSpan={5} className="p-2 text-right font-bold text-slate-900">TOTAL</td>
                                <td className="p-2 text-right font-bold text-slate-900">{formatCurrency(cotizacion._vc_precio_final_cliente)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </section>

                {/* Terms and Signatures */}
                <div className="grid grid-cols-2 gap-8 text-xs break-inside-avoid">
                    <div className="p-4 border rounded bg-slate-50 print:bg-white print:border-slate-300">
                        <h4 className="font-bold mb-2">Términos y Condiciones:</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                            <li>Precios expresados en {cotizacion.moneda}.</li>
                            <li>Tiempo de entrega: 15 días hábiles.</li>
                            <li>Forma de pago: 50% adelanto, 50% contra entrega.</li>
                            <li>La oferta tiene una validez de {cotizacion.validez_dias} días.</li>
                        </ul>
                    </div>
                    <div className="flex flex-col justify-end items-center mt-8">
                        <div className="w-48 border-t border-slate-400 mb-2"></div>
                        <p className="font-semibold text-slate-700">Firma Autorizada</p>
                    </div>
                </div>

                {/* Styles for print hiding dashboard elements if layout persists */}
                <style jsx global>{`
                    @media print {
                        /* Hide standard dashboard elements assuming they have semantic tags or classes */
                        nav, aside, .sticky { display: none !important; }
                        /* Ensure body background is white */
                        body { background-color: white !important; }
                        /* Ensure main content takes full width */
                        main { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: none !important; }
                        /* Hide shadcn dialogs/overlays */
                        [role="dialog"] { display: none !important; }
                    }
                `}</style>
            </div>
        </div>
    )
}
