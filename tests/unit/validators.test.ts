import { describe, it, expect } from 'vitest'
import {
    movimientoSchema,
    entradaCabeceraSchema,
    salidaCabeceraSchema
} from '../../lib/validators/trx'

describe('Validadores de Transacciones (trx.ts)', () => {

    describe('movimientoSchema (Kardex)', () => {
        it('debe validar un movimiento correcto', () => {
            const result = movimientoSchema.safeParse({
                tipo_movimiento: 'COMPRA',
                id_sku: 'SKU-001',
                cantidad: 10
            })
            expect(result.success).toBe(true)
        })

        it('debe rechazar cantidad 0', () => {
            const result = movimientoSchema.safeParse({
                tipo_movimiento: 'AJUSTE',
                id_sku: 'SKU-001',
                cantidad: 0
            })
            expect(result.success).toBe(false)
        })

        it('debe rechazar tipo_movimiento inválido', () => {
            const result = movimientoSchema.safeParse({
                tipo_movimiento: 'REGALO',
                id_sku: 'SKU-001',
                cantidad: 5
            })
            expect(result.success).toBe(false)
        })
    })

    describe('entradaCabeceraSchema (Compras)', () => {
        it('debe exigir proveedor si es COMPRA', () => {
            const result = entradaCabeceraSchema.safeParse({
                tipo_entrada: 'COMPRA',
                moneda: 'PEN',
                tipo_cambio: 1,
                detalles: [{ id_sku: 'SKU-001', cantidad: 5, costo_unitario: 10 }]
            })
            expect(result.success).toBe(false)
            if (!result.success && 'errors' in result.error) {
                expect((result.error as any).errors[0].message).toBe('Proveedor es requerido para Compras')
            }
        })

        it('debe permitir AJUSTE sin proveedor', () => {
            const result = entradaCabeceraSchema.safeParse({
                tipo_entrada: 'AJUSTE_POSITIVO',
                moneda: 'PEN',
                tipo_cambio: 1,
                detalles: [{ id_sku: 'SKU-001', cantidad: 5, costo_unitario: 10 }]
            })
            expect(result.success).toBe(true)
        })

        it('debe exigir al menos 1 detalle', () => {
            const result = entradaCabeceraSchema.safeParse({
                tipo_entrada: 'AJUSTE_POSITIVO',
                moneda: 'PEN',
                tipo_cambio: 1,
                detalles: []
            })
            expect(result.success).toBe(false)
        })
    })

    describe('salidaCabeceraSchema (Ventas/Producción)', () => {
        it('debe exigir cliente si es VENTA', () => {
            const result = salidaCabeceraSchema.safeParse({
                tipo_salida: 'VENTA',
                detalles: [{ id_sku: 'SKU-001', cantidad: 5, precio_unitario: 10 }]
            })
            expect(result.success).toBe(false)
            if (!result.success && 'errors' in result.error) {
                expect((result.error as any).errors[0].message).toBe('Cliente es requerido para Ventas')
            }
        })
    })

})
