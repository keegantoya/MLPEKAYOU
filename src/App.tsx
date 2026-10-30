import CollectionPageExperience from "@/components/CollectionPageExperience";
import ChinesePakraLinks from "@/components/ChinesePakraLinks";
import MLPEKAYOUFooter from "@/components/MLPEKAYOUFooter";
import ChineseLaserTickets from "./pages/Chinese Kayou/Chinese Sets/Other Sets/CN-Laser-Tickets";
import { chineseTicketLayoutCSS } from "@/pages/Chinese Kayou/Chinese ISO/catalog/catalog";
import ChineseKujiRaffles from "./pages/Chinese Kayou/Chinese Sets/Other Sets/Kuji-Raffles";
import BadgesPins from "./pages/Sets/Other Merch/Badges-Pins";
import AcrylicStands from "./pages/Sets/Other Merch/Acrylic-Stands";
import GelPens from "./pages/Sets/Other Merch/Gel-Pens";
import { isValidElement, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, createRoutesFromElements, matchRoutes, useLocation, useNavigate, } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import ScrollToTop from "@/components/ScrollToTop";
import KayouHeader from "@/components/KayouHeader";
import Index from "./pages/Main Pages/Index";
import SupportCreators from "./pages/Main Pages/Support-Creators";
import Collections from "./pages/Main Pages/Collections";
import ChineseMoonOne from "./pages/Chinese Kayou/Chinese Sets/Moon Editions/CN-Moon-One";
import ChineseMoonTwo from "./pages/Chinese Kayou/Chinese Sets/Moon Editions/CN-Moon-Two";
import ChineseMoonThree from "./pages/Chinese Kayou/Chinese Sets/Moon Editions/CN-Moon-Three";
import ChineseMoonFour from "./pages/Chinese Kayou/Chinese Sets/Moon Editions/CN-Moon-Four";
import ChineseMoonFive from "./pages/Chinese Kayou/Chinese Sets/Moon Editions/CN-Moon-Five";
import ChineseMoonSix from "./pages/Chinese Kayou/Chinese Sets/Moon Editions/CN-Moon-Six";
import ChineseMoonSeven from "./pages/Chinese Kayou/Chinese Sets/Moon Editions/CN-Moon-Seven";
import ChineseMoonEight from "./pages/Chinese Kayou/Chinese Sets/Moon Editions/CN-Moon-Eight";
import ChineseMoonNine from "./pages/Chinese Kayou/Chinese Sets/Moon Editions/CN-Moon-Nine";
import ChineseMoonTen from "./pages/Chinese Kayou/Chinese Sets/Moon Editions/CN-Moon-Ten";
import ChineseMoonEleven from "./pages/Chinese Kayou/Chinese Sets/Moon Editions/CN-Moon-Eleven";
import ChineseMoonThirteen from "./pages/Chinese Kayou/Chinese Sets/Moon Editions/CN-Moon-Thirteen";
import ChineseMoonTwelve from "./pages/Chinese Kayou/Chinese Sets/Moon Editions/CN-Moon-Twelve";
import ChineseFunOne from "./pages/Chinese Kayou/Chinese Sets/Fun Moments Editions/CN-Fun-One";
import ChineseFunTwo from "./pages/Chinese Kayou/Chinese Sets/Fun Moments Editions/CN-Fun-Two";
import ChineseFunThree from "./pages/Chinese Kayou/Chinese Sets/Fun Moments Editions/CN-Fun-Three";
import ChineseFunFour from "./pages/Chinese Kayou/Chinese Sets/Fun Moments Editions/CN-Fun-Four";
import ChineseFunFive from "./pages/Chinese Kayou/Chinese Sets/Fun Moments Editions/CN-Fun-Five";
import ChineseFunSix from "./pages/Chinese Kayou/Chinese Sets/Fun Moments Editions/CN-Fun-Six";
import ChineseFunSeven from "./pages/Chinese Kayou/Chinese Sets/Fun Moments Editions/CN-Fun-Seven";
import ChineseFunEight from "./pages/Chinese Kayou/Chinese Sets/Fun Moments Editions/CN-Fun-Eight";
import ChineseFunNine from "./pages/Chinese Kayou/Chinese Sets/Fun Moments Editions/CN-Fun-Nine";
import ChineseRainbowOne from "./pages/Chinese Kayou/Chinese Sets/Rainbow Sets/CN-Rainbow-One";
import ChineseRainbowTwo from "./pages/Chinese Kayou/Chinese Sets/Rainbow Sets/CN-Rainbow-Two";
import ChineseRainbowThree from "./pages/Chinese Kayou/Chinese Sets/Rainbow Sets/CN-Rainbow-Three";
import ChineseRainbowFour from "./pages/Chinese Kayou/Chinese Sets/Rainbow Sets/CN-Rainbow-Four";
import ChineseRainbowFive from "./pages/Chinese Kayou/Chinese Sets/Rainbow Sets/CN-Rainbow-Five";
import ChineseStarOne from "./pages/Chinese Kayou/Chinese Sets/Star Editions/CN-Star-One";
import ChineseStarTwo from "./pages/Chinese Kayou/Chinese Sets/Star Editions/CN-Star-Two";
import ChineseStarThree from "./pages/Chinese Kayou/Chinese Sets/Star Editions/CN-Star-Three";
import ChinesePromos from "./pages/Chinese Kayou/Chinese Sets/Promotional Cards/CN-Promos";
import ChineseStardustOne from "./pages/Chinese Kayou/Chinese Sets/Other Sets/CN-Stardust-One";
import ChineseStardustTwo from "./pages/Chinese Kayou/Chinese Sets/Other Sets/CN-Stardust-Two";
import ChineseMagicBookOne from "./pages/Chinese Kayou/Chinese Sets/Other Sets/CN-MagicBook-One";
import ChineseNewYearsOne from "./pages/Chinese Kayou/Chinese Sets/Other Sets/CN-NewYears-One";
import ChineseNewYearsTwo from "./pages/Chinese Kayou/Chinese Sets/Other Sets/CN-NewYears-Two";
import ISOChinese from "./pages/Chinese Kayou/Chinese ISO/ISOChinese";
import CollectionsChinese from "./pages/Chinese Kayou/Chinese Specific Pages/CollectionsChinese";
import Community from "./pages/Main Pages/Community";
import CommunitySet from "./pages//Main Pages/CommunitySet";
import Leaderboard from "./pages/Main Pages/Leaderboard";
import ChineseLeaderboard from "./pages/Chinese Kayou/Chinese Specific Pages/Chinese-Leaderboard";
import NotFound from "./pages/NotFound";
import Selling from "@/pages/Everypony/selling";
import PasswordReset from "./pages/password-reset";
import AccountConfirmation from "./pages/accountconfirmation";
import TradingPost from "./pages/Main Pages/trading-post";
import TradingPostInner from "./pages/Main Pages/trading-post-inner";
import ChineseTradePost from "./pages/Chinese Kayou/Chinese Specific Pages/Chinese-TradePost";
import ChineseTradePostInner from "./pages/Chinese Kayou/Chinese Specific Pages/Chinese-TradePostInner";
import MyTrades from "@/pages/Personal/MyTrades";
import MyTradesSets from "@/pages/Personal/MyTradesSets";
import RequireAuth from "./components/RequireAuth";
import SetInformation from "@/pages/Everypony/Set-Information";
import ISO from "./pages/ISO/iso";
import MoonOne from "./pages/Sets/Moon Editions/moon-one";
import MoonTwo from "./pages/Sets/Moon Editions/moon-two";
import MoonFour from "./pages/Sets/Moon Editions/moon-four";
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
import HeartswarmingEve from "./pages/Sets/Trading Card Game/HearthswarmingEve";
import NightmareNight from "./pages/Sets/Trading Card Game/nightmare-night";
import PromotionalCards from "./pages/Sets/Promos/promotional-cards";
import Explore from "./pages/Everypony/explore";
import Binders from "./pages/Main Pages/binders";
import ChineseInventory from "./pages/Chinese Kayou/Chinese Specific Pages/Chinese-Inventory";
import ChineseInventoryInner from "./pages/Chinese Kayou/Chinese Specific Pages/Chinese-Inventory-Inner";
import ChineseBinders from "./pages/Chinese Kayou/Chinese Specific Pages/Chinese-Binders";
import Support from "./pages/Main Pages/support-mlpekayou";
import Inbox from "./pages/Friends/inbox";
import MobileProfile from "./pages/Personal/mobile-profile";
import DesktopProfile from "./pages/Personal/desktop-profile";
import ChangeAvatar from "./pages/Personal/change-avatar";
import LeaderboardModeration from "./pages/Personal/LeaderboardModeration";
import PublicProfile from "@/pages/Everypony/PublicProfile";
import LGSBoards from "./pages/Personal/LGSBoards";
import GoFish from "./pages/Game/Go-Fish";
import MatchPairs from "./pages/Game/Match-Pairs";
const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false } },
});
const PUBLIC_AUTH_PATHS = new Set([
    "/",
    "/password-reset",
    "/account-confirmation",
]);
function SiteAccessGate({ children, publicProfileRoute = false }: {
    children: ReactNode;
    publicProfileRoute?: boolean;
}) {
const location = useLocation();
const navigate = useNavigate();
const [authState, setAuthState] = useState<"checking" | "authenticated" | "anonymous">("checking");
const [showLoginRequired, setShowLoginRequired] = useState(false);
const normalizedPath = location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
const isPublicRoute = publicProfileRoute || PUBLIC_AUTH_PATHS.has(normalizedPath);
const isBlockedRoute = authState === "anonymous" && !isPublicRoute;
    useEffect(() => {
let mounted = true;
        void supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted)
                return;
            setAuthState(session?.user ? "authenticated" : "anonymous");
        });
