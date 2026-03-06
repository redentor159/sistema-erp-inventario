import { describe, it, expect } from 'vitest';
import { evaluateFormula, validateFormula, previewFormula, FormulaVariables } from '../../lib/utils/formula-engine';

describe('Motor de Fórmulas (formula-engine.ts)', () => {
    const vars: FormulaVariables = { ancho: 2000, alto: 1500, hojas: 2, crucesH: 0, crucesV: 0 };

    describe('evaluateFormula()', () => {
        it('debe evaluar matemáticas básicas correctamente', () => {
            expect(evaluateFormula('2 + 2', vars).value).toBe(4);
            expect(evaluateFormula('10 - 5', vars).value).toBe(5);
            expect(evaluateFormula('4 * 5', vars).value).toBe(20);
            expect(evaluateFormula('20 / 4', vars).value).toBe(5);
        });

        it('debe respetar el orden de precedencia (paréntesis)', () => {
            expect(evaluateFormula('2 + 3 * 4', vars).value).toBe(14);
            expect(evaluateFormula('(2 + 3) * 4', vars).value).toBe(20);
        });

        it('debe reemplazar variables correctamente', () => {
            expect(evaluateFormula('ancho / hojas', vars).value).toBe(1000);
            expect(evaluateFormula('alto + 100', vars).value).toBe(1600);
        });

        it('debe ejecutar funciones integradas (min, max, ceil, floor, round, abs)', () => {
            expect(evaluateFormula('min(ancho, alto)', vars).value).toBe(1500);
            expect(evaluateFormula('max(ancho, alto)', vars).value).toBe(2000);
            expect(evaluateFormula('ceil(3.1)', vars).value).toBe(4);
            expect(evaluateFormula('floor(3.9)', vars).value).toBe(3);
            expect(evaluateFormula('round(3.5)', vars).value).toBe(4);
            expect(evaluateFormula('abs(-150)', vars).value).toBe(150);
        });

        it('debe manejar errores de fórmula sin romper', () => {
            expect(evaluateFormula('ancho / 0', vars).error).toBe('División por cero');
            expect(evaluateFormula('variableReTrucha + 2', vars).error).toContain('Variable desconocida');
            expect(evaluateFormula('min(1)', vars).error).toContain('requiere al menos 2 argumentos');
            expect(evaluateFormula('(', vars).error).toContain('Expresión incompleta');
        });
    });

    describe('validateFormula()', () => {
        it('debe validar si una fórmula es correcta semánticamente', () => {
            expect(validateFormula('ancho * 2').valid).toBe(true);
            expect(validateFormula('ancho * ).').valid).toBe(false);
        });
    });

    describe('previewFormula()', () => {
        it('debe retornar un string formateado o error visual', () => {
            expect(previewFormula('ancho / hojas', 2000, 1500, 2)).toBe('1000');
            expect(previewFormula('ancho / 0', 2000, 1500, 2)).toContain('⚠ División por cero');
        });
    });
});
