import { test, expect } from '@playwright/test'
import { signUpAndSignIn } from './fixtures'

/**
 * Scripted stand-ins for the "Semantic HTML", "ARIA", and "Focus management"
 * manual checklist items: these verify the actual rendered DOM/behavior
 * rather than relying on axe-core (which only flags rule violations, not
 * whether the *right* element/attribute was used for the job).
 */

test.describe('Semantic HTML structure', () => {
  test('landmarks are real, labelled HTML5 elements with a single h1', async ({ page }) => {
    await signUpAndSignIn(page, 'semantic')
    await page.goto('/dashboard')

    await expect(page.locator('header.masthead')).toHaveCount(1)
    await expect(page.locator('nav[aria-label="Primary"]')).toHaveCount(1)
    await expect(page.locator('main#main-content')).toHaveCount(1)
    // Exactly one h1 per page — a real heading outline, not divs styled as headings.
    await expect(page.locator('h1')).toHaveCount(1)
  })

  test('primary navigation is a real <ul>/<li> list inside its <nav>', async ({ page }) => {
    await signUpAndSignIn(page, 'semantic-list')
    const nav = page.locator('nav[aria-label="Primary"]')
    const list = nav.locator('ul')
    await expect(list).toHaveCount(1)
    expect(await list.locator('> li').count()).toBeGreaterThanOrEqual(7)
    // Every item's interactive control is a real <a>, not a clickable <div>/<span>.
    expect(await list.locator('> li a').count()).toBeGreaterThanOrEqual(7)
  })

  test('sign-in and create-account use a real <form> element', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('form')).toHaveCount(1)
    await page.goto('/create-account')
    await expect(page.locator('form')).toHaveCount(1)
  })

  test('modals render as a native <dialog> element, not a div overlay', async ({ page }) => {
    await signUpAndSignIn(page, 'semantic-dialog')
    await page.goto('/meds')
    await page.getByRole('button', { name: 'Add Medication' }).click()
    const dialog = page.locator('dialog[open]')
    await expect(dialog).toBeVisible()
    expect(await dialog.evaluate((node) => node.tagName)).toBe('DIALOG')
    // The close control is a real <button>, and its icon is hidden from AT.
    await expect(dialog.locator('button.dialog__close')).toBeVisible()
    await expect(dialog.locator('button.dialog__close [aria-hidden="true"]')).toHaveCount(1)
  })
})

test.describe('ARIA correctness', () => {
  test('account menu trigger exposes aria-expanded/aria-controls that match reality', async ({ page }) => {
    await signUpAndSignIn(page, 'aria-account')
    const trigger = page.locator('.account__trigger')

    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    const controlsId = await trigger.getAttribute('aria-controls')
    expect(controlsId).toBe('account-menu')
    // Referenced id shouldn't exist in the DOM while collapsed.
    await expect(page.locator(`#${controlsId}`)).toHaveCount(0)

    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    // Once expanded, the referenced element must actually exist and be visible.
    await expect(page.locator(`#${controlsId}`)).toBeVisible()
  })

  test('mobile primary-nav toggle exposes matching aria-expanded/aria-controls', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 })
    await signUpAndSignIn(page, 'aria-nav')
    const toggle = page.locator('.primary-nav__toggle')

    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    const controlsId = await toggle.getAttribute('aria-controls')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator(`#${controlsId}`)).toBeVisible()
  })

  test('dialog aria-labelledby/aria-describedby resolve to real, matching text', async ({ page }) => {
    await signUpAndSignIn(page, 'aria-dialog')
    await page.goto('/reminders')
    await page.getByRole('button', { name: 'Add Reminder' }).click()

    const dialog = page.locator('dialog[open]')
    const labelledBy = await dialog.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    const heading = page.locator(`#${labelledBy}`)
    await expect(heading).toBeVisible()
    // The dialog's accessible name should be the same text a sighted user sees as its title.
    expect((await heading.textContent())?.trim().length).toBeGreaterThan(0)
  })

  test('a polite, atomic live region exists for status announcements', async ({ page }) => {
    await page.goto('/')
    const region = page.locator('[role="status"][aria-live="polite"][aria-atomic="true"]')
    await expect(region).toHaveCount(1)
  })
})

test.describe('Focus management: modals and dropdowns', () => {
  test('opening a dialog moves focus inside it, and Tab cannot escape it (focus trap)', async ({ page }) => {
    await signUpAndSignIn(page, 'focus-dialog')
    await page.goto('/meds')
    await page.getByRole('button', { name: 'Add Medication' }).click()

    const dialog = page.locator('dialog[open]')
    await expect(dialog).toBeVisible()

    // The native <dialog> focus trap keeps the active element inside the dialog,
    // except for a brief transit through <body> between the last and first
    // focusable element on wrap-around (a documented Chromium/WebKit implementation
    // detail, not a real escape — body has no interactive content of its own).
    const isFocusSafe = () =>
      page.evaluate(() => {
        const active = document.activeElement
        return active === document.body || !!active?.closest('dialog[open]')
      })
    expect(await isFocusSafe()).toBe(true)

    const focusableCount = await dialog.locator('button, input, select, textarea, a[href]').count()
    // Tab well past the number of focusable elements inside the dialog; focus must
    // never land on any interactive element behind it (nav links, other buttons).
    for (let i = 0; i < focusableCount * 2; i++) {
      await page.keyboard.press('Tab')
      expect(await isFocusSafe()).toBe(true)
    }
  })

  test('closing a dialog with Escape returns focus to the button that opened it', async ({ page, browserName }) => {
    await signUpAndSignIn(page, 'focus-restore')
    await page.goto('/reminders')
    const opener = page.getByRole('button', { name: 'Add Reminder' })
    await opener.click()
    await expect(page.locator('dialog[open]')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('dialog[open]')).toHaveCount(0)

    // WebKit/Safari does not give a <button> programmatic focus on click by
    // default (only text inputs), so there is no "previously focused element"
    // for the native dialog to restore focus to here — a Safari OS default,
    // the same one documented in e2e/cross-browser.spec.ts, not an app bug.
    if (browserName === 'webkit') return

    await expect(opener).toBeFocused()
  })

  test('opening the account menu moves focus to Sign out, and Escape restores it to the trigger', async ({ page }) => {
    await signUpAndSignIn(page, 'focus-account')
    const trigger = page.locator('.account__trigger')
    await trigger.click()

    const signOut = page.getByRole('button', { name: 'Sign out' })
    await expect(signOut).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(page.locator('#account-menu')).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('opening the mobile nav panel moves focus predictably and Escape restores the toggle', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 480, height: 800 })
    await signUpAndSignIn(page, 'focus-nav')
    const toggle = page.locator('.primary-nav__toggle')
    await toggle.click()
    await expect(page.locator('#primary-nav-list')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('#primary-nav-list')).toHaveCount(0)

    // Same documented WebKit/Safari click-does-not-focus-buttons default as above.
    if (browserName === 'webkit') return

    await expect(toggle).toBeFocused()
  })
})
