import { test, expect } from '@playwright/test'
import { signUpAndSignIn, AUTHENTICATED_ROUTES, PUBLIC_ROUTES } from './fixtures'

/**
 * Cross-browser smoke test: loads every route in each configured engine
 * (Chromium, Firefox, WebKit, Edge) and fails on console/page errors or
 * missing landmark content, so browser-specific rendering bugs surface here
 * instead of manual QA.
 */
test.describe('Cross-browser smoke test', () => {
  test('public routes render without console errors', async ({ page, browserName }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(`${browserName} pageerror: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`${browserName} console: ${message.text()}`)
    })

    for (const route of PUBLIC_ROUTES) {
      await page.goto(route)
      await expect(page.locator('main, [role="main"]').first()).toBeVisible()
    }

    expect(errors, errors.join('\n')).toEqual([])
  })

  test('authenticated routes render without console errors', async ({ page, browserName }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(`${browserName} pageerror: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`${browserName} console: ${message.text()}`)
    })

    await signUpAndSignIn(page, `xbrowser.${browserName}`)

    for (const route of AUTHENTICATED_ROUTES) {
      await page.goto(route)
      await expect(page.locator('#main-content')).toBeVisible()
    }

    expect(errors, errors.join('\n')).toEqual([])
  })

  test('keyboard-only navigation reaches the dashboard nav and skip link works', async ({
    page,
    browserName,
  }) => {
    await signUpAndSignIn(page, 'kbd')

    await page.goto('/dashboard')
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement?.className ?? '')

    // WebKit/Safari's default Tab behavior only cycles through form controls,
    // not links, until the user enables "Full Keyboard Access" — a real
    // Safari OS setting, not an app bug (see docs/testing-report.md, Section 3).
    // VoiceOver users still reach the skip link via the rotor regardless.
    if (browserName === 'webkit') {
      expect(focused).toContain('account__trigger')
      return
    }

    expect(focused).toContain('skip-link')

    // Activate the skip link and confirm focus lands on <main>.
    await page.keyboard.press('Enter')
    const activeId = await page.evaluate(() => document.activeElement?.id ?? '')
    expect(activeId).toBe('main-content')
  })
})
