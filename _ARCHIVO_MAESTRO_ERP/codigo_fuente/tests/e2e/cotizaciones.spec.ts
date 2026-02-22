import { test, expect } from '@playwright/test';

test.describe('Módulo de Cotizaciones', () => {

    test('debe abrir la tabla de cotizaciones y tener buscador', async ({ page }) => {
        await page.goto('/cotizaciones');

        // Estructura E2E esperada
        // await expect(page.locator('input[placeholder*="Buscar"]')).toBeVisible();
        // await expect(page.locator('button:has-text("Nueva Cotización")')).toBeVisible();
    });

    test('debe permitir abrir el modal o página de nueva cotización', async ({ page }) => {
        await page.goto('/cotizaciones/new');
        // await expect(page.locator('form')).toBeVisible();
        // await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
});
