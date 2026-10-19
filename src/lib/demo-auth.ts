type DemoCredentials = { identifier: string; password: string };
type DemoRegistration = { name: string; email: string; password: string };
type StoredDemoAccount = { name: string; email: string; salt: string; passwordHash: string };
export type DemoSession = { name: string; email: string };

const ACCOUNT_KEY = "laporkota:demo-account";
const SESSION_KEY = "laporkota:demo-session";

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 120_000, hash: "SHA-256" }, key, 256);
  return toHex(new Uint8Array(bits));
}

function readAccount(): StoredDemoAccount | null {
  const raw = sessionStorage.getItem(ACCOUNT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredDemoAccount;
  } catch {
    sessionStorage.removeItem(ACCOUNT_KEY);
    return null;
  }
}

export async function registerDemoAccount({ name, email, password }: DemoRegistration): Promise<{ ok: boolean; message: string }> {
  if (typeof window === "undefined" || !crypto.subtle) {
    return { ok: false, message: "Browser ini tidak mendukung penyimpanan demo yang diperlukan." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = readAccount();
  if (existing?.email === normalizedEmail) {
    return { ok: false, message: "Email ini sudah terdaftar di sesi demo. Silakan masuk." };
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const account: StoredDemoAccount = {
    name: name.trim(),
    email: normalizedEmail,
    salt: toHex(salt),
    passwordHash: await hashPassword(password, salt),
  };
  sessionStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  return { ok: true, message: "Akun demo dibuat. Silakan masuk menggunakan email dan kata sandi tadi." };
}

export async function signInDemoAccount({ identifier, password }: DemoCredentials): Promise<{ ok: boolean; message: string }> {
  if (typeof window === "undefined" || !crypto.subtle) {
    return { ok: false, message: "Browser ini tidak mendukung proses masuk demo." };
  }

  const account = readAccount();
  if (!account) return { ok: false, message: "Belum ada akun demo di tab ini. Daftar terlebih dahulu." };
  if (account.email !== identifier.trim().toLowerCase()) {
    return { ok: false, message: "Email tidak cocok dengan akun demo yang didaftarkan di tab ini." };
  }

  const salt = new Uint8Array(account.salt.match(/.{2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);
  const submittedHash = await hashPassword(password, salt);
  if (submittedHash !== account.passwordHash) return { ok: false, message: "Kata sandi tidak cocok dengan akun demo." };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: account.name, email: account.email }));
  return { ok: true, message: "Berhasil masuk ke akun demo." };
}

export function getDemoSessionName(): string | null {
  return getDemoSession()?.name ?? null;
}

export function getDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { name?: unknown; email?: unknown };
    if (typeof session.name !== "string" || !session.name.trim() || typeof session.email !== "string") return null;
    return { name: session.name, email: session.email };
  } catch {
    return null;
  }
}

export function updateDemoProfile(profile: DemoSession) {
  if (typeof window === "undefined") return;
  const account = readAccount();
  if (account) sessionStorage.setItem(ACCOUNT_KEY, JSON.stringify({ ...account, name: profile.name, email: profile.email.toLowerCase() }));
  const currentSession = getDemoSession();
  if (currentSession) sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: profile.name, email: profile.email.toLowerCase() }));
  window.dispatchEvent(new Event("laporkota:session-changed"));
}

export function signOutDemoAccount() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("laporkota:session-changed"));
}