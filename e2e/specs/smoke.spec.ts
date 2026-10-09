import { expect, test } from '@playwright/test';

test("la page d'accueil affiche Duper", async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Duper');
  await expect(page.getByRole('heading', { name: 'Duper' })).toBeVisible();
});

test("l'API répond via le proxy Vite", async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: 'ok', app: 'Duper' });
});
