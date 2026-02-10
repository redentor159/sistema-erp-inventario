
import React from 'react';
import Modal from './Modal';

interface ResetOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReset: (fullReset: boolean) => void;
}

const ResetOptionsModal: React.FC<ResetOptionsModalProps> = ({ isOpen, onClose, onReset }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
            <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Opciones de Restablecimiento</h3>
                <p className="text-gray-700 mb-8">Selecciona cómo deseas restablecer el tablero:</p>
                <div className="flex flex-col gap-4">
                    <button onClick={() => onReset(false)} className="py-3 px-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition">
                        Borrar Solo Tarjetas
                    </button>
                    <button onClick={() => onReset(true)} className="py-3 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
                        Empezar de 0 (Reiniciar Todo)
                    </button>
                    <button onClick={onClose} className="py-3 px-4 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">
                        Cancelar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ResetOptionsModal;
