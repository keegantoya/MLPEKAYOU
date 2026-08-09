import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface CollectionCardProps {
  id: string;
  title: string;
  setName?: string;
  imageUrl: string;
  totalCards: number;
  progress?: number;
  showProgress?: boolean;
}

const CollectionCard = ({
  id,
  title,
  setName,
  imageUrl,
  totalCards,
  progress = 0,
  showProgress = true,
}: CollectionCardProps) => {
  const navigate = useNavigate();
  const [showAccessWarning, setShowAccessWarning] = useState(false);

  const getLink = () => {
    switch (id) {
      case "1":
        return "/moon-one";
      case "2":
        return "/moon-two";
      case "5":
        return "/rainbow-one";
      case "3":
        return "/moon-three";
      case "4":
        return "/star-one";
      case "6":
      case "rainbow2":
        return "/rainbow-two";
      case "tcg":
        return "/fantasy-wonderland";
      case "friendshipsbegin":
        return "/friendships-begin";
      case "9":
        return "/promotional-cards";
      case "7":
        return "/fun-moments-one";
      case "8":
        return "/fun-moments-two";
      case "11":
        return "/fun-moments-three";
      case "12":
        return "/discord";
      case "OTHERMERCH":
        return "/leaping-ponies";
      default:
        return `/collection/${id}`;
    }
  };

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      e.preventDefault();
      setShowAccessWarning(true);
    }
  };

  const safeProgress = Math.min(100, Math.max(0, progress));

  const collectedCards = Math.min(
    totalCards,
    Math.round((safeProgress / 100) * totalCards)
  );

  if (showAccessWarning) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#050707]/95 px-4 backdrop-blur-md">
        {/* TECH GRID */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.3]"
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

        {/* ACCESS PANEL */}
        <div className="relative w-[92%] max-w-lg overflow-hidden border border-white/[0.10] bg-[#080b0b] shadow-[0_30px_100px_rgba(0,0,0,.8)]">
          <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#050707] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-red-400 shadow-[0_0_10px_rgba(248,113,113,.9)]" />
              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.3em] text-red-400/80">
                ACCESS DENIED
              </span>
            </div>

            <span className="font-mono text-[6px] uppercase tracking-[0.22em] text-zinc-700">
              ASSET SECURITY
            </span>
          </div>

          <div className="relative p-6 sm:p-8">
            {/* CORNER BRACKETS */}
            <div className="pointer-events-none absolute left-0 top-0 h-10 w-10 border-l border-t border-[#FFD54A]/50" />
            <div className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r border-t border-[#FFD54A]/25" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 border-b border-l border-[#FFD54A]/20" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 border-b border-r border-[#FFD54A]/50" />

            {/* ACCESS CORE */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#FFD54A]/30 bg-[#FFD54A]/[0.06] shadow-[0_0_30px_rgba(255,212,74,.08)]">
              <div className="relative flex h-8 w-8 items-center justify-center border border-[#FFD54A]/70">
                <span className="absolute h-2 w-2 bg-[#FFD54A] shadow-[0_0_12px_#FFD54A]" />
                <span className="absolute inset-1 border border-[#FFD54A]/20" />
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="font-mono text-[6px] font-bold uppercase tracking-[0.35em] text-zinc-600">
                MLPEKAYOU COLLECTION SYSTEM
              </div>

              <h2 className="mt-2 font-['Oxanium'] text-2xl font-black uppercase tracking-[0.08em] text-white sm:text-3xl">
                Account Denied
              </h2>

              <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#FFD54A]/70 to-transparent" />
            </div>

            <div className="mt-6 border border-white/[0.07] bg-[#050707] px-5 py-4 text-center">
              <div className="font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                Protected Assets
              </div>

              <p className="mt-2 font-mono text-[7px] uppercase leading-5 tracking-[0.07em] text-zinc-600">
                You cannot access collection assets without an account.
                Please sign in or create an account to continue.
              </p>
            </div>

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

            <div className="mt-5 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-white/[0.06]" />
              <span className="font-mono text-[5px] uppercase tracking-[0.3em] text-zinc-700">
                SECURE ASSET GATE
              </span>
              <span className="h-px w-8 bg-white/[0.06]" />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#050707] px-4 py-2">
            <span className="font-mono text-[5px] uppercase tracking-[0.2em] text-zinc-700">
              STATUS: UNAUTHORIZED
            </span>

            <span className="font-mono text-[5px] uppercase tracking-[0.2em] text-[#FFD54A]/40">
              MLPEKAYOU // ASSET SYSTEM
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={getLink()}
      onClick={handleClick}
      className="group relative block overflow-hidden rounded-md border border-white/[0.08] bg-[#080b0b] shadow-[0_12px_35px_rgba(0,0,0,.42)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d4af37]/45 hover:shadow-[0_18px_45px_rgba(0,0,0,.6)]"
    >
      {/* IMAGE */}
      <div className="relative aspect-[5/7] overflow-hidden rounded-md bg-[#050707]">
        <img
          src={imageUrl}
          alt={title}
          draggable={false}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.025]"
        />

        {/* Subtle image shading */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/45 to-transparent" />

        {/* Technical corners */}
        <div className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 border-l border-t border-[#d4af37]/45 transition-colors duration-300 group-hover:border-[#d4af37]/80" />

        <div className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 border-r border-t border-[#d4af37]/45 transition-colors duration-300 group-hover:border-[#d4af37]/80" />

        {/* Collection readout */}
        {showProgress && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-md border border-white/10 bg-[#111]/75 px-2 py-1 backdrop-blur-sm">
            <span className="font-['Oxanium'] text-[9px] font-bold tracking-[0.04em] text-[#d4af37]">
              {Math.round(safeProgress)}%
            </span>

            <span className="h-2.5 w-px bg-white/15" />

            <span className="font-['Oxanium'] text-[8px] font-medium tracking-[0.03em] text-white/55">
              {collectedCards}/{totalCards}
            </span>
          </div>
        )}
      </div>

      {/* TITLE AREA */}
      <div className="px-3.5 pb-3 pt-2.5">
        {setName && (
          <div className="mb-1 flex items-center gap-1.5">
            <span className="h-px w-4 bg-[#d4af37]/55" />

            <span
              className="font-['Oxanium'] text-[9px] font-semibold uppercase tracking-[0.12em] text-[#d4af37]"
              style={{
                textShadow: "0 2px 8px rgba(0,0,0,.35)",
              }}
            >
              {setName}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <h2 className="min-w-0 truncate font-['Oxanium'] text-[12px] font-black uppercase tracking-[0.04em] text-white">
            {title}
          </h2>

          <span className="shrink-0 font-['Oxanium'] text-[10px] text-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#d4af37]">
            →
          </span>
        </div>

        {/* PROGRESS BAR */}
        {showProgress && (
          <div className="mt-2.5">
            <div className="relative h-1 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#a98520] via-[#d4af37] to-[#e7c85c] shadow-[0_0_7px_rgba(212,175,55,0.25)] transition-all duration-500"
                style={{
                  width: `${safeProgress}%`,
                }}
              />

              <div className="pointer-events-none absolute inset-0 flex justify-between">
                {Array.from({ length: 8 }).map((_, index) => (
                  <span
                    key={index}
                    className="h-full w-px bg-[#181818]/45"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HOVER ACCENT */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-[#d4af37]/70 transition-all duration-300 group-hover:w-1/3" />
    </Link>
  );
};

export default CollectionCard;