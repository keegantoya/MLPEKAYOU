import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<
    Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] | undefined
  >(undefined);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setUser(session?.user ?? null);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Loading state
  if (user === undefined) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#050707]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,212,74,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,74,.035) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(255,255,255,.025)_4px)]" />

        <div className="relative flex items-center gap-3 border border-[#FFD54A]/20 bg-[#080b0b] px-5 py-4 shadow-[0_20px_70px_rgba(0,0,0,.7)]">
          <span className="h-2 w-2 animate-pulse bg-[#FFD54A] shadow-[0_0_12px_#FFD54A]" />

          <div>
            <div className="font-['Oxanium'] text-[9px] font-black uppercase tracking-[0.2em] text-white">
              AUTHENTICATING
            </div>
            <div className="mt-1 font-mono text-[6px] uppercase tracking-[0.22em] text-zinc-600">
              VERIFYING SESSION // PLEASE WAIT
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#050707] px-4">
        {/* TECH GRID */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.32]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,212,74,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,74,.035) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* SCANLINES */}
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(255,255,255,.025)_4px)]" />

        {/* AMBIENT GLOW */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFD54A]/[0.025] blur-3xl" />

        {/* AUTH PANEL */}
        <div className="relative w-full max-w-md overflow-hidden border border-white/[0.10] bg-[#080b0b] shadow-[0_30px_100px_rgba(0,0,0,.78)]">
          {/* TOP STATUS BAR */}
          <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#050707] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-red-400 shadow-[0_0_10px_rgba(248,113,113,.9)]" />

              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.3em] text-red-400/80">
                AUTHORIZATION REQUIRED
              </span>
            </div>

            <span className="font-mono text-[6px] uppercase tracking-[0.2em] text-zinc-700">
              ACCESS NODE 01
            </span>
          </div>

          {/* MAIN PANEL */}
          <div className="relative px-6 py-7 sm:px-8 sm:py-9">
            {/* CORNER BRACKETS */}
            <div className="pointer-events-none absolute left-0 top-0 h-10 w-10 border-l border-t border-[#FFD54A]/50" />
            <div className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r border-t border-[#FFD54A]/25" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 border-b border-l border-[#FFD54A]/20" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 border-b border-r border-[#FFD54A]/50" />

            {/* ACCESS CORE */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#FFD54A]/30 bg-[#FFD54A]/[0.06] shadow-[0_0_30px_rgba(255,212,74,.08)]">
              <div className="relative flex h-7 w-7 items-center justify-center border border-[#FFD54A]/70">
                <span className="absolute h-1.5 w-1.5 bg-[#FFD54A] shadow-[0_0_10px_#FFD54A]" />
                <span className="absolute inset-1 border border-[#FFD54A]/20" />
              </div>
            </div>

            {/* TITLE */}
            <div className="mt-6 text-center">
              <div className="font-mono text-[6px] font-bold uppercase tracking-[0.35em] text-zinc-600">
                COLLECTION SYSTEM
              </div>

              <h2 className="mt-2 font-['Oxanium'] text-2xl font-black uppercase tracking-[0.08em] text-white sm:text-3xl">
                Access Denied
              </h2>

              <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-[#FFD54A]/70 to-transparent" />
            </div>

            {/* MESSAGE */}
            <div className="mt-6 border border-white/[0.07] bg-[#050707] px-4 py-4 text-center">
              <p className="font-mono text-[9px] uppercase leading-5 tracking-[0.06em] text-zinc-300">
                You're not logged in.
              </p>

              <p className="mt-2 font-mono text-[7px] uppercase leading-5 tracking-[0.08em] text-zinc-600">
                Assets are now locked behind a log-in wall due to AI scraping.
              </p>
            </div>

            {/* RETURN */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group relative mt-5 w-full overflow-hidden border border-[#FFD54A]/60 bg-[#FFD54A] px-4 py-3 font-['Oxanium'] text-[10px] font-black uppercase tracking-[0.2em] text-[#090b0d] transition-all duration-200 hover:bg-[#FFE27A] hover:shadow-[0_0_30px_rgba(255,212,74,.18)]"
            >
              <span className="absolute left-0 top-0 h-px w-10 bg-white/80" />
              <span className="absolute bottom-0 right-0 h-px w-10 bg-black/30" />

              <span className="flex items-center justify-center gap-3">
                <span>RETURN TO HOMEPAGE</span>
                <span className="text-sm transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </button>

            {/* SYSTEM FOOTER */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-white/[0.06]" />

              <span className="font-mono text-[5px] uppercase tracking-[0.3em] text-zinc-700">
                SECURE SESSION GATE
              </span>

              <span className="h-px w-8 bg-white/[0.06]" />
            </div>
          </div>

          {/* BOTTOM STATUS */}
          <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#050707] px-4 py-2">
            <span className="font-mono text-[5px] uppercase tracking-[0.2em] text-zinc-700">
              AUTH STATUS: DENIED
            </span>

            <span className="font-mono text-[5px] uppercase tracking-[0.2em] text-[#FFD54A]/40">
              MLPEKAYOU // SYSTEM
            </span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}