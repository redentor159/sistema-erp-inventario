
import React, { useState, useEffect } from 'react';
import { WipLimits } from '../types';
import Modal from './Modal';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (companyName: string, wipLimits: WipLimits) => void;
    currentCompanyName: string;
    currentWipLimits: WipLimits;
    onResetRequest: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentCompanyName, currentWipLimits, onResetRequest }) => {
    const [companyName, setCompanyName] = useState(currentCompanyName);
    const [wipLimits, setWipLimits] = useState(currentWipLimits);

    useEffect(() => {
        setCompanyName(currentCompanyName);
        setWipLimits(currentWipLimits);
    }, [currentCompanyName, currentWipLimits, isOpen]);

    const handleWipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setWipLimits(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(companyName, wipLimits);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Configuración del Tablero</h2>
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div id="settings-modal-company" className="p-4 border-b">
                        <label htmlFor="company-name-input" className="block text-lg font-semibold text-gray-700 mb-2">Nombre de la Empresa</label>
                        <input type="text" id="company-name-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Ej: Corporación de Vidrios" />
                    </div>
                    
                    <div id="settings-modal-wip" className="p-4 border-b">
                        <label className="block text-lg font-semibold text-gray-700 mb-3">Límites WIP (Work In Progress)</label>
                        <div className="flex items-center gap-4 mb-3">
                            <label htmlFor="wip-en-corte-input" className="w-32">En Corte:</label>
                            <input type="number" id="wip-en-corte-input" name="column-en-corte" value={wipLimits['column-en-corte']} onChange={handleWipChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" min="0" required />
                        </div>
                        <div className="flex items-center gap-4">
                            <label htmlFor="wip-en-ensamblaje-input" className="w-32">En Ensamblaje:</label>
                            <input type="number" id="wip-en-ensamblaje-input" name="column-en-ensamblaje" value={wipLimits['column-en-ensamblaje']} onChange={handleWipChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" min="0" required />
                        </div>
                    </div>

                    <div id="settings-modal-reset" className="p-4">
                        <label className="block text-lg font-semibold text-gray-700 mb-3">Opciones de Datos</label>
                        <button type="button" onClick={onResetRequest} className="w-full text-left py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition flex items-center gap-3">
                            <i className="fas fa-redo-alt"></i> Restablecer Tablero
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button type="button" onClick={onClose} className="py-2 px-5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">Cerrar</button>
                    <button type="submit" className="py-2 px-5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">Guardar Configuración</button>
                </div>
            </form>
        </Modal>
    );
};

export default SettingsModal;