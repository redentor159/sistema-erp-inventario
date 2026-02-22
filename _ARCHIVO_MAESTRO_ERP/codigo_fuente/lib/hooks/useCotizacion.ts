/**
 * Custom hook para manejo de cotizaciones
 * Centraliza la lógica de fetching, updating y cloning de cotizaciones
 * @module lib/hooks/useCotizacion
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cotizacionesApi } from '@/lib/api/cotizaciones'
import { useToastHelper } from './useToastHelper'
import { handleSupabaseError } from '@/lib/utils/errorHandler'
import type { CotizacionDetallada } from '@/types/cotizaciones'

/**
 * Hook para manejo completo de una cotización individual
 * @param id - ID de la cotización
 * @returns Objeto con data, loading states, y funciones de mutación
 * 
 * @example
 * ```typescript
 * const { cotizacion, isLoading, update, clone } = useCotizacion(id)
 * 
 * // Actualizar
 * update({ nombre_proyecto: "Nuevo Nombre" })
 * 
 * // Duplicar
 * clone()
 * ```
 */
export function useCotizacion(id: string) {
    const queryClient = useQueryClient()
    const toast = useToastHelper()

    // Fetch cotizacion
    const {
        data: cotizacion,
        isLoading,
        error,
        refetch
    } = useQuery<CotizacionDetallada>({
        queryKey: ['cotizacion', id],
        queryFn: () => cotizacionesApi.getCotizacionById(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 min cache
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (updates: Partial<CotizacionDetallada>) =>
            cotizacionesApi.updateCotizacion(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cotizacion', id] })
            queryClient.invalidateQueries({ queryKey: ['cotizaciones'] })
            toast.success("Guardado", "Los cambios se guardaron correctamente")
        },
        onError: (error) => {
            handleSupabaseError(error, toast, 'Update Cotizacion')
        }
    })

    // Clone mutation
    const cloneMutation = useMutation({
        mutationFn: () => cotizacionesApi.clonarCotizacion(id),
        onSuccess: (newCot) => {
            queryClient.invalidateQueries({ queryKey: ['cotizaciones'] })
            toast.success("Duplicada", `Cotización duplicada con ID: ${newCot.id_cotizacion}`)
        },
        onError: (error) => {
            handleSupabaseError(error, toast, 'Clone Cotizacion')
        }
    })

    return {
        cotizacion,
        isLoading,
        error,
        refetch,
        update: updateMutation.mutate,
        updateAsync: updateMutation.mutateAsync,
        clone: cloneMutation.mutate,
        cloneAsync: cloneMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        isCloning: cloneMutation.isPending,
    }
}
