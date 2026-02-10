import React from 'react';
import { auth } from '../firebase/config';

interface HeaderProps {
    companyName: string;
    onExportClick: () => void;
    onSettingsClick: () => void;
    onStatisticsClick: () => void;
    isSimulationMode?: boolean;
    onExitSimulation?: () => void;
    onTutorialClick?: () => void;
    onDocumentationClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ companyName, onExportClick, onSettingsClick, onStatisticsClick, isSimulationMode, onExitSimulation, onTutorialClick, onDocumentationClick }) => {
    
    const baseTitle = 'Tablero Kanban de Producción';
    const title = isSimulationMode
        ? `${baseTitle} - Modo Simulación`
        : companyName ? `${baseTitle} - ${companyName}` : baseTitle;


    const handleSignOut = () => {
        auth.signOut();
    };

    return (
        <div id="tutorial-header" className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight text-center sm:text-left">
                {title}
                {isSimulationMode && <span className="text-sm font-medium text-amber-600 bg-amber-100 rounded-full px-3 py-1 ml-3 align-middle">DEMO</span>}
            </h1>
            <div className="flex items-center gap-4 flex-wrap justify-center">
                <button id="tutorial-stats-button" onClick={onStatisticsClick} className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition duration-200 ease-in-out flex items-center gap-2">
                    <i className="fas fa-chart-pie text-indigo-600"></i> Estadísticas
                </button>
                <button id="tutorial-export-button" onClick={onExportClick} className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition duration-200 ease-in-out flex items-center gap-2">
                    <i className="fas fa-file-excel text-green-600"></i> Exportar
                </button>
                <button id="tutorial-settings-button" onClick={onSettingsClick} className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition duration-200 ease-in-out flex items-center gap-2">
                    <i className="fas fa-cog text-gray-600"></i> Configuración
                </button>
                <button id="tutorial-documentation-button" onClick={onDocumentationClick} className="bg-white hover:bg-sky-50 text-sky-600 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition duration-200 ease-in-out flex items-center gap-2">
                    <i className="fas fa-info-circle"></i> Documentación
                </button>
                {isSimulationMode ? (
                    <>
                        <button onClick={onTutorialClick} className="bg-white hover:bg-fuchsia-50 text-fuchsia-600 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition duration-200 ease-in-out flex items-center gap-2">
                           <i className="fas fa-question-circle"></i> Tutorial
                        </button>
                         <button id="tutorial-exit-button" onClick={onExitSimulation} className="bg-white hover:bg-amber-50 text-amber-600 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition duration-200 ease-in-out flex items-center gap-2">
                            <i className="fas fa-sign-out-alt"></i> Salir de Simulación
                        </button>
                    </>
                ) : (
                    <button id="tutorial-exit-button" onClick={handleSignOut} className="bg-white hover:bg-red-50 text-red-600 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition duration-200 ease-in-out flex items-center gap-2">
                        <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                    </button>
                )}
            </div>
        </div>
    );
};

export default Header;