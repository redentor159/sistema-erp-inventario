import { useMemo } from 'react';
import { KanbanData, COLUMN_IDS, WorkOrder } from '../types';
import { productSeries } from '../data/productSeries';

export const useKanbanFilters = (state: KanbanData, searchTerm: string) => {
    return useMemo(() => {
        if (!searchTerm.trim()) {
            return state;
        }

        const lowercasedFilter = searchTerm.toLowerCase();

        // If the search term is purely numeric, we might want a more specific search
        const isNumericSearch = /^\d+$/.test(searchTerm);

        const filteredData: Partial<KanbanData> = {};

        COLUMN_IDS.forEach(columnId => {
            filteredData[columnId] = state[columnId].filter((card: WorkOrder) => {
                const productMatch = productSeries.find(s => s.sku === card.product);
                const productDisplayName = productMatch ? `Serie ${productMatch.sku.split('/')[0].trim()} - ${productMatch.descripcion}` : card.product;

                if (isNumericSearch) {
                    // Search in order number or product series number
                    const orderNumber = card.id.split('-')[2];
                    return orderNumber.includes(lowercasedFilter) ||
                        productDisplayName.toLowerCase().includes(`serie ${lowercasedFilter}`);
                }

                // General text search
                return (
                    card.id.toLowerCase().includes(lowercasedFilter) ||
                    card.client.toLowerCase().includes(lowercasedFilter) ||
                    productDisplayName.toLowerCase().includes(lowercasedFilter) || // Search descriptive name
                    card.brand.toLowerCase().includes(lowercasedFilter) ||
                    card.color.toLowerCase().includes(lowercasedFilter) ||
                    card.crystal.toLowerCase().includes(lowercasedFilter) ||
                    card.additionalDescription?.toLowerCase().includes(lowercasedFilter)
                );
            });
        });

        // Pass through history untouched
        filteredData.allProjectsHistory = state.allProjectsHistory;

        return filteredData as KanbanData;
    }, [state, searchTerm]);
};
