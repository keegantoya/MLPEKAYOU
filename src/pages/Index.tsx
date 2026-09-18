import CardImage from "@/components/CardImage";
import React, { useEffect, useRef, useState } from "react";
import LGSApplications from "@/pages/Pop-Ups/LGSApplications";

type Announcement = {
  label: string;
  date: string;
  title: string;
  body: string;
  detail: string;
  actionLabel?: string;
  actionHref?: string;
  tone: "featured" | "warning" | "standard";
};

type CommunityReference = {
  title: string;
  href: string;
  description: string;
  image?: string;
  imageClass?: string;
};

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

const announcements: Announcement[] = [
  {
    label: "Website update",
    date: "September 17, 2026",
    title: "MLPEKAYOU is Underfunded",
    body: "This database is entirely free to users and features no paywalls or advertisements. As it gets bigger and bigger, it becomes extremely hard to keep funded.",
    detail: "Typically, streaming for StonesTradingCo covers the costs. This last two months has, however, been a huge dry spell in products. I have not been paid in a while, but that doesn't stop the website from needing funding. StonesTradingCo sends me commission based on my sales, which goes to the website.",
    actionLabel: "Shop through Keegan",
    actionHref: "https://stonestradingco.com/collections/my-little-pony",
    tone: "featured",
  },
  {
    label: "Accessibility update",
    date: "August 26, 2026",
    title: "A simpler, more accessible MLPEKAYOU",
    body: "The website interface was rebuilt to be easier to navigate and more accessible for hard-of-sight and disabled collectors.",
    detail: "Light and dark themes are now supported throughout the website, with clearer spacing, simpler controls, and better readability.",
    tone: "standard",
  },
  {
    label: "Domain update",
    date: "August 11, 2026",
    title: "MLPEKAYOU is still MLPEKAYOU",
    body: "A copyright strike caused several hours of downtime and forced a temporary domain change. No user information was affected.",
    detail: "The rights to mlpekayou.com were returned to Keegan, and the original domain now redirects visitors to the active MLPEKAYOU website.",
    tone: "warning",
  },
  {
    label: "Account maintenance",
    date: "August 10, 2026",
    title: "Inactive account cleanup",
    body: "Accounts at least 30 days old with no collection progress, along with accounts that never confirmed their email address, were permanently removed.",
    detail: "If a confirmation or password-reset link does not work, mark the email as trusted and refresh the page before opening it again. Gmail is especially likely to interfere with these messages.",
    tone: "standard",
  },
];

const references: CommunityReference[] = [
  {
    title: "PonyRec",
    href: "https://www.ponyrec.net/",
    image: "/website-assets/ponyreclogo.webp",
    imageClass: "max-h-24 w-full object-contain",
    description: "Deck building, TCG mechanics, competitive play, and other gameplay resources created by Tangent.",
  },
  {
    title: "Doodle Binder",
    href: "https://www.doodlebinder.com/",
    image: "/website-assets/binder1custom.webp",
    imageClass: "h-full min-h-32 w-full object-cover object-center",
    description: "Individually customized binders made by Eternal using acrylic paint, mixed materials, and hand-finished artwork.",
  },
  {
    title: "Stones Trading Co",
    href: "https://stonestradingco.com/collections/my-little-pony",
    description: "Shop English Kayou products through Keegan and help support MLPEKAYOU at no additional cost.",
  },
  {
    title: "PakraCards",
    href: "https://pakracards.com",
    description: "A trusted Kayou CN shop run by Amber and Hao, offering singles, sealed products, live rips, and collectibles.",
  },
];

