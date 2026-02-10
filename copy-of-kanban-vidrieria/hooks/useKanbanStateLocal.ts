import { useState, useEffect, useCallback } from 'react';
import { KanbanData, WipLimits, WorkOrder, ColumnId, ProjectHistory, COLUMN_IDS, ReworkEvent } from '../types';
import { generateMockData } from '../util/mockDataGenerator';
import { COLUMN_TITLES } from './useKanbanState';

const defaultKanbanData: KanbanData = {
    'column-pedidos-confirmados': [],
    'column-en-corte': [],
    'column-en-ensamblaje': [],
    'column-listo-para-instalar': [],
    'column-finalizado': [],
    'allProjectsHistory': []
};

const defaultWipLimits: WipLimits = {
    'column-en-corte': 4,
    'column-en-ensamblaje': 4
};

const defaultCompanyName = 'Empresa de Simulación';
const LOCAL_STORAGE_KEY = 'kanban_simulation_data_v2';

const getTodaysDate = () => new Date().toISOString().split('T')[0];

export const useKanbanStateLocal = (enabled: boolean) => {
    const [state, setState] = useState<KanbanData>(defaultKanbanData);
    const [wipLimits, setWipLimits] = useState<WipLimits>(defaultWipLimits);
    const [companyName, setCompanyName] = useState<string>(defaultCompanyName);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (enabled) {
            setLoading(true);
            try {
                const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    setState(parsedData.kanbanState || defaultKanbanData);
                    setWipLimits(parsedData.wipLimits || defaultWipLimits);
                    setCompanyName(parsedData.companyName || defaultCompanyName);
                } else {
                    // Generate mock data if nothing is saved
                    const mockData = generateMockData();
                    setState(mockData.kanbanState);
                    setWipLimits(mockData.wipLimits);
                    setCompanyName(mockData.companyName);
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockData));
                }
            } catch (error) {
                console.error("Error handling local storage:", error);
                // Fallback to default state
                const mockData = generateMockData();
                setState(mockData.kanbanState);
                setWipLimits(mockData.wipLimits);
                setCompanyName(mockData.companyName);
            }
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [enabled]);

    const updateLocalStorage = useCallback((data: {kanbanState: KanbanData, companyName: string, wipLimits: WipLimits}) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Failed to save to local storage:", error);
        }
    }, []);

    const saveData = useCallback((newState: KanbanData, newCompanyName: string, newWipLimits: WipLimits) => {
        setState(newState);
        setCompanyName(newCompanyName);
        setWipLimits(newWipLimits);
        updateLocalStorage({ kanbanState: newState, companyName: newCompanyName, wipLimits: newWipLimits });
    }, [updateLocalStorage]);


    const moveWorkOrder = useCallback((cardId: string, sourceColumnId: ColumnId, destColumnId: ColumnId) => {
        if (sourceColumnId === destColumnId) return;

        const newState = { ...state };
        const sourceColumn = [...newState[sourceColumnId]];
        const destColumn = [...newState[destColumnId]];
        const cardIndex = sourceColumn.findIndex(card => card.id === cardId);
        if (cardIndex === -1) return;

        const [cardToMove] = sourceColumn.splice(cardIndex, 1);
        if (destColumnId === 'column-finalizado') cardToMove.completionDate = getTodaysDate();
        else if (sourceColumnId === 'column-finalizado') delete cardToMove.completionDate;

        destColumn.push(cardToMove);
        newState[sourceColumnId] = sourceColumn;
        newState[destColumnId] = destColumn;

        const historyIndex = newState.allProjectsHistory.findIndex(p => p.id === cardId);
        if (historyIndex !== -1) {
            const historyEntry = newState.allProjectsHistory[historyIndex];
            const sourceIndex = COLUMN_IDS.indexOf(sourceColumnId);
            const destIndex = COLUMN_IDS.indexOf(destColumnId);
            const today = getTodaysDate();

            if (!historyEntry.movementHistory) historyEntry.movementHistory = [];
            const lastMovement = historyEntry.movementHistory[historyEntry.movementHistory.length - 1];
            if (lastMovement && !lastMovement.exitDate && lastMovement.stage === COLUMN_TITLES[sourceColumnId]) {
                lastMovement.exitDate = today;
            }
            historyEntry.movementHistory.push({ stage: COLUMN_TITLES[destColumnId], entryDate: today });

            if (destIndex < sourceIndex) {
                cardToMove.reworkCount = (cardToMove.reworkCount || 0) + 1;
                const newReworkEvent: ReworkEvent = { from: COLUMN_TITLES[sourceColumnId], to: COLUMN_TITLES[destColumnId], date: today };
                historyEntry.reworkHistory = [...(historyEntry.reworkHistory || []), newReworkEvent];
                historyEntry.reworkCount = cardToMove.reworkCount;
            }
            
            historyEntry.status = destColumnId === 'column-finalizado' ? 'Finalizado' : 'Activo';
            historyEntry.completionDate = cardToMove.completionDate || undefined;
        }

        saveData(newState, companyName, wipLimits);
    }, [state, companyName, wipLimits, saveData]);

    const addWorkOrder = useCallback((workOrderData: Omit<WorkOrder, 'id' | 'creationDate'>) => {
        const allHistory = state.allProjectsHistory;
        const currentYear = new Date().getFullYear();
        const yearPrefix = `OT-${currentYear}-`;
        
        const maxIdForYear = allHistory
            .filter(p => p.id.startsWith(yearPrefix))
            .map(p => parseInt(p.id.replace(yearPrefix, ''), 10))
            .reduce((max, current) => Math.max(max, current), 0);
            
        const newId = `OT-${currentYear}-${String(maxIdForYear + 1).padStart(4, '0')}`;
        const today = getTodaysDate();

        const newWorkOrder: WorkOrder = {
            ...workOrderData, id: newId, creationDate: today, reworkCount: 0,
        };
        const newHistoryEntry: ProjectHistory = {
            ...newWorkOrder, status: 'Activo', deletedFromColumn: null, deletionDate: null, reworkHistory: [],
            movementHistory: [{ stage: COLUMN_TITLES['column-pedidos-confirmados'], entryDate: today }]
        };

        const newState = { ...state };
        newState['column-pedidos-confirmados'] = [...newState['column-pedidos-confirmados'], newWorkOrder];
        newState.allProjectsHistory = [...newState.allProjectsHistory, newHistoryEntry];
        
        saveData(newState, companyName, wipLimits);
    }, [state, companyName, wipLimits, saveData]);

    const updateWorkOrder = useCallback((updatedWorkOrder: Omit<WorkOrder, 'creationDate' | 'completionDate'> & { id: string }) => {
        const newState = { ...state };
        let found = false;
        for (const colId of COLUMN_IDS) {
            const cardIndex = newState[colId].findIndex(c => c.id === updatedWorkOrder.id);
            if (cardIndex !== -1) {
                const originalCard = newState[colId][cardIndex];
                newState[colId][cardIndex] = { ...originalCard, ...updatedWorkOrder };
                found = true; break;
            }
        }
        if (found) {
            const historyIndex = newState.allProjectsHistory.findIndex(p => p.id === updatedWorkOrder.id);
            if (historyIndex !== -1) {
                const originalHistory = newState.allProjectsHistory[historyIndex];
                newState.allProjectsHistory[historyIndex] = { ...originalHistory, ...updatedWorkOrder };
            }
            saveData(newState, companyName, wipLimits);
        }
    }, [state, companyName, wipLimits, saveData]);

    const deleteWorkOrder = useCallback((id: string) => {
        const newState = { ...state };
        let deletedFromColumn: ColumnId | null = null;
        for (const colId of COLUMN_IDS) {
            const cardIndex = newState[colId].findIndex(c => c.id === id);
            if (cardIndex !== -1) {
                newState[colId].splice(cardIndex, 1);
                deletedFromColumn = colId; break;
            }
        }
        if (deletedFromColumn) {
            const historyIndex = newState.allProjectsHistory.findIndex(p => p.id === id);
            if (historyIndex !== -1) {
                const h = newState.allProjectsHistory[historyIndex];
                if (deletedFromColumn === 'column-finalizado') {
                    h.status = 'Archivado';
                } else {
                    h.status = 'Eliminado';
                    delete h.completionDate;
                }
                h.deletedFromColumn = deletedFromColumn;
                h.deletionDate = getTodaysDate();
            }
            saveData(newState, companyName, wipLimits);
        }
    }, [state, companyName, wipLimits, saveData]);

    const updateSettings = useCallback((newCompanyName: string, newWipLimits: WipLimits) => {
        saveData(state, newCompanyName, newWipLimits);
    }, [state, saveData]);

    const resetBoard = useCallback((fullReset: boolean) => {
        if (fullReset) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            const mockData = generateMockData();
            saveData(mockData.kanbanState, mockData.companyName, mockData.wipLimits);
        } else {
            const now = getTodaysDate();
            const updatedHistory = state.allProjectsHistory.map(h => {
                const cardIsActive = COLUMN_IDS.some(colId => colId !== 'column-finalizado' && state[colId].some(c => c.id === h.id));
                if (cardIsActive && h.status === 'Activo') {
                    return { ...h, status: 'Eliminado' as const, deletionDate: now };
                }
                return h;
            });
            const newKanbanState = {
                ...defaultKanbanData,
                'column-finalizado': state['column-finalizado'],
                allProjectsHistory: updatedHistory,
            };
            saveData(newKanbanState, companyName, wipLimits);
        }
    }, [state, companyName, wipLimits, saveData]);

    return { state, companyName, wipLimits, loading, moveWorkOrder, addWorkOrder, updateWorkOrder, deleteWorkOrder, updateSettings, resetBoard };
};
