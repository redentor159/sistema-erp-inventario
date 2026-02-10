
import React, { useMemo } from 'react';
import { WorkOrder } from '../types';
import { productSeries } from '../data/productSeries';

interface WorkOrderCardProps {
    card: WorkOrder;
    isDragging: boolean;
    headerColor: string;
    dateColor: string;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onEdit: (card: WorkOrder) => void;
    onCopy: (card: WorkOrder) => void;
    onDelete: (id: string) => void;
}

const getDeliveryDateStatus = (deliveryDate: string): { className: string, style: React.CSSProperties } => {
    const today = new Date();
    // Get today's date at midnight UTC for a timezone-agnostic comparison
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    
    // deliveryDate is in "YYYY-MM-DD" format. Appending 'T00:00:00Z' correctly parses it as UTC midnight.
    const delivery = new Date(deliveryDate + 'T00:00:00Z');

    const diffTime = delivery.getTime() - todayUTC.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { className: 'text-red-600 font-bold', style: { color: '#EF4444' } }; // Overdue
    }
    if (diffDays <= 3) {
        return { className: 'text-amber-600 font-bold', style: { color: '#F59E0B' } }; // Upcoming
    }
    return { className: 'font-bold', style: {} }; // Normal
};

const WorkOrderCard: React.FC<WorkOrderCardProps> = ({ card, isDragging, headerColor, dateColor, onDragStart, onEdit, onCopy, onDelete }) => {

    const deliveryStatus = useMemo(() => getDeliveryDateStatus(card.deliveryDate), [card.deliveryDate]);
    
    const dateStyle = deliveryStatus.className.includes('font-bold') ? deliveryStatus.style : { color: dateColor };

    const productDisplayName = useMemo(() => {
        const match = productSeries.find(s => s.sku === card.product);
        if (match) {
            const seriesNumber = match.sku.split('/')[0].trim();
            return `Serie ${seriesNumber} - ${match.descripcion}`;
        }
        return card.product; // Fallback for custom entries
    }, [card.product]);

    return (
        <div
            id={card.id}
            draggable
            onDragStart={onDragStart}
            className={`bg-white rounded-lg shadow-md hover:shadow-xl border border-gray-200 cursor-grab transform hover:-translate-y-1 transition-all duration-200 relative ${isDragging ? 'opacity-50 border-2 border-dashed border-indigo-500 scale-105' : ''}`}
        >
            <div className="card-actions absolute top-2 right-2 flex gap-2 z-10">
                 <button onClick={() => onCopy(card)} className="text-gray-500 hover:text-green-500 transition-colors"><i className="fas fa-copy"></i></button>
                 <button onClick={() => onEdit(card)} className="text-gray-500 hover:text-blue-500 transition-colors"><i className="fas fa-edit"></i></button>
                 <button onClick={() => onDelete(card.id)} className="text-gray-500 hover:text-red-500 transition-colors"><i className="fas fa-trash-alt"></i></button>
            </div>
            <div className="card-header rounded-t-lg text-white p-4" style={{ backgroundColor: headerColor }}>
                <p className="text-sm opacity-90">Orden de Trabajo</p>
                <h3 className="text-xl font-bold">{card.id}</h3>
            </div>
            <div className="card-content p-4 text-sm text-gray-700 space-y-2">
                <p><span className="font-semibold">Cliente:</span> <span className="text-base font-bold text-gray-800">{card.client}</span></p>
                <p><span className="font-semibold">Producto:</span> <span className="text-base text-gray-800">{productDisplayName}</span></p>
                {(card.width || card.height) && (
                    <p><span className="font-semibold">Medidas:</span> <span className="text-base text-gray-800">{card.width || 'N/A'}cm x {card.height || 'N/A'}cm</span></p>
                )}
                {card.additionalDescription && (
                    <p><span className="font-semibold">Desc:</span> <span className="text-base text-gray-800">{card.additionalDescription}</span></p>
                )}
                
                <hr className="my-2 border-gray-200" />
                
                <div className="text-xs text-gray-600 grid grid-cols-2 gap-x-4 gap-y-1">
                    <p><span className="font-semibold">Marca:</span> {card.brand}</p>
                    <p><span className="font-semibold">Color:</span> {card.color}</p>
                    <p><span className="font-semibold">Cristal:</span> {card.crystal}</p>
                    <p><span className="font-semibold">Creación:</span> {card.creationDate}</p>
                </div>
                
                <hr className="my-2 border-gray-200" />

                <div className="flex justify-between items-center">
                    {card.reworkCount > 0 && (
                        <div className="flex items-center gap-1 text-amber-600" title={`Esta orden ha tenido ${card.reworkCount} retrabajo(s).`}>
                            <i className="fas fa-exclamation-triangle"></i>
                            <span className="font-bold text-sm">{card.reworkCount}</span>
                        </div>
                    )}
                    <p className={`text-center flex-1 ${card.reworkCount > 0 ? 'text-right' : ''}`}>
                        <span className="font-semibold text-gray-700">Entrega:</span> <span className={`${deliveryStatus.className} text-lg`} style={dateStyle}>{card.deliveryDate}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WorkOrderCard;