import { getSupabaseClient } from "@/lib/supabaseClient";

type DemoCredentials = { identifier: string; password: string };
type DemoRegistration = { name: string; email: string; password: string };
export type DemoSession = { name: string; email: string; role?: string };

const SESSION_KEY = "laporkota:demo-session";

export function getDemoDashboardPath(role?: string): string {
  const normalizedRole = role?.toLowerCase().replace(/[\s-]+/g, "_");
  if (normalizedRole === "admin_bpdlh" || normalizedRole === "admin_keuangan" || normalizedRole === "bpdlh") return "/bpdlh";
  if (["admin", "administrator", "admin_utama", "admin_bpbd", "bpbd"].includes(normalizedRole ?? "")) return "/admin";
  return "/portal";
}

export async function registerDemoAccount({ name, email, password }: DemoRegistration): Promise<{ ok: boolean; message: string; redirectToLogin: boolean }> {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await getSupabaseClient().auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { nama: name.trim(), no_telepon: null, alamat: null },
    },
  });

  if (error) {
    const errorCode = "code" in error && typeof error.code === "string" ? error.code.toLowerCase() : "";
    const errorMessage = error.message.toLowerCase();
    const emailAlreadyRegistered = ["user_already_exists", "email_exists"].includes(errorCode)
      || /email.{0,40}(already|registered|exists|taken)|user.{0,40}already registered/.test(errorMessage);

    return {
      ok: false,
      message: emailAlreadyRegistered
        ? "Email sudah terdaftar. Silakan masuk menggunakan email tersebut atau gunakan email lain."
        : error.message,
      redirectToLogin: false,
    };
  }
  if (!data.user) return { ok: false, message: "Supabase tidak mengembalikan data akun setelah pendaftaran.", redirectToLogin: false };

  // Supabase may return a successful-looking response with no identities when
  // email enumeration protection is enabled and the address already exists.
  if (data.user.identities?.length === 0) {
    return {
      ok: false,
      message: "Email sudah terdaftar. Silakan masuk menggunakan email tersebut atau gunakan email lain.",
      redirectToLogin: false,
    };
  }

  // An auth.users trigger creates the profile when email confirmation is enabled.
  // Verify that the trigger created it when sign-up returns an authenticated session.
  if (data.session) {
    const { data: profile, error: profileError } = await getSupabaseClient()
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profileError) {
      return { ok: false, message: `Akun dibuat, tetapi profil gagal disimpan: ${profileError.message}`, redirectToLogin: false };
    }
    if (!profile) {
      return { ok: false, message: "Akun dibuat, tetapi profil belum tersedia. Terapkan migrasi trigger profil Supabase.", redirectToLogin: false };
    }
    cacheSession({ name: name.trim(), email: normalizedEmail, role: "warga" });
  }

  return {
    ok: true,
    redirectToLogin: Boolean(data.session),
    message: data.session
      ? "Pendaftaran berhasil. Profil warga telah tersimpan."
      : "Akun berhasil dibuat. Periksa email untuk mengonfirmasi akun sebelum masuk.",
  };
}

export async function signInDemoAccount({ identifier, password }: DemoCredentials): Promise<{ ok: boolean; message: string; role?: string }> {
  const normalizedEmail = identifier.trim().toLowerCase();
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });
  if (error) return { ok: false, message: error.message };
  if (!data.user) return { ok: false, message: "Supabase tidak mengembalikan data akun setelah masuk." };

  const { data: profile, error: profileError } = await getSupabaseClient()
    .from("profiles")
    .select("nama,email,role,is_active")
    .eq("id", data.user.id)
    .single();
  if (profileError) {
    // Do not make the login error wait for a second network request.
    void getSupabaseClient().auth.signOut();
    return {
      ok: false,
      message: `Login berhasil, tetapi data profil tidak dapat diambil berdasarkan ID akun (${data.user.id}). Pastikan id di profiles sama dengan auth.users.id dan kebijakan SELECT RLS mengizinkan pemilik membaca profil. Detail: ${profileError.message}`,
    };
  }
  if (profile.is_active === false) {
    await getSupabaseClient().auth.signOut();
    clearDemoSession();
    return { ok: false, message: "akun anda telah di nonaktifkan karena melanggar ketentuan" };
  }
  const metadataName = data.user.user_metadata?.nama;
  const role = typeof profile.role === "string"
    ? profile.role.trim().toLowerCase().replace(/[\s-]+/g, "_")
    : "warga";
  const session = {
    name: typeof profile.nama === "string" && profile.nama.trim()
      ? profile.nama
      : typeof metadataName === "string" ? metadataName : "Warga",
    email: typeof profile.email === "string" && profile.email.trim()
      ? profile.email
      : data.user.email || normalizedEmail,
    role,
  };
  cacheSession(session);
  return { ok: true, message: "Berhasil masuk.", role };
}

export async function startGoogleSignIn(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/google/callback`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) throw error;
}

export async function completeGoogleSignIn(): Promise<{ ok: boolean; message: string; role?: string }> {
  const supabase = getSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { ok: false, message: "Sesi Google tidak ditemukan. Silakan coba masuk kembali." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("nama,email,role,is_active")
    .eq("id", user.id)
    .single();
  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { ok: false, message: "Login Google berhasil, tetapi profil akun belum dapat dimuat. Silakan hubungi admin." };
  }
  if (profile.is_active === false) {
    await supabase.auth.signOut();
    clearDemoSession();
    return { ok: false, message: "Akun Anda dinonaktifkan. Silakan hubungi admin." };
  }

  const metadata = user.user_metadata;
  const metadataName = metadata?.full_name ?? metadata?.name ?? metadata?.nama;
  const role = typeof profile.role === "string"
    ? profile.role.trim().toLowerCase().replace(/[\s-]+/g, "_")
    : "warga";
  cacheSession({
    name: typeof profile.nama === "string" && profile.nama.trim()
      ? profile.nama
      : typeof metadataName === "string" && metadataName.trim() ? metadataName : "Warga",
    email: typeof profile.email === "string" && profile.email.trim() ? profile.email : user.email ?? "",
    role,
  });
  return { ok: true, message: "Berhasil masuk dengan Google.", role };
}

export function getDemoSessionName(): string | null {
  return getDemoSession()?.name ?? null;
}

export function getDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { name?: unknown; email?: unknown; role?: unknown };
    if (typeof session.name !== "string" || !session.name.trim() || typeof session.email !== "string") return null;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    sessionStorage.removeItem(SESSION_KEY);
    return {
      name: session.name,
      email: session.email,
      role: typeof session.role === "string" ? session.role : undefined,
    };
  } catch {
    return null;
  }
}

function cacheSession(session: DemoSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("laporkota:session-changed"));
}

export function clearDemoSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("laporkota:session-changed"));
}

export async function updateDemoProfile(profile: DemoSession): Promise<void> {
  const { data: { user }, error: userError } = await getSupabaseClient().auth.getUser();
  if (userError || !user) throw new Error("Sesi pengguna tidak ditemukan. Silakan masuk kembali.");

  const { error } = await getSupabaseClient()
    .from("profiles")
    .update({ nama: profile.name.trim() })
    .eq("id", user.id);
  if (error) throw error;
  const currentSession = getDemoSession();
  cacheSession({ name: profile.name.trim(), email: user.email ?? profile.email, role: currentSession?.role });
}

export async function signOutDemoAccount(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw error;
  clearDemoSession();
}