import CardImage from "@/components/CardImage";
import React, { useEffect, useState } from "react";
import LGSApplications from "@/pages/Pop-Ups/LGSApplications";
import { supabase } from "@/lib/supabase";
type HomeTab = "updates" | "tutorial" | "resources" | "partnership";
const tutorialItems = [
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
];
const resources = [
  {
    title: "PonyRec",
    href: "https://www.ponyrec.net/",
    image: "/website-assets/ponyreclogo.webp",
    imageClass: "max-h-40 w-full object-contain",
    description:
      "PonyRec was created by Tangent. It is a fan-run Kayou resource dedicated to deck building, TCG mechanics, competitive play, and everything related to the My Little Pony Trading Card Game.",
  },
  {
    title: "Doodle Binder",
    href: "https://www.doodlebinder.com/",
    image: "/website-assets/binder1custom.webp",
    imageClass: "h-full min-h-40 w-full object-cover object-center",
    description:
      "Doodle Binder was created by Eternal. Each binder is individually customized using acrylic paints, mixed materials, and hand-finished artwork.",
  },
];
export default function Index() {
const [showLGSApplication, setShowLGSApplication] = useState(false);
const [activeTab, setActiveTab] = useState<HomeTab>("updates");
const [showUpdateNotice, setShowUpdateNotice] = useState(false);
const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light"
  );
  useEffect(() => {
const hasSeenUpdateNotice = localStorage.getItem(
      "mlpekayou-ui-overhaul-notice"
    );
    if (!hasSeenUpdateNotice) {
      setShowUpdateNotice(true);
    }
  }, []);
  useEffect(() => {
let mounted = true;
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
const syncFromDocument = () => {
      if (!mounted) return;
      setIsLightMode(document.documentElement.dataset.theme === "light");
    };
const observer = new MutationObserver(syncFromDocument);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
const loadThemePreference = async () => {
const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session?.user) {
        setIsLightMode(false);
        return;
      }
const { data, error } = await supabase
        .from("user_light_mode_preferences")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!mounted) return;
      if (error) {
        console.error("Unable to load homepage theme preference:", error);
      } else {
        setIsLightMode(Boolean(data));
      }
      realtimeChannel = supabase
        .channel(`homepage-theme-${session.user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_light_mode_preferences",
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            if (!mounted) return;
            setIsLightMode(payload.eventType !== "DELETE");
          }
        )
        .subscribe();
    };
    syncFromDocument();
    loadThemePreference();
    return () => {
      mounted = false;
      observer.disconnect();
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, []);
const dismissUpdateNotice = () => {
    localStorage.setItem("mlpekayou-ui-overhaul-notice", "true");
    setShowUpdateNotice(false);
  };
const pageBg = isLightMode ? "bg-[#f6f4ee] text-zinc-900" : "bg-[#111111] text-white";
const surface = isLightMode
    ? "border-black/10 bg-white text-zinc-900 shadow-[0_10px_30px_rgba(75,58,18,0.08)]"
    : "border-white/10 bg-[#181818] text-white shadow-[0_10px_30px_rgba(0,0,0,0.24)]";
const muted = isLightMode ? "text-zinc-600" : "text-zinc-400";
const bodyText = isLightMode ? "text-zinc-700" : "text-zinc-300";
const accentText = isLightMode ? "text-[#765d12]" : "text-[#E7C84B]";
  return (
    <>
      {showLGSApplication && <LGSApplications onClose={() => setShowLGSApplication(false)} isLightMode={isLightMode} />}
      {showUpdateNotice && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 backdrop-blur-md">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 sm:p-7 ${surface}`}
          >
            <p className={`text-sm font-semibold ${accentText}`}>Website update</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              MLPEKAYOU has a new interface
            </h2>
            <div className={`mt-4 space-y-3 text-sm leading-6 ${bodyText}`}>
              <p>
                MLPEKAYOU received a complete UI overhaul along with efficiency
                improvements across the website.
              </p>
              <p>
                <strong className={isLightMode ? "text-zinc-900" : "text-white"}>
                  No pages have been merged or moved.
                </strong>{" "}
                Everything is still where it was before; the interface simply looks
                different.
              </p>
              <p>
                If anything about the website is confusing, the MLPEKAYOU Discord
                community can help explain it.
              </p>
              <a
                href="https://discord.gg/mlpekayou"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isLightMode
                    ? "bg-[#E7C84B]/15 text-[#66500f] hover:bg-[#E7C84B]/25"
                    : "bg-[#E7C84B]/10 text-[#FFE477] hover:bg-[#E7C84B]/15"
                }`}
              >
                discord.gg/mlpekayou ↗
              </a>
            </div>
            <button
              onClick={dismissUpdateNotice}
              className="mt-6 w-full rounded-xl bg-[#E7C84B] px-4 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#FFE477]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      <main className={`min-h-screen w-full overflow-x-hidden transition-colors duration-200 ${pageBg}`}>
        <section
          className={`border-b ${
            isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-[#171717]"
          }`}
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12">
            <div className="mx-auto max-w-3xl text-center">
              <p className={`text-sm font-semibold ${accentText}`}>Welcome to</p>
              <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                MLPEKAYOU
              </h1>
              <p className={`mt-1 text-sm sm:text-base ${muted}`}>
                My Little Pony{" "}
                <span
                  className={`text-base font-bold sm:text-lg ${
                    isLightMode ? "text-zinc-800" : "text-zinc-200"
                  }`}
                >
                  English
                </span>{" "}
                Kayou
              </p>
              <p className={`mx-auto mt-1 max-w-xl text-[11px] leading-4 sm:text-xs ${muted}`}>
                <span className="block">
                  We do not and will not support regions outside of North American cards.
                </span>
                <span className="block">
                  This includes SEA, Japanese, and Chinese Kayou cards.
                </span>
              </p>
              <a
                href="https://discord.gg/mlpekayou"
                target="_blank"
                rel="noopener noreferrer"
                className={`mx-auto mt-6 inline-flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                  isLightMode
                    ? "border-[#E7C84B]/40 bg-[#E7C84B]/10 hover:bg-[#E7C84B]/18"
                    : "border-white/10 bg-white/[0.04] hover:border-[#E7C84B]/40 hover:bg-white/[0.07]"
                }`}
              >
                <CardImage
                  src={
                    isLightMode
                      ? "/website-assets/discordlightmode.webp"
                      : "/website-assets/discordlogo.webp"
                  }
                  alt="Discord"
                  className="h-8 w-auto"
                />
                <span className={`text-sm font-medium ${isLightMode ? "text-zinc-800" : "text-zinc-200"}`}>
                  Join the MLPEKAYOU Discord
                </span>
              </a>
            </div>
            <div
              className={`mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-2 rounded-2xl border p-2 sm:grid-cols-4 ${
                isLightMode ? "border-black/10 bg-[#f4f1e8]" : "border-white/10 bg-[#111111]"
              }`}
            >
              {[
                { id: "updates", label: "Updates" },
                { id: "tutorial", label: "Tutorial" },
                { id: "resources", label: "Resources" },
                { id: "partnership", label: "About" },
              ].map((tab) => {
const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as HomeTab)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      selected
                        ? "bg-[#E7C84B] text-[#111111]"
                        : isLightMode
                        ? "text-zinc-700 hover:bg-black/[0.05] hover:text-zinc-950"
                        : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
        <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
          {activeTab === "updates" && (
            <div className="space-y-4">
              <article
                className={`relative overflow-hidden rounded-3xl border-2 border-[#E7C84B] p-5 shadow-[0_0_0_1px_rgba(231,200,75,0.18),0_18px_60px_rgba(231,200,75,0.16)] sm:p-7 ${
                  isLightMode
                    ? "bg-gradient-to-br from-[#fffdf5] via-white to-[#fff4bd] text-zinc-900"
                    : "bg-gradient-to-br from-[#25200d] via-[#181818] to-[#111111] text-white"
                }`}
              >
                <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#E7C84B]/20 blur-3xl" />
                <div className="relative">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center rounded-full bg-[#E7C84B] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[#111111] shadow-sm">
                      Please read
                    </span>
                    <time className={`text-xs font-medium ${muted}`}>September 17, 2026</time>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                    Help keep MLPEKAYOU online
                  </h2>
                  <div className={`mt-4 space-y-4 text-[15px] leading-7 ${bodyText}`}>
                    <p>
                      MLPEKAYOU was scraped by OpenAI and Meta AI until my wallet could no
                      longer handle the cost. I have spent the last several nights working
                      between 1:00 and 4:00 AM to move the database around while keeping
                      downtime restricted to the hours when the fewest of you would be active.
                    </p>
                    <div
                      className={`rounded-2xl border p-4 sm:p-5 ${
                        isLightMode
                          ? "border-[#D3AE18]/40 bg-white/80 text-zinc-800"
                          : "border-[#E7C84B]/30 bg-black/20 text-zinc-200"
                      }`}
                    >
                      <p className={`font-bold ${isLightMode ? "text-zinc-950" : "text-white"}`}>
                        The website should now be extremely fast, and AI scraping has been blocked.
                      </p>
                      <p className="mt-2 text-sm leading-6">
                        Every part of the database has been reorganized and distributed across
                        multiple new platforms to keep MLPEKAYOU running reliably.
                      </p>
                    </div>
                    <div
                      className={`rounded-2xl border-2 p-4 sm:p-5 ${
                        isLightMode
                          ? "border-[#E7C84B] bg-[#E7C84B]/15"
                          : "border-[#E7C84B]/70 bg-[#E7C84B]/10"
                      }`}
                    >
                      <p className={`text-lg font-bold ${accentText}`}>
                        Please consider buying through StonesTradingCo.
                      </p>
                      <p className="mt-2 text-sm leading-6">
                        I earn a significant commission from every purchase credited to MLPEKAYOU,
                        at no additional cost to you. I personally pack and ship your products, or
                        you can choose to have them opened live on the StonesTradingCo TikTok or
                        during a livestream in the MLPEKAYOU Discord server. I carry other IPs too,
                        including Naruto, Demon Slayer, KPOP, and Winx, so do not limit yourself to
                        My Little Pony!
                      </p>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <a
                          href="https://stonestradingco.com/collections/my-little-pony"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#E7C84B] px-4 py-3 text-center text-sm font-bold text-[#111111] transition-colors hover:bg-[#FFE477]"
                        >
                          Shop StonesTradingCo ↗
                        </a>
                        <a
                          href="https://discord.gg/mlpekayou"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border px-4 py-3 text-center text-sm font-bold transition-colors ${
                            isLightMode
                              ? "border-black/15 bg-white text-zinc-900 hover:bg-zinc-50"
                              : "border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.1]"
                          }`}
                        >
                          Join the Discord ↗
                        </a>
                      </div>
                    </div>
                    <div
                      className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 ${
                        isLightMode
                          ? "border-[#D3AE18]/45 bg-gradient-to-br from-white to-[#fff9dc] text-zinc-950"
                          : "border-[#E7C84B]/35 bg-gradient-to-br from-white/[0.06] to-[#E7C84B]/[0.08] text-white"
                      }`}
                    >
                      <style>{`
                        @keyframes checkoutMenu {
                          0%, 12%, 78%, 100% { opacity: 0; transform: translateY(-6px); visibility: hidden; }
                          18%, 70% { opacity: 1; transform: translateY(0); visibility: visible; }
                        }
                        @keyframes checkoutCursor {
                          0%, 20% { opacity: 0; transform: translate(24px, -8px); }
                          26% { opacity: 1; transform: translate(24px, -8px); }
                          50%, 62% { opacity: 1; transform: translate(0, 78px); }
                          70%, 100% { opacity: 0; transform: translate(0, 78px); }
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
                          .checkout-menu, .checkout-cursor, .checkout-placeholder { display: none; animation: none; }
                          .checkout-option, .checkout-selected, .checkout-confirmation { animation: none; opacity: 1; transform: none; }
                          .checkout-chevron { animation: none; transform: rotate(45deg); }
                        }
                      `}</style>
                      <div className="flex flex-col items-center text-center">
                        <span className="rounded-full bg-[#E7C84B] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#111111]">
                          At checkout
                        </span>
                        <h3 className="mt-3 text-xl font-black sm:text-2xl">
                          Select MLPEKAYOU so your order counts
                        </h3>
                        <p className={`mt-2 max-w-2xl text-sm leading-6 ${bodyText}`}>
                          Your order is only credited to me when <strong>MLPEKAYOU</strong> is chosen
                          under “Where did you hear about us?”
                        </p>
                      </div>
                      <div className={`mx-auto mt-5 max-w-lg rounded-2xl border p-4 ${
                        isLightMode
                          ? "border-black/10 bg-white shadow-sm"
                          : "border-white/10 bg-black/25"
                      }`}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-wide">
                            Where did you hear about us?
                          </p>
                          <span className={`text-[10px] font-bold uppercase tracking-wide ${muted}`}>
                            Required
                          </span>
                        </div>
                        <div className="relative mt-3 h-44">
                          <div className={`relative flex min-h-14 items-center justify-between rounded-xl border-2 border-[#E7C84B] px-4 ${
                            isLightMode ? "bg-[#fffdf3]" : "bg-[#17160f]"
                          }`}>
                            <span className={`checkout-placeholder absolute left-4 text-sm font-semibold ${muted}`}>
                              Select an option
                            </span>
                            <span className="checkout-selected absolute left-4 text-base font-black tracking-wide">
                              MLPEKAYOU
                            </span>
                            <span aria-hidden="true" className="checkout-chevron ml-auto h-2.5 w-2.5 border-b-2 border-r-2 border-current" />
                          </div>
                          <div className={`checkout-menu pointer-events-none absolute left-0 right-0 top-16 z-10 overflow-hidden rounded-xl border shadow-xl ${
                            isLightMode
                              ? "border-zinc-200 bg-white"
                              : "border-white/15 bg-[#171717]"
                          }`}>
                            <div className={`px-4 py-2 text-sm font-semibold ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                              TikTok
                            </div>
                            <div className={`border-t px-4 py-2 text-sm font-semibold ${isLightMode ? "border-zinc-200" : "border-white/10"}`}>
                              Discord
                            </div>
                            <div className={`checkout-option border-t px-4 py-2.5 text-sm font-black ${isLightMode ? "border-zinc-200" : "border-white/10"}`}>
                              MLPEKAYOU
                            </div>
                            <span aria-hidden="true" className="checkout-cursor absolute right-6 top-2 h-6 w-4 bg-[#E7C84B] shadow-md [clip-path:polygon(0_0,0_100%,28%_73%,45%_100%,58%_93%,42%_67%,74%_67%)]" />
                          </div>
                          <div className="checkout-confirmation absolute inset-x-0 top-20 rounded-xl border border-[#E7C84B]/50 bg-[#E7C84B]/10 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em]">
                            MLPEKAYOU selected — your order now supports the website! Thank you for helping me pay for all of the costs associated with MLPEKAYOU!
                          </div>
                        </div>
                        <p className={`mt-3 text-center text-xs font-semibold leading-5 ${muted}`}>
                          Choosing TikTok, Discord, Google, or any other option does not credit the sale to MLPEKAYOU.
                        </p>
                      </div>
                    </div>
                    <p className={`rounded-xl px-4 py-3 text-center font-bold ${
                      isLightMode
                        ? "bg-zinc-950 text-white"
                        : "bg-white text-zinc-950"
                    }`}>
                      Do not forget to ask for posters!
                    </p>
                  </div>
                </div>
              </article>
              <article
                className={`rounded-2xl border border-[#E7C84B]/30 p-5 sm:p-6 ${surface}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-sm font-semibold ${accentText}`}>
                    Accessibility Update
                  </span>
                  <time className={`text-xs ${muted}`}>August 26, 2026</time>
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  A simpler, more accessible MLPEKAYOU
                </h2>
                <div className={`mt-4 space-y-4 text-[15px] leading-7 ${bodyText}`}>
                  <p>
                    You spoke, and I heard. While my previous futuristic-UI was very cool
                    and fun to have, many complained that it was not very accessible for
                    the hard-of-sight or disabled in general.
                  </p>
                  <p>
                    I completely understand, and I apologize for how long it took me to
                    rewrite the entire website&apos;s UI.
                  </p>
                  <p>
                    Everything should be much simpler and easier now, outfitted with a
                    whole light and dark mode theme for those who were unable to read in
                    the permanent dark mode!
                  </p>
                </div>
              </article>
              <article
                className={`rounded-2xl border-l-4 border-l-red-500 border p-5 sm:p-6 ${surface}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-red-500">Important notice</span>
                  <time className={`text-xs ${muted}`}>August 11, 2026</time>
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Important Domain Update
                </h2>
                <div className={`mt-4 space-y-4 text-[15px] leading-7 ${bodyText}`}>
                  <p>
                    On <strong>08/11/2026</strong>, MLPEKAYOU experienced a copyright
                    strike that caused the website to be down for several hours. After
                    calling and emailing everyone possible, it became clear that the best
                    course of action would be to temporarily rebrand the website&apos;s domain.
                  </p>
                  <div
                    className={`rounded-xl border p-4 ${
                      isLightMode
                        ? "border-red-200 bg-red-50 text-red-900"
                        : "border-red-500/20 bg-red-500/[0.06] text-red-200"
                    }`}
                  >
                    <p className="font-semibold">MLPEKAYOU is still MLPEKAYOU.</p>
                    <p className="mt-1 text-sm leading-6">
                      I (Keegan) am partnered directly with Kayou US, so I know that Kayou
                      did not initiate this strike. As for who did, that remains unclear.
                    </p>
                  </div>
                  <p>
                    Moving forward, the new domain for the time being will be{" "}
                    <strong>mlpekayou.community</strong>. The domain may or may not change
                    back to <strong>mlpekayou.com</strong> if I am able to reobtain the
                    rights to it. No user information was impacted. This was simply a
                    copyright strike against the website&apos;s domain. Everything is still
                    exactly as it was before, just with a .community domain instead of a
                    .com domain.
                  </p>
                  <p className="font-medium">
                    As of 17:30 MDT 08/11/2026, the legal team has relinquished the rights
                    of mlpekayou.com back to me. However, the damage has already been done.
                    Instead of returning to the old domain, using the old domain will
                    automatically redirect you to the new one moving forward. Thank you
                    everyone for your patience in this frustrating situation.
                  </p>
                </div>
              </article>
              <article className={`rounded-2xl border p-5 sm:p-6 ${surface}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-sm font-semibold ${accentText}`}>Account maintenance</span>
                  <time className={`text-xs ${muted}`}>August 10, 2026</time>
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Account Cleanup</h2>
                <div className={`mt-4 space-y-3 text-[15px] leading-7 ${bodyText}`}>
                  <p>
                    As part of routine database maintenance, accounts that were 30 days or
                    older with 0 collection progress have been permanently deleted.
                  </p>
                  <p>
                    Accounts that never confirmed their email address were also permanently
                    deleted.
                  </p>
                  <div
                    className={`rounded-xl border p-4 ${
                      isLightMode
                        ? "border-[#E7C84B]/40 bg-[#E7C84B]/10"
                        : "border-[#E7C84B]/20 bg-[#E7C84B]/[0.06]"
                    }`}
                  >
                    <p className={`font-semibold ${accentText}`}>
                      Having trouble with confirmation or password reset emails?
                    </p>
                    <p className={`mt-1 text-sm leading-6 ${bodyText}`}>
                      You may need to mark the email as trusted and then refresh the page
                      before the link will work properly. Gmail in particular really hates us.
                    </p>
                  </div>
                </div>
              </article>
              <article className={`rounded-2xl border p-5 sm:p-6 ${surface}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-sm font-semibold ${accentText}`}>Update</span>
                  <time className={`text-xs ${muted}`}>August 7, 2026</time>
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Share Your Collection</h2>
                <p className={`mt-4 text-[15px] leading-7 ${bodyText}`}>
                  Click <strong>Share</strong> in your profile to instantly create a public
                  page that anyone can view. Share your ISO, Wishlist, and Trades with
                  collectors outside of MLPEKayou.
                </p>
              </article>
            </div>
          )}
          {activeTab === "tutorial" && (
            <div>
              <div className="mb-5">
                <h2 className="text-2xl font-semibold tracking-tight">How the website works</h2>
                <p className={`mt-1 text-sm leading-6 ${muted}`}>
                  Choose a feature to open it. Each card explains what it does in plain language.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {tutorialItems.slice(0, 4).map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    className={`rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${surface} ${
                      isLightMode
                        ? "hover:border-[#E7C84B]/60 hover:shadow-[0_12px_30px_rgba(117,90,16,0.12)]"
                        : "hover:border-[#E7C84B]/40 hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                    }`}
                  >
                    <h3 className={`text-lg font-semibold ${accentText}`}>{item.title}</h3>
                    <p className={`mt-2 text-sm leading-6 ${bodyText}`}>{item.body}</p>
                  </a>
                ))}
              </div>
              <div className={`my-4 rounded-2xl border p-5 ${surface}`}>
                <div className="flex flex-wrap gap-3">
                  <a href="/my-progress" className={`font-semibold ${accentText} hover:underline`}>
                    Progress CCG
                  </a>
                  <span className={muted}>•</span>
                  <a href="/progress-tcg" className={`font-semibold ${accentText} hover:underline`}>
                    Progress TCG
                  </a>
                </div>
                <p className={`mt-2 text-sm leading-6 ${bodyText}`}>
                  See which sets you&apos;ve mastered and track your overall completion separately
                  for CCG and TCG collections.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {tutorialItems.slice(4).map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    className={`rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${surface} ${
                      isLightMode
                        ? "hover:border-[#E7C84B]/60 hover:shadow-[0_12px_30px_rgba(117,90,16,0.12)]"
                        : "hover:border-[#E7C84B]/40 hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                    }`}
                  >
                    <h3 className={`text-lg font-semibold ${accentText}`}>{item.title}</h3>
                    <p className={`mt-2 text-sm leading-6 ${bodyText}`}>{item.body}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
          {activeTab === "resources" && (
            <div>
              <div className="mb-5">
                <h2 className="text-2xl font-semibold tracking-tight">Community resources</h2>
                <p className={`mt-1 text-sm leading-6 ${muted}`}>
                  Event hosting tools and helpful resources from the Kayou community.
                </p>
              </div>
              <div className="space-y-4">
                <article className={`rounded-2xl border p-5 sm:p-6 ${surface}`}>
                  <p className={`text-sm font-semibold ${accentText}`}>For local game stores</p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-tight">LGS Hosting Organization Program</h3>
                  <p className={`mt-3 text-sm leading-6 ${bodyText}`}>
                    Give your staff a shared place to manage tournaments and track events as they happen.
                    Apply for your store whether you already host events or are preparing for your first one.
                    Please choose one representative to submit your store’s application.
                  </p>
                  <button type="button" onClick={() => setShowLGSApplication(true)}
                    className="mt-5 rounded-xl bg-[#E7C84B] px-5 py-3 text-base font-semibold text-[#111111] transition hover:bg-[#FFE477] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E7C84B]">
                    Apply for the LGS Program
                  </button>
                </article>
                {resources.map((resource) => (
                  <a
                    key={resource.title}
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`grid overflow-hidden rounded-2xl border transition-all md:grid-cols-[240px_1fr] ${surface} ${
                      isLightMode
                        ? "hover:border-[#E7C84B]/60"
                        : "hover:border-[#E7C84B]/40"
                    }`}
                  >
                    <div
                      className={`flex min-h-40 items-center justify-center overflow-hidden ${
                        resource.title === "Doodle Binder" ? "p-0" : "p-5"
                      } ${isLightMode ? "bg-[#f1eee5]" : "bg-[#101010]"}`}
                    >
                      <CardImage
                        src={resource.image}
                        alt={resource.title}
                        className={resource.imageClass}
                      />
                    </div>
                    <div className="flex flex-col justify-center p-5 sm:p-6">
                      <p className={`text-sm font-semibold ${accentText}`}>Community resource</p>
                      <div className="mt-1 flex items-center justify-between gap-4">
                        <h3 className="text-2xl font-semibold tracking-tight">{resource.title}</h3>
                        <span aria-hidden="true" className={`text-xl ${accentText}`}>↗</span>
                      </div>
                      <p className={`mt-3 text-sm leading-6 ${bodyText}`}>
                        {resource.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
          {activeTab === "partnership" && (
            <div className="space-y-4">
              <article
                className={`rounded-2xl border-l-4 border-l-red-500 border p-5 sm:p-6 ${surface}`}
              >
                <p className="text-sm font-semibold text-red-500">Important disclaimer</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">MLPEKAYOU Is Not Kayou US</h2>
                <p className={`mt-4 text-[15px] font-semibold leading-7 ${isLightMode ? "text-zinc-900" : "text-white"}`}>
                  MLPEKAYOU is a fan website. It is not owned, operated, or managed by Kayou US.
                </p>
                <p className={`mt-3 text-[15px] leading-7 ${bodyText}`}>
                  MLPEKAYOU generates <strong>$0.00</strong> in revenue and will never
                  display advertisements, subscriptions, premium memberships, or paywalls.
                  The goal of this project has always been to provide a completely free
                  resource for the My Little Pony Kayou community.
                </p>
              </article>
              <a
                href="https://stonestradingco.com/collections/my-little-pony"
                target="_blank"
                rel="noopener noreferrer"
                className={`block rounded-2xl border p-5 transition-all sm:p-6 ${surface} ${
                  isLightMode
                    ? "hover:border-[#E7C84B]/60"
                    : "hover:border-[#E7C84B]/40"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${accentText}`}>Official partner</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">Stones Trading Co</h2>
                  </div>
                  <span aria-hidden="true" className={`text-2xl ${accentText}`}>↗</span>
                </div>
                <div className={`mt-4 space-y-3 text-[15px] leading-7 ${bodyText}`}>
                  <p>
                    Purchasing My Little Pony products through StonesTradingCo comes
                    directly through Keegan. The MLPEKAYOU Discord regularly hosts Live
                    Rip Nights, where products are opened live for collectors.
                  </p>
                  <p>
                    StonesTradingCo pays Keegan a commission on these purchases, which is
                    used to fund server costs, development, and maintenance of MLPEKAYOU
                    while keeping every feature completely free for the community.
                  </p>
                </div>
              </a>
              <a
                href="https://pakracards.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`block rounded-2xl border p-5 transition-all sm:p-6 ${surface} ${
                  isLightMode
                    ? "hover:border-[#E7C84B]/60"
                    : "hover:border-[#E7C84B]/40"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${accentText}`}>Official partner</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">PakraCards</h2>
                  </div>
                  <span aria-hidden="true" className={`text-2xl ${accentText}`}>↗</span>
                </div>
                <p className={`mt-4 text-[15px] leading-7 ${bodyText}`}>
                  A little Kayou CN store run by a lovely couple, Amber and Hao. Amber and Hao
                  sell singles, sealed products, live rips, and other things like plushies,
                  pins, pens, and more! You will never have to worry about a resealed or
                  counterfeit card from PakraCards.
                </p>
              </a>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
