import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

/**
 * Anonymous (cookie-less) client for public content fetching.
 * Safe to use in cached/ISR server components. Null when unconfigured.
 */
export function getAnonSupabase(): SupabaseClient | null {
  if (!url || !anon) return null;
  return createClient(url, anon, { auth: { persistSession: false } });
}

/**
 * Cookie-aware client for auth contexts (admin layout, server actions).
 * Makes the route dynamic. Null when unconfigured.
 */
export function getServerSupabase(): SupabaseClient | null {
  if (!url || !anon) return null;
  const cookieStore = cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (all: CookieToSet[]) => {
        try {
          all.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // called from a Server Component — middleware refreshes sessions
        }
      },
    },
  });
}

/** Current user + admin flag, for protecting admin routes. */
export async function getAdminUser() {
  const sb = getServerSupabase();
  if (!sb) return { user: null, isAdmin: false };
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { user: null, isAdmin: false };
  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return { user, isAdmin: profile?.role === "admin" };
}
