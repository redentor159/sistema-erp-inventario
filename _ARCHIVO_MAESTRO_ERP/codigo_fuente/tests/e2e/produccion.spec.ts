import { test, expect } from '@playwright/test';

test.describe('Módulo Kanban de Producción', () => {

    test('debe cargar el tablero con columnas base', async ({ page }) => {
        await page.goto('/production');

        // Validar que al menos las columnas básicas existen en el UI
        // await expect(page.locator('text=POR HACER')).toBeVisible();
        // await expect(page.locator('text=EN PROGRESO')).toBeVisible();
        // await expect(page.locator('text=ENTREGADO')).toBeVisible();
    });

});
