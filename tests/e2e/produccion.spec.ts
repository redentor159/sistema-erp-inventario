import { test, expect } from '@playwright/test';

test.describe('Módulo Kanban de Producción', () => {

    test('debe cargar la vista de producción con sus controles', async ({ page }) => {
        await page.goto('/production');

        // Validamos el layout general
        await expect(page.locator('h1', { hasText: /Producción|Kanban/i })).toBeVisible({ timeout: 10000 });
    });

    test('debe cargar las columnas base del tablero Kanban', async ({ page }) => {
        await page.goto('/production');

        // Validar que el componente Kanban Board se renderiza verificando los títulos de columnas
        // Usamos hasText flexible porque puede estar en mayúscula o minúscula
        await expect(page.locator('text=/POR HACER|Por Hacer/i')).toBeVisible();
        await expect(page.locator('text=/EN PROGRESO|En Progreso/i')).toBeVisible();
        await expect(page.locator('text=/ENTREGADO|Entregado/i')).toBeVisible();
    });

});
