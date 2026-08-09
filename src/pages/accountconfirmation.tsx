import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const logo = "/website-assets/mlpekayouwiki3.webp";

export default function AccountConfirmation() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Confirming your account...");

  useEffect(() => {
    setMessage("Account confirmed! Redirecting...");

    const timer = setTimeout(() => {
      navigate("/");
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#090a0a] text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* TECH GRID */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,212,0,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,212,0,.025) 1px, transparent 1px)
          `,
          backgroundSize: "42px 42px",
        }}
      />

      {/* GOLD AMBIENT GLOW */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFD400]/[0.035] blur-[120px]" />

      {/* CORNER ACCENTS */}
      <div className="pointer-events-none absolute left-4 top-4 h-16 w-16 border-l border-t border-[#FFD400]/30" />
      <div className="pointer-events-none absolute right-4 top-4 h-16 w-16 border-r border-t border-[#FFD400]/15" />
      <div className="pointer-events-none absolute bottom-4 left-4 h-16 w-16 border-b border-l border-[#FFD400]/15" />
      <div className="pointer-events-none absolute bottom-4 right-4 h-16 w-16 border-b border-r border-[#FFD400]/30" />

      {/* SYSTEM CARD */}
      <div className="relative w-full max-w-md border border-white/[0.08] bg-[#101212]/95 shadow-[0_30px_100px_rgba(0,0,0,.65)] backdrop-blur-xl">
        {/* TOP SYSTEM BAR */}
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c0e0e] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-[#FFD400] shadow-[0_0_10px_rgba(255,212,0,.9)]" />

            <span className="font-mono text-[7px] font-bold uppercase tracking-[0.25em] text-[#FFD400]/60">
              MLPEKAYOU
            </span>
          </div>

          <span className="font-mono text-[6px] uppercase tracking-[0.2em] text-white/20">
            AUTH MODULE 01
          </span>
        </div>

        {/* CONTENT */}
        <div className="relative px-6 pb-7 pt-10 sm:px-10">
          {/* LOGO */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <div className="flex h-16 w-16 items-center justify-center border border-[#FFD400]/35 bg-[#171919] shadow-[0_0_30px_rgba(255,212,0,.08)]">
              <img
                src={logo}
                alt="MLPEKAYOU"
                className="h-11 w-auto object-contain"
              />
            </div>
          </div>

          {/* STATUS */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]" />

            <span className="font-mono text-[7px] font-bold uppercase tracking-[0.25em] text-emerald-400/70">
              SYSTEM VERIFIED
            </span>
          </div>

          {/* TITLE */}
          <div className="text-center">
            <div className="mb-2 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#FFD400]/25" />

              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.3em] text-[#FFD400]/50">
                IDENTITY PROTOCOL
              </span>

              <span className="h-px w-8 bg-[#FFD400]/25" />
            </div>

            <h1 className="font-['Oxanium'] text-2xl font-black uppercase tracking-[0.08em] text-[#f5d37a]">
              Account Confirmed
            </h1>

            <div className="mx-auto mt-3 h-px w-16 bg-[#FFD400] shadow-[0_0_10px_rgba(255,212,0,.7)]" />
          </div>

          {/* STATUS PANEL */}
          <div className="mt-7 border border-white/[0.07] bg-[#0b0d0d]">
            <div className="flex items-center justify-between border-b border-white/[0.05] px-3 py-2">
              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.2em] text-white/25">
                AUTHENTICATION STATUS
              </span>

              <span className="font-mono text-[6px] uppercase tracking-[0.15em] text-emerald-400/60">
                COMPLETE
              </span>
            </div>

            <div className="px-4 py-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-emerald-400/25 bg-emerald-400/[0.04]">
                <span className="text-lg text-emerald-400">✓</span>
              </div>

              <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/45">
                {message}
              </p>
            </div>
          </div>

          {/* PROGRESS */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[5px] uppercase tracking-[0.18em] text-white/20">
                INITIALIZING SESSION
              </span>

              <span className="font-mono text-[5px] uppercase tracking-[0.15em] text-[#FFD400]/45">
                100%
              </span>
            </div>

            <div className="h-1 overflow-hidden bg-white/[0.06]">
              <div className="h-full w-full bg-[#FFD400] shadow-[0_0_12px_rgba(255,212,0,.6)]" />
            </div>
          </div>

          {/* BUTTON */}
          <button
            disabled
            className="mt-6 flex w-full items-center justify-center gap-2 border border-[#FFD400]/20 bg-[#151717] px-4 py-3 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-[#FFD400]/60"
          >
            <span className="h-1.5 w-1.5 animate-pulse bg-[#FFD400]" />
            Redirecting to Collection System...
          </button>
        </div>

        {/* BOTTOM SYSTEM BAR */}
        <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#0c0e0e] px-4 py-2">
          <span className="font-mono text-[5px] uppercase tracking-[0.18em] text-white/15">
            SECURE CONNECTION
          </span>

          <div className="flex items-center gap-2">
            <span className="h-1 w-1 bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,.8)]" />

            <span className="font-mono text-[5px] uppercase tracking-[0.16em] text-emerald-400/45">
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}