import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { signUpAndSignIn, AUTHENTICATED_ROUTES, PUBLIC_ROUTES } from './fixtures'

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']

async function scan(page: import('@playwright/test').Page) {
  return new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()
}

test.describe('Automated accessibility (axe-core)', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`public route ${route} has zero axe violations`, async ({ page }) => {
      await page.goto(route)
      const results = await scan(page)
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
    })
  }

  test('authenticated routes have zero axe violations', async ({ page }) => {
    await signUpAndSignIn(page, 'axe')

    const perRouteViolations: Record<string, unknown> = {}
    for (const route of AUTHENTICATED_ROUTES) {
      await page.goto(route)
      // Lazy-loaded routes briefly render a Suspense fallback with no heading;
      // wait for the real page heading before scanning.
      await page.locator('h1').first().waitFor({ state: 'visible' })
      const results = await scan(page)
      if (results.violations.length > 0) perRouteViolations[route] = results.violations
    }
    expect(Object.keys(perRouteViolations), JSON.stringify(perRouteViolations, null, 2)).toEqual([])
  })

  test('account menu (open) has zero axe violations', async ({ page }) => {
    await signUpAndSignIn(page, 'axe-menu')
    await page.locator('.account__trigger').click()
    await expect(page.locator('#account-menu')).toBeVisible()
    const results = await scan(page)
    expect(results.violations).toEqual([])
  })

  test('dialogs have zero axe violations while open', async ({ page }) => {
    await signUpAndSignIn(page, 'axe-dialog')

    await page.goto('/meds')
    await page.getByRole('button', { name: 'Add Medication' }).click()
    await expect(page.locator('dialog[open]')).toBeVisible()
    expect((await scan(page)).violations).toEqual([])
    await page.keyboard.press('Escape')

    await page.goto('/reminders')
    await page.getByRole('button', { name: 'Add Reminder' }).click()
    await expect(page.locator('dialog[open]')).toBeVisible()
    expect((await scan(page)).violations).toEqual([])
    await page.keyboard.press('Escape')

    await page.goto('/my-day')
    await page.getByRole('button', { name: 'Add Task' }).click()
    await expect(page.locator('dialog[open]')).toBeVisible()
    expect((await scan(page)).violations).toEqual([])
    await page.keyboard.press('Escape')

    await page.goto('/care-team')
    await page.getByRole('button', { name: 'Invite Caregiver' }).click()
    await expect(page.locator('dialog[open]')).toBeVisible()
    expect((await scan(page)).violations).toEqual([])
    await page.keyboard.press('Escape')

    await page.goto('/mail')
    await page.getByRole('button', { name: 'New message' }).click()
    await expect(page.locator('dialog[open]')).toBeVisible()
    expect((await scan(page)).violations).toEqual([])
  })
})
