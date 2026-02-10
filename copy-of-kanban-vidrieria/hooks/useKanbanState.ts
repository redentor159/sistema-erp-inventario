

import { useState, useEffect, useCallback } from 'react';
// FIX: Add missing firebase import to resolve 'Cannot find namespace firebase' error.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { KanbanData, WipLimits, WorkOrder, ColumnId, ProjectHistory, COLUMN_IDS, FirebaseUser, ReworkEvent } from '../types';
import { db } from '../firebase/config';

const defaultKanbanData: KanbanData = {
    'column-pedidos-confirmados': [],
    'column-en-corte': [],
    'column-en-ensamblaje': [],
    'column-listo-para-instalar': [],
    'column-finalizado': [],
    'allProjectsHistory': []
};

const defaultWipLimits: WipLimits = {
    'column-en-corte': 3,
    'column-en-ensamblaje': 2
};

const defaultCompanyName = 'Mi Empresa';

const getTodaysDate = () => new Date().toISOString().split('T')[0];

export const COLUMN_TITLES: { [key in ColumnId]: string } = {
    'column-pedidos-confirmados': 'Pedidos Confirmados',
    'column-en-corte': 'En Corte',
    'column-en-ensamblaje': 'En Ensamblaje',
    'column-listo-para-instalar': 'Listo para Instalar',
    'column-finalizado': 'Finalizado',
};

