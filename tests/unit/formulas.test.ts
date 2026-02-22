import { describe, it, expect } from 'vitest'

// Math formulas isolated for testing
const calcularPeso = (largoMm: number, pesoTeoricoKg: number) => {
    return (largoMm / 1000) * pesoTeoricoKg
}

const calcularRendimiento = (largoEstandarMm: number, largoCorteMm: number) => {
    if (largoCorteMm === 0) return 0
    return Math.floor(largoEstandarMm / largoCorteMm)
}

const calcularCostoItem = (cantidad: number, precioUnit: number) => {
    return Number((cantidad * precioUnit).toFixed(2))
}

const parseDimensions = (text: string) => {
    const match = text.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/)
    if (match) {
        return { w: parseFloat(match[1]), h: parseFloat(match[2]) }
    }
    return null
}

describe('Fórmulas Matemáticas de Ingeniería y Cotización', () => {

    describe('calcularPeso()', () => {
        it('debe calcular correctamente el peso para un corte', () => {
            // Ejemplo: Perfil de peso teórico 1.2kg/m y cortamos 500mm
            expect(calcularPeso(500, 1.2)).toBe(0.6)
        })

        it('debe devolver 0 si el largo es 0', () => {
            expect(calcularPeso(0, 1.2)).toBe(0)
        })

        it('debe lidiar con números decimales complejos', () => {
            expect(calcularPeso(750.5, 0.854)).toBeCloseTo(0.6409, 4)
        })
    })

    describe('calcularRendimiento()', () => {
        it('debe calcular cortes enteros exactos', () => {
            // Perfil de 6000mm, cortes de 1500mm = 4 cortes
            expect(calcularRendimiento(6000, 1500)).toBe(4)
        })

        it('debe ignorar el remanente (floor)', () => {
            // Perfil de 6000mm, cortes de 1400mm = 4 cortes (sobran 400mm)
            expect(calcularRendimiento(6000, 1400)).toBe(4)
        })

        it('debe prevenir división por cero', () => {
            expect(calcularRendimiento(6000, 0)).toBe(0)
        })
    })

    describe('calcularCostoItem()', () => {
        it('debe calcular el costo total con redondeo a 2 decimales', () => {
            expect(calcularCostoItem(3, 15.55)).toBe(46.65)
        })

        it('debe redondear correctamente montos como 10.334', () => {
            expect(calcularCostoItem(1, 10.334)).toBe(10.33)
        })

        it('debe redondear correctamente montos como 10.336', () => {
            expect(calcularCostoItem(1, 10.336)).toBe(10.34)
        })

        it('debe manejar 0s', () => {
            expect(calcularCostoItem(0, 50.00)).toBe(0)
            expect(calcularCostoItem(10, 0)).toBe(0)
        })
    })

    describe('parseDimensions()', () => {
        it('debe parsear dimensiones con X mayúscula y espacios', () => {
            expect(parseDimensions('1500 X 2000')).toEqual({ w: 1500, h: 2000 })
        })

        it('debe parsear dimensiones con x minúscula sin espacios', () => {
            expect(parseDimensions('800x600')).toEqual({ w: 800, h: 600 })
        })

        it('debe parsear dimensiones con decimales', () => {
            expect(parseDimensions('1500.5 x 2000.75')).toEqual({ w: 1500.5, h: 2000.75 })
        })

        it('debe devolver null si el formato es erróneo', () => {
            expect(parseDimensions('medidas')).toBeNull()
            expect(parseDimensions('1500  2000')).toBeNull()
        })
    })
})