const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted)
                return;
            setAuthState(session?.user ? "authenticated" : "anonymous");
            if (session?.user)
                setShowLoginRequired(false);
        });
        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);
    useEffect(() => {
        if (isPublicRoute) {
            setShowLoginRequired(false);
            return;
        }
        if (authState !== "anonymous") return;
        setShowLoginRequired(true);
        navigate("/", { replace: true });
    }, [authState, navigate, normalizedPath, isPublicRoute]);
    useEffect(() => {
        if (!showLoginRequired)
            return;
const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [showLoginRequired]);
    if (authState === "checking" && !isPublicRoute) {
        return (<div className="fixed inset-0 z-[30000] flex items-center justify-center bg-[#111111] px-4 text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#181818] px-5 py-4 shadow-xl">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[#E7C84B]"/>
          <span className="text-sm font-semibold">Checking your session...</span>
        </div>
      </div>);
    }
    return (<>
      {!isBlockedRoute && children}
      {(showLoginRequired || isBlockedRoute) && !publicProfileRoute && authState === "anonymous" && (<div role="alertdialog" aria-modal="true" aria-labelledby="site-login-required-title" aria-describedby="site-login-required-message" className="fixed inset-0 z-[30000] flex items-center justify-center overflow-y-auto bg-black/85 px-4 py-5 backdrop-blur-md">
          <div className="my-auto w-full max-w-xl rounded-[26px] border border-white/10 bg-[#17191b] p-5 text-white shadow-[0_30px_90px_rgba(0,0,0,.55)] sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E7C84B] text-xl font-black text-[#111517]">
                !
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E7C84B]">
                  Account required
                </p>
                <h1 id="site-login-required-title" className="mt-1 font-['Oxanium'] text-2xl font-bold tracking-tight sm:text-3xl">
                  You must now log in or create an account in order to go
                  anywhere.
                </h1>
              </div>
            </div>
            <div id="site-login-required-message" className="mt-5 max-h-[52vh] space-y-3 overflow-y-auto rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-4 text-sm leading-6 text-zinc-300 sm:max-h-none sm:px-5">
              <p>
                This is due to Meta AI and OpenAI continually finding ways
                around my firewalls and ramping my bill up toward $300 every
                single month. Every firewall I put up, they found a way around,
                and now it has given me no choice but to lock everything down.
              </p>
              <p>
                If you find your way around this screen, you'll find that all
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
            <button type="button" onClick={() => setShowLoginRequired(false)} className="mt-5 min-h-12 w-full rounded-2xl bg-[#E7C84B] px-5 py-3 text-base font-bold text-[#111517] transition hover:bg-[#FFE477] active:scale-[0.99]">
              Return to the homepage to log in
            </button>
          </div>
        </div>)}
    </>);
}
function RequireLGSStaff({ children }: {
    children: ReactNode;
}) {
const [access, setAccess] = useState<"checking" | "allowed" | "denied">("checking");
    useEffect(() => {
let mounted = true;
let request = 0;
let accessUserId: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const checkAccess = async () => {
const ticket = ++request;
            try {
const { data: { session }, error: sessionError, } = await supabase.auth.getSession();
                if (!mounted || ticket !== request)
                    return;
                if (sessionError || !session?.user) {
                    accessUserId = null;
                    setAccess("denied");
                    return;
                }
                if (accessUserId !== session.user.id)
                    setAccess("checking");
                accessUserId = session.user.id;
const { data, error } = await (supabase as unknown as SupabaseClient)
                    .from("lgs_staff")
                    .select("role, store_id")
                    .eq("user_id", session.user.id)
                    .eq("active", true)
                    .maybeSingle();
                if (!mounted || ticket !== request)
                    return;
const qualifies = !error &&
                    data &&
                    (data.role === "ALLGS" || (data.role === "STAFF" && data.store_id));
                setAccess(qualifies ? "allowed" : "denied");
            }
            catch {
                if (mounted && ticket === request)
                    setAccess("denied");
            }
        };
const scheduleCheck = () => {
            ++request;
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (mounted)
                    void checkAccess();
            }, 0);
        };
const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted)
                return;
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
        return (<div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center px-6 text-center text-base">
        Checking staff access...
      </div>);
    }
    if (access === "denied")
        return <Navigate to="/" replace/>;
    return <>{children}</>;
}
const AppRoutes = () => {
const location = useLocation();
    useEffect(() => {
let lastUserId: string | null = null;
const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
const currentUserId = session?.user?.id ?? null;
            if (currentUserId !== lastUserId)
                lastUserId = currentUserId;
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
const routes = (<Routes>
      <Route path="/" element={<Index />}/>
      <Route path="/go-fish" element={<RequireAuth><GoFish /></RequireAuth>}/>
      <Route path="/match-pairs" element={<RequireAuth><MatchPairs /></RequireAuth>}/>
      <Route path="/badges-pins" element={<RequireAuth><BadgesPins /></RequireAuth>}/>
      <Route path="/acrylic-stands" element={<RequireAuth><AcrylicStands /></RequireAuth>}/>
      <Route path="/gel-pens" element={<RequireAuth><GelPens /></RequireAuth>}/>
      <Route path="/collections" element={<Collections />}/>
    <Route path="/cn-moon-one" element={<RequireAuth><ChineseMoonOne /></RequireAuth>}/>
  <Route path="/cn-moon-two" element={<RequireAuth><ChineseMoonTwo /></RequireAuth>}/>
  <Route path="/cn-moon-three" element={<RequireAuth><ChineseMoonThree /></RequireAuth>}/>
  <Route path="/cn-moon-four" element={<RequireAuth><ChineseMoonFour /></RequireAuth>}/>
  <Route path="/cn-moon-five" element={<RequireAuth><ChineseMoonFive /></RequireAuth>}/>
  <Route path="/cn-moon-six" element={<RequireAuth><ChineseMoonSix /></RequireAuth>}/>
  <Route path="/cn-moon-seven" element={<RequireAuth><ChineseMoonSeven /></RequireAuth>}/>
  <Route path="/cn-moon-eight" element={<RequireAuth><ChineseMoonEight /></RequireAuth>}/>
  <Route path="/cn-moon-nine" element={<RequireAuth><ChineseMoonNine /></RequireAuth>}/>
  <Route path="/cn-moon-ten" element={<RequireAuth><ChineseMoonTen /></RequireAuth>}/>
  <Route path="/cn-moon-eleven" element={<RequireAuth><ChineseMoonEleven /></RequireAuth>}/>
  <Route path="/cn-moon-twelve" element={<RequireAuth><ChineseMoonTwelve /></RequireAuth>}/>
  <Route path="/cn-moon-thirteen" element={<RequireAuth><ChineseMoonThirteen /></RequireAuth>}/>
  <Route path="/cn-fun-one" element={<RequireAuth><ChineseFunOne /></RequireAuth>}/>
  <Route path="/cn-fun-two" element={<RequireAuth><ChineseFunTwo /></RequireAuth>}/>
  <Route path="/cn-fun-three" element={<RequireAuth><ChineseFunThree /></RequireAuth>}/>
  <Route path="/cn-fun-four" element={<RequireAuth><ChineseFunFour /></RequireAuth>}/>
  <Route path="/cn-fun-five" element={<RequireAuth><ChineseFunFive /></RequireAuth>}/>
  <Route path="/cn-fun-six" element={<RequireAuth><ChineseFunSix /></RequireAuth>}/>
  <Route path="/cn-fun-seven" element={<RequireAuth><ChineseFunSeven /></RequireAuth>}/>
  <Route path="/cn-fun-eight" element={<RequireAuth><ChineseFunEight /></RequireAuth>}/>
  <Route path="/cn-fun-nine" element={<RequireAuth><ChineseFunNine /></RequireAuth>}/>
  <Route path="/cn-rainbow-one" element={<RequireAuth><ChineseRainbowOne /></RequireAuth>}/>
  <Route path="/cn-rainbow-two" element={<RequireAuth><ChineseRainbowTwo /></RequireAuth>}/>
  <Route path="/cn-rainbow-three" element={<RequireAuth><ChineseRainbowThree /></RequireAuth>}/>
  <Route path="/cn-rainbow-four" element={<RequireAuth><ChineseRainbowFour /></RequireAuth>}/>
  <Route path="/cn-rainbow-five" element={<RequireAuth><ChineseRainbowFive /></RequireAuth>}/>
  <Route path="/cn-star-one" element={<RequireAuth><ChineseStarOne /></RequireAuth>}/>
  <Route path="/cn-star-two" element={<RequireAuth><ChineseStarTwo /></RequireAuth>}/>
  <Route path="/cn-star-three" element={<RequireAuth><ChineseStarThree /></RequireAuth>}/>
  <Route path="/cn-promos" element={<RequireAuth><ChinesePromos /></RequireAuth>}/>
    <Route path="/cn-stardust-one" element={<RequireAuth><ChineseStardustOne /></RequireAuth>}/>
    <Route path="/cn-stardust-two" element={<RequireAuth><ChineseStardustTwo /></RequireAuth>}/>
    <Route path="/cn-magicbook-one" element={<RequireAuth><ChineseMagicBookOne /></RequireAuth>}/>
    <Route path="/cn-newyears-one" element={<RequireAuth><ChineseNewYearsOne /></RequireAuth>}/>
    <Route path="/cn-laser-tickets" element={<RequireAuth><ChineseLaserTickets /></RequireAuth>}/>
    <Route path="/cn-kuji-raffles" element={<RequireAuth><ChineseKujiRaffles /></RequireAuth>}/>
    <Route path="/cn-newyears-two" element={<RequireAuth><ChineseNewYearsTwo /></RequireAuth>}/>
  <Route path="/iso-chinese" element={<RequireAuth><ISOChinese /></RequireAuth>}/>
    <Route path="/collections-chinese" element={<CollectionsChinese />}/>
      <Route path="/moon-one" element={<RequireAuth>
            <MoonOne />
          </RequireAuth>}/>
      <Route path="/moon-two" element={<RequireAuth>
            <MoonTwo />
          </RequireAuth>}/>
      <Route path="/moon-four" element={<RequireAuth><MoonFour /></RequireAuth>}/>
      <Route path="/moon-three" element={<RequireAuth>
            <MoonThree />
          </RequireAuth>}/>
      <Route path="/rainbow-one" element={<RequireAuth>
            <RainbowOne />
          </RequireAuth>}/>
      <Route path="/rainbow-two" element={<RequireAuth>
            <RainbowTwo />
          </RequireAuth>}/>
      <Route path="/fun-moments-one" element={<RequireAuth>
            <FunMomentsOne />
          </RequireAuth>}/>
      <Route path="/fun-moments-two" element={<RequireAuth>
            <FunMomentsTwo />
          </RequireAuth>}/>
      <Route path="/fun-moments-three" element={<RequireAuth>
            <FunMomentsThree />
          </RequireAuth>}/>
      <Route path="/star-one" element={<RequireAuth>
            <StarOne />
          </RequireAuth>}/>
      <Route path="/fantasy-wonderland" element={<RequireAuth>
            <FantasyWonderland />
          </RequireAuth>}/>
      <Route path="/friendships-begin" element={<RequireAuth>
            <FriendshipsBegin />
          </RequireAuth>}/>
      <Route path="/discord" element={<RequireAuth>
            <Discord />
          </RequireAuth>}/>
      <Route path="/hearthswarming-eve" element={<RequireAuth><HeartswarmingEve /></RequireAuth>}/>
      <Route path="/nightmare-night" element={<RequireAuth>
            <NightmareNight />
          </RequireAuth>}/>
      <Route path="/promotional-cards" element={<RequireAuth>
            <PromotionalCards />
          </RequireAuth>}/>
      <Route path="/explore" element={<RequireAuth>
            <Explore />
          </RequireAuth>}/>
      <Route path="/inventory" element={<RequireAuth>
            <MyTrades />
          </RequireAuth>}/>
      <Route path="/inventory-chinese" element={<RequireAuth><ChineseInventory /></RequireAuth>}/>
      <Route path="/inventory-chinese/:setId" element={<RequireAuth><ChineseInventoryInner /></RequireAuth>}/>
      <Route path="/inventory/:setId" element={<MyTradesSets />}/>
      <Route path="/Personal/change-avatar" element={<RequireAuth>
            <ChangeAvatar />
          </RequireAuth>}/>
      <Route path="/iso" element={<RequireAuth>
            <ISO />
          </RequireAuth>}/>
      <Route path="/community" element={<Community />}/>
      <Route path="/community/:id" element={<CommunitySet />}/>
      <Route path="/leaderboard" element={<Leaderboard />}/>
      <Route path="/leaderboard-chinese" element={<RequireAuth><ChineseLeaderboard /></RequireAuth>}/>
      <Route path="/password-reset" element={<PasswordReset />}/>
      <Route path="/selling" element={<Selling />}/>
      <Route path="/trading-post" element={<TradingPost />}/>
      <Route path="/trading-post/:setId" element={<TradingPostInner />}/>
      <Route path="/trading-post-chinese" element={<RequireAuth><ChineseTradePost /></RequireAuth>}/>
      <Route path="/trading-post-chinese/:setId" element={<RequireAuth><ChineseTradePostInner /></RequireAuth>}/>
      <Route path="/set-information" element={<SetInformation />}/>
      <Route path="/faq" element={<Navigate to="/set-information" replace />}/>
      <Route path="/support-mlpekayou" element={<Support />}/>
      <Route path="/support-creators" element={<SupportCreators />}/>
      <Route path="/binders" element={<Binders />}/>
      <Route path="/binders-chinese" element={<RequireAuth><ChineseBinders /></RequireAuth>}/>
      <Route path="/mobile-profile" element={<RequireAuth>
            <MobileProfile />
          </RequireAuth>}/>
      <Route path="/desktop-profile" element={<RequireAuth>
            <DesktopProfile />
          </RequireAuth>}/>
      <Route path="/inbox" element={<RequireAuth>
            <Inbox />
          </RequireAuth>}/>
      <Route path="/account-confirmation" element={<AccountConfirmation />}/>
      <Route path="/leaderboard-moderation" element={<RequireAuth>
            <LeaderboardModeration />
          </RequireAuth>}/>
      <Route path="/lgs-boards" element={<RequireLGSStaff>
            <LGSBoards />
          </RequireLGSStaff>}/>
      <Route path="/:username" element={<PublicProfile />}/>
      <Route path="*" element={<NotFound />}/>
    </Routes>);
const matches = matchRoutes(createRoutesFromElements(routes.props.children), location);
const matchedElement = matches?.[matches.length - 1]?.route.element;
const publicProfileRoute = isValidElement(matchedElement) && matchedElement.type === PublicProfile;
return <SiteAccessGate publicProfileRoute={publicProfileRoute}>{routes}</SiteAccessGate>;
};
function AppLayout() {
const { pathname, search } = useLocation();
const normalizedPath = pathname.replace(/\/+$/, "").toLowerCase() || "/";
const hideNavigation = normalizedPath === "/links" ||
        normalizedPath === "/lgs-boards" ||
        new URLSearchParams(search).has("embed");
const standalone = window.matchMedia("(display-mode: standalone)").matches;
    return (<>
      <style>{`
        ${chineseTicketLayoutCSS}
        @media (max-width:767px) {
          .cn-gallery .cn-grid { grid-template-columns:repeat(3,minmax(0,1fr));gap:16px 8px; }
          .cn-gallery .cn-grid > * { min-width:0; }
          body:has(.cn-gallery) [role="dialog"]:has(input[type="range"]) { width:min(340px,calc(100% - 24px));max-width:340px;height:min(560px,80dvh);max-height:calc(100dvh - 24px);padding:12px;gap:8px; }
        }
        @media (max-width:767px) and (max-height:480px) {
          body:has(.cn-gallery) [role="dialog"]:has(input[type="range"]) { height:calc(100dvh - 16px);max-height:calc(100dvh - 16px);gap:6px; }
        }
      `}</style>
      <ScrollToTop />
      {!hideNavigation && <KayouHeader />}
      <div data-kayou-page-content="true" className={hideNavigation ? "min-h-screen" : "min-h-screen sm:pb-0"} style={hideNavigation ? undefined : { paddingTop: `var(--kayou-header-bottom, ${standalone ? "88px" : "64px"})` }}>
        <CollectionPageExperience><AppRoutes /></CollectionPageExperience>
      </div>
      <ChinesePakraLinks />
      {!hideNavigation && <MLPEKAYOUFooter />}
    </>);
}
const App = () => (<QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>);
export default App;