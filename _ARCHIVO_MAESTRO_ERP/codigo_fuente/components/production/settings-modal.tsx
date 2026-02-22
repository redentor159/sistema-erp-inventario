"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (settings: { company_name?: string, wip_limits?: any }) => void
    onResetCards: () => void
    onResetAll: () => void
    onGenerateDemo: () => void
    currentCompanyName: string
    currentWipLimits: { [key: string]: number }
}

export function SettingsModal({ isOpen, onClose, onSave, onResetCards, onResetAll, onGenerateDemo, currentCompanyName, currentWipLimits }: SettingsModalProps) {
    const [companyName, setCompanyName] = useState(currentCompanyName)
    const [wipLimits, setWipLimits] = useState(currentWipLimits)

    // Sync state when props change
    useEffect(() => {
        setCompanyName(currentCompanyName)
        setWipLimits(currentWipLimits)
    }, [currentCompanyName, currentWipLimits, isOpen])

    const handleSave = () => {
        onSave({
            company_name: companyName,
            wip_limits: wipLimits
        })
        onClose()
    }

    const handleWipChange = (colId: string, val: string) => {
        setWipLimits(prev => ({
            ...prev,
            [colId]: parseInt(val) || 0
        }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Configuración del Tablero</DialogTitle>
                    <DialogDescription>
                        Personaliza los parámetros generales del sistema.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* WIP Limits */}
                    <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                            Límites WIP (Work In Progress)
                            <span className="text-xs text-muted-foreground font-normal">(0 = Sin límite)</span>
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="limit-corte">En Corte</Label>
                                <Input
                                    id="limit-corte"
                                    type="number"
                                    min="0"
                                    value={wipLimits['column-en-corte'] || 0}
                                    onChange={(e) => handleWipChange('column-en-corte', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="limit-ensamblaje">En Ensamblaje</Label>
                                <Input
                                    id="limit-ensamblaje"
                                    type="number"
                                    min="0"
                                    value={wipLimits['column-en-ensamblaje'] || 0}
                                    onChange={(e) => handleWipChange('column-en-ensamblaje', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reset Options */}
                    <div className="space-y-4 border-t pt-4">
                        <h4 className="font-medium text-center">Opciones de Restablecimiento</h4>
                        <p className="text-sm text-center text-muted-foreground pb-2">Selecciona cómo deseas restablecer el tablero:</p>

                        <Button
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                            onClick={() => {
                                if (confirm("¿Estás seguro? Se eliminarán todas las tarjetas activas, pero se conservará el historial.")) {
                                    onResetCards()
                                }
                            }}
                        >
                            Borrar Solo Tarjetas
                        </Button>

                        <Button
                            variant="destructive"
                            className="w-full font-semibold"
                            onClick={() => {
                                if (confirm("¡ATENCIÓN! Esto eliminará TODO (Tarjetas + Historial). ¿Estás completamente seguro?")) {
                                    onResetAll()
                                }
                            }}
                        >
                            Empezar de 0 (Reiniciar Todo)
                        </Button>

                        <div className="pt-2 flex justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs text-muted-foreground"
                                onClick={() => {
                                    if (confirm("¿Generar datos de prueba (5 años)? Esto es útil para ver los gráficos.")) {
                                        onGenerateDemo()
                                    }
                                }}
                            >
                                Simular 5 Años de Datos
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