export default function Index() {
  const [showLGSApplication, setShowLGSApplication] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState(0);
  const [announcementDirection, setAnnouncementDirection] = useState<"forward" | "backward">("forward");
  const [outgoingAnnouncement, setOutgoingAnnouncement] = useState<number | null>(null);
  const [isAnnouncementTransitioning, setIsAnnouncementTransitioning] = useState(false);
  const announcementTimer = useRef<number | null>(null);
  const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light",
  );

  useEffect(() => {
    const syncTheme = () => {
      setIsLightMode(document.documentElement.dataset.theme === "light");
    };
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    syncTheme();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (announcementTimer.current !== null) {
        window.clearTimeout(announcementTimer.current);
      }
    };
  }, []);

  const announcement = announcements[activeAnnouncement];
  const changeAnnouncement = (index: number, direction: "forward" | "backward") => {
    if (index === activeAnnouncement || isAnnouncementTransitioning) return;
    setOutgoingAnnouncement(activeAnnouncement);
    setAnnouncementDirection(direction);
    setActiveAnnouncement(index);
    setIsAnnouncementTransitioning(true);
    if (announcementTimer.current !== null) {
      window.clearTimeout(announcementTimer.current);
    }
    announcementTimer.current = window.setTimeout(() => {
      setOutgoingAnnouncement(null);
      setIsAnnouncementTransitioning(false);
      announcementTimer.current = null;
    }, 560);
  };
  const previousAnnouncement = () => changeAnnouncement(
    activeAnnouncement === 0 ? announcements.length - 1 : activeAnnouncement - 1,
    "backward",
  );
  const nextAnnouncement = () => changeAnnouncement(
    activeAnnouncement === announcements.length - 1 ? 0 : activeAnnouncement + 1,
    "forward",
  );
  const openAnnouncement = (index: number) => changeAnnouncement(
    index,
    index > activeAnnouncement ? "forward" : "backward",
  );
  const pageBg = isLightMode
    ? "bg-[#f6f4ee] text-zinc-900"
    : "bg-[#111111] text-white";
  const surface = isLightMode
    ? "border-black/10 bg-white text-zinc-900 shadow-[0_12px_35px_rgba(75,58,18,0.08)]"
    : "border-white/10 bg-[#181818] text-white shadow-[0_12px_35px_rgba(0,0,0,0.28)]";
  const muted = isLightMode ? "text-zinc-600" : "text-zinc-400";
  const bodyText = isLightMode ? "text-zinc-700" : "text-zinc-300";
  const accentText = isLightMode ? "text-[#765d12]" : "text-[#E7C84B]";
  const getAnnouncementSurface = (item: Announcement) =>
    item.tone === "featured"
      ? isLightMode
        ? "border-[#D3AE18]/60 bg-gradient-to-br from-white via-white to-[#fff4bd]"
        : "border-[#E7C84B]/60 bg-gradient-to-br from-[#25200d] via-[#181818] to-[#111111]"
      : item.tone === "warning"
        ? isLightMode
          ? "border-red-300 bg-gradient-to-br from-white to-red-50"
          : "border-red-500/35 bg-gradient-to-br from-[#211616] to-[#181818]"
        : surface;
  const renderAnnouncementCard = (
    item: Announcement,
    index: number,
    phase: "incoming" | "outgoing" | "sizing",
  ) => {
    const motionClass = phase === "sizing"
      ? ""
      : phase === "incoming"
      ? announcementDirection === "forward"
        ? "mlpekayou-announcement-enter-forward"
        : "mlpekayou-announcement-enter-backward"
      : announcementDirection === "forward"
        ? "mlpekayou-announcement-exit-forward"
        : "mlpekayou-announcement-exit-backward";
    return (
      <article
        key={`${phase}-${index}-${announcementDirection}`}
        aria-live={phase === "incoming" ? "polite" : undefined}
        aria-hidden={phase !== "incoming" ? "true" : undefined}
        className={`relative flex [grid-area:1/1] flex-col justify-center overflow-hidden rounded-3xl border p-5 sm:p-7 ${getAnnouncementSurface(item)} ${motionClass} ${
          phase === "incoming"
            ? "z-10"
            : phase === "sizing"
              ? "invisible pointer-events-none z-0"
              : "pointer-events-none z-0"
        }`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#E7C84B]/15 blur-3xl" />
        <div className={`relative ${
          item.title === "MLPEKAYOU is Underfunded"
            ? "grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(300px,0.78fr)] md:gap-8"
            : ""
        }`}>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`text-sm font-semibold ${item.tone === "warning" ? "text-red-500" : accentText}`}>
                {item.label}
              </span>
              <time className={`text-xs ${muted}`}>{item.date}</time>
            </div>
            <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{item.title}</h3>
            <p className={`mt-4 max-w-4xl text-[15px] leading-7 ${bodyText}`}>{item.body}</p>
            <p className={`mt-3 max-w-4xl text-sm leading-6 ${muted}`}>{item.detail}</p>
            {item.actionHref && item.actionLabel && (
              <a
                href={item.actionHref}
                target="_blank"
                rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E7C84B] px-5 py-3 text-sm font-bold text-[#111111] transition-colors hover:bg-[#FFE477]"
            >
                {item.actionLabel}
                <ExternalLinkIcon />
              </a>
            )}
          </div>
          {item.title === "MLPEKAYOU is Underfunded" && (
            <div className={`w-full rounded-2xl border p-4 ${
              isLightMode
                ? "border-[#D3AE18]/45 bg-white/80 text-zinc-950"
                : "border-[#E7C84B]/35 bg-black/20 text-white"
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full bg-[#E7C84B] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#111111]">
                    At checkout
                  </span>
                  <h4 className="mt-2 text-base font-black tracking-tight sm:text-lg">
                    Select MLPEKAYOU
                  </h4>
                </div>
                <span className={`pt-1 text-[9px] font-bold uppercase tracking-wide ${muted}`}>Required</span>
              </div>
              <p className={`mt-2 text-xs leading-5 ${muted}`}>
                Under “Where did you hear about us?”
              </p>
              <div className="relative mt-3 h-40">
                <div className={`relative flex min-h-12 items-center justify-between rounded-xl border-2 border-[#E7C84B] px-3 ${
                  isLightMode ? "bg-[#fffdf3]" : "bg-[#17160f]"
                }`}>
                  <span className={`checkout-placeholder absolute left-3 text-sm font-semibold ${muted}`}>
                    Select an option
                  </span>
                  <span className="checkout-selected absolute left-3 text-sm font-black tracking-wide">
                    MLPEKAYOU
                  </span>
                  <span aria-hidden="true" className="checkout-chevron ml-auto h-2.5 w-2.5 border-b-2 border-r-2 border-current" />
                </div>
                <div className={`checkout-menu pointer-events-none absolute left-0 right-0 top-14 z-10 overflow-hidden rounded-xl border shadow-xl ${
                  isLightMode
                    ? "border-zinc-200 bg-white"
                    : "border-white/15 bg-[#171717]"
                }`}>
                  <div className={`px-3 py-1.5 text-xs font-semibold ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                    TikTok
                  </div>
                  <div className={`border-t px-3 py-1.5 text-xs font-semibold ${isLightMode ? "border-zinc-200" : "border-white/10"}`}>
                    Discord
                  </div>
                  <div className={`checkout-option border-t px-3 py-2 text-xs font-black ${isLightMode ? "border-zinc-200" : "border-white/10"}`}>
                    MLPEKAYOU
                  </div>
                  <span aria-hidden="true" className="checkout-cursor absolute right-5 top-1 h-5 w-3.5 bg-[#E7C84B] shadow-md [clip-path:polygon(0_0,0_100%,28%_73%,45%_100%,58%_93%,42%_67%,74%_67%)]" />
                </div>
                <div className="checkout-confirmation absolute inset-x-0 top-16 rounded-xl border border-[#E7C84B]/50 bg-[#E7C84B]/10 px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.1em]">
                  MLPEKAYOU selected — order credited
                </div>
              </div>
              <p className={`mt-1 text-center text-[10px] font-semibold leading-4 ${muted}`}>
                Other choices do not credit MLPEKAYOU.
              </p>
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <>
      <style>{`
        @keyframes mlpekayouAnnouncementEnterForward {
          from { opacity: 0; transform: translate3d(46px, 0, 0) scale(0.985); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes mlpekayouAnnouncementExitForward {
          from { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
          to { opacity: 0; transform: translate3d(-46px, 0, 0) scale(0.985); }
        }
        @keyframes mlpekayouAnnouncementEnterBackward {
          from { opacity: 0; transform: translate3d(-46px, 0, 0) scale(0.985); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes mlpekayouAnnouncementExitBackward {
          from { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
          to { opacity: 0; transform: translate3d(46px, 0, 0) scale(0.985); }
        }
        .mlpekayou-announcement-enter-forward {
          animation: mlpekayouAnnouncementEnterForward 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .mlpekayou-announcement-exit-forward {
          animation: mlpekayouAnnouncementExitForward 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .mlpekayou-announcement-enter-backward {
          animation: mlpekayouAnnouncementEnterBackward 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .mlpekayou-announcement-exit-backward {
          animation: mlpekayouAnnouncementExitBackward 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes checkoutMenu {
          0%, 12%, 78%, 100% { opacity: 0; transform: translateY(-6px); visibility: hidden; }
          18%, 70% { opacity: 1; transform: translateY(0); visibility: visible; }
        }
        @keyframes checkoutCursor {
          0%, 20% { opacity: 0; transform: translate(24px, -8px); }
          26% { opacity: 1; transform: translate(24px, -8px); }
          50%, 62% { opacity: 1; transform: translate(0, 58px); }
          70%, 100% { opacity: 0; transform: translate(0, 58px); }
        }
        @keyframes checkoutOption {
          0%, 46% { background-color: transparent; }
          53%, 100% { background-color: rgba(231, 200, 75, 0.34); }
        }
        @keyframes checkoutPlaceholder {
          0%, 68% { opacity: 1; }
          74%, 100% { opacity: 0; }
        }
        @keyframes checkoutSelected {
          0%, 68% { opacity: 0; }
          76%, 100% { opacity: 1; }
        }
        @keyframes checkoutConfirmation {
          0%, 74% { opacity: 0; transform: translateY(6px); }
          82%, 96% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(0); }
        }
        @keyframes checkoutChevron {
          0%, 12%, 78%, 100% { transform: rotate(45deg); }
          18%, 70% { transform: rotate(225deg); }
        }
        .checkout-menu { animation: checkoutMenu 6s ease-in-out infinite; }
        .checkout-cursor { animation: checkoutCursor 6s ease-in-out infinite; }
        .checkout-option { animation: checkoutOption 6s ease-in-out infinite; }
        .checkout-placeholder { animation: checkoutPlaceholder 6s ease-in-out infinite; }
        .checkout-selected { animation: checkoutSelected 6s ease-in-out infinite; }
        .checkout-confirmation { animation: checkoutConfirmation 6s ease-in-out infinite; }
        .checkout-chevron { animation: checkoutChevron 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mlpekayou-announcement-enter-forward,
          .mlpekayou-announcement-exit-forward,
          .mlpekayou-announcement-enter-backward,
          .mlpekayou-announcement-exit-backward { animation: none; }
          .checkout-menu, .checkout-cursor, .checkout-placeholder { display: none; animation: none; }
          .checkout-option, .checkout-selected, .checkout-confirmation { animation: none; opacity: 1; transform: none; }
          .checkout-chevron { animation: none; transform: rotate(45deg); }
        }
      `}</style>
      {showLGSApplication && (
        <LGSApplications
          onClose={() => setShowLGSApplication(false)}
          isLightMode={isLightMode}
        />
      )}
      <main className={`min-h-screen w-full overflow-x-hidden transition-colors duration-200 ${pageBg}`}>
        <section className={`border-b ${isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-[#171717]"}`}>
          <div className="mx-auto grid w-full max-w-7xl items-center gap-7 px-4 py-9 sm:px-6 sm:py-12 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:py-16">
            <div>
              <p className={`text-sm font-bold uppercase tracking-[0.18em] ${accentText}`}>MLPEKAYOU</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.035em] sm:text-5xl md:text-6xl">
                The home of English My Little Pony Kayou collectors.
              </h1>
              <p className={`mt-5 max-w-2xl text-base leading-7 sm:text-lg ${bodyText}`}>
                Keep up with MLPEKAYOU announcements, connect with the community, discover trusted resources, and bring organized play to your local game store.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://discord.gg/mlpekayou"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#E7C84B] px-6 py-3 text-sm font-bold text-[#111111] transition-colors hover:bg-[#FFE477]"
                >
                  Join the Discord
                  <ExternalLinkIcon />
                </a>
                <button
                  type="button"
                  onClick={() => setShowLGSApplication(true)}
                  className={`inline-flex min-h-12 items-center justify-center rounded-xl border px-6 py-3 text-sm font-bold transition-colors ${
                    isLightMode
                      ? "border-black/15 bg-white text-zinc-900 hover:bg-zinc-50"
                      : "border-white/15 bg-white/[0.05] text-white hover:bg-white/[0.09]"
                  }`}
                >
                  Apply for the LGS Program
                </button>
              </div>
              <p className={`mt-5 text-xs leading-5 ${muted}`}>
                MLPEKAYOU supports North American English cards only. SEA, Japanese, and Chinese Kayou cards are not included.
              </p>
            </div>
            <a
              href="https://discord.gg/mlpekayou"
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative overflow-hidden rounded-3xl border p-6 transition-all hover:-translate-y-0.5 ${surface}`}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E7C84B]/20 blur-3xl" />
              <div className="relative">
                <CardImage
                  src={isLightMode ? "/website-assets/discordlightmode.webp" : "/website-assets/discordlogo.webp"}
                  alt="Discord"
                  className="h-10 w-auto"
                />
                <p className={`mt-6 text-xs font-bold uppercase tracking-[0.16em] ${accentText}`}>The community lives here</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Join the MLPEKAYOU Discord</h2>
                <p className={`mt-3 text-sm leading-6 ${bodyText}`}>
                  Get collection help, share pulls, arrange trades, follow English Kayou releases, and join live rip nights with other collectors.
                </p>
                <p className={`mt-5 inline-flex items-center gap-2 text-sm font-bold ${accentText}`}>
                  discord.gg/mlpekayou
                  <ExternalLinkIcon />
                </p>
              </div>
            </a>
          </div>
        </section>

        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12">
          <section aria-labelledby="announcements-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={`text-sm font-semibold ${accentText}`}>What’s happening</p>
                <h2 id="announcements-heading" className="mt-1 text-3xl font-bold tracking-tight">Announcements</h2>
              </div>
              <p className={`text-sm ${muted}`}>{activeAnnouncement + 1} of {announcements.length}</p>
            </div>
            <div className="mt-5 grid overflow-hidden rounded-3xl">
              {announcements.map((item, index) =>
                renderAnnouncementCard(item, index, "sizing"),
              )}
              {outgoingAnnouncement !== null && renderAnnouncementCard(
                announcements[outgoingAnnouncement],
                outgoingAnnouncement,
                "outgoing",
              )}
              {renderAnnouncementCard(announcement, activeAnnouncement, "incoming")}
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={previousAnnouncement}
                aria-label="Previous announcement"
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border font-bold transition-colors ${
                  isLightMode
                    ? "border-black/15 bg-white text-zinc-800 hover:border-[#E7C84B]"
                    : "border-white/15 bg-[#181818] text-white hover:border-[#E7C84B]/60"
                }`}
              >
                <ArrowLeftIcon />
              </button>
              <div className="flex items-center justify-center gap-2">
                {announcements.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => openAnnouncement(index)}
                    aria-label={`Open announcement ${index + 1}: ${item.title}`}
                    aria-current={index === activeAnnouncement ? "true" : undefined}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeAnnouncement
                        ? "w-8 bg-[#E7C84B]"
                        : isLightMode
                          ? "w-2.5 bg-black/20 hover:bg-black/35"
                          : "w-2.5 bg-white/20 hover:bg-white/35"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={nextAnnouncement}
                aria-label="Next announcement"
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border font-bold transition-colors ${
                  isLightMode
                    ? "border-black/15 bg-white text-zinc-800 hover:border-[#E7C84B]"
                    : "border-white/15 bg-[#181818] text-white hover:border-[#E7C84B]/60"
                }`}
              >
                <ArrowRightIcon />
              </button>
            </div>
          </section>

          <section className="space-y-7" aria-labelledby="community-heading">
            <article className={`flex flex-col gap-5 rounded-3xl border p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between ${surface}`}>
              <div className="max-w-4xl">
                <p className={`text-sm font-semibold ${accentText}`}>For local game stores</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">Bring organized play to your community.</h2>
                <p className={`mt-2 text-sm leading-6 ${bodyText}`}>
                  Approved stores can manage tournaments, track attendance, and preserve event history in one shared space. Stores may apply whether they already host events or are preparing for their first one.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLGSApplication(true)}
                className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-[#E7C84B] px-5 py-3 text-sm font-bold text-[#111111] transition-colors hover:bg-[#FFE477] sm:w-auto"
              >
                Apply for the LGS Program
              </button>
            </article>

            <div>
              <p className={`text-sm font-semibold ${accentText}`}>Trusted places to continue</p>
              <h2 id="community-heading" className="mt-1 text-2xl font-bold tracking-tight">Community references</h2>
              <div className="mt-4 grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-4">
                {references.map((resource) => (
                  <a
                    key={resource.title}
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex h-full min-h-36 overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 ${surface} ${
                      isLightMode ? "hover:border-[#E7C84B]/70" : "hover:border-[#E7C84B]/45"
                    }`}
                  >
                    {resource.image && (
                      <div className={`flex w-24 shrink-0 items-center justify-center overflow-hidden sm:w-28 ${
                        isLightMode ? "bg-[#f1eee5]" : "bg-[#101010]"
                      }`}>
                        <CardImage
                          src={resource.image}
                          alt={resource.title}
                          className={resource.title === "Doodle Binder" ? "h-full w-full object-cover object-center" : "max-h-20 w-full object-contain p-3"}
                        />
                      </div>
                    )}
                    <div className={`flex min-w-0 flex-1 flex-col justify-center ${resource.image ? "p-4" : "p-5"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold tracking-tight">{resource.title}</h3>
                        <span aria-hidden="true" className={accentText}>
                          <ExternalLinkIcon className="h-4 w-4" />
                        </span>
                      </div>
                      <p className={`mt-2 text-xs leading-5 ${bodyText}`}>{resource.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          <footer className={`border-t pt-6 text-center text-xs leading-5 ${isLightMode ? "border-black/10 text-zinc-500" : "border-white/10 text-zinc-500"}`}>
            <p>MLPEKAYOU is a free fan website owned and operated by Keegan. It is not owned, operated, or managed by Kayou US.</p>
          </footer>
        </div>
      </main>
    </>
  );
}
