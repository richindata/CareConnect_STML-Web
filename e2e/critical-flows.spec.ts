import { expect, test, type Page } from '@playwright/test'

const password = 'correct-horse'
const caringFor = 'Eleanor Jenkins'

function uniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}@example.com`
}

async function createAccount(
  page: Page,
  {
    fullName = 'Sarah Jenkins',
    email,
    caringForName = caringFor,
  }: { fullName?: string; email: string; caringForName?: string },
) {
  await page.goto('/create-account')
  await page.getByLabel(/full name/i).fill(fullName)
  await page.getByLabel(/email address/i).fill(email)
  await page.getByLabel(/who are you caring for/i).fill(caringForName)
  await page.getByLabel(/^password/i).fill(password)
  await page.getByLabel(/confirm password/i).fill(password)
  await page.getByRole('button', { name: /create account/i }).click()

  const code = await page.getByText(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/).textContent()
  expect(code).toBeTruthy()
  await page.getByRole('button', { name: /continue to sign in/i }).click()
  return code!
}

async function signIn(page: Page, email: string, pwd = password) {
  await page.goto('/')
  await page.getByLabel(/email address/i).fill(email)
  await page.getByLabel(/password/i).fill(pwd)
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}

test.describe('Critical user flows (Chrome / Chromium)', () => {
  test('1) Create account → recovery code → sign in → dashboard', async ({ page }) => {
    const email = uniqueEmail('create')
    await createAccount(page, { email })
    await expect(page).toHaveURL('/')

    await signIn(page, email)
    await expect(page.getByRole('heading', { level: 1, name: /good (morning|afternoon|evening)/i })).toBeVisible()
    await expect(page.getByText(new RegExp(caringFor, 'i'))).toBeVisible()
  })

  test('2) Auth guard redirects signed-out visitors; session survives reload; sign out', async ({
    page,
  }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { level: 1, name: 'CareConnect' })).toBeVisible()

    const email = uniqueEmail('session')
    await createAccount(page, { email })
    await signIn(page, email)

    await page.reload()
    await expect(page).toHaveURL(/\/dashboard/)

    await page.getByRole('button', { name: /sarah jenkins/i }).click()
    await page.getByRole('button', { name: /^sign out$/i }).click()
    await expect(page).toHaveURL('/')
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/')
  })

  test('3) Forgot password with recovery code unlocks a new password', async ({ page }) => {
    const email = uniqueEmail('reset')
    const recoveryCode = await createAccount(page, { email })

    await page.goto('/forgot-password')
    await page.getByLabel(/email address/i).fill(email)
    await page.getByLabel(/recovery code/i).fill(recoveryCode)
    await page.getByLabel(/^new password/i).fill('new-password')
    await page.getByLabel(/confirm new password/i).fill('new-password')
    await page.getByRole('button', { name: /change password/i }).click()

    await expect(page.getByText(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)).toBeVisible()
    await page.getByRole('button', { name: /continue to sign in/i }).click()

    await signIn(page, email, 'new-password')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('4) Dashboard navigation reaches My Day, Meds, and Settings', async ({ page }) => {
    const email = uniqueEmail('nav')
    await createAccount(page, { email })
    await signIn(page, email)

    const nav = page.getByRole('navigation', { name: /primary/i })
    await nav.getByRole('link', { name: /^my day$/i }).click()
    await expect(page).toHaveURL(/\/my-day/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await nav.getByRole('link', { name: /^medications$/i }).click()
    await expect(page).toHaveURL(/\/meds/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await nav.getByRole('link', { name: /^settings$/i }).click()
    await expect(page).toHaveURL(/\/settings/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('5) Mark a medication dose taken and confirm the summary updates', async ({ page }) => {
    const email = uniqueEmail('meds')
    await createAccount(page, { email })
    await signIn(page, email)

    await page.getByRole('navigation', { name: /primary/i }).getByRole('link', { name: /^medications$/i }).click()
    await expect(page).toHaveURL(/\/meds/)

    const dueDose = page.getByRole('checkbox', { name: /due/i }).first()
    await expect(dueDose).toBeVisible()
    await dueDose.check()
    await expect(page.getByText(/marked as taken|taken/i).first()).toBeVisible()
  })
})
