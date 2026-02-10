import React, { useState } from 'react';
import { WorkOrder, ColumnId } from '../types';
import WorkOrderCard from './WorkOrderCard';

interface KanbanColumnProps {
    columnId: ColumnId;
    title: string;
    description: string;
    cards: WorkOrder[];
    wipLimit?: number;
    className?: string;
    headerColor: string;
    dateColor: string;
    onAddNew?: () => void;
    onPaste?: () => void;
    isPasteEnabled?: boolean;
    onDrop: (destColumnId: ColumnId) => void;
    onCardEdit: (workOrder: WorkOrder) => void;
    onCardCopy: (workOrder: WorkOrder) => void;
    onCardDelete: (id: string) => void;
    draggedItemId: string | null;
    onDragStart: (cardId: string, sourceColumnId: ColumnId) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    columnId, title, description, cards, wipLimit, className, headerColor, dateColor, onAddNew, onPaste, isPasteEnabled, onDrop, onCardEdit, onCardCopy, onCardDelete, draggedItemId, onDragStart
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const isWipExceeded = wipLimit !== undefined && cards.length > wipLimit;

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        onDrop(columnId);
        setIsDragOver(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    
    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const wipExceededClasses = isWipExceeded ? 'border-2 border-red-500 bg-red-100' : '';
    const dragOverClasses = isDragOver ? 'border-2 border-dashed border-indigo-500 bg-indigo-100' : '';

    return (
        <div
            id={columnId}
            className={`kanban-column rounded-xl shadow-lg flex flex-col min-w-[300px] w-full lg:w-[calc(20%-1.2rem)] flex-shrink-0 transition-colors duration-300 ${className} ${wipExceededClasses} ${dragOverClasses}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            {/* Unified content container for a cohesive look */}
            <div className="p-4 flex flex-col gap-4">
                {/* Header Content (as a flex item) */}
                <div className="flex-shrink-0">
                    <div className="text-center">
                        <h2 className={`text-xl font-bold mb-1 ${isWipExceeded ? 'text-red-800' : 'text-gray-700'}`}>
                            {title}
                            {wipLimit !== undefined && (
                                <span className="text-sm text-gray-500 font-normal ml-2">({cards.length}/{wipLimit})</span>
                            )}
                        </h2>
                        <p className="text-sm text-gray-500">{description}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-center mt-4">
                        {onAddNew && (
                            <button
                                id={`add-new-${columnId}`}
                                onClick={onAddNew}
                                className="bg-indigo-500 text-white hover:bg-indigo-600 font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out w-full max-w-[220px] self-center"
                            >
                                + Nueva Orden de Trabajo
                            </button>
                        )}
                        {onPaste && (
                            <button
                                onClick={onPaste}
                                disabled={!isPasteEnabled}
                                className="bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-200 ease-in-out w-full max-w-[220px] self-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-paste"></i> Pegar Tarjeta
                            </button>
                        )}
                    </div>
                </div>

                {/* Card List Items (as flex items) */}
                {cards.map(card => (
                    <WorkOrderCard
                        key={card.id}
                        card={card}
                        isDragging={draggedItemId === card.id}
                        onDragStart={() => onDragStart(card.id, columnId)}
                        onEdit={onCardEdit}
                        onCopy={onCardCopy}
                        onDelete={onCardDelete}
                        headerColor={headerColor}
                        dateColor={dateColor}
                    />
                ))}
            </div>
        </div>
    );
};

export default KanbanColumn;