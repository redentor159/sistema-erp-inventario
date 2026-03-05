"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { company_name?: string; wip_limits?: any }) => void;
  currentCompanyName: string;
  currentWipLimits: { [key: string]: number };
}

export function SettingsModal({
  isOpen,
  onClose,
  onSave,
  currentCompanyName,
  currentWipLimits,
}: SettingsModalProps) {
  const [companyName, setCompanyName] = useState(currentCompanyName);
  const [wipLimits, setWipLimits] = useState(currentWipLimits);

  const [prevCompanyName, setPrevCompanyName] = useState(currentCompanyName);
  const [prevWipLimits, setPrevWipLimits] = useState(currentWipLimits);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (currentCompanyName !== prevCompanyName || currentWipLimits !== prevWipLimits || isOpen !== prevIsOpen) {
    setPrevCompanyName(currentCompanyName);
    setPrevWipLimits(currentWipLimits);
    setPrevIsOpen(isOpen);
    setCompanyName(currentCompanyName);
    setWipLimits(currentWipLimits);
  }

  const handleSave = () => {
    onSave({
      company_name: companyName,
      wip_limits: wipLimits,
    });
    onClose();
  };

  const handleWipChange = (colId: string, val: string) => {
    setWipLimits((prev) => ({
      ...prev,
      [colId]: parseInt(val) || 0,
    }));
  };

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
              <span className="text-xs text-muted-foreground font-normal">
                (0 = Sin límite)
              </span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="limit-corte">En Corte</Label>
                <Input
                  id="limit-corte"
                  type="number"
                  min="0"
                  value={wipLimits["column-en-corte"] || 0}
                  onChange={(e) =>
                    handleWipChange("column-en-corte", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit-ensamblaje">En Ensamblaje</Label>
                <Input
                  id="limit-ensamblaje"
                  type="number"
                  min="0"
                  value={wipLimits["column-en-ensamblaje"] || 0}
                  onChange={(e) =>
                    handleWipChange("column-en-ensamblaje", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
