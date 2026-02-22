"use client"

import React from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
    constructor(props: { children: React.ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Actualiza el estado para la siguiente renderización
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Aquí podrías enviar el error a un servicio como Sentry si lo configuras después
        console.error("Error capturado por límite global:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col px-4 text-center">
                    <div className="bg-red-50 text-red-600 p-4 rounded-full mb-6">
                        <AlertTriangle className="h-12 w-12" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Algo salió mal</h1>
                    <p className="text-gray-600 mb-8 max-w-md">
                        Ha ocurrido un error inesperado en la interfaz. Por favor, recarga la página para intentar solucionar el problema.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Recargar Página
                    </button>
                    {process.env.NODE_ENV === "development" && (
                        <div className="mt-8 text-left bg-gray-100 p-4 rounded text-xs text-gray-800 w-full max-w-2xl overflow-auto border">
                            <strong>{this.state.error?.name}:</strong> {this.state.error?.message}
                        </div>
                    )}
                </div>
            )
        }

        return this.props.children
    }
}
