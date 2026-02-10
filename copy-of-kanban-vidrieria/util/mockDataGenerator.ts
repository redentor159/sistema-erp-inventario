import { KanbanData, WipLimits, WorkOrder, ProjectHistory, ReworkEvent, ColumnId, COLUMN_IDS, StageMovement } from '../types';
import { crystalTypes } from '../data/crystalTypes';
import { productSeries } from '../data/productSeries';
import { profileBrands } from '../data/profileBrands';
import { profileColors } from '../data/profileColors';
import { COLUMN_TITLES } from '../hooks/useKanbanState';

const CLIENT_NAMES = ["Constructora G&M", "Diseño Interior Moderno", "Edificios del Sur", "Hogar Ideal SAC", "Oficinas Centrales Corp", "Inversiones ABC", "Colegio San Patricio", "Residencial Las Lomas", "Clínica Bienestar", "Centro Comercial El Sol"];
const PROJECT_PREFIXES = { small: "CASA", medium: "EDIF", large: "COMP" };

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randChoice = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const generateWorkOrder = (creationDate: Date, otNumber: number): ProjectHistory => {
    const deliveryDate = addDays(creationDate, randInt(10, 30));
    const isOldOrder = addDays(creationDate, 45) < new Date();
    
    let completionDate: Date | undefined = undefined;
    let status: ProjectHistory['status'] = 'Activo';

    const workOrderBase = {
        id: `OT-${creationDate.getFullYear()}-${String(otNumber).padStart(4, '0')}`,
        client: randChoice(CLIENT_NAMES),
        product: randChoice(productSeries).sku,
        brand: randChoice(profileBrands).sku,
        color: randChoice(profileColors).sku,
        crystal: randChoice(crystalTypes).sku,
        deliveryDate: formatDate(deliveryDate),
        creationDate: formatDate(creationDate),
        width: randInt(50, 250),
        height: randInt(100, 300),
        additionalDescription: `Item ${randInt(1, 10)}`,
        reworkCount: 0,
        reworkHistory: [],
        movementHistory: [],
        deletedFromColumn: null,
        deletionDate: null,
    };

    // Simulate flow and completion
    const movementHistory: StageMovement[] = [];
    let currentDate = new Date(creationDate);
    let currentStageIndex = 0;

    while(currentStageIndex < COLUMN_IDS.length) {
        if(currentDate > new Date()) break; // Stop if we are in the future

        const stageId = COLUMN_IDS[currentStageIndex];
        const entryDate = new Date(currentDate);
        
        let daysInStage;
        switch(stageId) {
            case 'column-pedidos-confirmados': daysInStage = randInt(1, 2); break;
            case 'column-en-corte': daysInStage = randInt(2, 6); break;
            case 'column-en-ensamblaje': daysInStage = randInt(3, 7); break;
            case 'column-listo-para-instalar': daysInStage = randInt(1, 4); break;
            default: daysInStage = randInt(1, 3);
        }
        
        const exitDate = addDays(currentDate, daysInStage);

        movementHistory.push({
            stage: COLUMN_TITLES[stageId],
            entryDate: formatDate(entryDate),
            exitDate: formatDate(exitDate),
        });
        currentDate = exitDate;

        // Simulate Rework
        if (stageId === 'column-en-ensamblaje' && Math.random() < 0.08) { // 8% chance of rework
            workOrderBase.reworkCount = (workOrderBase.reworkCount || 0) + 1;
            const reworkEvent: ReworkEvent = { from: COLUMN_TITLES['column-en-ensamblaje'], to: COLUMN_TITLES['column-en-corte'], date: formatDate(currentDate) };
            workOrderBase.reworkHistory.push(reworkEvent);
            
            // Go back to 'En Corte'
            currentStageIndex = COLUMN_IDS.indexOf('column-en-corte') - 1; // loop will increment it back
        }

        if (stageId === 'column-finalizado') {
            status = 'Finalizado';
            completionDate = entryDate; // Completed on the day it entered the column
            movementHistory[movementHistory.length - 1].exitDate = undefined; // Final stage has no exit
            break;
        }

        // Decide if active card stops here
        if(!isOldOrder && Math.random() < 0.3) break;
        
        currentStageIndex++;
    }
    
    // Clean up last movement for active cards
    if (status === 'Activo' && movementHistory.length > 0) {
        movementHistory[movementHistory.length - 1].exitDate = undefined;
    }

    return {
        ...workOrderBase,
        status,
        completionDate: completionDate ? formatDate(completionDate) : undefined,
        movementHistory,
    };
};

export const generateMockData = (): { kanbanState: KanbanData; wipLimits: WipLimits; companyName: string } => {
    const kanbanState: KanbanData = {
        'column-pedidos-confirmados': [], 'column-en-corte': [], 'column-en-ensamblaje': [],
        'column-listo-para-instalar': [], 'column-finalizado': [], 'allProjectsHistory': [],
    };
    const wipLimits: WipLimits = { 'column-en-corte': 4, 'column-en-ensamblaje': 4 };
    const companyName = 'Empresa de Simulación';

    const today = new Date();
    const otCountersByYear: {[key: number]: number} = {};

    for (let month = 0; month < 60; month++) { // 5 years * 12 months
        const date = new Date(today.getFullYear(), today.getMonth() - month, 1);
        const year = date.getFullYear();
        if (!otCountersByYear[year]) otCountersByYear[year] = 1;

        const projects = [
            ...Array(randInt(3, 5)).fill({ count: randInt(1, 3) }),      // Small projects
            ...Array(randInt(0, 2)).fill({ count: randInt(3, 8) }),     // Medium projects
            ...(month % 5 === 0 ? [{ count: randInt(15, 30) }] : []) // Large projects
        ];

        for (const project of projects) {
            for (let i = 0; i < project.count; i++) {
                const creationDate = new Date(year, date.getMonth(), randInt(1, 28));
                if (creationDate > today) continue;
                kanbanState.allProjectsHistory.push(generateWorkOrder(creationDate, otCountersByYear[year]++));
            }
        }
    }

    // Distribute active projects onto the board
    const activeOrders = kanbanState.allProjectsHistory.filter(p => p.status === 'Activo');
    
    for(const order of activeOrders) {
        const lastMovement = order.movementHistory?.[order.movementHistory.length - 1];
        if (lastMovement && !lastMovement.exitDate) {
            const stageName = lastMovement.stage;
            const columnId = Object.keys(COLUMN_TITLES).find(key => COLUMN_TITLES[key as ColumnId] === stageName) as ColumnId;
            if (columnId && kanbanState[columnId] && columnId !== 'column-finalizado') {
                kanbanState[columnId].push(order as WorkOrder);
            }
        }
    }

    return { kanbanState, wipLimits, companyName };
};