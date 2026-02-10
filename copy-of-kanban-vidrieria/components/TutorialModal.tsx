import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WipLimits, WorkOrder } from '../types';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
    sampleCard: WorkOrder;
    wipLimits: WipLimits;
    setStatisticsModalOpen: (isOpen: boolean) => void;
    setExportModalOpen: (isOpen: boolean) => void;
    setSettingsModalOpen: (isOpen: boolean) => void;
}

// Helper function to create a cutout path for the spotlight effect
const createClipPath = (rect: DOMRect | null, padding = 10): string => {
    if (!rect) return 'none';
    const top = rect.top - padding;
    const left = rect.left - padding;
    const right = rect.right + padding;
    const bottom = rect.bottom + padding;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // An SVG path that covers everything and then cuts out the rectangle area
    return `M0 0 H${width} V${height} H0 Z M${left} ${top} V${bottom} H${right} V${top} Z`;
};

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, sampleCard, wipLimits, setStatisticsModalOpen, setExportModalOpen, setSettingsModalOpen }) => {
    const [step, setStep] = useState(0);
    const [highlightBox, setHighlightBox] = useState<DOMRect | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [modalStyle, setModalStyle] = useState<React.CSSProperties>({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        visibility: 'hidden',
    });


    const steps = useMemo(() => [
        // --- Basic Operations ---
        {
            targetId: null,
            title: "¡Bienvenido al Tutorial Interactivo!",
            content: <p>¡Hola! Esta guía te mostrará cómo usar el tablero Kanban. Usa los botones 'Siguiente' y 'Anterior' para navegar. ¡Empecemos!</p>
        },
        {
            targetId: 'tutorial-search-bar',
            title: "Búsqueda Inteligente",
            content: <p>Usa esta barra para encontrar cualquier tarjeta al instante. Puedes buscar por número de orden, nombre del cliente, producto, o cualquier otro detalle.</p>
        },
        {
            targetId: 'column-en-corte',
            title: "Columnas y Límites WIP",
            content: <p>El tablero está dividido en columnas que representan tu flujo de trabajo. Fíjate en el contador en el título. Por ejemplo, el límite para 'En Corte' es <strong>{wipLimits['column-en-corte']}</strong>. Si se supera, la columna se pondrá <strong>roja</strong> para señalar un posible cuello de botella.</p>
        },
        {
            targetId: sampleCard.id,
            title: "Anatomía de una Tarjeta",
            content: <p>Cada tarjeta es una orden de trabajo. Contiene toda la información clave: ID de orden (<strong>'{sampleCard.id}'</strong>), cliente (<strong>'{sampleCard.client}'</strong>), y la fecha de entrega, que cambia de color según la urgencia.</p>
        },
        {
            targetId: sampleCard.id,
            title: "Acciones Rápidas",
            content: <p>Al pasar el ratón sobre una tarjeta, aparecen iconos en la esquina superior derecha. Te permiten <strong>copiar, editar o eliminar</strong> la orden de trabajo de forma rápida y sencilla.</p>
        },
        {
            targetId: 'add-new-column-pedidos-confirmados',
            title: "Crear Nuevas Órdenes",
            content: <p>Para empezar un nuevo trabajo, simplemente haz clic en este botón en la primera columna. Se abrirá un formulario para que llenes los detalles.</p>
        },
        {
            targetId: 'column-pedidos-confirmados',
            title: "Mover las Tarjetas",
            content: <p>La acción más importante es mover las tarjetas. Simplemente haz clic, <strong>arrastra y suelta</strong> una tarjeta en la siguiente columna para actualizar su estado. ¡Así es como avanza la producción!</p>
        },
        {
            targetId: 'column-finalizado',
            title: "Archivar vs. Eliminar",
            content: <p>¡Un punto clave! Si eliminas una tarjeta desde esta columna ('Finalizado'), se considera <strong>'Archivada'</strong> (un éxito). Si la eliminas desde cualquier otra columna, se marca como <strong>'Eliminada'</strong> (cancelada). Esta diferencia es crucial para que tus estadísticas sean precisas.</p>
        },
        {
            targetId: sampleCard.id,
            title: "Historial Detallado por Tarjeta",
            content: <p>Dentro de la ventana de <strong>edición</strong> de cada tarjeta, encontrarás un botón para <strong>'Ver Historial'</strong>. Esto te muestra cada movimiento y retrabajo que ha tenido esa orden específica, dándote una trazabilidad completa de su ciclo de vida.</p>
        },
        // --- Statistics Module ---
        {
            targetId: 'tutorial-stats-button',
            title: "Explorando las Estadísticas",
            content: <p>Ahora, vamos a sumergirnos en las herramientas avanzadas. Haz clic en 'Siguiente' para abrir el panel de estadísticas y analizar el rendimiento de tu producción.</p>
        },
        {
            targetId: 'stats-modal-filters',
            title: "Filtros de Tiempo",
            content: <p>Aquí puedes cambiar el período de tiempo que quieres analizar. Compara el rendimiento de esta semana, este mes o de todo el historial para identificar tendencias.</p>,
            modal: 'statistics'
        },
        {
            targetId: 'stats-modal-kpis',
            title: "Indicadores Clave (KPIs)",
            content: <p>Estos son los números más importantes: Proyectos finalizados, tiempo promedio de entrega y tu tasa de retrabajo. Un objetivo clave es mantener esta última lo más baja posible.</p>,
            modal: 'statistics'
        },
        {
            targetId: 'stats-modal-rework',
            title: "Análisis de Retrabajos",
            content: <p>Este módulo es crucial. Te muestra exactamente entre qué etapas del proceso están ocurriendo la mayoría de los retrabajos. Usa esta información para identificar y corregir la causa raíz de los errores.</p>,
            modal: 'statistics'
        },
        {
            targetId: 'stats-modal-scatter',
            title: "Gráfico de Dispersión",
            content: <p>Esta es la herramienta más potente para la predicción. Cada punto es un proyecto terminado. La línea 'p85' te dice: 'El 85% de nuestros trabajos se terminan en X días o menos'. ¡Usa este número para dar estimaciones fiables a tus clientes!</p>,
            modal: 'statistics'
        },
        // --- Export Module ---
        {
            targetId: 'tutorial-export-button',
            title: "Exportando tus Datos",
            content: <p>A continuación, veremos cómo sacar tus datos del sistema para crear informes o copias de seguridad. Haz clic en 'Siguiente' para abrir el módulo de exportación.</p>
        },
        {
            targetId: 'export-modal-range',
            title: "Exportar por Rango",
            content: <p>Si solo necesitas los datos de un período específico, como el último mes o trimestre, puedes seleccionar las fechas de inicio y fin aquí.</p>,
            modal: 'export'
        },
        {
            targetId: 'export-modal-buttons',
            title: "Opciones de Exportación",
            content: <p>Usa 'Exportar Rango' para los datos filtrados, o 'Exportar Todo' para descargar un historial completo de cada orden de trabajo que ha existido en el tablero.</p>,
            modal: 'export'
        },
        // --- Settings Module ---
        {
            targetId: 'tutorial-settings-button',
            title: "Configurando tu Tablero",
            content: <p>Finalmente, personalicemos el tablero. Haz clic en 'Siguiente' para abrir el panel de configuración.</p>
        },
        {
            targetId: 'settings-modal-company',
            title: "Nombre de la Empresa",
            content: <p>Puedes cambiar el nombre que aparece en el encabezado principal del tablero para personalizarlo para tu equipo.</p>,
            modal: 'settings'
        },
        {
            targetId: 'settings-modal-wip',
            title: "Límites de Trabajo en Progreso (WIP)",
            content: <p>Esta es una de las herramientas más importantes de Kanban. Establece un número máximo de tareas por columna para evitar la sobrecarga y mejorar el flujo. ¡Es la clave para detectar cuellos de botella!</p>,
            modal: 'settings'
        },
        {
            targetId: 'settings-modal-reset',
            title: "Restablecer Tablero",
            content: <p>Aquí puedes limpiar el tablero. Tienes la opción de borrar solo las tarjetas activas o hacer un reinicio completo. ¡Usa la segunda opción con mucho cuidado!</p>,
            modal: 'settings'
        },
        // --- Final Steps ---
        {
            targetId: 'tutorial-documentation-button',
            title: "Ayuda y Documentación",
            content: <p>Si en algún momento necesitas repasar cómo funciona la aplicación o qué significa cada estadística, haz clic aquí. Se abrirá una guía completa con toda la información.</p>
        },
        {
            targetId: 'tutorial-exit-button',
            title: "Salir de la Sesión",
            content: <p>Usa este botón para cerrar tu sesión de forma segura o para salir del modo de simulación y volver a la pantalla de inicio.</p>
        },
        {
            targetId: null,
            title: "¡Estás Listo!",
            content: <p>¡Felicidades! Has completado el recorrido. Ahora tienes los conocimientos para gestionar tu flujo de producción de manera eficiente. ¡A trabajar!</p>
        }
    ], [sampleCard, wipLimits]);
    
    useEffect(() => {
        if (isOpen) {
            const currentStep = steps[step];
            
            // Manage modal states based on the current step
            const shouldOpenStats = currentStep.modal === 'statistics';
            const shouldOpenExport = currentStep.modal === 'export';
            const shouldOpenSettings = currentStep.modal === 'settings';

            setStatisticsModalOpen(shouldOpenStats);
            setExportModalOpen(shouldOpenExport);
            setSettingsModalOpen(shouldOpenSettings);
            
            // Hide modal before recalculating position to measure it correctly
            setModalStyle(prev => ({ ...prev, visibility: 'hidden' }));

            // Use a delay to allow modals to open/close and elements to become visible
            const timer = setTimeout(() => {
                const element = currentStep.targetId ? document.getElementById(currentStep.targetId) : null;
                
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }

                 // Another delay to let scrolling finish
                const positionTimer = setTimeout(() => {
                    const targetRect = element?.getBoundingClientRect() ?? null;
                    const modalEl = modalRef.current;
                    
                    setHighlightBox(targetRect);

                    if (targetRect && modalEl) {
                        const modalRect = modalEl.getBoundingClientRect();
                        const margin = 15;
                        const viewportPadding = 10;

                        const positions = {
                            right: {
                                top: targetRect.top + targetRect.height / 2 - modalRect.height / 2,
                                left: targetRect.right + margin,
                            },
                            left: {
                                top: targetRect.top + targetRect.height / 2 - modalRect.height / 2,
                                left: targetRect.left - modalRect.width - margin,
                            },
                            bottom: {
                                top: targetRect.bottom + margin,
                                left: targetRect.left + targetRect.width / 2 - modalRect.width / 2,
                            },
                            top: {
                                top: targetRect.top - modalRect.height - margin,
                                left: targetRect.left + targetRect.width / 2 - modalRect.width / 2,
                            },
                        };

                        let finalPos: { top: number; left: number } | null = null;
                        const placementOrder: ('right' | 'left' | 'bottom' | 'top')[] = ['right', 'left', 'bottom', 'top'];

                        for (const placement of placementOrder) {
                            const pos = positions[placement];
                            if (
                                pos.top >= viewportPadding &&
                                pos.left >= viewportPadding &&
                                pos.top + modalRect.height <= window.innerHeight - viewportPadding &&
                                pos.left + modalRect.width <= window.innerWidth - viewportPadding
                            ) {
                                finalPos = pos;
                                break;
                            }
                        }
                        
                        // If no ideal position is found, default to the first choice and clamp it.
                        if (!finalPos) {
                            finalPos = positions.right;
                        }
                        
                        // Clamp values to ensure it's always in view
                        finalPos.left = Math.max(
                            viewportPadding,
                            Math.min(finalPos.left, window.innerWidth - modalRect.width - viewportPadding)
                        );
                        finalPos.top = Math.max(
                            viewportPadding,
                            Math.min(finalPos.top, window.innerHeight - modalRect.height - viewportPadding)
                        );
                        
                        setModalStyle({
                            position: 'fixed',
                            top: `${finalPos.top}px`,
                            left: `${finalPos.left}px`,
                            transform: 'none',
                            visibility: 'visible',
                        });

                    } else {
                        // Center on screen if no target
                        setModalStyle({
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            visibility: 'visible',
                        });
                    }
                }, 400); // Wait for scroll

                return () => clearTimeout(positionTimer);
            }, 350);

            return () => clearTimeout(timer);
        }
    }, [step, isOpen, steps, setStatisticsModalOpen, setExportModalOpen, setSettingsModalOpen]);
    
    const handleClose = () => {
        setStatisticsModalOpen(false);
        setExportModalOpen(false);
        setSettingsModalOpen(false);
        onClose();
    };

    if (!isOpen) return null;

    const currentStepData = steps[step];
    
    return (
        <>
            <div
                className="fixed inset-0 z-[1000] transition-all duration-500 ease-in-out"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    clipPath: `path("${createClipPath(highlightBox)}")`,
                }}
            />
            <div
                ref={modalRef}
                className="fixed z-[1001] bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all duration-200 ease-in-out flex flex-col"
                style={{...modalStyle, maxHeight: 'calc(100vh - 30px)'}}
            >
                <div className="flex-shrink-0">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-full">
                            <p className="text-sm font-bold text-indigo-600">PASO {step + 1} de {steps.length}</p>
                            <h3 className="text-xl font-bold text-gray-800 mt-1">{currentStepData.title}</h3>
                        </div>
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                    </div>
                </div>

                <div className="text-gray-600 mb-6 space-y-2 text-sm overflow-y-auto flex-grow">
                    {currentStepData.content}
                </div>

                <div className="flex justify-between items-center flex-shrink-0 mt-4">
                    <button
                        onClick={() => setStep(s => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Anterior
                    </button>
                    {step < steps.length - 1 ? (
                         <button
                            onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                            className="py-2 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            onClick={handleClose}
                            className="py-2 px-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                        >
                            Finalizar
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default TutorialModal;