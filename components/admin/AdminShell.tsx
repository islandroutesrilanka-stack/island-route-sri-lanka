"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarRange,
  Inbox,
  MessageSquare,
  Map,
  MapPin,
  Briefcase,
  Car,
  Users,
  Star,
  Newspaper,
  Images,
  ImagePlus,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: Inbox },
  { href: "/admin/calendar", label: "Availability", icon: CalendarRange },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/content/tours", label: "Tours", icon: Map },
  { href: "/admin/content/destinations", label: "Destinations", icon: MapPin },
  { href: "/admin/content/services", label: "Services", icon: Briefcase },
  { href: "/admin/content/vehicles", label: "Fleet", icon: Car },
  { href: "/admin/content/drivers", label: "Drivers", icon: Users },
  { href: "/admin/content/reviews", label: "Reviews", icon: Star },
  { href: "/admin/content/posts", label: "Blog", icon: Newspaper },
  { href: "/admin/content/gallery", label: "Gallery", icon: Images },
  /* Page furniture rather than a content type: the photographs behind the
     headers, the region tiles and the closing band, none of which is a row in
     any table. See lib/media/slots.ts. */
  { href: "/admin/images", label: "Images", icon: ImagePlus },
  { href: "/admin/settings", label: "Site & SEO", icon: Settings },
];

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await getBrowserSupabase()?.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const NavLinks = () => (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      {nav.map((n) => {
        const active =
          n.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 text-[13px] tracking-wide transition-colors ${
              active
                ? "bg-copper/15 text-copper-light"
                : "text-sand/60 hover:text-sand hover:bg-sand/5"
            }`}
          >
            <n.icon size={16} strokeWidth={1.8} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-sand lg:flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col bg-deep sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-sand/10">
          <p className="font-display text-xl text-sand">Island Route</p>
          <p className="eyebrow text-copper-light mt-0.5">Admin</p>
        </div>
        <NavLinks />
        <div className="border-t border-sand/10 px-4 py-4 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-2 text-[12px] text-sand/50 hover:text-sand"
          >
            <ExternalLink size={14} /> View site
          </Link>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2.5 px-2 text-[12px] text-sand/50 hover:text-copper-light"
          >
            <LogOut size={14} /> Sign out ({email.split("@")[0]})
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-deep px-4 py-3">
        <p className="font-display text-lg text-sand">
          Island Route{" "}
          <span className="text-copper-light text-xs uppercase tracking-widest ml-1">
            Admin
          </span>
        </p>
        <button onClick={() => setOpen((v) => !v)} className="p-2 text-sand">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-deep pt-14 flex flex-col">
          <NavLinks />
          <div className="border-t border-sand/10 px-6 py-4">
            <button
              onClick={signOut}
              className="flex items-center gap-2.5 text-[13px] text-sand/60"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 min-w-0 px-5 py-8 md:px-10 md:py-10">
        {children}
      </main>
    </div>
  );
}
