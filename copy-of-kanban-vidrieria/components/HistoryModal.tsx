import React from 'react';
import { ProjectHistory } from '../types';
import Modal from './Modal';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: ProjectHistory;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Historial de la Orden</h2>
                    <p className="text-indigo-600 font-semibold">{history.id}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
            </div>
            
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                        <i className="fas fa-route mr-2 text-gray-500"></i>
                        Historial de Movimientos
                    </h3>
                    {history.movementHistory && history.movementHistory.length > 0 ? (
                        <ul className="space-y-2">
                            {history.movementHistory.map((move, index) => (
                                <li key={index} className="flex items-center p-2 bg-gray-50 rounded-md text-sm">
                                    <span className="font-bold text-gray-800 w-36">{move.stage}</span>
                                    <div className="flex-1 text-gray-600">
                                        <span>Entrada: <span className="font-medium">{move.entryDate}</span></span>
                                        {move.exitDate && (
                                            <span className="ml-4">Salida: <span className="font-medium">{move.exitDate}</span></span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">No hay movimientos registrados.</p>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                         <i className="fas fa-tools mr-2 text-gray-500"></i>
                         Historial de Retrabajos
                    </h3>
                    {history.reworkHistory && history.reworkHistory.length > 0 ? (
                         <ul className="space-y-2">
                            {history.reworkHistory.map((rework, index) => (
                                <li key={index} className="flex items-center p-2 bg-yellow-50 rounded-md text-sm">
                                    <span className="font-bold text-yellow-800 w-36">{rework.date}</span>
                                    <div className="flex-1 text-yellow-700">
                                        Retroceso de <span className="font-medium">'{rework.from}'</span> a <span className="font-medium">'{rework.to}'</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">No hay retrabajos registrados.</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end mt-8">
                <button onClick={onClose} className="py-2 px-5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">
                    Cerrar
                </button>
            </div>
        </Modal>
    );
};

export default HistoryModal;
