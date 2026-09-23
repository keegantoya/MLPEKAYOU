import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import ScrollToTop from "@/components/ScrollToTop";
import KayouHeader from "@/components/KayouHeader";
import Index from "./pages/Index";
import KayouNews from "./pages/Main Pages/kayou-news";
import Collections from "./pages/Collections";
import MyProgress from "./pages/MyProgress";
import Community from "./pages/Community";
import CommunitySet from "./pages/CommunitySet";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import Selling from "@/pages/selling";
import PasswordReset from "./pages/password-reset";
import AccountConfirmation from "./pages/accountconfirmation";
import TradingPost from "./pages/trading-post";
import TradingPostInner from "./pages/trading-post-inner";
import MyTrades from "@/pages/MyTrades";
import MyTradesSets from "@/pages/MyTradesSets";
import MyTradesView from "@/pages/MyTradesView";
import RequireAuth from "./components/RequireAuth";
import FAQ from "@/pages/FAQ";
import MyProgressTCG from "./pages/MyProgressTCG";
import LinksPage from "./pages/linkspage";
import ISO from "./pages/ISO/iso";
import ThrowawayPage from "./pages/throwawaypage";
import MoonOne from "./pages/Sets/Moon Editions/moon-one";
import MoonTwo from "./pages/Sets/Moon Editions/moon-two";
import MoonThree from "./pages/Sets/Moon Editions/moon-three";
import RainbowOne from "./pages/Sets/Rainbow Editions/rainbow-one";
import RainbowTwo from "./pages/Sets/Rainbow Editions/rainbow-two";
import FunMomentsOne from "./pages/Sets/Fun Moments Editions/fun-moments-one";
import FunMomentsTwo from "./pages/Sets/Fun Moments Editions/fun-moments-two";
import FunMomentsThree from "./pages/Sets/Fun Moments Editions/fun-moments-three";
import StarOne from "./pages/Sets/Star Editions/star-one";
import FantasyWonderland from "./pages/Sets/Trading Card Game/fantasy-wonderland";
import FriendshipsBegin from "./pages/Sets/Trading Card Game/friendships-begin";
import Discord from "./pages/Sets/Trading Card Game/discord";
import NightmareNight from "./pages/Sets/Trading Card Game/nightmare-night";
import PromotionalCards from "./pages/Sets/Promos/promotional-cards";
import LeapingPonies from "./pages/Sets/Others/leaping-ponies";
import Explore from "./pages/Everypony/explore";
import Binders from "./pages/Main Pages/binders";
import Support from "./pages/Main Pages/support-mlpekayou";
import Inbox from "./pages/Friends/inbox";
import MobileProfile from "./pages/Personal/mobile-profile";
import DesktopProfile from "./pages/Personal/desktop-profile";
import ChangeAvatar from "./pages/Personal/change-avatar";
import LeaderboardModeration from "./pages/Personal/LeaderboardModeration";
import PublicProfile from "@/pages/Everypony/PublicProfile";
import LGSBoards from "./pages/Personal/LGSBoards";
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});
const PUBLIC_AUTH_PATHS = new Set([
  "/",
  "/password-reset",
  "/account-confirmation",
  "/links",
]);
// One-segment URLs may be public profile links. Keep every named app route gated.
const RESERVED_PATHS = new Set([
  "/collections", "/moon-one", "/moon-two", "/moon-three",
  "/rainbow-one", "/rainbow-two", "/fun-moments-one",
  "/fun-moments-two", "/fun-moments-three", "/star-one",
  "/fantasy-wonderland", "/friendships-begin", "/discord",
  "/nightmare-night", "/promotional-cards", "/leaping-ponies",
  "/explore", "/my-progress", "/inventory", "/iso",
  "/community", "/leaderboard", "/selling", "/trading-post",
  "/faq", "/kayou-news", "/support-mlpekayou", "/binders",
  "/throwawaypage", "/mobile-profile", "/desktop-profile",
  "/inbox", "/progress-tcg", "/leaderboard-moderation",
  "/lgs-boards",
]);
function SiteAccessGate({ children }: { children: ReactNode }) {
const location = useLocation();
const navigate = useNavigate();
const [authState, setAuthState] = useState<
    "checking" | "authenticated" | "anonymous"
  >("checking");
const [showLoginRequired, setShowLoginRequired] = useState(false);
const normalizedPath =
    location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
const isPublicProfilePath =
    /^\/[^/]+$/.test(normalizedPath) && !RESERVED_PATHS.has(normalizedPath);
const isPublicPath = PUBLIC_AUTH_PATHS.has(normalizedPath) || isPublicProfilePath;
const isBlockedRoute = authState === "anonymous" && !isPublicPath;
  useEffect(() => {
let mounted = true;
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setAuthState(session?.user ? "authenticated" : "anonymous");
    });
const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setAuthState(session?.user ? "authenticated" : "anonymous");
      if (session?.user) setShowLoginRequired(false);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (
      authState !== "anonymous" ||
      isPublicPath
    ) {
      return;
    }
    setShowLoginRequired(true);
    navigate("/", { replace: true });
  }, [authState, navigate, isPublicPath]);
  useEffect(() => {
    if (isPublicProfilePath) setShowLoginRequired(false);
  }, [isPublicProfilePath]);
  useEffect(() => {
    if (!showLoginRequired) return;
const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showLoginRequired]);
  if (authState === "checking" && !isPublicPath) {
    return (
      <div className="fixed inset-0 z-[30000] flex items-center justify-center bg-[#111111] px-4 text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#181818] px-5 py-4 shadow-xl">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[#E7C84B]" />
          <span className="text-sm font-semibold">Checking your session…</span>
        </div>
      </div>
    );
  }
  return (
    <>
      {!isBlockedRoute && children}
      {(showLoginRequired || isBlockedRoute) && authState === "anonymous" && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="site-login-required-title"
          aria-describedby="site-login-required-message"
          className="fixed inset-0 z-[30000] flex items-center justify-center overflow-y-auto bg-black/85 px-4 py-5 backdrop-blur-md"
        >
          <div className="my-auto w-full max-w-xl rounded-[26px] border border-white/10 bg-[#17191b] p-5 text-white shadow-[0_30px_90px_rgba(0,0,0,.55)] sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E7C84B] text-xl font-black text-[#111517]">
                !
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E7C84B]">
                  Account required
                </p>
                <h1
                  id="site-login-required-title"
                  className="mt-1 font-['Oxanium'] text-2xl font-bold tracking-tight sm:text-3xl"
                >
                  You must now log in or create an account in order to go
                  anywhere.
                </h1>
              </div>
            </div>
            <div
              id="site-login-required-message"
              className="mt-5 max-h-[52vh] space-y-3 overflow-y-auto rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-4 text-sm leading-6 text-zinc-300 sm:max-h-none sm:px-5"
            >
              <p>
                This is due to Meta AI and OpenAI continually finding ways
                around my firewalls and ramping my bill up toward $300 every
                single month. Every firewall I put up, they found a way around,
                and now it has given me no choice but to lock everything down.
              </p>
              <p>
                If you find your way around this screen, you’ll find that all
                information reads 0 or does not load. You must have an account
                now to proceed.
              </p>
              <p>
                I know this is inconvenient, and I apologize. MLPEKAYOU is a
                project that I work on in my free time. It has zero paywalls and
                does not require any payments or special subscriptions. It is
                entirely free.
              </p>
              <p>
                I cannot keep pouring as much money as I do into it to satisfy
                AI scraping. I do hope you understand.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLoginRequired(false)}
              className="mt-5 min-h-12 w-full rounded-2xl bg-[#E7C84B] px-5 py-3 text-base font-bold text-[#111517] transition hover:bg-[#FFE477] active:scale-[0.99]"
            >
              Return to the homepage to log in
            </button>
          </div>
        </div>
      )}
    </>
  );
}
function RequireLGSStaff({ children }: { children: ReactNode }) {
const [access, setAccess] = useState<"checking" | "allowed" | "denied">(
    "checking",
  );
  useEffect(() => {
let mounted = true;
let request = 0;
let accessUserId: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const checkAccess = async () => {
const ticket = ++request;
      try {
const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (!mounted || ticket !== request) return;
        if (sessionError || !session?.user) {
          accessUserId = null;
          setAccess("denied");
          return;
        }
        if (accessUserId !== session.user.id) setAccess("checking");
        accessUserId = session.user.id;
const { data, error } = await (supabase as unknown as SupabaseClient)
          .from("lgs_staff")
          .select("role, store_id")
          .eq("user_id", session.user.id)
          .eq("active", true)
          .maybeSingle();
        if (!mounted || ticket !== request) return;
const qualifies =
          !error &&
          data &&
          (data.role === "ALLGS" || (data.role === "STAFF" && data.store_id));
        setAccess(qualifies ? "allowed" : "denied");
      } catch {
        if (mounted && ticket === request) setAccess("denied");
      }
    };
const scheduleCheck = () => {
      ++request;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (mounted) void checkAccess();
      }, 0);
    };
const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if ((session?.user.id ?? null) !== accessUserId) {
        setAccess(session?.user ? "checking" : "denied");
      }
      scheduleCheck();
    });
    void checkAccess();
    window.addEventListener("focus", scheduleCheck);
    return () => {
      mounted = false;
      ++request;
      clearTimeout(timer);
      subscription.unsubscribe();
      window.removeEventListener("focus", scheduleCheck);
    };
  }, []);
  if (access === "checking") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen items-center justify-center px-6 text-center text-base"
      >
        Checking staff access…
      </div>
    );
  }
  if (access === "denied") return <Navigate to="/" replace />;
  return <>{children}</>;
}
const AppRoutes = () => {
  useEffect(() => {
let lastUserId: string | null = null;
const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
const currentUserId = session?.user?.id ?? null;
      if (currentUserId !== lastUserId) lastUserId = currentUserId;
    });
const handleRightClick = (event: MouseEvent) => {
      if (event.target instanceof HTMLElement && event.target.tagName === "IMG")
        event.preventDefault();
    };
const preventDrag = (event: DragEvent) => event.preventDefault();
    document.addEventListener("contextmenu", handleRightClick);
    document.addEventListener("dragstart", preventDrag);
    return () => {
      subscription.unsubscribe();
      document.removeEventListener("contextmenu", handleRightClick);
      document.removeEventListener("dragstart", preventDrag);
    };
  }, []);
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/collections" element={<Collections />} />
      <Route
        path="/moon-one"
        element={
          <RequireAuth>
            <MoonOne />
          </RequireAuth>
        }
      />
      <Route
        path="/moon-two"
        element={
          <RequireAuth>
            <MoonTwo />
          </RequireAuth>
        }
      />
      <Route
        path="/moon-three"
        element={
          <RequireAuth>
            <MoonThree />
          </RequireAuth>
        }
      />
      <Route
        path="/rainbow-one"
        element={
          <RequireAuth>
            <RainbowOne />
          </RequireAuth>
        }
      />
      <Route
        path="/rainbow-two"
        element={
          <RequireAuth>
            <RainbowTwo />
          </RequireAuth>
        }
      />
      <Route
        path="/fun-moments-one"
        element={
          <RequireAuth>
            <FunMomentsOne />
          </RequireAuth>
        }
      />
      <Route
        path="/fun-moments-two"
        element={
          <RequireAuth>
            <FunMomentsTwo />
          </RequireAuth>
        }
      />
      <Route
        path="/fun-moments-three"
        element={
          <RequireAuth>
            <FunMomentsThree />
          </RequireAuth>
        }
      />
      <Route
        path="/star-one"
        element={
          <RequireAuth>
            <StarOne />
          </RequireAuth>
        }
      />
      <Route
        path="/fantasy-wonderland"
        element={
          <RequireAuth>
            <FantasyWonderland />
          </RequireAuth>
        }
      />
      <Route
        path="/friendships-begin"
        element={
          <RequireAuth>
            <FriendshipsBegin />
          </RequireAuth>
        }
      />
      <Route
        path="/discord"
        element={
          <RequireAuth>
            <Discord />
          </RequireAuth>
        }
      />
      <Route
        path="/nightmare-night"
        element={
          <RequireAuth>
            <NightmareNight />
          </RequireAuth>
        }
      />
      <Route
        path="/promotional-cards"
        element={
          <RequireAuth>
            <PromotionalCards />
          </RequireAuth>
        }
      />
      <Route
        path="/leaping-ponies"
        element={
          <RequireAuth>
            <LeapingPonies />
          </RequireAuth>
        }
      />
      <Route
        path="/explore"
        element={
          <RequireAuth>
            <Explore />
          </RequireAuth>
        }
      />
      <Route
        path="/my-progress"
        element={
          <RequireAuth>
            <MyProgress />
          </RequireAuth>
        }
      />
      <Route
        path="/inventory"
        element={
          <RequireAuth>
            <MyTrades />
          </RequireAuth>
        }
      />
      <Route path="/inventory/:setId" element={<MyTradesSets />} />
      <Route
        path="/Personal/change-avatar"
        element={
          <RequireAuth>
            <ChangeAvatar />
          </RequireAuth>
        }
      />
      <Route
        path="/iso"
        element={
          <RequireAuth>
            <ISO />
          </RequireAuth>
        }
      />
      <Route path="/community" element={<Community />} />
      <Route path="/community/:id" element={<CommunitySet />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/selling" element={<Selling />} />
      <Route path="/trading-post" element={<TradingPost />} />
      <Route path="/trading-post/:setId" element={<TradingPostInner />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/kayou-news" element={<KayouNews />} />
      <Route path="/support-mlpekayou" element={<Support />} />
      <Route path="/binders" element={<Binders />} />
      <Route path="/links" element={<LinksPage />} />
      <Route path="/throwawaypage" element={<ThrowawayPage />} />
      <Route
        path="/mobile-profile"
        element={
          <RequireAuth>
            <MobileProfile />
          </RequireAuth>
        }
      />
      <Route
        path="/desktop-profile"
        element={
          <RequireAuth>
            <DesktopProfile />
          </RequireAuth>
        }
      />
      <Route
        path="/inbox"
        element={
          <RequireAuth>
            <Inbox />
          </RequireAuth>
        }
      />
      <Route
        path="/progress-tcg"
        element={
          <RequireAuth>
            <MyProgressTCG />
          </RequireAuth>
        }
      />
      <Route
        path="/my-trades/view/:setId"
        element={
          <RequireAuth>
            <MyTradesView />
          </RequireAuth>
        }
      />
      <Route path="/account-confirmation" element={<AccountConfirmation />} />
      <Route
        path="/leaderboard-moderation"
        element={
          <RequireAuth>
            <LeaderboardModeration />
          </RequireAuth>
        }
      />
      <Route
        path="/lgs-boards"
        element={
          <RequireLGSStaff>
            <LGSBoards />
          </RequireLGSStaff>
        }
      />
      <Route path="/:username" element={<PublicProfile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
function AppLayout() {
const { pathname, search } = useLocation();
const normalizedPath = pathname.replace(/\/+$/, "").toLowerCase() || "/";
const hideNavigation =
    normalizedPath === "/links" ||
    normalizedPath === "/lgs-boards" ||
    new URLSearchParams(search).has("embed");
const standalone = window.matchMedia("(display-mode: standalone)").matches;
  return (
    <>
      <ScrollToTop />
      {!hideNavigation && <KayouHeader />}
      <div
        className={
          hideNavigation
            ? "min-h-screen"
            : `min-h-screen sm:pt-[64px] sm:pb-0 ${standalone ? "pt-[88px]" : "pt-[52px]"}`
        }
      >
        <SiteAccessGate>
          <AppRoutes />
        </SiteAccessGate>
      </div>
    </>
  );
}
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;