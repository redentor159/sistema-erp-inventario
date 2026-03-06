import { test, expect } from '@playwright/test';

test.describe('Módulo de Inventario (Kardex)', () => {

    test('debe renderizar el título y layout de Inventario (Kardex)', async ({ page }) => {
        await page.goto('/inventory');

        // Validar título principal
        await expect(page.locator('h1', { hasText: /Kardex|Inventario/i })).toBeVisible({ timeout: 10000 });
    });

    test('debe existir el botón de exportar excel y registrar movimiento', async ({ page }) => {
        await page.goto('/inventory');

        // Estos botones son críticos para la funcionalidad
        await expect(page.getByRole('button', { name: /Exportar/i })).toBeVisible();
        // Puede variar entre "Registrar Movimiento" o "Nuevo Movimiento"
        await expect(page.getByRole('button', { name: /Registrar|Nuevo/i })).toBeVisible();
    });
});
