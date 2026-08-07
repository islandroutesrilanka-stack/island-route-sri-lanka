import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getAdminUser();
  if (!user) redirect("/admin/login");

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-deep px-5">
        <div className="max-w-md border border-copper/40 bg-copper/10 p-8 text-sand/85">
          <p className="font-display text-2xl text-sand">Almost there</p>
          <p className="mt-3 text-sm leading-relaxed">
            You&apos;re signed in as <strong>{user.email}</strong>, but this
            account isn&apos;t an admin yet. Run this in the Supabase SQL
            editor, then refresh:
          </p>
          <pre className="mt-4 overflow-x-auto bg-deep/70 p-3 text-xs text-copper-light">
{`update public.profiles
set role = 'admin'
where email = '${user.email}';`}
          </pre>
        </div>
      </div>
    );
  }

  return <AdminShell email={user.email ?? ""}>{children}</AdminShell>;
}
