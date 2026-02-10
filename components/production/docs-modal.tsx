"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Static copy from original file (abbreviated where safe, but keeping core help text)
const sections = [
    {
        title: "Parte 1: Introducción",
        content: `
        <p>Esta es una herramienta digital de gestión de producción...</p>
        <p><b>Función:</b> Sincroniza al equipo en tiempo real.</p>
      `
    },
    {
        title: "Parte 2: El Tablero",
        content: `
          <p>El tablero se divide en columnas que representan el flujo:</p>
          <ul class="list-disc pl-4">
            <li><b>Pedidos Confirmados:</b> Entrada de trabajo.</li>
            <li><b>En Corte / En Ensamblaje:</b> Proceso productivo.</li>
            <li><b>Listo / Finalizado:</b> Entrega.</li>
          </ul>
        `
    },
    {
        title: "Parte 3: Tarjetas y Acciones",
        content: `
          <p><b>Mover:</b> Arrastra las tarjetas entre columnas.</p>
          <p><b>Editar:</b> Haz clic en una tarjeta para ver detalles.</p>
          <p><b>Historial:</b> Cada movimiento queda registrado.</p>
        `
    }
]

export function DocsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Documentación & Ayuda</DialogTitle>
                </DialogHeader>
                <Accordion type="single" collapsible>
                    {sections.map((doc, idx) => (
                        <AccordionItem key={idx} value={`item-${idx}`}>
                            <AccordionTrigger>{doc.title}</AccordionTrigger>
                            <AccordionContent>
                                <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: doc.content }} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </DialogContent>
        </Dialog>
    )
}
