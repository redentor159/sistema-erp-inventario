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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, cn } from "@/lib/utils"
import { numeroALetras } from "@/lib/numerosALetras"
import { ArrowLeft, Printer, RefreshCw, Type, Palette, Layout } from "lucide-react"

// Types
type PrintTheme = 'modern' | 'classic' | 'minimalist'

interface PrintConfig {
    showLogo: boolean
    showBankInfo: boolean
    showSignature: boolean
    showWarranty: boolean
    showPayment: boolean
    primaryColor: string
    title: string
    theme: PrintTheme
}

interface PrintTexts {
    terms: string
    warranty: string
    payment: string
    notes: string
}

export default function CotizacionPrintPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    // Data State
    const [cotizacion, setCotizacion] = useState<any>(null)
    const [globalConfig, setGlobalConfig] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Editor State
    const [config, setConfig] = useState<PrintConfig>({
        showLogo: true,
        showBankInfo: true,
        showSignature: true,
        showWarranty: true,
        showPayment: true,
        primaryColor: "#2563eb",
        title: "COTIZACIÓN",
        theme: 'modern'
    })

    const [texts, setTexts] = useState<PrintTexts>({
        terms: "",
        warranty: "",
        payment: "",
        notes: ""
    })

    // Load Data
    useEffect(() => {
        const load = async () => {
            try {
                const [cotRes, confRes] = await Promise.all([
                    cotizacionesApi.getCotizacionById(id),
                    configApi.getConfig()
                ])

                setCotizacion(cotRes)
                setGlobalConfig(confRes)

                // Initialize Editor State from Config
                setConfig(prev => ({
                    ...prev,
                    title: cotRes.titulo_documento || "COTIZACIÓN",
                    primaryColor: confRes.color_primario || "#2563eb"
                }))

                setTexts({
                    terms: cotRes.terminos_personalizados || confRes.texto_condiciones_base || "",
                    warranty: confRes.texto_garantia || "",
                    payment: confRes.texto_forma_pago || "",
                    notes: cotRes.observaciones || confRes.notas_pie_cotizacion || ""
                })

            } catch (err) {
                console.error(err)
                alert("Error cargando datos")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    // Variable Replacement
    const processText = (text: string) => {
        if (!text || !cotizacion || !globalConfig) return text

        const replacements: Record<string, string> = {
            '{{CLIENTE}}': cotizacion.mst_clientes?.nombre_completo || 'Cliente',
            '{{PROYECTO}}': cotizacion.nombre_proyecto || '',
            '{{FECHA}}': new Date(cotizacion.fecha_emision).toLocaleDateString(),
            '{{VALIDEZ}}': (cotizacion.validez_dias?.toString() || globalConfig.validez_cotizacion_dias?.toString()) || '15',
            '{{TOTAL}}': formatCurrency(cotizacion._vc_precio_final_cliente, cotizacion.moneda as any),
            '{{MONEDA}}': cotizacion.moneda || 'PEN',
            '{{EMPRESA}}': globalConfig.nombre_empresa || 'Empresa',
            '{{RUC}}': globalConfig.ruc || ''
        }

        let processed = text
        Object.keys(replacements).forEach(key => {
            processed = processed.replaceAll(key, replacements[key])
        })
        return processed
    }

    // Insert Variable Helper
    const insertVariable = (variable: string, field: keyof PrintTexts) => {
        setTexts(prev => ({
            ...prev,
            [field]: prev[field] + " " + variable
        }))
    }

    // Currency Logic
    const mainCurrency = globalConfig?.moneda_default || 'PEN'
    const quoteCurrency = cotizacion?.moneda || 'PEN'
    const exchangeRate = globalConfig?.tipo_cambio_referencial || 3.80

    // Calculate Dual Totals
    const totalQuote = cotizacion?._vc_precio_final_cliente || 0
    let totalMain = 0
    let totalSecondary = 0

    if (mainCurrency === quoteCurrency) {
        totalMain = totalQuote
        // Calculate secondary if needed, e.g. if PEN, show USD
        totalSecondary = mainCurrency === 'PEN' ? totalQuote / exchangeRate : totalQuote * exchangeRate
    } else {
        // Quote is different from Main
        if (mainCurrency === 'PEN' && quoteCurrency === 'USD') {
            totalMain = totalQuote * exchangeRate
            totalSecondary = totalQuote
        } else if (mainCurrency === 'USD' && quoteCurrency === 'PEN') {
            totalMain = totalQuote / exchangeRate
            totalSecondary = totalQuote
        }
    }

    const secondaryCurrency = mainCurrency === 'PEN' ? 'USD' : 'PEN'

    if (loading) return <div className="flex items-center justify-center h-screen">Cargando editor...</div>
    if (!cotizacion) return <div className="p-8 text-center text-red-500">No se encontró la cotización.</div>

    // === THEME DEFINITIONS ===
    const fontThemeClass = config.theme === 'classic' ? 'font-serif' : 'font-sans'
    const isClassic = config.theme === 'classic'
    const isMinimalist = config.theme === 'minimalist'
    const isModern = config.theme === 'modern'

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">

            {/* =====================================================================================
                LEFT PANEL: EDITOR (Hidden on Print)
               ===================================================================================== */}
            <aside className="w-[420px] bg-white border-r flex flex-col shadow-xl z-20 print:hidden">
                <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                    </Button>
                    <h2 className="font-semibold text-slate-800">Editor de Impresión</h2>
                </div>

                <div className="p-2 bg-blue-50 border-b text-xs text-blue-700 px-4">
                    Personaliza este documento antes de imprimir.
                </div>

                <Tabs defaultValue="visual" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-4 pt-2">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="visual" className="text-xs"><Layout className="w-3 h-3 mr-1" /> Visual</TabsTrigger>
                            <TabsTrigger value="texts" className="text-xs"><Type className="w-3 h-3 mr-1" /> Textos</TabsTrigger>
                            <TabsTrigger value="style" className="text-xs"><Palette className="w-3 h-3 mr-1" /> Estilo</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1 p-4">

                        {/* TAB: VISUAL TOGGLES */}
                        <TabsContent value="visual" className="space-y-6 mt-0">
                            <div className="space-y-4 border p-4 rounded-lg bg-slate-50/50">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Secciones</h3>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="logo" className="cursor-pointer">Mostrar Logo / Membrete</Label>
                                    <Switch id="logo" checked={config.showLogo} onCheckedChange={(c) => setConfig({ ...config, showLogo: c })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="bank" className="cursor-pointer">Mostrar Cuentas Bancarias</Label>
                                    <Switch id="bank" checked={config.showBankInfo} onCheckedChange={(c) => setConfig({ ...config, showBankInfo: c })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="sign" className="cursor-pointer">Mostrar Espacio Firma</Label>
                                    <Switch id="sign" checked={config.showSignature} onCheckedChange={(c) => setConfig({ ...config, showSignature: c })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="warr" className="cursor-pointer">Mostrar Garantía</Label>
                                    <Switch id="warr" checked={config.showWarranty} onCheckedChange={(c) => setConfig({ ...config, showWarranty: c })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="pay" className="cursor-pointer">Mostrar Formas de Pago</Label>
                                    <Switch id="pay" checked={config.showPayment} onCheckedChange={(c) => setConfig({ ...config, showPayment: c })} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Título del Documento</Label>
                                <Input value={config.title} onChange={(e) => setConfig({ ...config, title: e.target.value })} />
                            </div>
                        </TabsContent>

                        {/* TAB: TEXTS */}
                        <TabsContent value="texts" className="space-y-6 mt-0">
                            {/* Terms */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label className="text-xs uppercase text-slate-500">Términos y Condiciones</Label>
                                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setTexts({ ...texts, terms: globalConfig?.texto_condiciones_base || "" })} title="Reset">
                                        <RefreshCw className="h-3 w-3" />
                                    </Button>
                                </div>
                                <Textarea
                                    className="text-xs font-mono h-[150px]"
                                    value={texts.terms}
                                    onChange={(e) => setTexts({ ...texts, terms: e.target.value })}
                                />
                                <div className="flex flex-wrap gap-1">
                                    {['{{CLIENTE}}', '{{VALIDEZ}}', '{{TOTAL}}'].map(v => (
                                        <Button key={v} variant="outline" size="sm" className="h-5 text-[9px] px-1" onClick={() => insertVariable(v, 'terms')}>{v}</Button>
                                    ))}
                                </div>
                            </div>

                            {/* Other Texts */}
                            <div className="space-y-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-slate-500">Texto Formas de Pago</Label>
                                    <Textarea className="text-xs h-[50px]" value={texts.payment} onChange={(e) => setTexts({ ...texts, payment: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-slate-500">Texto Garantía</Label>
                                    <Textarea className="text-xs h-[50px]" value={texts.warranty} onChange={(e) => setTexts({ ...texts, warranty: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-slate-500">Notas (Pie de Página)</Label>
                                    <Textarea className="text-xs h-[40px]" value={texts.notes} onChange={(e) => setTexts({ ...texts, notes: e.target.value })} />
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB: STYLE */}
                        <TabsContent value="style" className="space-y-6 mt-0">
                            {/* Theme Selector */}
                            <div className="space-y-3 border p-4 rounded-lg bg-indigo-50/50">
                                <Label className="text-indigo-900 font-semibold">Tema de Diseño</Label>
                                <Select
                                    value={config.theme}
                                    onValueChange={(val: PrintTheme) => setConfig({ ...config, theme: val })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona un tema" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="modern">Estandar (Moderno)</SelectItem>
                                        <SelectItem value="classic">Clásico (Elegante)</SelectItem>
                                        <SelectItem value="minimalist">Minimalista (Limpio)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3 border p-4 rounded-lg">
                                <Label>Color Principal (Marca)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={config.primaryColor}
                                        className="w-12 h-10 p-1"
                                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                                    />
                                    <Input
                                        value={config.primaryColor}
                                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                <div className="p-4 border-t bg-slate-50 flex flex-col gap-2">
                    <Button className="w-full" size="lg" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
                    </Button>
                </div>
            </aside>

            {/* =====================================================================================
                RIGHT PANEL: PREVIEW
               ===================================================================================== */}
            <main className="flex-1 overflow-auto bg-slate-500/10 p-8 flex justify-center print:p-0 print:bg-white print:block print:overflow-visible relative">

                {/* DYNAMIC STYLE ROOT */}
                <div
                    className={cn(
                        "bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[10mm] box-border relative print:shadow-none print:w-full print:min-h-0 print:absolute print:top-0 print:left-0 flex flex-col",
                        fontThemeClass
                    )}
                    style={{
                        '--primary': config.primaryColor
                    } as React.CSSProperties}
                >

                    {/* === HEADER SECTION === */}
                    <header className={cn(
                        "mb-8",
                        isClassic ? "text-center" : "flex justify-between items-start border-b-2 pb-4",
                        isMinimalist && "border-b-0 pb-0"
                    )} style={{ borderColor: (isModern || isMinimalist) ? 'var(--primary)' : 'transparent' }}>

                        {/* CLASSIC HEADER SPECIFIC LAYOUT */}
                        {isClassic && (
                            <div className="flex flex-col items-center mb-6">
                                {config.showLogo && (
                                    <div className="mb-4">
                                        {globalConfig?.logo_url ? (
                                            <img src={globalConfig.logo_url} alt="Logo" className="h-[80px] object-contain" />
                                        ) : (
                                            <h1 className="text-3xl font-serif font-bold uppercase tracking-widest text-slate-900">
                                                {globalConfig?.nombre_empresa || 'EMPRESA'}
                                            </h1>
                                        )}
                                    </div>
                                )}
                                <div className="text-sm font-serif text-slate-600 space-y-1">
                                    <p className="font-bold tracking-wide uppercase text-slate-800">{globalConfig?.nombre_empresa}</p>
                                    <div className="flex gap-3 justify-center text-xs">
                                        <span>RUC: {globalConfig?.ruc}</span>
                                        <span>•</span>
                                        <span>{globalConfig?.telefono_contacto}</span>
                                    </div>
                                    <p className="text-xs italic">{globalConfig?.direccion_fiscal}</p>
                                    <p className="text-xs text-blue-800 underline">{globalConfig?.email_empresa}</p>
                                </div>

                                {/* Divider Line for Classic */}
                                <div className="w-full h-1 border-t-2 border-slate-900 border-double mt-4 mb-4"></div>

                                <div className="w-full flex justify-between items-end px-4">
                                    <div className="text-left">
                                        <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-slate-900">{config.title}</h2>
                                    </div>
                                    <div className="text-right font-serif text-sm">
                                        <p className="font-bold">N°: {cotizacion.id_cotizacion}</p>
                                        <p>Fecha: {processText('{{FECHA}}')}</p>
                                        <p>Entrega: {cotizacion.fecha_prometida ? new Date(cotizacion.fecha_prometida).toLocaleDateString() : 'A coordinar'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MODERN / MINIMALIST HEADER LAYOUT */}
                        {!isClassic && (
                            <>
                                <div className="w-[60%]">
                                    {config.showLogo && (
                                        <div>
                                            {globalConfig?.logo_url ? (
                                                <img src={globalConfig.logo_url} alt="Logo" className="h-16 mb-2 object-contain" />
                                            ) : (
                                                <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tighter" style={{ color: 'var(--primary)' }}>
                                                    {globalConfig?.nombre_empresa || 'NOMBRE EMPRESA'}
                                                </h1>
                                            )}
                                        </div>
                                    )}
                                    {config.showLogo && globalConfig?.logo_url && (
                                        <h2 className={cn("text-lg font-bold uppercase")} style={{ color: 'var(--primary)' }}>
                                            {globalConfig?.nombre_empresa}
                                        </h2>
                                    )}
                                    <div className={cn("space-y-0.5 mt-2 text-sm text-slate-600", isMinimalist && "text-xs font-light text-slate-400")}>
                                        <p><span className="font-semibold">RUC:</span> {globalConfig?.ruc || '---'}</p>
                                        <p>{globalConfig?.direccion_fiscal}</p>
                                        <p>{globalConfig?.telefono_contacto} | {globalConfig?.email_empresa}</p>
                                    </div>
                                </div>

                                <div className={cn(
                                    "text-right w-[40%]",
                                    isMinimalist && "text-right"
                                )}>
                                    <h2 className={cn("text-3xl font-bold uppercase mb-1", isMinimalist && "text-2xl font-light tracking-wide")} style={{ color: 'var(--primary)' }}>{config.title}</h2>
                                    <p className="text-lg font-mono font-bold text-slate-700">{cotizacion.id_cotizacion}</p>
                                    <div className="mt-3 text-sm space-y-1">
                                        <p><strong>Fecha:</strong> {processText('{{FECHA}}')}</p>
                                        <p><strong>Entrega:</strong> {cotizacion.fecha_prometida ? new Date(cotizacion.fecha_prometida).toLocaleDateString() : 'A coordinar'}</p>
                                        <p><strong>Validez:</strong> {processText('{{VALIDEZ}}')} días</p>
                                        <p><strong>Moneda:</strong> {cotizacion.moneda}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </header>

                    {/* === CLIENT SECTION === */}
                    <section className={cn(
                        "mb-6 p-4 rounded-sm",
                        isModern && "border border-slate-200 bg-slate-50/50 print:bg-transparent print:border-slate-300",
                        isClassic && "border border-slate-300 bg-white shadow-sm p-6", // Card-like for Classic
                        isMinimalist && "pl-0"
                    )}>
                        <div className="grid grid-cols-12 gap-4 text-sm">
                            <div className="col-span-8">
                                <p className={cn("text-[10px] uppercase text-slate-500 font-bold mb-1", isClassic && "tracking-widest text-black")}>
                                    {isClassic ? "Señor(es):" : "Cliente"}
                                </p>
                                <p className={cn("font-bold text-lg text-slate-800", isClassic && "text-xl font-serif text-black uppercase")}>
                                    {cotizacion.mst_clientes?.nombre_completo || 'Cliente General'}
                                </p>
                                <p className={cn("text-slate-600", isClassic && "italic")}>
                                    {cotizacion.mst_clientes?.direccion_obra_principal || 'Dirección no registrada'}
                                </p>
                            </div>
                            <div className="col-span-4 text-right">
                                <div className="mb-2">
                                    <p className="text-[10px] uppercase text-slate-500 font-bold">RUC / DNI</p>
                                    <p className="font-semibold">{cotizacion.mst_clientes?.ruc || '---'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-slate-500 font-bold">Referencia</p>
                                    <p className="font-semibold text-slate-800">{cotizacion.nombre_proyecto}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* === TABLE SECTION === */}
                    <section className="mb-6 flex-1">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className={cn(
                                    "text-white print:text-white",
                                    isClassic && "text-black print:text-black border-y-2 border-black bg-white print:bg-white uppercase tracking-widest text-xs",
                                    isMinimalist && "text-slate-700 bg-slate-100 print:bg-slate-100"
                                )} style={{
                                    backgroundColor: isClassic ? 'white' : (isMinimalist ? '#f1f5f9' : 'var(--primary)'),
                                    color: (isClassic || isMinimalist) ? 'black' : 'white'
                                }}>
                                    <th className="p-3 text-center w-10 font-bold">#</th>
                                    <th className="p-3 text-left font-bold">DESCRIPCIÓN</th>
                                    <th className="p-3 text-center w-24 font-bold">MEDIDAS</th>
                                    <th className="p-3 text-center w-12 font-bold">CANT</th>
                                    <th className="p-3 text-right w-24 font-bold">P. UNIT</th>
                                    <th className="p-3 text-right w-24 font-bold">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700">
                                {cotizacion.detalles?.map((item: any, index: number) => (
                                    <tr key={item.id_linea_cot} className={cn(
                                        "border-b",
                                        isMinimalist ? "border-slate-100" : "border-slate-200",
                                        isClassic && "border-slate-300"
                                    )}>
                                        <td className="p-3 text-center text-slate-500">{index + 1}</td>
                                        <td className="p-3">
                                            <div className="font-bold text-slate-900">{item.etiqueta_item}</div>
                                            {item.id_modelo !== 'SERVICIO' ? (
                                                <div className="text-xs text-slate-500 flex flex-col gap-0.5 mt-1">
                                                    <div className="flex gap-3">
                                                        <span><span className="font-semibold">Vidrio:</span> {item.tipo_vidrio}</span>
                                                        <span><span className="font-semibold">Acabado:</span> {item.color_perfiles}</span>
                                                    </div>
                                                    {item.ubicacion && <span className="italic text-slate-400">Ubicación: {item.ubicacion}</span>}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-500 mt-1 italic">{item.ubicacion}</div>
                                            )}
                                        </td>
                                        <td className="p-3 text-center whitespace-nowrap text-xs">
                                            {item.id_modelo !== 'SERVICIO' ? `${item.ancho_mm} x ${item.alto_mm}` : '-'}
                                        </td>
                                        <td className="p-3 text-center font-semibold">{item.cantidad}</td>
                                        <td className="p-3 text-right text-slate-600 font-mono">
                                            {formatCurrency(item._vc_precio_unit_oferta_calc / item.cantidad, quoteCurrency as any)}
                                        </td>
                                        <td className="p-3 text-right font-bold text-slate-800 font-mono">
                                            {formatCurrency(item._vc_subtotal_linea_calc, quoteCurrency as any)}
                                        </td>
                                    </tr>
                                ))}

                                {/* INSTALLATION SERVICE ROW */}
                                {(cotizacion.costo_fijo_instalacion ?? 0) > 0 && (
                                    <tr className={cn(
                                        "border-b",
                                        isModern && "bg-slate-50/50",
                                        isMinimalist && "bg-transparent text-slate-500 italic",
                                        isClassic && "bg-slate-50 italic border-slate-300"
                                    )}>
                                        <td className="p-3 text-center text-slate-500">-</td>
                                        <td className="p-3">
                                            <div className="font-bold text-slate-900">Servicios de Instalación y Logística</div>
                                            <div className="text-xs text-slate-500 mt-1 italic">
                                                Incluye: Embalaje, Flete, Movilidad, Viáticos, SCTR e Instalación en obra.
                                            </div>
                                        </td>
                                        <td className="p-3 text-center whitespace-nowrap">-</td>
                                        <td className="p-3 text-center font-semibold">1</td>
                                        <td className="p-3 text-right text-slate-600 font-mono">
                                            {formatCurrency(cotizacion.costo_fijo_instalacion!, quoteCurrency as any)}
                                        </td>
                                        <td className="p-3 text-right font-bold text-slate-800 font-mono">
                                            {formatCurrency(cotizacion.costo_fijo_instalacion!, quoteCurrency as any)}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </section>

                    {/* === TOTALS SECTION === */}
                    <div className="flex justify-end mb-8 break-inside-avoid">
                        <div className={cn(
                            "w-[400px] p-4",
                            isModern && "bg-slate-50 rounded border border-slate-200 print:bg-white print:border-slate-300",
                            isClassic && "border-2 border-slate-900 bg-white",
                            isMinimalist && "bg-transparent border-0 pr-0"
                        )}>
                            <div className="space-y-2 mb-3">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span className={isClassic ? "font-serif" : ""}>Subtotal ({quoteCurrency}):</span>
                                    <span>{formatCurrency(cotizacion.incluye_igv ? totalQuote / 1.18 : totalQuote, quoteCurrency as any)}</span>
                                </div>
                                {cotizacion.incluye_igv && (
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span className={isClassic ? "font-serif" : ""}>IGV (18%):</span>
                                        <span>{formatCurrency(totalQuote - (totalQuote / 1.18), quoteCurrency as any)}</span>
                                    </div>
                                )}
                                <div className={cn(
                                    "flex justify-between text-xl font-bold text-slate-900 pt-2",
                                    isMinimalist ? "border-t-0" : "border-t border-slate-300",
                                    isClassic && "border-slate-900 border-t-2"
                                )}>
                                    <span className={isClassic ? "uppercase tracking-widest font-serif" : ""}>Total {quoteCurrency}:</span>
                                    <span style={{ color: isClassic ? 'black' : 'var(--primary)' }}>{formatCurrency(totalQuote, quoteCurrency as any)}</span>
                                </div>
                            </div>

                            {/* Conversion */}
                            <div className="pt-2 border-t border-dashed border-slate-300 text-xs text-slate-500 text-right">
                                <p>Tipo de Cambio Ref: {exchangeRate.toFixed(3)}</p>
                                <div className="flex justify-between items-center mt-1 font-semibold text-slate-700">
                                    <span>Equivalente en {mainCurrency}:</span>
                                    <span className="text-sm">{formatCurrency(totalMain, mainCurrency as any)}</span>
                                </div>
                            </div>

                            {/* Total in Words */}
                            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500 italic text-right">
                                {numeroALetras(cotizacion.incluye_igv ? totalQuote : totalQuote, quoteCurrency as any)}
                            </div>
                        </div>
                    </div>

                    {/* === FOOTER GRID === */}
                    <div className="grid grid-cols-2 gap-8 text-xs break-inside-avoid mt-auto">
                        <div className="space-y-4">
                            {/* Terms */}
                            <div>
                                <h4 className={cn(
                                    "font-bold mb-2 pb-1 uppercase tracking-wider",
                                    isClassic ? "border-b-2 border-black text-black font-serif" : "border-b"
                                )} style={{
                                    borderColor: isClassic ? 'black' : 'var(--primary)',
                                    color: isClassic ? 'black' : 'var(--primary)'
                                }}>Términos y Condiciones</h4>
                                <div className={cn(
                                    "whitespace-pre-line leading-relaxed text-slate-600 text-[11px] text-justify",
                                    isClassic && "font-serif"
                                )}>
                                    {processText(texts.terms)}
                                </div>
                            </div>

                            {/* Payment Methods */}
                            {config.showPayment && texts.payment && (
                                <div>
                                    <h4 className={cn(
                                        "font-bold mb-1 pb-1 uppercase tracking-wider",
                                        isClassic ? "border-b-2 border-black text-black font-serif" : "border-b"
                                    )} style={{
                                        borderColor: isClassic ? 'black' : 'var(--primary)',
                                        color: isClassic ? 'black' : 'var(--primary)'
                                    }}>Formas de Pago</h4>
                                    <div className={cn("whitespace-pre-line text-slate-600", isClassic && "font-serif")}>{texts.payment}</div>
                                </div>
                            )}

                            {/* Warranty */}
                            {config.showWarranty && texts.warranty && (
                                <div>
                                    <h4 className={cn(
                                        "font-bold mb-1 pb-1 uppercase tracking-wider",
                                        isClassic ? "border-b-2 border-black text-black font-serif" : "border-b"
                                    )} style={{
                                        borderColor: isClassic ? 'black' : 'var(--primary)',
                                        color: isClassic ? 'black' : 'var(--primary)'
                                    }}>Garantía</h4>
                                    <div className={cn("whitespace-pre-line text-slate-600", isClassic && "font-serif")}>{texts.warranty}</div>
                                </div>
                            )}

                            {/* Observations/Notes */}
                            {texts.notes && (
                                <div className="pt-2 border-t border-slate-200 mt-2">
                                    <h4 className="font-bold uppercase text-[10px] text-slate-500 mb-1">Observaciones</h4>
                                    <p className="italic text-slate-600">{texts.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-between h-full">
                            {/* Bank Info */}
                            {config.showBankInfo && (
                                <div className={cn(
                                    "p-3 rounded mb-4 text-[10px]",
                                    isModern && "bg-slate-50 border border-slate-200 print:bg-white print:border-slate-300",
                                    isClassic && "border-2 border-slate-900 bg-slate-50/50",
                                    isMinimalist && "border-l-2 border-slate-200 pl-4"
                                )}>
                                    <h4 className={cn("font-bold mb-2 uppercase text-center", isClassic && "text-black font-serif tracking-widest")} style={{ color: isClassic ? 'black' : 'var(--primary)' }}>Cuentas Bancarias</h4>
                                    <div className="text-center font-bold mb-2">{globalConfig?.nombre_account || globalConfig?.nombre_empresa}</div>



                                    <div className={cn("space-y-2", isClassic && "font-serif")}>
                                        {/* Dynamic Accounts */}
                                        {/* Dynamic Accounts */}
                                        {(globalConfig?.cuenta_bcp_soles || globalConfig?.cci_soles) && (
                                            <div>
                                                <p className="font-bold">BCP Soles (S/.)</p>
                                                {globalConfig.cuenta_bcp_soles && <p>Cta: {globalConfig.cuenta_bcp_soles}</p>}
                                                {globalConfig.cci_soles && <p>CCI: {globalConfig.cci_soles}</p>}
                                            </div>
                                        )}

                                        {(globalConfig?.cuenta_bcp_dolares || globalConfig?.cci_dolares) && (quoteCurrency === 'USD' || mainCurrency === 'USD') && (
                                            <div className="mt-2 pt-2 border-t border-dashed border-slate-300">
                                                <p className="font-bold">BCP Dólares ($)</p>
                                                {globalConfig.cuenta_bcp_dolares && <p>Cta: {globalConfig.cuenta_bcp_dolares}</p>}
                                                {globalConfig.cci_dolares && <p>CCI: {globalConfig.cci_dolares}</p>}
                                            </div>
                                        )}

                                        {/* BBVA Accounts */}
                                        {(globalConfig?.cuenta_bbva_soles || globalConfig?.cci_bbva_soles) && (
                                            <div className="mt-2 pt-2 border-t border-dashed border-slate-300">
                                                <p className="font-bold">BBVA Soles (S/.)</p>
                                                {globalConfig.cuenta_bbva_soles && <p>Cta: {globalConfig.cuenta_bbva_soles}</p>}
                                                {globalConfig.cci_bbva_soles && <p>CCI: {globalConfig.cci_bbva_soles}</p>}
                                            </div>
                                        )}

                                        {(globalConfig?.cuenta_bbva_dolares || globalConfig?.cci_bbva_dolares) && (quoteCurrency === 'USD' || mainCurrency === 'USD') && (
                                            <div className="mt-2 pt-2 border-t border-dashed border-slate-300">
                                                <p className="font-bold">BBVA Dólares ($)</p>
                                                {globalConfig.cuenta_bbva_dolares && <p>Cta: {globalConfig.cuenta_bbva_dolares}</p>}
                                                {globalConfig.cci_bbva_dolares && <p>CCI: {globalConfig.cci_bbva_dolares}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Signature */}
                            {config.showSignature && (
                                <div className="flex flex-col items-center mt-auto pt-8">
                                    <div className="w-[180px] h-[80px] mb-1 relative flex items-center justify-center">
                                        {globalConfig?.firma_digital_url && (
                                            <img src={globalConfig.firma_digital_url} alt="Firma" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                        )}
                                    </div>
                                    <div className="w-[200px] border-t border-slate-800 mb-1"></div>
                                    <p className="font-bold text-slate-800 text-xs">{globalConfig?.nombre_representante || globalConfig?.nombre_empresa}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{globalConfig?.cargo_representante || 'Gerencia General'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { 
                        size: A4; 
                        margin: 10mm 10mm 10mm 10mm; 
                    }
                    
                    /* Reset Body/Root */
                    body, html { 
                        background: white; 
                        height: auto !important; 
                        overflow: visible !important; 
                    }
                    
                    /* Hide UI */
                    aside, nav, header.navbar { 
                        display: none !important; 
                    }

                    /* Main Container Reset */
                    .flex.h-screen {
                        display: block !important;
                        height: auto !important;
                        overflow: visible !important;
                    }

                    main { 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        width: 100% !important; 
                        height: auto !important; 
                        overflow: visible !important; 
                        display: block !important;
                        background: white !important;
                    }

                    /* Paper Simulation Reset for Print */
                    main > div { 
                        box-shadow: none !important; 
                        border: none !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        width: 100% !important; 
                        min-height: 0 !important; 
                        height: auto !important;
                    }

                    /* Table Pagination Logic */
                    thead { 
                        display: table-header-group; 
                    }
                    tfoot { 
                        display: table-footer-group; 
                    }
                    tr { 
                        page-break-inside: avoid; 
                        break-inside: avoid; 
                    }
                    
                    /* Content Flow */
                    .break-inside-avoid {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }

                    /* Colors */
                    * { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                    }
                }
            `}</style>
        </div>
    )
}
