"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { History, ArrowRight, RotateCcw } from "lucide-react"

interface HistoryModalProps {
    isOpen: boolean
    onClose: () => void
    historyData: {
        id: string
        movementHistory?: any[]
        reworkHistory?: any[]
    } | null
}

export function HistoryModal({ isOpen, onClose, historyData }: HistoryModalProps) {
    if (!historyData) return null

    const movements = historyData.movementHistory || []
    const reworks = historyData.reworkHistory || []

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Historial: <span className="text-primary">{historyData.id}</span>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-6">
                        {/* Movements Section */}
                        <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground border-b pb-1">
                                <ArrowRight className="h-4 w-4" /> Movimientos
                            </h4>
                            {movements.length > 0 ? (
                                <div className="space-y-2">
                                    {movements.map((move: any, idx: number) => (
                                        <div key={idx} className="flex flex-col bg-muted/40 p-3 rounded-lg text-sm border-l-4 border-l-blue-500">
                                            <div className="font-semibold text-foreground flex justify-between">
                                                {move.stage}
                                                {idx === 0 && <Badge variant="outline" className="ml-2 text-[10px]">Actual</Badge>}
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                <span>Entrada: {new Date(move.entryDate).toLocaleDateString()}</span>
                                                {move.exitDate && (
                                                    <span>Salida: {new Date(move.exitDate).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic px-2">Sin movimientos registrados.</p>
                            )}
                        </div>

                        {/* Reworks Section */}
                        <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground border-b pb-1 text-orange-600">
                                <RotateCcw className="h-4 w-4" /> Retrabajos
                            </h4>
                            {reworks.length > 0 ? (
                                <div className="space-y-2">
                                    {reworks.map((rw: any, idx: number) => (
                                        <div key={idx} className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg text-sm border-l-4 border-l-orange-500">
                                            <div className="font-medium text-orange-800 dark:text-orange-200">
                                                {rw.from} <ArrowRight className="inline h-3 w-3" /> {rw.to}
                                            </div>
                                            <div className="text-xs text-orange-600/80 dark:text-orange-400 mt-1">
                                                {new Date(rw.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic px-2">Sin retrabajos registrados.</p>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <div className="flex justify-end pt-2">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
