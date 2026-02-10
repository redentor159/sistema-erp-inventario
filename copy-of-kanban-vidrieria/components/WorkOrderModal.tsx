

import React, { useState, useEffect } from 'react';
import { WorkOrder } from '../types';
import Modal from './Modal';
import AutocompleteInput from './AutocompleteInput';
import { crystalTypes, Suggestion } from '../data/crystalTypes';
import { productSeries } from '../data/productSeries';
import { profileBrands } from '../data/profileBrands';
import { profileColors } from '../data/profileColors';

interface WorkOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (workOrder: Omit<WorkOrder, 'id' | 'creationDate' | 'completionDate'>, id?: string) => void;
    workOrder: WorkOrder | null;
    initialData?: Partial<WorkOrder> | null;
    onViewHistory: (id: string) => void;
}

const WorkOrderModal: React.FC<WorkOrderModalProps> = ({ isOpen, onClose, onSave, workOrder, initialData, onViewHistory }) => {
    const emptyForm = {
        client: '',
        product: '',
        brand: '',
        color: '',
        crystal: '',
        deliveryDate: '',
        width: '',
        height: '',
        additionalDescription: '',
    };
    
    const [formData, setFormData] = useState(emptyForm);
    const [productDisplay, setProductDisplay] = useState('');

    useEffect(() => {
        if (workOrder) { // Editing mode
            const productMatch = productSeries.find(s => s.sku === workOrder.product);
            
            let displayValue = workOrder.product;
            if (productMatch) {
                const seriesNumber = productMatch.sku.split('/')[0].trim();
                displayValue = `Serie ${seriesNumber} - ${productMatch.descripcion}`;
            }
            setProductDisplay(displayValue);

            setFormData({
                client: workOrder.client,
                product: workOrder.product,
                brand: workOrder.brand,
                color: workOrder.color,
                crystal: workOrder.crystal,
                deliveryDate: workOrder.deliveryDate,
                width: workOrder.width?.toString() || '',
                height: workOrder.height?.toString() || '',
                additionalDescription: workOrder.additionalDescription || '',
            });
        } else { // New or Paste mode
            const data = initialData || emptyForm;
            let displayValue = '';
            if (data.product) {
                const productMatch = productSeries.find(s => s.sku === data.product);
                if (productMatch) {
                    const seriesNumber = productMatch.sku.split('/')[0].trim();
                    displayValue = `Serie ${seriesNumber} - ${productMatch.descripcion}`;
                } else {
                    displayValue = data.product; // For custom entries
                }
            }
            setProductDisplay(displayValue);
            setFormData({
                client: data.client || '',
                product: data.product || '',
                brand: data.brand || '',
                color: data.color || '',
                crystal: data.crystal || '',
                deliveryDate: data.deliveryDate || '',
                width: data.width?.toString() || '',
                height: data.height?.toString() || '',
                additionalDescription: data.additionalDescription || '',
            });
        }
    }, [workOrder, initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string; } }) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductInputChange = (e: { target: { name: string; value: string; } }) => {
        const userInput = e.target.value;
        setProductDisplay(userInput);
        setFormData(prev => ({ ...prev, product: userInput }));
    };

    const handleProductSelect = (suggestion: Suggestion) => {
        const seriesNumber = suggestion.sku.split('/')[0].trim();
        const displayValue = `Serie ${seriesNumber} - ${suggestion.descripcion}`;
        setProductDisplay(displayValue);
        setFormData(prev => ({ ...prev, product: suggestion.sku }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            width: parseFloat(formData.width) || undefined,
            height: parseFloat(formData.height) || undefined,
        };
        onSave(dataToSave, workOrder?.id);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {workOrder ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                     <input type="text" name="client" value={formData.client} onChange={handleChange} placeholder="Nombre del Cliente" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required />
                     <AutocompleteInput
                        name="product"
                        value={productDisplay}
                        onChange={handleProductInputChange}
                        onSelectSuggestion={handleProductSelect}
                        placeholder="Producto / Serie"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        suggestions={productSeries}
                        required
                     />
                     <AutocompleteInput
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        placeholder="Marca de Perfil"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        suggestions={profileBrands}
                     />
                     <AutocompleteInput
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="Color"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        suggestions={profileColors}
                     />
                     <AutocompleteInput
                        name="crystal"
                        value={formData.crystal}
                        onChange={handleChange}
                        placeholder="Tipo de Cristal"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        suggestions={crystalTypes}
                     />
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input type="number" name="width" value={formData.width} onChange={handleChange} placeholder="Ancho (cm)" className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition" step="any" />
                        <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="Alto (cm)" className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition" step="any" />
                     </div>
                     <textarea name="additionalDescription" value={formData.additionalDescription} onChange={handleChange} placeholder="Descripción Adicional (ej: Sala, Cocina...)" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition" rows={2}></textarea>
                     <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required />
                </div>
                <div className="flex justify-between items-center mt-8">
                    <div>
                        {workOrder && (
                            <button
                                type="button"
                                onClick={() => onViewHistory(workOrder.id)}
                                className="py-2 px-5 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 border border-indigo-200 transition flex items-center gap-2"
                            >
                                <i className="fas fa-history"></i> Ver Historial
                            </button>
                        )}
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="py-2 px-5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">Cancelar</button>
                        <button type="submit" className="py-2 px-5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">{workOrder ? 'Guardar Cambios' : 'Crear Tarjeta'}</button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default WorkOrderModal;
