
import React from 'react';
import Modal from './Modal';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, message, onConfirm, isDanger = false }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
            <div className="text-center">
                <p className="text-lg text-gray-700 mb-8">{message}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm}
                        className={`py-2 px-6 text-white rounded-lg font-semibold transition ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
