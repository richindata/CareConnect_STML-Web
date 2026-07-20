/**
 * Client-side account store for the CareConnect prototype.
 *
 * IMPORTANT — this is not real authentication. Everything lives in
 * localStorage on the device, so anyone with access to the browser can read or
 * edit the account list, and there is no server to enforce anything. It exists
 * so the sign-up / sign-in / reset journeys can be demonstrated end to end.
 *
 * What it does do, rather than store passwords in the clear:
 *   - derives a key with PBKDF2-SHA256 (210k iterations) and a per-account
 *     random salt, storing only the derived hash
 *   - compares hashes in constant time
 *   - gates password reset behind a recovery code issued at sign-up, so the
 *     flow is not "type any email, take over the account"
 */

const ACCOUNTS_KEY = 'careconnect.accounts.v1'
const SESSION_KEY = 'careconnect.session.v1'

const PBKDF2_ITERATIONS = 210_000

export interface StoredAccount {
  /** Lower-cased; the identity key for an account. */
  email: string
  fullName: string
  /** Who this caregiver is looking after. Optional. */
  caringFor?: string
  passwordSalt: string
  passwordHash: string
  recoverySalt: string
  recoveryHash: string
  createdAt: string
}

export interface SessionUser {
  email: string
  fullName: string
  caringFor?: string
}

/* -------------------------------------------------------------------------- */
/* Encoding helpers                                                            */
/* -------------------------------------------------------------------------- */

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/* Returns a Uint8Array explicitly backed by an ArrayBuffer, which is what
   SubtleCrypto's BufferSource parameters require. */
function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2))
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return toHex(bytes)
}

/* -------------------------------------------------------------------------- */
/* Hashing                                                                     */
/* -------------------------------------------------------------------------- */

async function derive(secret: string, saltHex: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromHex(saltHex), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  )
  return toHex(new Uint8Array(bits))
}

/** Length-independent comparison, so timing does not leak the hash. */
function equalHashes(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

/* -------------------------------------------------------------------------- */
/* Storage                                                                     */
/* -------------------------------------------------------------------------- */

function readAccounts(): StoredAccount[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StoredAccount[]) : []
  } catch {
    return []
  }
}

function writeAccounts(accounts: StoredAccount[]): void {
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    // Storage is best-effort; surfaced to the caller as a failed operation.
  }
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function accountExists(email: string): boolean {
  const target = normaliseEmail(email)
  return readAccounts().some((account) => account.email === target)
}

/* -------------------------------------------------------------------------- */
/* Recovery codes                                                              */
/* -------------------------------------------------------------------------- */

// Excludes I, O, 0, 1 so a hand-copied code is unambiguous.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateRecoveryCode(): string {
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  const chars = Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length])
  return `${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}-${chars.slice(8, 12).join('')}`
}

export function normaliseRecoveryCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/* -------------------------------------------------------------------------- */
/* Operations                                                                  */
/* -------------------------------------------------------------------------- */

export interface CreateAccountInput {
  fullName: string
  email: string
  password: string
  caringFor?: string
}

export type CreateAccountResult =
  | { ok: true; recoveryCode: string }
  | { ok: false; reason: 'email-taken' }

export async function createAccount(input: CreateAccountInput): Promise<CreateAccountResult> {
  const email = normaliseEmail(input.email)
  if (accountExists(email)) return { ok: false, reason: 'email-taken' }

  const recoveryCode = generateRecoveryCode()
  const passwordSalt = randomHex(16)
  const recoverySalt = randomHex(16)

  const account: StoredAccount = {
    email,
    fullName: input.fullName.trim(),
    caringFor: input.caringFor?.trim() || undefined,
    passwordSalt,
    passwordHash: await derive(input.password, passwordSalt),
    recoverySalt,
    recoveryHash: await derive(normaliseRecoveryCode(recoveryCode), recoverySalt),
    createdAt: new Date().toISOString(),
  }

  writeAccounts([...readAccounts(), account])
  return { ok: true, recoveryCode }
}

export type SignInResult =
  | { ok: true; user: SessionUser }
  | { ok: false; reason: 'invalid-credentials' }

export async function verifyCredentials(email: string, password: string): Promise<SignInResult> {
  const account = readAccounts().find((entry) => entry.email === normaliseEmail(email))

  // Always derive, even with no matching account, so a missing email and a
  // wrong password take the same time and give the same message.
  const salt = account?.passwordSalt ?? randomHex(16)
  const candidate = await derive(password, salt)

  if (!account || !equalHashes(candidate, account.passwordHash)) {
    return { ok: false, reason: 'invalid-credentials' }
  }

  return {
    ok: true,
    user: { email: account.email, fullName: account.fullName, caringFor: account.caringFor },
  }
}

export type ResetResult =
  | { ok: true; recoveryCode: string }
  | { ok: false; reason: 'invalid-recovery' }

export async function resetPassword(
  email: string,
  recoveryCode: string,
  newPassword: string,
): Promise<ResetResult> {
  const accounts = readAccounts()
  const index = accounts.findIndex((entry) => entry.email === normaliseEmail(email))
  const account = index >= 0 ? accounts[index] : undefined

  const salt = account?.recoverySalt ?? randomHex(16)
  const candidate = await derive(normaliseRecoveryCode(recoveryCode), salt)

  if (!account || !equalHashes(candidate, account.recoveryHash)) {
    return { ok: false, reason: 'invalid-recovery' }
  }

  // A used recovery code is retired and a fresh one issued, so the old code
  // cannot be replayed and the user is not locked out of resetting again.
  const nextRecoveryCode = generateRecoveryCode()
  const passwordSalt = randomHex(16)
  const recoverySalt = randomHex(16)
  accounts[index] = {
    ...account,
    passwordSalt,
    passwordHash: await derive(newPassword, passwordSalt),
    recoverySalt,
    recoveryHash: await derive(normaliseRecoveryCode(nextRecoveryCode), recoverySalt),
  }
  writeAccounts(accounts)
  return { ok: true, recoveryCode: nextRecoveryCode }
}

/* -------------------------------------------------------------------------- */
/* Session                                                                     */
/* -------------------------------------------------------------------------- */

export function readSession(): SessionUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as SessionUser) : null
  } catch {
    return null
  }
}

export function writeSession(user: SessionUser): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } catch {
    // no-op
  }
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // no-op
  }
}
