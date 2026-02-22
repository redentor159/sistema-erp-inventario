"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { catApi } from "@/lib/api/cat"

import { Loader2 } from "lucide-react"

interface MarketCostDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product: any
}

export function MarketCostDialog({ open, onOpenChange, product }: MarketCostDialogProps) {
    const [costo, setCosto] = useState("")
    const queryClient = useQueryClient()

    useEffect(() => {
        if (open && product) {
            // Prefer costo_estandar (Market Cost) if available, otherwise fallback to existing or 0
            setCosto(product.costo_estandar?.toString() || "0")
        }
    }, [open, product])

    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!product) return
            const numCosto = parseFloat(costo)
            if (isNaN(numCosto)) throw new Error("El costo debe ser un número válido")

            await catApi.updatePrecioMercado(product.id_sku, numCosto)
        },
        onSuccess: () => {
            alert("Costo de mercado actualizado correctamente")
            queryClient.invalidateQueries({ queryKey: ["catProductos"] })
            onOpenChange(false)
        },
        onError: (error) => {
            alert("Error al actualizar el costo: " + error.message)
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateMutation.mutate()
    }

    if (!product) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Actualizar Costo de Mercado</DialogTitle>
                    <DialogDescription>
                        Este costo se utilizará como referencia predeterminada en las cotizaciones para el SKU: <strong>{product.id_sku}</strong>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="costo" className="text-right">
                            Costo Unit.
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="costo"
                                type="number"
                                step="0.01"
                                value={costo}
                                onChange={(e) => setCosto(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </form>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
                        {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambio
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
