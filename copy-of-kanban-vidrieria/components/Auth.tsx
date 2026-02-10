import React, { useState } from 'react';
import { auth } from '../firebase/config';
import DocumentationModal from './DocumentationModal';

interface AuthProps {
    onEnterSimulation: () => void;
}

const Auth: React.FC<AuthProps> = ({ onEnterSimulation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isDocModalOpen, setDocModalOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (err: unknown) {
            const firebaseError = err as { code: string };
            // Personaliza los mensajes de error para ser más amigables
            switch (firebaseError.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('El correo electrónico o la contraseña son incorrectos.');
                    break;
                case 'auth/invalid-email':
                    setError('El formato del correo electrónico no es válido.');
                    break;
                default:
                    setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
                    break;
            }
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
                    <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
                        Iniciar Sesión
                    </h2>
                    <p className="text-center text-gray-600 mb-6">
                        Acceso exclusivo para personal autorizado.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Correo Electrónico"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                            required
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                            required
                        />
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                        >
                            Ingresar
                        </button>
                    </form>

                    <div className="mt-6 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">O</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <button
                            type="button"
                            onClick={onEnterSimulation}
                            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300"
                        >
                            Probar en modo simulación
                        </button>
                        <button
                            type="button"
                            onClick={() => setDocModalOpen(true)}
                            className="w-full py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition border border-indigo-200 flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-info-circle"></i> Ver Documentación
                        </button>
                    </div>
                </div>
            </div>
            <DocumentationModal isOpen={isDocModalOpen} onClose={() => setDocModalOpen(false)} />
        </>
    );
};

export default Auth;