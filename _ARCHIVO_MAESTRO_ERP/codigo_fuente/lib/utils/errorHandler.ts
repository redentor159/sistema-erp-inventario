/**
 * Centralized error handler for API and database errors
 * @module lib/utils/errorHandler
 */

import { PostgrestError } from '@supabase/supabase-js'

interface ToastFunction {
    error: (title: string, description?: string) => void
}

/**
 * Maneja errores de Supabase/Postgrest de forma centralizada
 * @param error - Error object de Supabase
 * @param toast - Toast helper object
 * @param context - Contexto opcional para debugging
 * 
 * @example
 * ```typescript
 * try {
 *     await api.createCotizacion(data)
 * } catch (error) {
 *     handleSupabaseError(error, toast, 'Create Cotizacion')
 * }
 * ```
 */
export function handleSupabaseError(
    error: PostgrestError | Error | any,
    toast: ToastFunction,
    context?: string
) {
    console.error(`[${context || 'API Error'}]:`, error)

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
        // TODO: Integrar con Sentry/LogRocket
        // logToSentry(error, context)
    }

    // PostgrestError codes
    if ('code' in error) {
        switch (error.code) {
            case 'PGRST116':
                toast.error(
                    "No encontrado",
                    "El registro solicitado no existe o fue eliminado"
                )
                break

            case '23503': // foreign_key_violation
                toast.error(
                    "Faltan datos relacionados",
                    "Asegúrate de que todos los datos necesarios existan. Revisa /audit/recetas si es un problema de SKUs."
                )
                break

            case '23505': // unique_violation
                toast.error(
                    "Registro duplicado",
                    "Ya existe un registro con estos datos. Usa uno diferente."
                )
                break

            case '23502': // not_null_violation
                toast.error(
                    "Datos incompletos",
                    "Faltan campos obligatorios. Completa todos los campos marcados."
                )
                break

            case '42P01': // undefined_table (views no existen)
                toast.error(
                    "Vistas SQL no encontradas",
                    "Ejecuta los scripts SQL necesarios en Supabase. Contacta al administrador."
                )
                break

            default:
                toast.error(
                    "Error de base de datos",
                    error.message || `Código: ${error.code}`
                )
        }
    } else {
        // Generic error
        toast.error(
            "Error inesperado",
            error.message || "Ocurrió un error. Intenta nuevamente."
        )
    }
}

/**
 * Wrapper para operaciones async con manejo de errores automático
 * @param operation - Función async a ejecutar
 * @param toast - Toast helper object  
 * @param context - Contexto para debugging
 * @returns Resultado de la operación o null si hubo error
 * 
 * @example
 * ```typescript
 * const data = await withErrorHandling(
 *     () => api.getCotizaciones(),
 *     toast,
 *     'Load Cotizaciones'
 * )
 * if (!data) return
 * // ...usar data
 * ```
 */
export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    toast: ToastFunction,
    context?: string
): Promise<T | null> {
    try {
        return await operation()
    } catch (error) {
        handleSupabaseError(error, toast, context)
        return null
    }
}