export const useKanbanState = (user: FirebaseUser | null, enabled: boolean) => {
    const [state, setState] = useState<KanbanData>(defaultKanbanData);
    const [wipLimits, setWipLimits] = useState<WipLimits>(defaultWipLimits);
    const [companyName, setCompanyName] = useState<string>(defaultCompanyName);
    const [loading, setLoading] = useState(true);
    const [docRef, setDocRef] = useState<firebase.firestore.DocumentReference | null>(null);

    useEffect(() => {
        if (user && enabled) {
            setLoading(true);
            const ref = db.collection('kanban_boards').doc('shared_board');
            setDocRef(ref);

            const unsubscribe = ref.onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    if (data) {
                        setState(data.kanbanState || defaultKanbanData);
                        setWipLimits(data.wipLimits || defaultWipLimits);
                        setCompanyName(data.companyName || defaultCompanyName);
                    }
                } else {
                    ref.set({
                        kanbanState: defaultKanbanData,
                        wipLimits: defaultWipLimits,
                        companyName: defaultCompanyName
                    });
                }
                setLoading(false);
            }, error => {
                console.error("Error fetching kanban data:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, [user, enabled]);

    const updateFirestore = useCallback((updates: object) => {
        if (docRef) {
            docRef.update(updates).catch(err => console.error("Error updating Firestore:", err));
        }
    }, [docRef]);

    const moveWorkOrder = useCallback((cardId: string, sourceColumnId: ColumnId, destColumnId: ColumnId) => {
        if (sourceColumnId === destColumnId || !docRef) return;

        // Create a deep copy of the parts of state we are modifying
        // We can't just spread the state object and mutate, we need to treat everything ending up in 'kanbanState' as immutable until we form the new structure

        const newState = { ...state };
        const sourceColumn = [...newState[sourceColumnId]];
        const destColumn = [...newState[destColumnId]];

        const cardIndex = sourceColumn.findIndex(card => card.id === cardId);
        if (cardIndex === -1) return;

        const [cardToMove] = sourceColumn.splice(cardIndex, 1);

        // Create a new card object
        const updatedCard = { ...cardToMove };

        if (destColumnId === 'column-finalizado') {
            updatedCard.completionDate = getTodaysDate();
        } else if (sourceColumnId === 'column-finalizado') {
            delete updatedCard.completionDate;
        }

        destColumn.push(updatedCard);

        // Update columns in new state
        newState[sourceColumnId] = sourceColumn;
        newState[destColumnId] = destColumn;

        // Handle history update
        const historyIndex = newState.allProjectsHistory.findIndex(p => p.id === cardId);
        if (historyIndex !== -1) {
            // Immutable update for history entry
            const historyEntry = { ...newState.allProjectsHistory[historyIndex] };

            const sourceIndex = COLUMN_IDS.indexOf(sourceColumnId);
            const destIndex = COLUMN_IDS.indexOf(destColumnId);

            // Update movement history
            const today = getTodaysDate();
            const movementHistory = [...(historyEntry.movementHistory || [])];

            if (movementHistory.length > 0) {
                const lastMovementIndex = movementHistory.length - 1;
                const lastMovement = { ...movementHistory[lastMovementIndex] };

                if (!lastMovement.exitDate && lastMovement.stage === COLUMN_TITLES[sourceColumnId]) {
                    lastMovement.exitDate = today;
                    movementHistory[lastMovementIndex] = lastMovement;
                }
            }

            movementHistory.push({
                stage: COLUMN_TITLES[destColumnId],
                entryDate: today,
            });
            historyEntry.movementHistory = movementHistory;

            // Handle rework logic
            if (destIndex < sourceIndex) {
                const newReworkCount = (updatedCard.reworkCount || 0) + 1;
                updatedCard.reworkCount = newReworkCount;

                const newReworkEvent: ReworkEvent = {
                    from: COLUMN_TITLES[sourceColumnId], to: COLUMN_TITLES[destColumnId], date: today,
                };
                historyEntry.reworkHistory = [...(historyEntry.reworkHistory || []), newReworkEvent];
                historyEntry.reworkCount = newReworkCount;
            }

            // Update general history status
            historyEntry.status = destColumnId === 'column-finalizado' ? 'Finalizado' : 'Activo';
            if (updatedCard.completionDate) {
                historyEntry.completionDate = updatedCard.completionDate;
            } else {
                delete historyEntry.completionDate;
            }
            historyEntry.deletedFromColumn = null;
            historyEntry.deletionDate = null;

            // Update history array in new state
            const newHistory = [...newState.allProjectsHistory];
            newHistory[historyIndex] = historyEntry;
            newState.allProjectsHistory = newHistory;
        }

        setState(newState);
        updateFirestore({ kanbanState: newState });
    }, [state, docRef, updateFirestore]);

    const addWorkOrder = useCallback((workOrderData: Omit<WorkOrder, 'id' | 'creationDate'>) => {
        const allHistory = state.allProjectsHistory;
        const maxId = Math.max(0, ...allHistory.map((p: ProjectHistory) => parseInt(p.id.split('-')[2] || '0')));
        const newId = `ot-${new Date().getFullYear()}-${String(maxId + 1).padStart(3, '0')}`;

        const today = getTodaysDate();
        const newWorkOrder: WorkOrder = {
            ...workOrderData,
            id: newId,
            creationDate: today,
            reworkCount: 0,
        };

        const newHistoryEntry: ProjectHistory = {
            ...newWorkOrder,
            status: 'Activo',
            deletedFromColumn: null,
            deletionDate: null,
            reworkHistory: [],
            movementHistory: [{
                stage: COLUMN_TITLES['column-pedidos-confirmados'],
                entryDate: today,
            }]
        };

        const newState = { ...state };
        newState['column-pedidos-confirmados'] = [...newState['column-pedidos-confirmados'], newWorkOrder];
        newState.allProjectsHistory = [...newState.allProjectsHistory, newHistoryEntry];

        setState(newState);
        updateFirestore({ kanbanState: newState });
    }, [state, updateFirestore]);

    const updateWorkOrder = useCallback((updatedWorkOrder: Omit<WorkOrder, 'creationDate' | 'completionDate'> & { id: string }) => {
        const newState = { ...state };
        let found = false;

        for (const colId of COLUMN_IDS) {
            const column = newState[colId];
            const cardIndex = column.findIndex(c => c.id === updatedWorkOrder.id);
            if (cardIndex !== -1) {
                const originalCard = column[cardIndex];
                // Create new array for the column
                const newColumn = [...column];
                newColumn[cardIndex] = { ...originalCard, ...updatedWorkOrder };
                newState[colId] = newColumn;
                found = true;
                break;
            }
        }

        if (found) {
            const historyIndex = newState.allProjectsHistory.findIndex(p => p.id === updatedWorkOrder.id);
            if (historyIndex !== -1) {
                const originalHistory = newState.allProjectsHistory[historyIndex];
                const preservedData = {
                    reworkCount: originalHistory.reworkCount,
                    reworkHistory: originalHistory.reworkHistory,
                    movementHistory: originalHistory.movementHistory,
                };

                const newHistory = [...newState.allProjectsHistory];
                newHistory[historyIndex] = { ...originalHistory, ...updatedWorkOrder, ...preservedData };
                newState.allProjectsHistory = newHistory;
            }
            setState(newState);
            updateFirestore({ kanbanState: newState });
        }
    }, [state, updateFirestore]);

    const deleteWorkOrder = useCallback((id: string) => {
        const newState = { ...state };
        let deletedFromColumn: ColumnId | null = null;

        // Find which column it's in
        for (const colId of COLUMN_IDS) {
            if (newState[colId].some(c => c.id === id)) {
                deletedFromColumn = colId;
                break;
            }
        }

        if (deletedFromColumn) {
            // Create new column array without the item
            newState[deletedFromColumn] = newState[deletedFromColumn].filter(c => c.id !== id);

            const historyIndex = newState.allProjectsHistory.findIndex(p => p.id === id);
            if (historyIndex !== -1) {
                const historyEntry = { ...newState.allProjectsHistory[historyIndex] };
                if (deletedFromColumn === 'column-finalizado') {
                    historyEntry.status = 'Archivado';
                } else {
                    historyEntry.status = 'Eliminado';
                    delete historyEntry.completionDate;
                }
                historyEntry.deletedFromColumn = deletedFromColumn;
                historyEntry.deletionDate = getTodaysDate();

                const newHistory = [...newState.allProjectsHistory];
                newHistory[historyIndex] = historyEntry;
                newState.allProjectsHistory = newHistory;
            }
            setState(newState);
            updateFirestore({ kanbanState: newState });
        }
    }, [state, updateFirestore]);

    const updateSettings = useCallback((newCompanyName: string, newWipLimits: WipLimits) => {
        setCompanyName(newCompanyName);
        setWipLimits(newWipLimits);
        updateFirestore({ companyName: newCompanyName, wipLimits: newWipLimits });
    }, [updateFirestore]);

    const resetBoard = useCallback((fullReset: boolean) => {
        if (!docRef) return;
        if (fullReset) {
            setState(defaultKanbanData);
            setWipLimits(defaultWipLimits);
            setCompanyName(defaultCompanyName);
            docRef.set({
                kanbanState: defaultKanbanData,
                wipLimits: defaultWipLimits,
                companyName: defaultCompanyName
            });
        } else {
            const now = getTodaysDate();

            const idsToDeleteMap = new Map<string, ColumnId>();
            COLUMN_IDS.forEach(colId => {
                if (colId !== 'column-finalizado') {
                    state[colId].forEach(card => idsToDeleteMap.set(card.id, colId));
                }
            });

            const newHistory = state.allProjectsHistory.map(item => {
                if (idsToDeleteMap.has(item.id) && item.status === 'Activo') {
                    const newItem = { ...item };
                    newItem.status = 'Eliminado';
                    newItem.deletedFromColumn = idsToDeleteMap.get(item.id)!;
                    newItem.deletionDate = now;
                    delete newItem.completionDate;
                    return newItem;
                }
                return item;
            });

            const newKanbanState = {
                ...defaultKanbanData,
                'column-finalizado': state['column-finalizado'],
                allProjectsHistory: newHistory
            };

            setState(newKanbanState);
            updateFirestore({ kanbanState: newKanbanState });
        }
    }, [docRef, state, companyName]);

    return {
        state,
        companyName,
        wipLimits,
        loading,
        moveWorkOrder,
        addWorkOrder,
        updateWorkOrder,
        deleteWorkOrder,
        updateSettings,
        resetBoard,
    };
};