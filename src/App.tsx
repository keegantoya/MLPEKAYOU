import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import ScrollToTop from "@/components/ScrollToTop";
import KayouHeader from "@/components/KayouHeader";
import TiltCard from "@/components/TiltCards";

import Index from "./pages/Index";
import Collections from "./pages/Collections";
import MyProgress from "./pages/MyProgress";
import MyISO from "./pages/MyISO";
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
import UserMenu from "@/pages/UserMenu";
import Wishlist from "./pages/Wishlist";
import LinksPage from "./pages/linkspage";
/// PERSONAL PAGES

/// CCG SETS
import MoonOne from "./pages/Sets/Moon Editions/moon-one";
import MoonTwo from "./pages/Sets/Moon Editions/moon-two";
import MoonThree from "./pages/Sets/Moon Editions/moon-three";
import RainbowOne from "./pages/Sets/Rainbow Editions/rainbow-one";
import RainbowTwo from "./pages/Sets/Rainbow Editions/rainbow-two";
import FunMomentsOne from "./pages/Sets/Fun Moments Editions/fun-moments-one";
import FunMomentsTwo from "./pages/Sets/Fun Moments Editions/fun-moments-two";
import FunMomentsThree from "./pages/Sets/Fun Moments Editions/fun-moments-three";
import StarOne from "./pages/Sets/Star Editions/star-one";
/// TCG SETS
import FantasyWonderland from "./pages/Sets/Trading Card Game/fantasy-wonderland";
import FriendshipsBegin from "./pages/Sets/Trading Card Game/friendships-begin";
/// PROMOS
import PromotionalCards from "./pages/Sets/Promos/promotional-cards";
/// OTHERS
import LeapingPonies from "./pages/Sets/Others/leaping-ponies";
/// OTHER PAGES
import Explore from "./pages/Everypony/explore";
import Binders from "./pages/Main Pages/binders";
import Support from "./pages/Main Pages/support-mlpekayou";




const queryClient = new QueryClient();

const AppRoutes = () => {

  useEffect(() => {
  let lastUserId: string | null = null;

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    const currentUserId = session?.user?.id ?? null;

    if (currentUserId !== lastUserId) {
      lastUserId = currentUserId;
    }
  });

  const handleRightClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.tagName === "IMG") {
      e.preventDefault();
    }
  };

  const preventDrag = (e: DragEvent) => e.preventDefault();

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
  path="/my-iso"
  element={
    <RequireAuth>
      <MyISO />
    </RequireAuth>
  }
/>
<Route
  path="/Wishlist"
  element={
    <RequireAuth>
      <Wishlist />
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

      <Route path="/community" element={<Community />} />
      <Route path="/community/:id" element={<CommunitySet />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/selling" element={<Selling />} />
      <Route path="/trading-post" element={<TradingPost />} />
      <Route path="/trading-post/:setId" element={<TradingPostInner />} />
      <Route path="/inventory/:setId" element={<MyTradesSets />} />
      <Route path="/faq" element={<FAQ />} />





                <Route path="/support-mlpekayou" element={<Support />} />
                <Route path="/binders" element={<Binders />} />
      <Route
  path="/UserMenu"
  element={
    <RequireAuth>
      <UserMenu />
    </RequireAuth>
  }
/>

<Route
  path="/profile-mobile"
  element={
    <RequireAuth>
      <UserMenu />
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
      <Route path="/links" element={<LinksPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
<BrowserRouter>

<ScrollToTop />

{window.location.pathname !== "/links" && <KayouHeader />}

<div
  className={
    window.location.pathname === "/links"
      ? "min-h-screen"
      : `min-h-screen sm:pt-[64px] sm:pb-0 ${
          window.matchMedia('(display-mode: standalone)').matches
            ? 'pt-[88px]'
            : 'pt-[52px]'
        }`
  }
>
  <AppRoutes />
</div>

</BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};


export default App;