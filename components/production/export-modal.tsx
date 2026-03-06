"use client";

import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProjectHistory } from "@/lib/kanban-adapter";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ProjectHistory[];
}

export function ExportModal({ isOpen, onClose, history }: ExportModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const exportToExcel = async (
    data: ProjectHistory[],
    startStr?: string,
    endStr?: string,
  ) => {
    let filteredHistory = [...data];

    if (startStr && endStr) {
      const start = new Date(startStr + "T00:00:00Z");
      const end = new Date(endStr + "T23:59:59Z");
      filteredHistory = filteredHistory.filter((card) => {
        if (!card.creationDate) return false;
        const cardCreationDate = new Date(card.creationDate + "T00:00:00Z");
        return cardCreationDate >= start && cardCreationDate <= end;
      });
    }

    if (filteredHistory.length === 0) {
      alert("No hay registros de proyectos para exportar en el rango seleccionado.");
      return;
    }

    const finalizedProjectsData = data
      .filter((card) => card.status === "Finalizado" || card.status === "Archivado")
      .filter((card) => {
        if (startDate && endDate) {
          if (!card.completionDate) return false;
          const start = new Date(startDate + "T00:00:00Z");
          const end = new Date(endDate + "T23:59:59Z");
          const cardCompletionDate = new Date(card.completionDate + "T00:00:00Z");
          return cardCompletionDate >= start && cardCompletionDate <= end;
        }
        return true;
      });

    const wb = new ExcelJS.Workbook();
    wb.creator = "ERP Kanban";
    wb.created = new Date();

    const addSheet = (sheetName: string, projects: ProjectHistory[], isFinalized: boolean) => {
      const ws = wb.addWorksheet(sheetName);

      const columns = [
        { header: "ID Pedido", key: "id", width: 20 },
        { header: "Cliente", key: "client", width: 30 },
        { header: "Producto", key: "product", width: 30 },
        { header: "Ancho (cm)", key: "width", width: 15 },
        { header: "Alto (cm)", key: "height", width: 15 },
        { header: "Descripción Adicional", key: "additionalDescription", width: 40 },
        { header: "Marca", key: "brand", width: 15 },
      ];

      if (!isFinalized) {
        columns.push(
          { header: "Color", key: "color", width: 15 },
          { header: "Cristal", key: "crystal", width: 20 }
        );
      }

      columns.push(
        { header: "Fecha Creación", key: "creationDate", width: 20 },
        { header: "Fecha Entrega Estimada", key: "deliveryDate", width: 20 },
        { header: "Fecha Finalización", key: "completionDate", width: 20 }
      );

      if (!isFinalized) {
        columns.push(
          { header: "Cantidad de Retrabajos", key: "reworkCount", width: 25 },
          { header: "Estado", key: "status", width: 15 },
          { header: "Eliminado Desde Etapa", key: "deletedFromColumn", width: 25 },
          { header: "Fecha Eliminación / Archivo", key: "deletionDate", width: 25 }
        );
      }

      ws.columns = columns;

      projects.forEach(card => {
        ws.addRow({
          id: card.id,
          client: card.client,
          product: card.product,
          width: card.width || 0,
          height: card.height || 0,
          additionalDescription: card.additionalDescription || "",
          brand: card.brand || "",
          color: card.color || "",
          crystal: card.crystal || "",
          creationDate: card.creationDate || "",
          deliveryDate: card.deliveryDate || "",
          completionDate: card.completionDate || "N/A",
          reworkCount: card.reworkCount || 0,
          status: card.status || "",
          deletedFromColumn: card.deletedFromColumn || "N/A",
          deletionDate: card.deletionDate || "N/A"
        });
      });

      // Format Numbers
      const qtyFormat = '#,##0.00_ ;[Red]-#,##0.00_ ;"-"';
      ws.getColumn("width").numFmt = qtyFormat;
      ws.getColumn("height").numFmt = qtyFormat;

      // Styling Header
      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FF0F172A" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF8FAFC" }
      };
      headerRow.border = { bottom: { style: "medium", color: { argb: "FFCBD5E1" } } };

      // Freeze Panes & AutoFilter
      ws.views = [{ state: "frozen", ySplit: 1, xSplit: 0 }];
      ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };
    };

    addSheet("Todos los Proyectos", filteredHistory, false);
    addSheet("Proyectos Finalizados", finalizedProjectsData, true);

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    saveAs(blob, `historial_kanban_${timestamp}.xlsx`);
  };

  const handleExport = () => {
    exportToExcel(history, startDate, endDate);
    onClose();
  };

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
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Hasta</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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
              <span className="bg-background px-2 text-muted-foreground">
                O por rango
              </span>
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
          <Button
            variant="ghost"
            onClick={onClose}
            className="mt-2 text-muted-foreground"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
