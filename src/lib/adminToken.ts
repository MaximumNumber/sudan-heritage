import { supabase } from "@/lib/supabase";

export async function serverLogin(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function serverLogout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function serverChangePassword(
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getSupabaseSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (loggedIn: boolean) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(!!session);
  });
  return data.subscription;
}

export function getSessionToken(): string | null {
  return null;
}

export function adminHeaders(): Record<string, string> {
  return {};
}

export function clearSessionToken(): void {}
