"use client"

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProjectHistory } from '@/lib/kanban-adapter';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: ProjectHistory[];
}

export function ExportModal({ isOpen, onClose, history }: ExportModalProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const exportToExcel = (data: ProjectHistory[], startStr?: string, endStr?: string) => {
        let filteredHistory = [...data];

        if (startStr && endStr) {
            const start = new Date(startStr + 'T00:00:00Z');
            const end = new Date(endStr + 'T23:59:59Z');
            filteredHistory = filteredHistory.filter(card => {
                if (!card.creationDate) return false;
                const cardCreationDate = new Date(card.creationDate + 'T00:00:00Z');
                return cardCreationDate >= start && cardCreationDate <= end;
            });
        }

        if (filteredHistory.length === 0) {
            alert('No hay registros de proyectos para exportar en el rango seleccionado.');
            return;
        }

        const allProjectsData = filteredHistory.map(card => ({
            "ID Pedido": card.id,
            "Cliente": card.client,
            "Producto": card.product,
            "Ancho (cm)": card.width,
            "Alto (cm)": card.height,
            "Descripción Adicional": card.additionalDescription,
            "Marca": card.brand,
            "Color": card.color,
            "Cristal": card.crystal,
            "Fecha Creación": card.creationDate,
            "Fecha Entrega Estimada": card.deliveryDate,
            "Fecha Finalización": card.completionDate || 'N/A',
            "Cantidad de Retrabajos": card.reworkCount || 0,
            // "Historial de Retrabajos": (card.reworkHistory || []).map(r => `${r.date}: De '${r.from}' a '${r.to}'`).join('; ') || 'N/A',
            "Estado": card.status,
            "Eliminado Desde Etapa": card.deletedFromColumn || 'N/A',
            "Fecha Eliminación / Archivo": card.deletionDate || 'N/A'
        }));

        const finalizedProjectsData = data
            .filter(card => card.status === 'Finalizado' || card.status === 'Archivado')
            .filter(card => {
                if (startDate && endDate) {
                    if (!card.completionDate) return false;
                    const start = new Date(startDate + 'T00:00:00Z');
                    const end = new Date(endDate + 'T23:59:59Z');
                    const cardCompletionDate = new Date(card.completionDate + 'T00:00:00Z');
                    return cardCompletionDate >= start && cardCompletionDate <= end;
                }
                return true;
            })
            .map(card => ({
                "ID Pedido": card.id,
                "Cliente": card.client,
                "Producto": card.product,
                "Ancho (cm)": card.width,
                "Alto (cm)": card.height,
                "Descripción Adicional": card.additionalDescription,
                "Marca": card.brand,
                "Fecha Creación": card.creationDate,
                "Fecha Entrega Estimada": card.deliveryDate,
                "Fecha Finalización": card.completionDate
            }));

        const wsAll = XLSX.utils.json_to_sheet(allProjectsData);
        const wsFinalized = XLSX.utils.json_to_sheet(finalizedProjectsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsAll, "Todos los Proyectos");
        XLSX.utils.book_append_sheet(wb, wsFinalized, "Proyectos Finalizados");

        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        XLSX.writeFile(wb, `historial_kanban_${timestamp}.xlsx`);
    };

    const handleExport = () => {
        exportToExcel(history, startDate, endDate);
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Exportar Historial</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Desde</Label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Hasta</Label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => exportToExcel(history)}
                    >
                        Exportar Todo (Histórico Completo)
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">O por rango</span>
                        </div>
                    </div>
                    <Button
                        onClick={handleExport}
                        disabled={!startDate || !endDate}
                        variant="secondary"
                        className="w-full"
                    >
                        Exportar Rango Seleccionado
                    </Button>
                    <Button variant="ghost" onClick={onClose} className="mt-2 text-muted-foreground">Cancelar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
