
import React, { useState } from 'react';
import { ProjectHistory } from '../types';
import Modal from './Modal';

// This function needs to be declared because the script is loaded from CDN
declare const XLSX: any;

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: ProjectHistory[];
}

const exportToExcel = (data: ProjectHistory[], startDate?: string, endDate?: string) => {
    let filteredHistory = [...data];

    if (startDate && endDate) {
        const start = new Date(startDate + 'T00:00:00Z');
        const end = new Date(endDate + 'T23:59:59Z');
        filteredHistory = filteredHistory.filter(card => {
            if (!card.creationDate) return false;
            const cardCreationDate = new Date(card.creationDate + 'T00:00:00Z');
            return cardCreationDate >= start && cardCreationDate <= end;
        });
    }

    if (filteredHistory.length === 0) {
        alert('No hay registros de proyectos para exportar en el rango seleccionado.');
        return;
    }

    const allProjectsData = filteredHistory.map(card => ({
        "ID Pedido": card.id,
        "Cliente": card.client,
        "Producto": card.product,
        "Ancho (cm)": card.width,
        "Alto (cm)": card.height,
        "Descripción Adicional": card.additionalDescription,
        "Marca": card.brand,
        "Color": card.color,
        "Cristal": card.crystal,
        "Fecha Creación": card.creationDate,
        "Fecha Entrega Estimada": card.deliveryDate,
        "Fecha Finalización": card.completionDate || 'N/A',
        "Cantidad de Retrabajos": card.reworkCount || 0,
        "Historial de Retrabajos": (card.reworkHistory || []).map(r => `${r.date}: De '${r.from}' a '${r.to}'`).join('; ') || 'N/A',
        "Estado": card.status,
        "Eliminado Desde Etapa": card.deletedFromColumn || 'N/A',
        "Fecha Eliminación / Archivo": card.deletionDate || 'N/A'
    }));

    let finalizedProjectsData = data.filter(card => card.status === 'Finalizado' || card.status === 'Archivado');
    if (startDate && endDate) {
        const start = new Date(startDate + 'T00:00:00Z');
        const end = new Date(endDate + 'T23:59:59Z');
        finalizedProjectsData = finalizedProjectsData.filter(card => {
            if (!card.completionDate) return false;
            const cardCompletionDate = new Date(card.completionDate + 'T00:00:00Z');
            return cardCompletionDate >= start && cardCompletionDate <= end;
        });
    }

    const finalizedSheetData = finalizedProjectsData.map(card => ({
        "ID Pedido": card.id,
        "Cliente": card.client,
        "Producto": card.product,
        "Ancho (cm)": card.width,
        "Alto (cm)": card.height,
        "Descripción Adicional": card.additionalDescription,
        "Marca": card.brand,
        "Fecha Creación": card.creationDate,
        "Fecha Entrega Estimada": card.deliveryDate,
        "Fecha Finalización": card.completionDate
    }));

    const wsAll = XLSX.utils.json_to_sheet(allProjectsData);
    const wsFinalized = XLSX.utils.json_to_sheet(finalizedSheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsAll, "Todos los Proyectos");
    XLSX.utils.book_append_sheet(wb, wsFinalized, "Proyectos Finalizados");
    
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `historial_kanban_${timestamp}.xlsx`;
    XLSX.writeFile(wb, filename);
};


const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, history }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleExportRange = (e: React.FormEvent) => {
        e.preventDefault();
        exportToExcel(history, startDate, endDate);
        onClose();
    };

    const handleExportAll = () => {
        exportToExcel(history);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Exportar Historial</h2>
            <p className="text-gray-600 mb-6 text-center">Selecciona un rango de fechas o exporta todo el historial.</p>
            <form onSubmit={handleExportRange}>
                <div id="export-modal-range" className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <label htmlFor="export-start-date" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio:</label>
                        <input type="date" id="export-start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="export-end-date" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin:</label>
                        <input type="date" id="export-end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                </div>
                <div id="export-modal-buttons" className="flex flex-col gap-3 mt-8">
                    <button type="submit" className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                         <i className="fas fa-calendar-alt"></i> Exportar Rango
                    </button>
                    <button type="button" onClick={handleExportAll} className="w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2">
                        <i className="fas fa-file-export"></i> Exportar Todo
                    </button>
                    <button type="button" onClick={onClose} className="w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">
                        Cancelar
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ExportModal;