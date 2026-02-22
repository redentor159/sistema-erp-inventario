import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
    test('debe mostrar la pantalla de login por defecto al no estar autenticado', async ({ page }) => {
        // Si vamos a la raíz, deberíamos ver la pantalla de login (ya sea por renderizado directo o redirección)
        await page.goto('/');

        // Verificar que existen los campos de correo y contraseña (indicador de que estamos en login)
        await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 8000 });
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('debe mostrar error con credenciales incorrectas', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[type="email"]', 'test_invalido@vidrieria.com');
        await page.fill('input[type="password"]', 'contraseñaIncorrecta123');
        await page.click('button[type="submit"]');

        // Esperar mensaje de error (usualmente en un toast de shadcn/ui o texto en pantalla)
        await expect(page.locator('text=Invalid login credentials').or(page.locator('text=Credenciales inválidas'))).toBeVisible({ timeout: 5000 });
    });
});
