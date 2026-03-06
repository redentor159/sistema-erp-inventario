import { test, expect } from '@playwright/test';

test.describe('Módulo de Cotizaciones', () => {

    test('debe mostrar la interfaz principal de la tabla de cotizaciones', async ({ page }) => {
        // En Next.js app router con Supabase, la página puede redirigir si no hay sesión.
        // Asumiendo que Playwright corre contra una DB seed o bypass.
        await page.goto('/cotizaciones');

        // Validamos la estructura visual base
        await expect(page.locator('h1', { hasText: /Cotizaciones/i })).toBeVisible({ timeout: 10000 });

        // Debe existir el botón de Nueva Cotización usando roles accesibles
        await expect(page.getByRole('button', { name: /Nueva Cotización|Nueva/i })).toBeVisible();

        // Debe existir un input de búsqueda
        await expect(page.getByPlaceholder(/Buscar/i)).toBeVisible();
    });

    test('debe abrir el formulario para crear una nueva cotización', async ({ page }) => {
        await page.goto('/cotizaciones/new');

        // Verifica que cargue el layout principal del editor y panel de botones
        await expect(page.locator('h1', { hasText: /Nueva Cotización|Cotización/i })).toBeVisible({ timeout: 10000 });

        // Validar que existan los inputs o la UI del formulario de receta
        await expect(page.getByRole('button', { name: /Guardar/i })).toBeVisible();
    });
});
