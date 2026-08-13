"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MotionConfig, motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function AdminLogin() {
  const sb = getBrowserSupabase();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sb) return;
    setLoading(true);
    setError(null);
    const { error } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    /* framer-motion no longer loads from the root layout, so the reduced-motion
       contract travels with the surfaces that use it. */
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen items-center justify-center bg-deep px-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md border border-sand/10 bg-palm/30 p-8 md:p-10"
        >
          <p className="font-display text-3xl text-sand">Island Route</p>
          <p className="eyebrow text-copper-light mt-1">Admin console</p>

          {!sb ? (
            <div className="mt-8 border border-copper/40 bg-copper/10 p-5 text-sm leading-relaxed text-sand/80">
              <p className="font-semibold text-sand mb-2">
                Backend not connected yet
              </p>
              <p>
                Add your Supabase keys to{" "}
                <code className="bg-deep/60 px-1.5 py-0.5">.env.local</code> and
                restart the server. Full instructions are in{" "}
                <code className="bg-deep/60 px-1.5 py-0.5">SETUP.md</code>.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-4">
              <div>
                <label
                  className="eyebrow text-sand/50 block mb-1.5"
                  htmlFor="al-email"
                >
                  Email
                </label>
                <input
                  id="al-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-sand/20 bg-deep/40 px-4 py-3 text-[15px] text-sand placeholder:text-sand/30 focus:outline-none focus:border-copper-light"
                  placeholder="you@islandroute.lk"
                />
              </div>
              <div>
                <label
                  className="eyebrow text-sand/50 block mb-1.5"
                  htmlFor="al-pass"
                >
                  Password
                </label>
                <input
                  id="al-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-sand/20 bg-deep/40 px-4 py-3 text-[15px] text-sand focus:outline-none focus:border-copper-light"
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <p className="border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2.5 bg-copper px-6 py-3.5 text-[13px] uppercase tracking-[0.16em] text-sand hover:bg-copper-light transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Lock size={15} />
                )}
                Sign in
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </MotionConfig>
  );
}
