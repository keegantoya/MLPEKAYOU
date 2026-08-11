import React, { useEffect, useState } from "react";

type HomeTab = "updates" | "tutorial" | "resources" | "partnership";

export default function Index() {
  const [activeTab, setActiveTab] = useState<HomeTab>("updates");
  const [showUpdateNotice, setShowUpdateNotice] = useState(false);

  useEffect(() => {
    const hasSeenUpdateNotice = localStorage.getItem(
      "mlpekayou-ui-overhaul-notice"
    );

    if (!hasSeenUpdateNotice) {
      setShowUpdateNotice(true);
    }
  }, []);

  const dismissUpdateNotice = () => {
    localStorage.setItem("mlpekayou-ui-overhaul-notice", "true");
    setShowUpdateNotice(false);
  };

  return (
    <>
      {showUpdateNotice && (
        <div className="fixed inset-x-0 top-[88px] bottom-3 z-[9999] flex items-center justify-center px-3 sm:top-[110px] sm:bottom-4 sm:px-4">
          <div className="relative w-full max-w-md overflow-hidden border border-[#E7C84B]/50 bg-[#111111] shadow-[0_0_45px_rgba(231,200,75,0.14)]">

            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(231,200,75,0.035) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(231,200,75,0.035) 1px, transparent 1px)
                `,
                backgroundSize: "24px 24px",
              }}
            />

            <div className="pointer-events-none absolute left-0 top-0 h-full w-[2px] bg-[#E7C84B]" />

            <span className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l border-t border-[#E7C84B]" />
            <span className="pointer-events-none absolute right-0 top-0 h-5 w-5 border-r border-t border-[#E7C84B]/60" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b border-l border-[#E7C84B]/60" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b border-r border-[#E7C84B]" />

            <div className="relative p-3 sm:p-5">

              <div className="flex items-center gap-2">
                <div className="h-2 w-2 shrink-0 bg-[#E7C84B] shadow-[0_0_8px_#E7C84B]" />

                <span className="font-oxanium text-[7px] font-bold uppercase tracking-[0.28em] text-[#E7C84B]">
                  SYSTEM UPDATE
                </span>

                <div className="h-px flex-1 bg-[#E7C84B]/20" />

                <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-zinc-400">
                  NOTICE 01
                </span>
              </div>

              <h2 className="mt-3 font-oxanium text-lg font-black tracking-[0.05em] text-white sm:text-xl">
                UPDATE NOTIFICATION
              </h2>

              <div className="mt-2 h-px w-full bg-gradient-to-r from-[#E7C84B] via-[#E7C84B]/30 to-transparent" />

              <div className="mt-3 space-y-2 text-[10px] leading-[1.45] text-zinc-300 sm:text-[11px]">

                <p>
                  <span className="font-semibold text-white">MLPEKAYOU</span>{" "}
                  has received a complete UI overhaul in addition to improving
                  efficiency across pages.
                </p>

                <p>
                  <span className="font-semibold text-[#E7C84B]">
                    No pages have been merged or moved.
                  </span>{" "}
                  The only changes made were on the backend, or changing the
                  website&apos;s UI. Everything is still exactly where it was
                  before; it just looks different.
                </p>

                <p>
                  I have been working on this update since the day Kayou US
                  updated their website.
                </p>

                <div className="border-l-2 border-[#E7C84B] bg-[#E7C84B]/5 px-3 py-2">
                  If anything about the website ever confuses you, please reach
                  out to anybody in the MLPEKAYOU Discord Server. Over{" "}
                  <span className="font-bold text-white">1,000 users</span>{" "}
                  reside in the server and can help explain anything you
                  don&apos;t understand!
                </div>

                <a
                  href="https://discord.gg/mlpekayou"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[#E7C84B] transition-colors hover:text-white"
                >
                  <span className="h-1 w-1 bg-[#E7C84B] shadow-[0_0_6px_#E7C84B]" />
                  discord.gg/mlpekayou
                  <span className="text-white/30">↗</span>
                </a>
              </div>

              <button
                onClick={dismissUpdateNotice}
                className="mt-3 w-full border border-[#E7C84B] bg-[#E7C84B] px-4 py-2.5 font-oxanium text-[10px] font-black uppercase tracking-[0.2em] text-[#111111] transition-all duration-200 hover:bg-[#fff1a8]"
              >
                Acknowledge Update
              </button>

              <div className="mt-1.5 text-center font-mono text-[7px] uppercase tracking-[0.18em] text-zinc-400">
                MLPEKAYOU // SYSTEM UPDATE
              </div>

            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#111111] text-white">

      {/* Top Banner */}
      <section className="relative overflow-hidden border-b border-yellow-400/15 bg-[#171717]">

        {/* Background glow */}
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />

          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(250,204,21,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(250,204,21,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-3 py-7 sm:px-5 sm:py-8 md:px-8 md:py-10">

          <div className="text-center">
            <p className="mb-2 font-oxanium text-[10px] uppercase tracking-[0.28em] text-yellow-400 sm:text-xs sm:tracking-[0.45em] md:tracking-[0.6rem]">
              Welcome To
            </p>

<h1 className="font-oxanium text-[clamp(2rem,10vw,3rem)] font-black uppercase tracking-[clamp(0.08em,2vw,0.3rem)] text-white">
  MLPEKAYOU
</h1>

<p className="mt-2 font-oxanium text-[clamp(9px,2.5vw,10px)] font-bold uppercase tracking-[0.12em] sm:tracking-[0.18em]">
  <span className="text-yellow-400">MY LITTLE PONY</span>{" "}
  <span className="text-white text-[clamp(10px,3vw,14px)]">ENGLISH</span>{" "}
  <span className="text-yellow-400">KAYOU</span>
</p>

            <div className="mx-auto mt-4 h-1 w-28 rounded-full bg-yellow-400 shadow-[0_0_20px_#facc15]" />

<a
  href="https://discord.gg/mlpekayou"
  target="_blank"
  rel="noopener noreferrer"
  className="group mx-auto mt-6 flex w-fit transition-transform duration-300 hover:scale-105"
>
  <img
    src="/website-assets/discordlogo.webp"
    alt="Join the MLPEKAYOU Discord"
    className="h-[clamp(42px,14vw,56px)] w-auto max-w-full drop-shadow-[0_0_20px_rgba(250,204,21,0.25)] transition-all duration-300 group-hover:drop-shadow-[0_0_35px_rgba(250,204,21,0.55)]"
  />
</a>
          </div>

{/* Tabs */}
<div className="mt-5 grid grid-cols-2 gap-1.5 sm:mt-8 sm:gap-3 lg:mt-10 lg:grid-cols-4">
  {[
    { id: "updates", label: "UPDATES" },
    { id: "tutorial", label: "TUTORIAL" },
    { id: "resources", label: "RESOURCES" },
    { id: "partnership", label: "PARTNERSHIP" },
  ].map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id as HomeTab)}
      className={`group relative min-w-0 overflow-hidden rounded-xl border px-2 py-3 font-oxanium text-[10px] font-bold uppercase tracking-[0.08em] transition-all duration-300 sm:px-4 sm:py-4 sm:text-xs sm:tracking-[0.15em] md:px-6 md:text-sm md:tracking-[0.25em] ${
        activeTab === tab.id
          ? "border-yellow-400 bg-[#201d0c] text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.35)]"
          : "border-[#343434] bg-[#181818] text-white hover:-translate-y-1 hover:border-yellow-400 hover:text-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.18)]"
      }`}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Scanning line */}
      <div className="absolute -left-full top-0 h-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />

      {/* Tech border glow */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-yellow-400/0 transition-all duration-300 group-hover:ring-yellow-400/40" />

      {/* Corner accents */}
      <span className="absolute left-2 top-2 h-2 w-2 border-l border-t border-yellow-400/40 transition-all duration-300 group-hover:border-yellow-300" />
      <span className="absolute right-2 top-2 h-2 w-2 border-r border-t border-yellow-400/40 transition-all duration-300 group-hover:border-yellow-300" />
      <span className="absolute bottom-2 left-2 h-2 w-2 border-b border-l border-yellow-400/40 transition-all duration-300 group-hover:border-yellow-300" />
      <span className="absolute bottom-2 right-2 h-2 w-2 border-b border-r border-yellow-400/40 transition-all duration-300 group-hover:border-yellow-300" />

      <span className="relative z-10">{tab.label}</span>
    </button>
  ))}
</div>

        </div>

      </section>

      {/* Tab Content */}
      <section className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
        <div className="rounded-xl border border-[#333] bg-[#1a1a1a] p-3 sm:rounded-2xl sm:p-5 md:p-8">
          {activeTab === "updates" && (
  <div className="space-y-6">

    {/* Critical Domain / Copyright Notice */}
    <div className="group relative overflow-hidden border border-red-500/70 bg-gradient-to-br from-red-950/70 via-[#151515] to-[#151515] shadow-[0_0_35px_rgba(239,68,68,0.18)]">

      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.045)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Moving Scan Line */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/2 top-0 h-full w-1/3 skew-x-[-25deg] bg-gradient-to-r from-transparent via-red-400/20 to-transparent animate-[scan_4s_linear_infinite]" />
      </div>

      {/* Accent Line */}
      <div className="absolute left-0 top-0 h-full w-[5px] bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.55)]" />

      {/* Corner Accents */}
      <div className="absolute left-0 top-0 h-7 w-7 border-l-2 border-t-2 border-red-500" />
      <div className="absolute right-0 top-0 h-7 w-7 border-r-2 border-t-2 border-red-500" />
      <div className="absolute bottom-0 left-0 h-7 w-7 border-b-2 border-l-2 border-red-500" />
      <div className="absolute bottom-0 right-0 h-7 w-7 border-b-2 border-r-2 border-red-500" />

      <div className="relative min-w-0 p-3 sm:p-5 md:p-8">

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-5 md:mb-6">

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center bg-red-500 text-[9px] font-black text-white shadow-[0_0_14px_rgba(239,68,68,0.55)]">
              !
            </div>

            <span className="font-oxanium text-[9px] font-bold uppercase tracking-[0.2em] text-red-400 sm:text-xs sm:tracking-[0.3em] md:tracking-[0.4em]">
              CRITICAL NOTICE
            </span>
          </div>

          <span className="shrink-0 border border-red-500/40 bg-red-950/40 px-2 py-1.5 font-oxanium text-[9px] uppercase tracking-[0.05em] text-red-300 sm:px-3 sm:text-[10px] sm:tracking-[0.08em] md:px-4 md:py-2 md:text-xs md:tracking-[0.2em]">
            08 / 11 / 2026
          </span>

        </div>

        <h2 className="font-oxanium text-[clamp(1.15rem,5vw,1.875rem)] font-black uppercase tracking-[0.04em] text-white sm:tracking-[0.08em] md:tracking-[0.12em]">
          Important Domain Update
        </h2>

        <div className="mt-4 h-px w-full bg-gradient-to-r from-red-500 via-red-500/40 to-transparent" />

        <div className="mt-4 space-y-4 text-[12px] leading-5 text-gray-300 sm:mt-5 sm:text-sm sm:leading-7 md:mt-6 md:text-[15px] md:leading-8">

          <p>
            On <span className="font-semibold text-white">08/11/2026</span>,
            <span className="font-semibold text-red-400"> MLPEKAYOU experienced a copyright strike</span>
            {" "}that caused the website to be down for several hours. After calling and emailing everyone possible, it became clear that the best course of action would be to temporarily rebrand the website&apos;s domain.
          </p>

          <div className="border-l-2 border-red-500 bg-red-500/5 px-3 py-3 sm:px-4">
            <p className="font-semibold text-red-400">
              MLPEKAYOU is still MLPEKAYOU.
            </p>

            <p className="mt-1.5 text-gray-300">
              I (Keegan) am partnered directly with Kayou US, so I know that Kayou did not initiate this strike. As for who did, that remains unclear.
            </p>
          </div>

          <p>
            Moving forward, the new domain for the time being will be{" "}
            <span className="font-bold text-white">mlpekayou.community</span>.
            {" "}The domain may or may not change back to{" "}
            <span className="font-semibold text-white">mlpekayou.com</span>
            {" "}if I am able to reobtain the rights to it. I would also like to iterate
            here that no user information was impacted. This was simply a copyright
            strike against the website's domain, and that is all. Everything is still
            exactly as it was before, just with a  
            <span className="font-bold text-white"> .community</span> domain instead of a 
            <span className="font-bold text-white"> .com</span> domain.
          </p>

          <p className="font-semibold text-white">
            UPDATE: The MLPEKAYOU.COM domain was restored and rights were given back. By using the .COM domain, you will automatically now be redirected to .COMMUNITY.
          </p>

        </div>

      </div>
    </div>

    <div className="group relative overflow-hidden border border-[#3a3a3a] bg-[#151515]">

      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Moving Scan Line */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/2 top-0 h-full w-1/3 skew-x-[-25deg] bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-[scan_5s_linear_infinite]" />
      </div>

      {/* Accent Line */}
      <div className="absolute left-0 top-0 h-full w-[4px] bg-yellow-400" />

      {/* Corner Accents */}
      <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-yellow-400" />
      <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-yellow-400" />
      <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-yellow-400" />
      <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-yellow-400" />

      <div className="relative min-w-0 p-3 sm:p-5 md:p-8">

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-5 md:mb-6">

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">

            <div className="h-3 w-3 bg-yellow-400 shadow-[0_0_12px_#facc15]" />

            <span className="font-oxanium text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-400 sm:text-xs sm:tracking-[0.3em] md:tracking-[0.4em]">
              ACCOUNT MAINTENANCE
            </span>

          </div>

          <span className="shrink-0 border border-[#404040] bg-[#1b1b1b] px-2 py-1.5 font-oxanium text-[9px] uppercase tracking-[0.05em] text-gray-400 sm:px-3 sm:text-[10px] sm:tracking-[0.08em] md:px-4 md:py-2 md:text-xs md:tracking-[0.2em]">
            08 / 10 / 2026
          </span>

        </div>

        <h2 className="font-oxanium text-[clamp(1.15rem,5vw,1.875rem)] font-black uppercase tracking-[0.04em] text-white sm:tracking-[0.08em] md:tracking-[0.12em]">
          Account Cleanup
        </h2>

        <div className="mt-4 h-px w-full bg-gradient-to-r from-yellow-400 via-yellow-400/30 to-transparent" />

        <div className="mt-4 space-y-4 text-[12px] leading-5 text-gray-300 sm:mt-5 sm:text-sm sm:leading-7 md:mt-6 md:text-[15px] md:leading-8">

          <p>
            As part of routine database maintenance, accounts that were{" "}
            <span className="font-semibold text-white">
              30 days or older with 0 collection progress
            </span>{" "}
            have been permanently deleted.
          </p>

          <p>
            Accounts that{" "}
            <span className="font-semibold text-white">
              never confirmed their email address
            </span>{" "}
            were also permanently deleted.
          </p>

          <div className="border-l-2 border-yellow-400 bg-yellow-400/5 px-3 py-3 sm:px-4">
            <p className="font-semibold text-yellow-400">
              Having trouble with confirmation or password reset emails?
            </p>

            <p className="mt-1.5 text-gray-300">
              You may need to mark the email as trusted and then refresh the
              page before the link will work properly.{" "}
              <span className="font-semibold text-white">
                Gmail in particular really hates us.
              </span>
            </p>
          </div>

        </div>

      </div>
    </div>

    <div className="group relative overflow-hidden border border-[#3a3a3a] bg-[#151515]">

      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Moving Scan Line */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/2 top-0 h-full w-1/3 skew-x-[-25deg] bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-[scan_5s_linear_infinite]" />
      </div>

      {/* Accent Line */}
      <div className="absolute left-0 top-0 h-full w-[4px] bg-yellow-400" />

      {/* Corner Accents */}
      <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-yellow-400" />
      <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-yellow-400" />
      <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-yellow-400" />
      <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-yellow-400" />

      <div className="relative min-w-0 p-3 sm:p-5 md:p-8">

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-5 md:mb-6">

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">

            <div className="h-3 w-3 bg-yellow-400 shadow-[0_0_12px_#facc15]" />

            <span className="font-oxanium text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-400 sm:text-xs sm:tracking-[0.3em] md:tracking-[0.4em]">
              UPDATE
            </span>

          </div>

          <span className="shrink-0 border border-[#404040] bg-[#1b1b1b] px-2 py-1.5 font-oxanium text-[9px] uppercase tracking-[0.05em] text-gray-400 sm:px-3 sm:text-[10px] sm:tracking-[0.08em] md:px-4 md:py-2 md:text-xs md:tracking-[0.2em]">

            08 / 07 / 2026
          </span>

        </div>

        <h2 className="font-oxanium text-[clamp(1.15rem,5vw,1.875rem)] font-black uppercase tracking-[0.04em] text-white sm:tracking-[0.08em] md:tracking-[0.12em]">
          Share Your Collection
        </h2>

        <div className="mt-4 h-px w-full bg-gradient-to-r from-yellow-400 via-yellow-400/30 to-transparent" />

        <p className="mt-4 max-w-4xl break-words text-[12px] leading-5 text-gray-300 sm:mt-5 sm:text-sm sm:leading-7 md:mt-6 md:text-[15px] md:leading-8">
          Click
          <span className="mx-2 border border-yellow-400 bg-yellow-400/10 px-2 py-1 font-semibold text-yellow-400">
            Share
          </span>
          in your profile to instantly create a public page that anyone can
          view. Share your
          <span className="font-semibold text-white"> ISO</span>,
          <span className="font-semibold text-white"> Wishlist</span>, and
          <span className="font-semibold text-white"> Trades</span> with
          collectors outside of MLPEKayou.
        </p>

      </div>

    </div>

  </div>
  
)}

{activeTab === "tutorial" && (
  <div className="space-y-5">

    {[
      {
        title: "Collections",
        href: "/collections",
        body: "Flip cards over to show their backs. That means you officially own that card.",
      },
      {
        title: "ISO & Wishlist",
        href: "/iso",
        body: "Your ISO builds automatically from cards you do not own. Hide sets you don't want to collect, make your ISO private, search every card by character or card code, and create a public wishlist. Collectors who only chase specific characters or individual cards typically disable their ISO and only use a wishlist.",
      },
      {
        title: "Inventory",
        href: "/inventory",
        body: "Mark cards as For Trade or For Sale and edit the quantity you own. Inventory is automatically set to 1 for owned cards. After making changes, scroll back to the top of the page and press Save before leaving.",
      },
      {
        title: "Binders",
        href: "/binders",
        body: "View every card organized into digital binders so you can browse your collection even when you're away from home. Missing cards leave empty spaces, making it easy to organize physical binders. You can also view other collectors' binders.",
      },
    ].map((item) => (
      <div
        key={item.title}
        className="group relative overflow-hidden border border-[#303030] bg-[#141414] transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(250,204,21,0.12)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />

        <div className="absolute left-0 top-0 h-full w-[3px] bg-yellow-400" />

        <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-yellow-400" />
        <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-yellow-400" />
        <div className="absolute bottom-0 left-0 h-5 w-5 border-l-2 border-b-2 border-yellow-400" />
        <div className="absolute bottom-0 right-0 h-5 w-5 border-r-2 border-b-2 border-yellow-400" />

        <div className="relative min-w-0 p-3 sm:p-5 md:p-7">

          <div className="flex min-w-0 items-center justify-between gap-3">
            <a
              href={item.href}
              className="break-words font-oxanium text-[clamp(1.05rem,5vw,1.5rem)] font-black uppercase tracking-[0.05em] text-yellow-400 transition hover:text-white sm:text-xl sm:tracking-[0.1em] md:text-2xl md:tracking-[0.15em]"
            >
              {item.title}
            </a>

            <div className="h-3 w-3 bg-yellow-400 shadow-[0_0_10px_#facc15]" />
          </div>

          <div className="mt-4 h-px w-full bg-gradient-to-r from-yellow-400 via-yellow-400/25 to-transparent" />

          <p className="mt-4 text-[13px] leading-6 text-gray-300 sm:mt-5 sm:text-sm sm:leading-7 md:leading-8">
            {item.body}
          </p>

        </div>
      </div>
    ))}

    <div className="group relative overflow-hidden border border-[#303030] bg-[#141414] transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(250,204,21,0.12)]">

      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="absolute left-0 top-0 h-full w-[3px] bg-yellow-400" />

      <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-yellow-400" />
      <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-yellow-400" />
      <div className="absolute bottom-0 left-0 h-5 w-5 border-l-2 border-b-2 border-yellow-400" />
      <div className="absolute bottom-0 right-0 h-5 w-5 border-r-2 border-b-2 border-yellow-400" />

      <div className="relative min-w-0 p-3 sm:p-5 md:p-7">

        <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <a
            href="/my-progress"
            className="break-words font-oxanium text-[clamp(1.15rem,6vw,1.5rem)] font-black uppercase tracking-[0.08em] text-yellow-400 hover:text-white sm:text-2xl sm:tracking-[0.15em]"
          >
            Progress CCG
          </a>

          <span className="hidden text-gray-600 sm:inline">/</span>

          <a
            href="/progress-tcg"
            className="break-words font-oxanium text-[clamp(1.15rem,6vw,1.5rem)] font-black uppercase tracking-[0.08em] text-yellow-400 hover:text-white sm:text-2xl sm:tracking-[0.15em]"
          >
            Progress TCG
          </a>
        </div>

        <div className="mt-4 h-px w-full bg-gradient-to-r from-yellow-400 via-yellow-400/25 to-transparent" />

        <p className="mt-4 text-[13px] leading-6 text-gray-300 sm:mt-5 sm:text-sm sm:leading-7 md:leading-8">
          See which sets you've mastered and track your overall completion
          separately for CCG and TCG collections.
        </p>

      </div>
    </div>

    {[
      {
        title: "Inbox",
        href: "/inbox",
        body: "Accept friend requests, view your friends' ISO, Wishlist, and Trades, and privately message other collectors. Friend requests are sent from Explore.",
      },
      {
        title: "Explore",
        href: "/explore",
        body: "Search for any collector on MLPEKayou, send friend requests, view their profile, collection statistics, binders, and more.",
      },
      {
        title: "First Finishers",
        href: "/community",
        body: "Leaderboards for individual sets. The collector displayed on each set completed it first and verified completion with Keegan using photos and video.",
      },
      {
        title: "Leaderboard",
        href: "/leaderboard",
        body: "See who owns the most cards on MLPEKayou. Rankings are separated into CCG and TCG leaderboards.",
      },
      {
        title: "Selling",
        href: "/selling",
        body: "Suggested community guidelines for buying and selling cards. This is not an official price guide, but recommendations created by experienced Kayou collectors to help keep the hobby affordable and accessible instead of becoming Pokémon 2.0.",
      },
      {
        title: "Shop",
        href: "/shop",
        body: "Purchase select products through Keegan at StonesTradingCo. Redeem your Discord roles and experience live card rips in the MLPEKayou Discord server (discord.gg/mlpekayou).",
      },
    ].map((item) => (
      <div
        key={item.title}
        className="group relative overflow-hidden border border-[#303030] bg-[#141414] transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(250,204,21,0.12)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />

        <div className="absolute left-0 top-0 h-full w-[3px] bg-yellow-400" />

        <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-yellow-400" />
        <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-yellow-400" />
        <div className="absolute bottom-0 left-0 h-5 w-5 border-l-2 border-b-2 border-yellow-400" />
        <div className="absolute bottom-0 right-0 h-5 w-5 border-r-2 border-b-2 border-yellow-400" />

        <div className="relative min-w-0 p-3 sm:p-5 md:p-7">

          <div className="flex min-w-0 items-center justify-between gap-3">
            <a
              href={item.href}
              className="break-words font-oxanium text-[clamp(1.05rem,5vw,1.5rem)] font-black uppercase tracking-[0.05em] text-yellow-400 transition hover:text-white sm:text-xl sm:tracking-[0.1em] md:text-2xl md:tracking-[0.15em]"
            >
              {item.title}
            </a>

            <div className="h-3 w-3 bg-yellow-400 shadow-[0_0_10px_#facc15]" />
          </div>

          <div className="mt-4 h-px w-full bg-gradient-to-r from-yellow-400 via-yellow-400/25 to-transparent" />

          <p className="mt-4 text-[13px] leading-6 text-gray-300 sm:mt-5 sm:text-sm sm:leading-7 md:leading-8">
            {item.body}
          </p>

        </div>
      </div>
    ))}

  </div>
)}
{activeTab === "resources" && (
  <div className="space-y-6">

    {[
      {
        title: "PonyRec",
        href: "https://www.ponyrec.net/",
        image: "/website-assets/ponyreclogo.webp",
        imageClass:
          "bg-[#0f0f0f] object-contain p-8",
        description: (
          <>
            <span className="font-semibold text-white">PonyRec</span> was
            created by <span className="text-yellow-400">Tangent</span>. A
            fan-run Kayou resource dedicated to deck building, TCG mechanics,
            competitive play, and everything related to the My Little Pony
            Trading Card Game.
          </>
        ),
      },
      {
        title: "Doodle Binder",
        href: "https://www.doodlebinder.com/",
        image: "/website-assets/binder1custom.webp",
        imageClass:
          "object-cover object-center scale-110",
        description: (
          <>
            <span className="font-semibold text-white">Doodle Binder</span> was
            created by <span className="text-yellow-400">Eternal</span>. Each
            binder is individually customized using acrylic paints, mixed
            materials, and hand-finished artwork.
          </>
        ),
      },
    ].map((resource) => (
      <a
        key={resource.title}
        href={resource.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden border border-[#343434] bg-[#121212] transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_40px_rgba(250,204,21,0.18)]"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.025)_1px,transparent_1px)] bg-[size:30px_30px]" />

        {/* Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,#facc1515,transparent_65%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Scan */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/2 h-full w-1/4 skew-x-[-25deg] bg-gradient-to-r from-transparent via-yellow-400/15 to-transparent animate-[scan_7s_linear_infinite]" />
        </div>

        {/* Accent */}
        <div className="absolute left-0 top-0 h-full w-[4px] bg-yellow-400" />

        {/* Corners */}
        <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-yellow-400" />
        <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-yellow-400" />
        <div className="absolute bottom-0 left-0 h-5 w-5 border-l-2 border-b-2 border-yellow-400" />
        <div className="absolute bottom-0 right-0 h-5 w-5 border-r-2 border-b-2 border-yellow-400" />

        <div className="relative grid md:grid-cols-[320px_1fr]">

          {/* Image */}
          <div className="relative flex h-36 items-center justify-center overflow-hidden border-b border-[#303030] bg-[#0d0d0d] sm:h-52 md:h-72 md:border-b-0 md:border-r">
            <img
              src={resource.image}
              alt={resource.title}
              className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${resource.imageClass}`}
            />
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-col justify-center p-3 sm:p-5 md:p-8">

            <div className="flex min-w-0 items-center justify-between gap-3">

              <div>
                <p className="font-oxanium text-[9px] uppercase tracking-[0.2em] text-yellow-400 sm:text-xs sm:tracking-[0.35em] md:tracking-[0.45em]">
                  COMMUNITY RESOURCE
                </p>

                <h2 className="mt-1 font-oxanium text-2xl font-black uppercase tracking-[0.08em] text-white transition group-hover:text-yellow-400 sm:text-3xl sm:tracking-[0.1em] md:mt-2 md:text-4xl md:tracking-[0.15em]">
                  {resource.title}
                </h2>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-yellow-400/40 bg-yellow-400/10 transition group-hover:bg-yellow-400 group-hover:text-black sm:h-12 sm:w-12">
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 17L17 7M17 7H9M17 7v8"
                  />
                </svg>
              </div>

            </div>

            <div className="mt-5 h-[2px] bg-gradient-to-r from-yellow-400 via-yellow-400/25 to-transparent" />

            <p className="mt-5 max-w-3xl break-words text-[13px] leading-6 text-gray-300 sm:mt-6 sm:text-sm sm:leading-8">
              {resource.description}
            </p>

          </div>

        </div>

      </a>
    ))}

  </div>
)}
          {activeTab === "partnership" && (
  <div className="space-y-6">

    {/* About MLPEKAYOU */}
    <div className="relative overflow-hidden border border-[#343434] bg-[#121212]">

      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.025)_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="absolute left-0 top-0 h-full w-[4px] bg-yellow-400" />

      <div className="relative min-w-0 p-3 sm:p-5 md:p-8">

        <p className="font-oxanium text-[9px] uppercase tracking-[0.2em] text-yellow-400 sm:text-xs sm:tracking-[0.35em] md:tracking-[0.45em]">
          ABOUT MLPEKAYOU
        </p>

        <h2 className="mt-2 font-oxanium text-2xl font-black uppercase tracking-[0.08em] sm:text-3xl sm:tracking-[0.1em] md:text-4xl md:tracking-[0.15em] text-white">
        </h2>

        <div className="mt-5 h-[2px] bg-gradient-to-r from-yellow-400 via-yellow-400/25 to-transparent" />

        <p className="mt-4 text-[13px] leading-6 text-gray-300 sm:mt-5 sm:text-sm sm:leading-7 md:mt-6 md:leading-8">
          <span className="font-semibold text-white">MLPEKAYOU</span> is owned
          and operated by <span className="text-yellow-400">Sam Keegan</span>.
          Keegan is a U.S. Army Veteran (Prior Service Infantry - 11C) and <span className="font-semibold text-white">is not employed by Kayou. </span>
          Kayou retains ownership of all My Little Pony artwork, characters, and
          related intellectual property used throughout this website. Images are
          provided by Kayou for use on MLPEKAYOU.
        </p>

      </div>

    </div>

    {/* Disclaimer */}
    <div className="relative overflow-hidden border border-red-500/40 bg-gradient-to-r from-red-950/50 to-[#121212]">

      <div className="absolute left-0 top-0 h-full w-[4px] bg-red-500" />

      <div className="relative min-w-0 p-3 sm:p-5 md:p-8">

        <p className="font-oxanium text-xs uppercase tracking-[0.45em] text-red-400">
          IMPORTANT DISCLAIMER
        </p>

        <h2 className="mt-2 font-oxanium text-2xl font-black uppercase tracking-[0.08em] sm:text-3xl sm:tracking-[0.1em] md:text-4xl md:tracking-[0.15em] text-white">
          MLPEKAYOU Is Not Kayou US
        </h2>

        <div className="mt-5 h-[2px] bg-gradient-to-r from-red-500 via-red-500/25 to-transparent" />

        <p className="mt-4 break-words text-[11px] font-semibold uppercase leading-5 text-white sm:mt-5 sm:text-base sm:leading-7 md:mt-6 md:text-lg md:leading-9">
          MLPEKAYOU IS A FAN WEBSITE. IT IS NOT OWNED, OPERATED, OR MANAGED BY
          KAYOU US.
        </p>

        <p className="mt-5 break-words text-[13px] leading-6 text-gray-300 sm:mt-6 sm:text-sm sm:leading-8">
          MLPEKAYOU generates <span className="font-bold text-yellow-400">$0.00</span>
          {" "}in revenue and will never display advertisements, subscriptions,
          premium memberships, or paywalls. The goal of this project has always
          been to provide a completely free resource for the My Little Pony
          Kayou community.
        </p>

      </div>

    </div>

    {/* StonesTradingCo */}
    <a
      href="https://stonestradingco.com/collections/my-little-pony"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden border border-[#343434] bg-[#121212] transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_40px_rgba(250,204,21,0.18)]"
    >

      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.025)_1px,transparent_1px)] bg-[size:30px_30px]" />

      <div className="absolute left-0 top-0 h-full w-[4px] bg-yellow-400" />

      <div className="relative min-w-0 p-3 sm:p-5 md:p-8">

        <div className="flex min-w-0 items-center justify-between gap-3">

          <div>

            <p className="font-oxanium text-[9px] uppercase tracking-[0.2em] text-yellow-400 sm:text-xs sm:tracking-[0.35em] md:tracking-[0.45em]">
              OFFICIAL PARTNER
            </p>

            <h2 className="mt-2 font-oxanium text-2xl font-black uppercase tracking-[0.08em] sm:text-3xl sm:tracking-[0.1em] md:text-4xl md:tracking-[0.15em] text-white group-hover:text-yellow-400">
              Stones Trading Co
            </h2>

          </div>

          <svg
            className="h-8 w-8 text-yellow-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 17L17 7M17 7H9M17 7v8"
            />
          </svg>

        </div>

        <div className="mt-5 h-[2px] bg-gradient-to-r from-yellow-400 via-yellow-400/25 to-transparent" />

        <p className="mt-4 text-[13px] leading-6 text-gray-300 sm:mt-5 sm:text-sm sm:leading-7 md:mt-6 md:leading-8">
          Purchasing My Little Pony products through
          <span className="font-semibold text-white"> StonesTradingCo</span>
          {" "}comes directly through Keegan. The MLPEKAYOU Discord regularly
          hosts <span className="text-yellow-400">Live Rip Nights</span>, where
          products are opened live for collectors.
        </p>

        <p className="mt-4 text-[13px] leading-6 text-gray-300 sm:mt-5 sm:text-sm sm:leading-7 md:mt-6 md:leading-8">
          StonesTradingCo pays Keegan a commission on these purchases, which is
          used to fund server costs, development, and maintenance of
          <span className="font-semibold text-white"> MLPEKAYOU</span> while
          keeping every feature completely free for the community.
        </p>

      </div>

    </a>

  </div>
)}
        </div>
      </section>

    </main>
    </>
  );
}