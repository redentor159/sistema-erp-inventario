"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";

export function SecretDangerZone() {
  const [isOpen, setIsOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const { toast } = useToast();

  const [isErpSelected, setIsErpSelected] = useState(false);
  const [isKanbanSelected, setIsKanbanSelected] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const isUnlockValid = (isErpSelected || isKanbanSelected) && confirmPhrase === "CONFIRMO LIMPIEZA";

  const triggerClick = () => {
    const now = Date.now();
    if (now - lastClickTime > 2000) {
      // Reset if more than 2 seconds between clicks
      setClickCount(1);
    } else {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount >= 7) {
        setIsOpen(true);
        setClickCount(0);
      }
    }
    setLastClickTime(now);
  };

  useEffect(() => {
    if (!isOpen) {
      setIsErpSelected(false);
      setIsKanbanSelected(false);
      setConfirmPhrase("");
    }
  }, [isOpen]);

  const handleSecureReset = async () => {
    setIsExecuting(true);
    try {
      if (isErpSelected) {
        const { error: errErp } = await supabase.rpc('fn_reset_erp_transactions');
        if (errErp) throw errErp;
      }
      if (isKanbanSelected) {
        const { error: errKanban } = await supabase.rpc('fn_reset_kanban_data');
        if (errKanban) throw errKanban;
      }

      toast({
        title: "Limpieza Exitosa",
        description: "Las tablas seleccionadas han sido purgadas.",
      });
      setIsOpen(false);

      // Recargar la página para limpiar estados residuales
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      toast({
        title: "Error en la purga",
        description: error.message || "Ocurrió un error inesperado al limpiar la base de datos.",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <>
      <div
        onClick={triggerClick}
        className="fixed bottom-0 right-0 w-16 h-16 bg-transparent z-50 cursor-default"
        title=""
        aria-hidden="true"
      />

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="border-red-600 border-2">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle className="h-6 w-6" />
              <AlertDialogTitle className="text-xl">DANGER ZONE (Nivel Dios)</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-700">
              Estás a punto de ejecutar sentencias TRUNCATE CASCADE. Esta acción es irreversible y eliminará todos los registros de los módulos seleccionados. Tablas maestras y catálogos están protegidos.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-6 my-4 p-4 border border-red-200 bg-red-50/50 rounded-md">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="check-erp"
                checked={isErpSelected}
                onCheckedChange={(c) => setIsErpSelected(c as boolean)}
              />
              <Label htmlFor="check-erp" className="font-medium text-red-900 cursor-pointer leading-tight">
                Limpiar Transacciones del ERP (Kardex, Cotizaciones, Entradas, Salidas)
              </Label>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="check-kanban"
                checked={isKanbanSelected}
                onCheckedChange={(c) => setIsKanbanSelected(c as boolean)}
              />
              <Label htmlFor="check-kanban" className="font-medium text-red-900 cursor-pointer">
                Limpiar Tablero Kanban (Tarjetas y Registro Histórico)
              </Label>
            </div>

            <div className="pt-4 border-t border-red-200">
              <Label htmlFor="confirm-phrase" className="text-sm font-semibold text-red-700">
                Para proceder, escriba exactamente: <span className="select-none font-bold bg-white px-2 py-0.5 rounded ml-1 border border-red-200 shadow-sm">CONFIRMO LIMPIEZA</span>
              </Label>
              <Input
                id="confirm-phrase"
                className="mt-3 border-red-300 focus-visible:ring-red-500 font-mono text-center tracking-widest uppercase"
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value.toUpperCase())}
                placeholder="Escribe la frase aquí"
                autoComplete="off"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isExecuting}>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                handleSecureReset();
              }}
              disabled={!isUnlockValid || isExecuting}
            >
              {isExecuting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
              Ejecutar Purga Definitiva
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
