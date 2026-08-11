import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/supabase/server";

/**
 * On-demand revalidation, triggered by the admin after a successful save.
 *
 * WHY THIS EXISTS AT ALL
 * Public pages use `revalidate = 60`, so a settings change could take a minute
 * to appear. The admin settings screen is a client component that writes
 * straight to Supabase, so there is no server action to hang `revalidatePath`
 * on — this is the smallest server-side surface that closes the gap.
 *
 * WHY IT IS NOT AN OPEN ENDPOINT
 * Authorisation reuses `getAdminUser()`, the same check the admin dashboard
 * itself relies on: it reads the caller's Supabase session from cookies and
 * confirms `profiles.role = 'admin'`. There is no shared secret to leak, no
 * bearer token in the browser bundle, and no service-role key anywhere near
 * this file. An anonymous POST gets 401 and nothing is revalidated.
 *
 * Cost of abuse is therefore bounded to what a signed-in admin could already do
 * by editing content, and the work itself is a cache purge, not a mutation.
 */
export async function POST() {
  const { isAdmin } = await getAdminUser();

  if (!isAdmin) {
    return NextResponse.json(
      { ok: false, error: "Not authorised." },
      { status: 401 }
    );
  }

  /*
    "layout" scope, not "page": site settings feed the header, footer and
    metadata through the root layout as well as the homepage hero, so purging
    the page alone would leave a stale phone number in the footer while the
    hero updated.
  */
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, revalidatedAt: Date.now() });
}
