"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { kanbanApi, KanbanOrder } from "@/lib/api/kanban"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Settings, Download, BarChart2, HelpCircle, Copy, Clipboard } from "lucide-react"
import { KanbanBoard } from "@/components/production/kanban-board"
import { WorkOrderDialog } from "@/components/production/work-order-dialog"
import { ExportModal } from "@/components/production/export-modal"
import { StatsModal } from "@/components/production/stats-modal"
import { DocsModal } from "@/components/production/docs-modal"
import { SettingsModal } from "@/components/production/settings-modal"
import { HistoryModal } from "@/components/production/history-modal"
import { TutorialModal } from "@/components/production/tutorial-modal"
import { useToast } from "@/components/ui/use-toast"
import { adaptHistoryToLegacy, adaptOrderToLegacy } from "@/lib/kanban-adapter"

export default function ProductionPage() {
    const queryClient = useQueryClient()
    const { toast } = useToast()



    // UI State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isStatsOpen, setIsStatsOpen] = useState(false)
    const [isExportOpen, setIsExportOpen] = useState(false)
    const [isDocsOpen, setIsDocsOpen] = useState(false)
    const [isTutorialOpen, setIsTutorialOpen] = useState(false)

    // History State
    const [historyOrder, setHistoryOrder] = useState<KanbanOrder | null>(null)

    const [editingOrder, setEditingOrder] = useState<KanbanOrder | null>(null)
    const [copiedOrder, setCopiedOrder] = useState<Partial<KanbanOrder> | null>(null)

    // Data Fetching
    const { data: configData } = useQuery({
        queryKey: ["kanbanConfig"],
        queryFn: kanbanApi.getConfig
    })

    const wipLimits = configData?.data?.wip_limits || {}

    const { data: orders, isLoading } = useQuery({
        queryKey: ["kanbanBoard"],
        queryFn: kanbanApi.getBoard
    })

    const { data: historyData } = useQuery({
        queryKey: ["kanbanHistory"],
        queryFn: kanbanApi.getHistory
    })

    // Mutations
    const createMutation = useMutation({
        mutationFn: kanbanApi.createOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kanbanBoard"] })
            toast({ title: "Orden Creada", description: "La orden se ha añadido al tablero." })
            setIsDialogOpen(false)
        },
        onError: (err: any) => {
            console.error("Create Order Error:", err)
            console.error("Error Details:", {
                message: err.message,
                details: err.details,
                hint: err.hint,
                code: err.code
            })
            toast({ variant: "destructive", title: "Error al Guardar", description: err.message || "Error desconocido" })
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<KanbanOrder> }) => kanbanApi.updateOrder(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kanbanBoard"] })
            toast({ title: "Orden Actualizada", description: "Cambios guardados correctamente." })
            setIsDialogOpen(false)
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: "Falló la actualización." })
        }
    })

    const moveMutation = useMutation({
        mutationFn: ({ id, col, idx }: { id: string, col: string, idx: number }) => kanbanApi.moveCard(id, col, idx),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kanbanBoard"] })
        }
    })

    // Handlers
    const handleCreateOrder = () => {
        setEditingOrder(null)
        setIsDialogOpen(true)
    }

    const handleEditOrder = (order: KanbanOrder) => {
        setEditingOrder(order)
        setIsDialogOpen(true)
    }

    const handleSaveOrder = (data: Partial<KanbanOrder>) => {
        if (editingOrder) {
            updateMutation.mutate({ id: editingOrder.id, data })
        } else {
            // New Order Logic
            // Generate basic ID
            const randomSuffix = Math.floor(Math.random() * 9000) + 1000
            const newId = `OT-${new Date().getFullYear().toString().slice(-2)}${randomSuffix}`

            const newOrder = {
                ...data,
                id: newId,
                column_id: 'column-pedidos-confirmados',
                position_rank: 0,
                rework_count: 0
            } as any

            createMutation.mutate(newOrder)
        }
    }

    const handleMoveOrder = (id: string, destColumn: string, newIndex: number) => {
        moveMutation.mutate({ id, col: destColumn, idx: newIndex })
    }

    // Prepare History for Modals
    // We map the raw DB history to legacy structure expected by exported modals
    const legacyHistory = (historyData?.data || []).map(h => adaptHistoryToLegacy(h as any))

    // Copy Paste Logic
    // In a real app we might use clipboard, but internal state is safer for "Copy Card" feature within app
    const handleCopyOrder = (order: KanbanOrder) => {
        // Strip ID and tracking
        const { id, column_id, ...rest } = order
        setCopiedOrder(rest)
        toast({ title: "Copiado", description: "Puedes pegar esta orden como una nueva." })
    }

    const handlePasteOrder = () => {
        if (!copiedOrder) return
        setEditingOrder(null) // New mode
        // Pre-fill dialog with copied data
        // We'll pass it as 'initialData' logic if we want, or just set it:
        // Actually WorkOrderDialog needs a way to receive 'initialData' without an ID
        // For now, let's just trigger create with pre-filled state if we modified logic, 
        // OR we can just open dialog and let user fill. 
        // Better: Open Dialog and trick it.
        // Let's modify WorkOrderDialog props slightly in future to support this better.
        // Current workaround: We will just open a new order, but we can't easily injection unless we change the component.
        // Let's implement "Clone" directly?

        setIsDialogOpen(true)
        // Note: The Dialog currently resets on "null" order. We would need to pass `defaultValues`.
        // I will fix WorkOrderDialog to accept `defaultValues` separately from `order`.
    }

    // Search
    const [searchTerm, setSearchTerm] = useState("")

    // Filter Logic
    const filteredOrders = (orders || []).filter(order => {
        if (!searchTerm) return true
        const lowerTerm = searchTerm.toLowerCase()
        return (
            order.id.toLowerCase().includes(lowerTerm) ||
            order.client_name.toLowerCase().includes(lowerTerm) ||
            order.product_name.toLowerCase().includes(lowerTerm) ||
            order.brand?.toLowerCase().includes(lowerTerm) ||
            order.additional_desc?.toLowerCase().includes(lowerTerm)
        )
    })

    // Archive Logic
    const archiveAllMutation = useMutation({
        mutationFn: async () => {
            // We need an API endpoint to archive all finished.
            // For now we can iterate or add a specific RPC. 
            // Let's iterate for safety/simplicity first or add RPC later.
            // Actually, let's assume kanbanApi.archiveAllFinished() exists or we add it safely.
            // To avoid errors, I'll update kanbanApi first. Wait.
            // Let's just create the stub handler for now and update API next.
            await kanbanApi.archiveAllFinished()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kanbanBoard"] })
            queryClient.invalidateQueries({ queryKey: ["kanbanHistory"] })
            toast({ title: "Tablero Limpio", description: "Las órdenes finalizadas han sido archivadas." })
        }
    })

    const handleArchiveAll = () => {
        if (confirm("¿Estás seguro de archivar TODAS las órdenes finalizadas? Se moverán al historial.")) {
            archiveAllMutation.mutate()
        }
    }

    const handleDeleteOrder = (id: string) => {
        if (confirm("¿Eliminar esta orden permanentemente?")) {
            // Add delete mutation logic
            // Assuming we use archiveOrder with specific status
            // We need a deleteMutation.
            // Let's create it quickly.
            // moveMutation uses kanbanApi.moveCard
            // archive uses kanbanApi.archiveOrder
            const deleteMut = async () => {
                await kanbanApi.archiveOrder(id, 'Eliminado', 'Manual')
                queryClient.invalidateQueries({ queryKey: ["kanbanBoard"] })
                toast({ title: "Orden Eliminada" })
            }
            deleteMut()
        }
    }

    const { mutate: updateConfig } = useMutation({
        mutationFn: kanbanApi.updateConfig,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kanbanConfig"] })
            toast({ title: "Configuración Actualizada" })
        }
    })

    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    return (
        <div className="flex flex-col min-h-screen space-y-4 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Tablero de Producción</h2>
                    <p className="text-muted-foreground flex items-center gap-2">
                        Gestión Visual
                        <Button variant="ghost" size="sm" onClick={() => setIsDocsOpen(true)} className="h-8 w-8 p-0 rounded-full hover:bg-slate-200">
                            <HelpCircle className="h-5 w-5 text-blue-600" />
                            <span className="sr-only">Ayuda</span>
                        </Button>
                    </p>
                </div>

                {/* Search Bar */}
                <div id="tutorial-search-bar" className="flex-1 max-w-sm mx-4">
                    <Input
                        placeholder="Buscar orden, cliente, producto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white dark:bg-slate-900"
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button id="tutorial-settings-button" variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Configuración
                    </Button>

                    <Button id="tutorial-stats-button" variant="outline" size="sm" onClick={() => setIsStatsOpen(true)}>
                        <BarChart2 className="mr-2 h-4 w-4" />
                        Estadísticas
                    </Button>

                    <Button id="tutorial-export-button" variant="outline" size="sm" onClick={() => setIsExportOpen(true)}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>

                    <Button variant="outline" size="sm" onClick={handleArchiveAll} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                        <Download className="mr-2 h-4 w-4" />
                        Archivar Finalizados
                    </Button>

                    {copiedOrder && (
                        <Button id="btn-paste-order" variant="secondary" size="sm" onClick={handlePasteOrder} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            <Clipboard className="mr-2 h-4 w-4" />
                            Pegar
                        </Button>
                    )}

                    <Button id="btn-new-order" size="sm" onClick={handleCreateOrder}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nueva Orden
                    </Button>

                    <Button id="tutorial-new-order-btn" variant="ghost" size="sm" onClick={() => setIsTutorialOpen(true)} className="text-indigo-600">
                        <HelpCircle className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Board Area */}
            <div className="flex-1 overflow-x-auto bg-slate-100 dark:bg-slate-950/50 rounded-lg p-4">
                {isLoading ? (
                    <div className="text-center p-10 animate-pulse">Cargando tablero...</div>
                ) : (
                    <KanbanBoard
                        initialOrders={filteredOrders}
                        onOrderMove={handleMoveOrder}
                        onOrderClick={handleEditOrder}
                        onCopyOrder={handleCopyOrder}
                        onDeleteOrder={handleDeleteOrder}
                        wipLimits={wipLimits}
                    />
                )}
            </div>

            {/* Modals */}
            <WorkOrderDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveOrder}
                order={editingOrder}
                onViewHistory={(id) => {
                    const order = orders?.find(o => o.id === id) || null
                    setHistoryOrder(order)
                }}
                initialData={copiedOrder}
            />

            <StatsModal
                isOpen={isStatsOpen}
                onClose={() => setIsStatsOpen(false)}
                history={legacyHistory}
            />

            <ExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                history={legacyHistory}
            />

            <DocsModal
                isOpen={isDocsOpen}
                onClose={() => setIsDocsOpen(false)}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentCompanyName=""
                currentWipLimits={wipLimits}
                onSave={async (settings) => {
                    updateConfig({ wip_limits: settings.wip_limits })
                    setIsSettingsOpen(false)
                }}
                onResetCards={async () => {
                    await kanbanApi.deleteAllCards()
                    queryClient.invalidateQueries({ queryKey: ["kanbanBoard"] })
                    toast({ title: "Tarjetas Eliminadas", description: "El tablero ha sido limpiado." })
                    setIsSettingsOpen(false)
                }}
                onResetAll={async () => {
                    await kanbanApi.resetEverything()
                    queryClient.invalidateQueries({ queryKey: ["kanbanBoard"] })
                    queryClient.invalidateQueries({ queryKey: ["kanbanHistory"] })
                    toast({ title: "Sistema Reiniciado", description: "Se ha eliminado todo el historial y tarjetas." })
                    setIsSettingsOpen(false)
                }}
                onGenerateDemo={async () => {
                    try {
                        toast({ title: "Generando datos...", description: "Esto puede tardar unos segundos." })
                        await kanbanApi.generateDemoData()
                        queryClient.invalidateQueries({ queryKey: ["kanbanHistory"] })
                        toast({ title: "Datos Generados", description: "Se han creado 5 años de historial." })
                        setIsSettingsOpen(false)
                    } catch (error) {
                        console.error("Error generating demo data:", error)
                        toast({
                            variant: "destructive",
                            title: "Error Generando Datos",
                            description: "Revisa la consola para más detalles."
                        })
                    }
                }}
            />

            <HistoryModal
                isOpen={!!historyOrder}
                onClose={() => setHistoryOrder(null)}
                historyData={historyOrder ? adaptOrderToLegacy(historyOrder) : null}
            />

            <TutorialModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
                sampleCard={orders?.[0]}
                setStatisticsModalOpen={setIsStatsOpen}
                setExportModalOpen={setIsExportOpen}
                setSettingsModalOpen={setIsSettingsOpen}
            />
        </div>
    )
}
