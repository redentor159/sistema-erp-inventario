"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { cotizacionesApi } from "@/lib/api/cotizaciones"
import { configApi } from "@/lib/api/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, Printer, RefreshCw, Save } from "lucide-react"
import { useToastHelper } from "@/lib/hooks/useToastHelper"

// Definición de Plantilla por Defecto
const DEFAULT_TERMS = `• Precios expresados en {{MONEDA}}.
• Tiempo de entrega estimado: 15-20 días hábiles.
• Forma de pago: 60% de adelanto y 40% contra entrega.
• La oferta tiene una validez de {{VALIDEZ}} días.
• No incluye trabajos de albañilería ni pintura salvo se especifique.
• Cuentas Bancarias: BCP Soles 193-XXXXXXXX-0-XX`

export default function CotizacionPrintPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const toast = useToastHelper()

    // Data Loading
    const [cotizacion, setCotizacion] = useState<any>(null)
    const [config, setConfig] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Editor State
    const [termsText, setTermsText] = useState(DEFAULT_TERMS)
    const [observations, setObservations] = useState("")
    const [showBranding, setShowBranding] = useState(true)
    const [customTitle, setCustomTitle] = useState("COTIZACIÓN")
    const [showImages, setShowImages] = useState(false) // Future feature?

    useEffect(() => {
        Promise.all([
            cotizacionesApi.getCotizacionById(id),
            configApi.getConfig()
        ])
            .then(([cotRes, configRes]) => {
                setCotizacion(cotRes)
                setConfig(configRes)
                if (cotRes.observaciones) setObservations(cotRes.observaciones)
                // If saved terms exist, load them? For now use default or simple cache
            })
            .catch(err => {
                console.error(err)
                alert("Error cargando datos")
            })
            .finally(() => setLoading(false))
    }, [id])

    // Variable Replacement Logic
    const processText = (text: string) => {
        if (!cotizacion || !config) return text

        const replacements: Record<string, string> = {
            '{{CLIENTE}}': cotizacion.mst_clientes?.nombre_completo || 'Cliente',
            '{{PROYECTO}}': cotizacion.nombre_proyecto || '',
            '{{FECHA}}': new Date(cotizacion.fecha_emision).toLocaleDateString(),
            '{{VALIDEZ}}': cotizacion.validez_dias?.toString() || '15',
            '{{TOTAL}}': formatCurrency(cotizacion._vc_precio_final_cliente),
            '{{MONEDA}}': cotizacion.moneda || 'PEN',
            '{{EMPRESA}}': config.nombre_empresa || 'Empresa',
            '{{RUC}}': config.ruc || ''
        }

        let processed = text
        Object.keys(replacements).forEach(key => {
            processed = processed.replaceAll(key, replacements[key])
        })
        return processed
    }

    const insertVariable = (variable: string) => {
        setTermsText(prev => prev + " " + variable)
    }

    if (loading) return <div className="p-8 text-center">Cargando editor...</div>
    if (!cotizacion) return <div className="p-8 text-center text-red-500">No se encontró la cotización.</div>

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* =====================================================================================
                LEFT PANEL: EDITOR (Hidden on Print)
               ===================================================================================== */}
            <aside className="w-[400px] bg-white border-r flex-col shadow-xl z-20 hidden md:flex print:hidden">
                <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                    </Button>
                    <h2 className="font-semibold text-slate-800">Editor de Impresión</h2>
                </div>

                <ScrollArea className="flex-1 p-4 space-y-6">
                    {/* Visual Options */}
                    <div className="space-y-4 border p-4 rounded-lg bg-slate-50/50">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Opciones Visuales</h3>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="brand">Mostrar Membrete (Logo)</Label>
                            <Switch id="brand" checked={showBranding} onCheckedChange={setShowBranding} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Título del Documento</Label>
                            <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
                        </div>
                    </div>

                    {/* Terms Editor */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Términos y Condiciones</h3>
                            <Button variant="ghost" size="icon" title="Resetear Default" onClick={() => setTermsText(DEFAULT_TERMS)}>
                                <RefreshCw className="h-3 w-3" />
                            </Button>
                        </div>
                        <Textarea
                            value={termsText}
                            onChange={(e) => setTermsText(e.target.value)}
                            className="h-[200px] font-mono text-xs leading-relaxed"
                            placeholder="Ingrese términos..."
                        />
                        {/* Variable Helpers */}
                        <div className="flex flex-wrap gap-2">
                            {['{{CLIENTE}}', '{{VALIDEZ}}', '{{MONEDA}}', '{{TOTAL}}', '{{FECHA}}'].map(v => (
                                <Button key={v} variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => insertVariable(v)}>
                                    {v}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Observations */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Observaciones (Pie de Página)</h3>
                        <Textarea
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            className="h-[80px] text-xs"
                            placeholder="Notas adicionales..."
                        />
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-slate-50 flex flex-col gap-2">
                    <Button className="w-full" size="lg" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Imprimir / Guardar PDF
                    </Button>
                    <p className="text-[10px] text-center text-slate-400">
                        Nota: La vista previa derecha es exactamente lo que se imprimirá.
                    </p>
                </div>
            </aside>

            {/* =====================================================================================
                RIGHT PANEL: PREVIEW (Print Target)
               ===================================================================================== */}
            <main className="flex-1 overflow-auto bg-slate-500/10 p-8 flex justify-center print:p-0 print:bg-white print:block print:overflow-visible">
                <div className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[10mm] box-border relative print:shadow-none print:w-full print:min-h-0 print:absolute print:top-0 print:left-0">

                    {/* Header */}
                    <header className="flex justify-between items-start mb-8 border-b pb-4">
                        <div className="w-1/2">
                            {showBranding && (
                                config?.logo_url ? (
                                    <img src={config.logo_url} alt="Logo" className="h-16 mb-2 object-contain" />
                                ) : (
                                    <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tighter">
                                        {config?.nombre_empresa || 'NOMBRE EMPRESA'}
                                    </h1>
                                )
                            )}
                            {showBranding && config?.logo_url && config?.nombre_empresa && (
                                <h2 className="text-lg font-bold text-slate-900 uppercase">{config.nombre_empresa}</h2>
                            )}

                            <div className="space-y-1 mt-2">
                                <p className="text-sm text-slate-500">RUC: {config?.ruc || '---'}</p>
                                <p className="text-sm text-slate-500">{config?.direccion_fiscal || 'Dirección no registrada'}</p>
                                <p className="text-sm text-slate-500">Tel: {config?.telefono_contacto || '---'}</p>
                                <p className="text-sm text-slate-500 max-w-[300px]">{config?.email_contacto}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-slate-700 uppercase">{customTitle}</h2>
                            <p className="text-lg font-mono text-primary font-bold">{cotizacion.id_cotizacion}</p>
                            <div className="mt-4 text-sm space-y-1">
                                <p><strong>Fecha Emisión:</strong> {processText('{{FECHA}}')}</p>
                                <p><strong>Validez:</strong> {cotizacion.validez_dias} días</p>
                                <p><strong>Moneda:</strong> {cotizacion.moneda}</p>
                            </div>
                        </div>
                    </header>

                    {/* Client Info */}
                    <section className="mb-6 p-4 bg-slate-50 rounded-sm border border-slate-200 print:bg-white print:border print:border-slate-300">
                        <div className="grid grid-cols-12 gap-4 text-sm">
                            <div className="col-span-8">
                                <p className="text-slate-500 text-xs uppercase">Cliente</p>
                                <p className="font-bold text-base text-slate-800">{cotizacion.mst_clientes?.nombre_completo || 'Cliente General'}</p>
                                <p className="text-slate-600">{cotizacion.mst_clientes?.direccion || ''}</p>
                            </div>
                            <div className="col-span-4 text-right">
                                <p className="text-slate-500 text-xs uppercase">RUC / DNI</p>
                                <p className="font-semibold">{cotizacion.mst_clientes?.nro_doc || '---'}</p>
                                <div className="mt-2">
                                    <p className="text-slate-500 text-xs uppercase">Proyecto</p>
                                    <p className="font-semibold text-slate-800">{cotizacion.nombre_proyecto}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Items Table */}
                    <section className="mb-8">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-800 text-white print:bg-slate-800 print:text-white">
                                    <th className="border-b-2 border-slate-600 p-2 text-center w-10">#</th>
                                    <th className="border-b-2 border-slate-600 p-2 text-left">Descripción / Item</th>
                                    <th className="border-b-2 border-slate-600 p-2 text-center w-24">Medidas</th>
                                    <th className="border-b-2 border-slate-600 p-2 text-center w-12">Cant</th>
                                    <th className="border-b-2 border-slate-600 p-2 text-right w-24">P. Unit</th>
                                    <th className="border-b-2 border-slate-600 p-2 text-right w-24">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cotizacion.detalles?.map((item: any, index: number) => (
                                    <tr key={item.id_linea_cot}>
                                        <td className="border-b p-3 text-center text-slate-500">{index + 1}</td>
                                        <td className="border-b p-3">
                                            <div className="font-bold text-slate-800">{item.etiqueta_item}</div>
                                            {item.id_modelo !== 'SERVICIO' ? (
                                                <div className="text-xs text-slate-500 flex flex-col gap-0.5 mt-1">
                                                    <span>Sistema: {item.id_modelo?.split('-')[0] || 'Std'}</span>
                                                    <span>Vidrio: {item.tipo_vidrio}</span>
                                                    <span>Acabado: {item.color_perfiles}</span>
                                                    {item.ubicacion && <span className="italic text-slate-400">Ubicación: {item.ubicacion}</span>}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-500 mt-1 italic">{item.ubicacion || 'Servicio General'}</div>
                                            )}
                                        </td>
                                        <td className="border-b p-3 text-center whitespace-nowrap">
                                            {item.id_modelo !== 'SERVICIO' ? `${item.ancho_mm} x ${item.alto_mm}` : '-'}
                                        </td>
                                        <td className="border-b p-3 text-center font-semibold">{item.cantidad}</td>
                                        <td className="border-b p-3 text-right text-slate-600">
                                            {formatCurrency(item._vc_precio_unit_oferta_calc / item.cantidad)}
                                        </td>
                                        <td className="border-b p-3 text-right font-bold text-slate-800">
                                            {formatCurrency(item._vc_subtotal_linea_calc)}
                                        </td>
                                    </tr>
                                ))}
                                {/* Costo Fijo de Instalación - Virtual Item */}
                                {(cotizacion.costo_fijo_instalacion ?? 0) > 0 && (
                                    <tr>
                                        <td className="border-b p-3 text-center text-slate-500">-</td>
                                        <td className="border-b p-3">
                                            <div className="font-bold text-slate-800">Servicios de Instalación</div>
                                            <div className="text-xs text-slate-500 mt-1 italic">Incluye: Embalaje, Flete, Movilidad, Viáticos, SCTR</div>
                                        </td>
                                        <td className="border-b p-3 text-center whitespace-nowrap">-</td>
                                        <td className="border-b p-3 text-center font-semibold">1</td>
                                        <td className="border-b p-3 text-right text-slate-600">
                                            {formatCurrency(cotizacion.costo_fijo_instalacion!)}
                                        </td>
                                        <td className="border-b p-3 text-right font-bold text-slate-800">
                                            {formatCurrency(cotizacion.costo_fijo_instalacion!)}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end mt-4">
                            <div className="w-[250px] space-y-2">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(cotizacion.incluye_igv ? cotizacion._vc_precio_final_cliente / 1.18 : cotizacion._vc_precio_final_cliente)}</span>
                                </div>
                                {cotizacion.incluye_igv && (
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>IGV (18%):</span>
                                        <span>{formatCurrency(cotizacion._vc_precio_final_cliente - (cotizacion._vc_precio_final_cliente / 1.18))}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-slate-900 border-t pt-2 border-slate-300">
                                    <span>TOTAL:</span>
                                    <span>{formatCurrency(cotizacion._vc_precio_final_cliente)}</span>
                                </div>
                                <div className="text-[10px] text-right text-slate-400">
                                    {cotizacion.incluye_igv ? 'Precios incluyen IGV' : 'Precios NO incluyen IGV'}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer Conditions */}
                    <div className="mt-auto grid grid-cols-2 gap-10 break-inside-avoid">
                        <div className="text-sm text-slate-700">
                            <h4 className="font-bold border-b border-slate-300 mb-2 pb-1 text-xs uppercase tracking-wider text-slate-500">Términos y Condiciones</h4>
                            <div className="whitespace-pre-line leading-snug">
                                {processText(termsText)}
                            </div>

                            {observations && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <h4 className="font-bold mb-1 text-xs uppercase text-slate-500">Observaciones</h4>
                                    <p className="text-xs italic text-slate-600">{observations}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-end items-center pb-8">
                            <div className="w-[200px] h-[80px] mb-2 relative">
                                {/* Space for digital signature or stamp */}
                            </div>
                            <div className="w-[240px] border-t border-slate-400 mb-2"></div>
                            <p className="font-bold text-slate-700 text-sm">{config?.nombre_empresa || 'LA EMPRESA'}</p>
                            <p className="text-xs text-slate-500">Firma Autorizada</p>
                        </div>
                    </div>

                </div>
            </main>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white; }
                    aside { display: none !important; }
                    main { margin: 0; padding: 0; width: 100%; height: auto; background: white; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    /* Ensure background colors print (standard browsers default to no-bg) */
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    )
}
