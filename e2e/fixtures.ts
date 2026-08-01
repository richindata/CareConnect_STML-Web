import type { Page } from '@playwright/test'

export const TEST_PASSWORD = 'Sup3rSecret!42'

/** Creates a fresh account (unique email per call) and lands on /dashboard. */
export async function signUpAndSignIn(page: Page, emailPrefix: string): Promise<string> {
  const email = `${emailPrefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`

  await page.goto('/create-account')
  await page.locator('#signup-fullName').fill('Accessibility Tester')
  await page.locator('#signup-email').fill(email)
  await page.locator('#signup-password').fill(TEST_PASSWORD)
  await page.locator('#signup-confirmPassword').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Create Account' }).click()

  await page.getByRole('button', { name: /I have saved it/ }).click()
  await page.waitForURL('**/')

  await page.locator('#signin-email').fill(email)
  await page.locator('#signin-password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL('**/dashboard')

  return email
}

export const AUTHENTICATED_ROUTES = [
  '/dashboard',
  '/my-day',
  '/meds',
  '/reminders',
  '/care-team',
  '/mail',
  '/ai',
  '/settings/account',
  '/settings/notifications',
  '/settings/privacy',
  '/settings/accessibility',
  '/settings/care-preferences',
  '/settings/about',
  '/this-route-does-not-exist',
]

export const PUBLIC_ROUTES = ['/', '/create-account', '/forgot-password']
