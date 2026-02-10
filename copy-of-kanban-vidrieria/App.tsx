

import React, { useState, useCallback, useMemo } from 'react';
import { useKanbanState } from './hooks/useKanbanState';
import { useKanbanStateLocal } from './hooks/useKanbanStateLocal';
import { useAuth } from './hooks/useAuth';
import { useKanbanFilters } from './hooks/useKanbanFilters';
import { ColumnId, WorkOrder, COLUMN_IDS, ProjectHistory } from './types';
import Header from './components/Header';
import KanbanColumn from './components/KanbanColumn';
import WorkOrderModal from './components/WorkOrderModal';
import SettingsModal from './components/SettingsModal';
import ExportModal from './components/ExportModal';
import ConfirmationModal from './components/ConfirmationModal';
import ResetOptionsModal from './components/ResetOptionsModal';
import Auth from './components/Auth';
import StatisticsDashboard from './components/StatisticsDashboard';
import { productSeries } from './data/productSeries';
import TutorialModal from './components/TutorialModal';
import HistoryModal from './components/HistoryModal';
import DocumentationModal from './components/DocumentationModal';

const App: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [isSimulationMode, setIsSimulationMode] = useState(false);

    // Use a wrapper object to avoid breaking rules of hooks
    const stateManager = (() => {
        const firebaseState = useKanbanState(user, !isSimulationMode);
        const localState = useKanbanStateLocal(isSimulationMode);

        if (isSimulationMode) {
            return { ...localState, source: 'local' };
        }
        return { ...firebaseState, source: 'firebase' };
    })();

    const {
        state,
        companyName,
        wipLimits,
        loading: dataLoading,
        moveWorkOrder,
        addWorkOrder,
        updateWorkOrder,
        deleteWorkOrder,
        updateSettings,
        resetBoard,
    } = stateManager;

    const [isWorkOrderModalOpen, setWorkOrderModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isExportModalOpen, setExportModalOpen] = useState(false);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [isResetOptionsModalOpen, setResetOptionsModalOpen] = useState(false);
    const [isStatisticsModalOpen, setStatisticsModalOpen] = useState(false);
    const [isTutorialModalOpen, setTutorialModalOpen] = useState(false);
    const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
    const [isDocumentationModalOpen, setDocumentationModalOpen] = useState(false);

    const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
    const [viewingHistoryOf, setViewingHistoryOf] = useState<ProjectHistory | null>(null);
    const [initialWorkOrderData, setInitialWorkOrderData] = useState<Partial<WorkOrder> | null>(null);
    const [confirmationProps, setConfirmationProps] = useState({
        message: '',
        onConfirm: () => { },
        isDanger: false,
    });

    const [dragState, setDragState] = useState<{ cardId: string; sourceColumnId: ColumnId } | null>(null);
    const [copiedWorkOrder, setCopiedWorkOrder] = useState<Partial<WorkOrder> | null>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');




    const filteredState = useKanbanFilters(state, searchTerm);

    const columnDetails = useMemo(() => ({
        'column-pedidos-confirmados': { title: 'Pedidos Confirmados', description: 'Nuevos pedidos listos para producción.', color: 'bg-gray-200 hover:bg-gray-300', headerColor: '#707070', dateColor: '#404040' },
        'column-en-corte': { title: 'En Corte', description: 'Tareas en proceso de corte.', color: 'bg-cyan-100 hover:bg-cyan-200', headerColor: '#48D1CC', dateColor: '#008B8B' },
        'column-en-ensamblaje': { title: 'En Ensamblaje', description: 'Trabajo en proceso de ensamblaje.', color: 'bg-yellow-100 hover:bg-yellow-200', headerColor: '#FFD700', dateColor: '#B8860B' },
        'column-listo-para-instalar': { title: 'Listo para Instalar', description: 'Productos listos para ser instalados.', color: 'bg-orange-100 hover:bg-orange-200', headerColor: '#FF8C00', dateColor: '#CD6600' },
        'column-finalizado': { title: 'Finalizado', description: 'Tareas completadas y entregadas.', color: 'bg-green-100 hover:bg-green-200', headerColor: '#3CB371', dateColor: '#006400' },
    }), []);

    const handleOpenWorkOrderModal = useCallback((workOrder: WorkOrder | null = null, initialData: Partial<WorkOrder> | null = null) => {
        setEditingWorkOrder(workOrder);
        setInitialWorkOrderData(initialData);
        setWorkOrderModalOpen(true);
    }, []);

    const handleWorkOrderSave = (workOrder: Omit<WorkOrder, 'id' | 'creationDate' | 'completionDate'>, id?: string) => {
        if (id) {
            updateWorkOrder({ ...workOrder, id });
        } else {
            addWorkOrder(workOrder);
        }
        setWorkOrderModalOpen(false);
    };

    const handleDeleteWorkOrder = useCallback((id: string) => {
        setConfirmationProps({
            message: '¿Estás seguro de que quieres eliminar esta orden de trabajo?',
            onConfirm: () => {
                deleteWorkOrder(id);
                setConfirmationModalOpen(false);
            },
            isDanger: true,
        });
        setConfirmationModalOpen(true);
    }, [deleteWorkOrder]);

    const handleCopyWorkOrder = useCallback((workOrderToCopy: WorkOrder) => {
        const { id, creationDate, completionDate, ...copyData } = workOrderToCopy;
        setCopiedWorkOrder(copyData);
        setToastMessage('¡Tarjeta copiada!');
        setTimeout(() => {
            setToastMessage('');
        }, 3000);
    }, []);

    const handlePasteWorkOrder = useCallback(() => {
        if (copiedWorkOrder) {
            handleOpenWorkOrderModal(null, copiedWorkOrder);
        }
    }, [copiedWorkOrder, handleOpenWorkOrderModal]);

    const handleViewHistory = useCallback((id: string) => {
        const historyRecord = state.allProjectsHistory.find(p => p.id === id);
        if (historyRecord) {
            setViewingHistoryOf(historyRecord);
            setHistoryModalOpen(true);
        }
    }, [state.allProjectsHistory]);

    const handleResetBoard = (fullReset: boolean) => {
        const message = fullReset
            ? 'ADVERTENCIA: Esto eliminará TODA la información y reiniciará el tablero. ¿Estás absolutamente seguro?'
            : '¿Estás seguro de que deseas borrar solo las tarjetas activas?';

        setResetOptionsModalOpen(false);
        setConfirmationProps({
            message: message,
            onConfirm: () => {
                resetBoard(fullReset);
                setConfirmationModalOpen(false);
            },
            isDanger: true,
        });
        setConfirmationModalOpen(true);
    };

    const handleDragStart = (cardId: string, sourceColumnId: ColumnId) => {
        setDragState({ cardId, sourceColumnId });
    };

    const handleDrop = (destColumnId: ColumnId) => {
        if (dragState) {
            moveWorkOrder(dragState.cardId, dragState.sourceColumnId, destColumnId);
        }
        setDragState(null);
    };

    const sampleCardForTutorial = useMemo(() => {
        for (const colId of COLUMN_IDS) {
            if (state[colId] && state[colId].length > 0) {
                return state[colId][0];
            }
        }
        // Fallback mock card if no cards are on the board
        return {
            id: 'OT-2024-0000', client: 'Cliente de Ejemplo', product: 'Producto de Muestra',
            brand: 'Marca ABC', color: 'Blanco', crystal: 'Simple',
            deliveryDate: new Date().toISOString().split('T')[0], creationDate: new Date().toISOString().split('T')[0],
            reworkCount: 1,
        } as WorkOrder;
    }, [state]);

    if (authLoading || dataLoading) {
        return <div className="loader"></div>;
    }

    if (!user && !isSimulationMode) {
        return <Auth onEnterSimulation={() => setIsSimulationMode(true)} />;
    }

    return (
        <div className="px-4 pt-2 md:px-8 md:pt-4 min-h-screen flex flex-col">
            {toastMessage && (
                <div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out z-50">
                    {toastMessage}
                    <style>{`
                        @keyframes fade-in-out {
                            0% { opacity: 0; transform: translateY(-20px); }
                            10% { opacity: 1; transform: translateY(0); }
                            90% { opacity: 1; transform: translateY(0); }
                            100% { opacity: 0; transform: translateY(-20px); }
                        }
                        .animate-fade-in-out {
                            animation: fade-in-out 3s ease-in-out forwards;
                        }
                    `}</style>
                </div>
            )}
            <div className="w-full max-w-[1600px] mx-auto flex flex-col flex-1">
                <Header
                    companyName={companyName}
                    onExportClick={() => setExportModalOpen(true)}
                    onSettingsClick={() => setSettingsModalOpen(true)}
                    onStatisticsClick={() => setStatisticsModalOpen(true)}
                    isSimulationMode={isSimulationMode}
                    onExitSimulation={() => setIsSimulationMode(false)}
                    onTutorialClick={() => setTutorialModalOpen(true)}
                    onDocumentationClick={() => setDocumentationModalOpen(true)}
                />

                <div className="flex justify-start mb-4">
                    <div id="tutorial-search-bar" className="relative w-full max-w-xs">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <i className="fas fa-search"></i>
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-9 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>
                </div>

                <div className="flex gap-6 justify-start overflow-x-auto pb-4 flex-1">
                    {COLUMN_IDS.map(columnId => (
                        <KanbanColumn
                            key={columnId}
                            columnId={columnId}
                            title={columnDetails[columnId].title}
                            description={columnDetails[columnId].description}
                            wipLimit={wipLimits[columnId as keyof typeof wipLimits]}
                            cards={filteredState[columnId]}
                            onAddNew={columnId === 'column-pedidos-confirmados' ? () => handleOpenWorkOrderModal() : undefined}
                            onPaste={columnId === 'column-pedidos-confirmados' ? handlePasteWorkOrder : undefined}
                            isPasteEnabled={!!copiedWorkOrder}
                            onDrop={handleDrop}
                            onCardEdit={handleOpenWorkOrderModal}
                            onCardDelete={handleDeleteWorkOrder}
                            onCardCopy={handleCopyWorkOrder}
                            draggedItemId={dragState?.cardId || null}
                            onDragStart={handleDragStart}
                            headerColor={columnDetails[columnId].headerColor}
                            dateColor={columnDetails[columnId].dateColor}
                            className={columnDetails[columnId].color}
                        />
                    ))}
                </div>
            </div>

            {isWorkOrderModalOpen && (
                <WorkOrderModal
                    isOpen={isWorkOrderModalOpen}
                    onClose={() => setWorkOrderModalOpen(false)}
                    onSave={handleWorkOrderSave}
                    workOrder={editingWorkOrder}
                    initialData={initialWorkOrderData}
                    onViewHistory={handleViewHistory}
                />
            )}
            {isSettingsModalOpen && (
                <SettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={() => setSettingsModalOpen(false)}
                    onSave={updateSettings}
                    currentCompanyName={companyName}
                    currentWipLimits={wipLimits}
                    onResetRequest={() => {
                        setSettingsModalOpen(false);
                        setResetOptionsModalOpen(true);
                    }}
                />
            )}
            {isExportModalOpen && (
                <ExportModal
                    isOpen={isExportModalOpen}
                    onClose={() => setExportModalOpen(false)}
                    history={state.allProjectsHistory}
                />
            )}
            {isResetOptionsModalOpen && (
                <ResetOptionsModal
                    isOpen={isResetOptionsModalOpen}
                    onClose={() => setResetOptionsModalOpen(false)}
                    onReset={handleResetBoard}
                />
            )}
            {isConfirmationModalOpen && (
                <ConfirmationModal
                    isOpen={isConfirmationModalOpen}
                    onClose={() => setConfirmationModalOpen(false)}
                    message={confirmationProps.message}
                    onConfirm={confirmationProps.onConfirm}
                    isDanger={confirmationProps.isDanger}
                />
            )}
            {isStatisticsModalOpen && (
                <StatisticsDashboard
                    isOpen={isStatisticsModalOpen}
                    onClose={() => setStatisticsModalOpen(false)}
                    history={state.allProjectsHistory}
                />
            )}
            {isTutorialModalOpen && (
                <TutorialModal
                    isOpen={isTutorialModalOpen}
                    onClose={() => setTutorialModalOpen(false)}
                    sampleCard={sampleCardForTutorial}
                    wipLimits={wipLimits}
                    setStatisticsModalOpen={setStatisticsModalOpen}
                    setExportModalOpen={setExportModalOpen}
                    setSettingsModalOpen={setSettingsModalOpen}
                />
            )}
            {isHistoryModalOpen && viewingHistoryOf && (
                <HistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setHistoryModalOpen(false)}
                    history={viewingHistoryOf}
                />
            )}
            {isDocumentationModalOpen && (
                <DocumentationModal
                    isOpen={isDocumentationModalOpen}
                    onClose={() => setDocumentationModalOpen(false)}
                />
            )}
        </div>
    );
};

export default App;