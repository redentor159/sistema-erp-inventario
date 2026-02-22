"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KanbanOrder } from "@/lib/api/kanban"
import { productSeries, crystalTypes, profileBrands, profileColors } from "@/lib/kanban-data"

interface WorkOrderDialogProps {
    isOpen: boolean
    onClose: () => void
    onSave: (order: Partial<KanbanOrder>) => void
    onViewHistory?: (id: string) => void
    order: KanbanOrder | null // If null, creating new
    initialData?: Partial<KanbanOrder> | null // For paste/copy functionality
}

export function WorkOrderDialog({ isOpen, onClose, onSave, onViewHistory, order, initialData }: WorkOrderDialogProps) {
    const [formData, setFormData] = useState<Partial<KanbanOrder>>({
        client_name: '',
        product_name: '',
        brand: '',
        color: '',
        crystal_type: '',
        width_mm: 0,
        height_mm: 0,
        delivery_date: '',
        additional_desc: ''
    })

    useEffect(() => {
        if (order) {
            setFormData({ ...order })
        } else if (initialData) {
            // Pre-fill with initialData for paste functionality, but clear ID
            const { id, creation_date, ...rest } = initialData as any
            setFormData({
                ...rest,
                client_name: rest.client_name || '',
                product_name: rest.product_name || '',
                brand: rest.brand || '',
                color: rest.color || '',
                crystal_type: rest.crystal_type || '',
                width_mm: rest.width_mm || 0,
                height_mm: rest.height_mm || 0,
                delivery_date: rest.delivery_date || '',
                additional_desc: rest.additional_desc || ''
            })
        } else {
            setFormData({
                client_name: '',
                product_name: '',
                brand: '',
                color: '',
                crystal_type: '',
                width_mm: 0,
                height_mm: 0,
                delivery_date: '',
                additional_desc: ''
            })
        }
    }, [order, isOpen, initialData])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{order ? `Editar Orden ${order.id}` : 'Nueva Orden de Trabajo'}</DialogTitle>
                    <DialogDescription>
                        Complete la información técnica para la tarjeta de producción.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="client">Cliente</Label>
                            <Input
                                id="client"
                                value={formData.client_name}
                                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                required
                                placeholder="Nombre del cliente"
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="product">Producto / Sistema</Label>
                            <Select
                                value={formData.product_name}
                                onValueChange={(val) => setFormData({ ...formData, product_name: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione Sistema" />
                                </SelectTrigger>
                                <SelectContent>
                                    {productSeries.map(s => (
                                        <SelectItem key={s.sku} value={s.sku}>
                                            {s.sku} - {s.descripcion}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="brand">Marca Perfil</Label>
                            <Select
                                value={formData.brand}
                                onValueChange={(val) => setFormData({ ...formData, brand: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Marca" />
                                </SelectTrigger>
                                <SelectContent>
                                    {profileBrands.map(s => (
                                        <SelectItem key={s.sku} value={s.sku}>{s.descripcion}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color">Color</Label>
                            <Select
                                value={formData.color}
                                onValueChange={(val) => setFormData({ ...formData, color: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Color" />
                                </SelectTrigger>
                                <SelectContent>
                                    {profileColors.map(s => (
                                        <SelectItem key={s.sku} value={s.sku}>{s.descripcion}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="crystal">Cristal</Label>
                            <Select
                                value={formData.crystal_type}
                                onValueChange={(val) => setFormData({ ...formData, crystal_type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tipo de Cristal" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {crystalTypes.map(s => (
                                        <SelectItem key={s.sku} value={s.sku}>
                                            {s.descripcion}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="width">Ancho (mm)</Label>
                            <Input
                                id="width"
                                type="number"
                                value={formData.width_mm || ''}
                                onChange={(e) => setFormData({ ...formData, width_mm: Number(e.target.value) })}
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="height">Alto (mm)</Label>
                            <Input
                                id="height"
                                type="number"
                                value={formData.height_mm || ''}
                                onChange={(e) => setFormData({ ...formData, height_mm: Number(e.target.value) })}
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="delivery">Fecha Entrega</Label>
                            <Input
                                id="delivery"
                                type="date"
                                value={formData.delivery_date}
                                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc">Notas Adicionales</Label>
                        <Textarea
                            id="desc"
                            value={formData.additional_desc}
                            onChange={(e) => setFormData({ ...formData, additional_desc: e.target.value })}
                            placeholder="Detalles especiales..."
                        />
                    </div>

                    <DialogFooter className="flex justify-between sm:justify-between w-full">
                        {order && onViewHistory && (
                            <Button type="button" variant="secondary" onClick={() => onViewHistory(order.id)}>
                                Ver Historial
                            </Button>
                        )}
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button type="submit">Guardar</Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
